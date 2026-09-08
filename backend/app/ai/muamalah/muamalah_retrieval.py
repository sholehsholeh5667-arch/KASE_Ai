"""
Muamalah Retrieval Engine - Stage 3.2.4.2

Fokus:
- Memperbaiki candidate retrieval berdasarkan diagnosis Stage 3.2.4.1.
- Mempertahankan ranking heading Stage 3.2.3.2.
- Mempertahankan MySQL muamalah_materi.
- SQLite path tetap read-only: D:/AI_KITAB/DATA/content_catalog.db
- Tidak mengintegrasikan RAG engine pada tahap ini.

Perbaikan utama:
1. Normalisasi Arab tidak lagi mengubah ة menjadi ه.
2. Variant matching tetap menyediakan variasi alif/hamzah tanpa merusak ة.
3. Konsep multi-term diperlakukan sebagai GROUP:
   - حكم الربا في البيع -> ربا + بيع
   - ما حكم بيع الذهب بالتقسيط -> بيع + ذهب + تقسيط
4. Candidate retrieval mencoba:
   A. exact raw phrase
   B. semua konsep hadir (AND per concept)
   C. fallback OR bila kandidat terlalu sedikit
5. Ranking mendapat concept coverage dan proximity berbasis GROUP,
   bukan sekadar hitungan variant.
"""

from __future__ import annotations

import re
import sqlite3
from html.parser import HTMLParser
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Sequence, Tuple

from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from app.models.muamalah_materi import MuamalahMateri


class _ShamelaPageParser(HTMLParser):
    """Parse HTML Shamela dari kolom pages.page tanpa mengubah sumber."""

    BLOCK_TAGS = {"p", "div", "li", "br", "tr", "td", "h1", "h2", "h3", "h4", "h5", "h6"}

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.main_parts: List[str] = []
        self.footnotes: List[str] = []
        self._in_comment = False

    @staticmethod
    def _clean(text: Any) -> str:
        value = str(text or "").replace("\r\n", "\n").replace("\r", "\n")
        value = re.sub(r"[ \t\f\v]+", " ", value)
        value = re.sub(r" *\n *", "\n", value)
        return value.strip()

    def handle_starttag(self, tag: str, attrs: List[Tuple[str, Optional[str]]]) -> None:
        attr_map = {k.lower(): v for k, v in attrs}
        if tag.lower() == "a":
            cls = (attr_map.get("class") or "").split()
            title = attr_map.get("title")
            if "comment" in {c.lower() for c in cls} and title:
                footnote = self._clean(title)
                self.footnotes.append(footnote)
                self.main_parts.append(f"({len(self.footnotes)})")
                self._in_comment = True
                return

        if not self._in_comment and tag.lower() in self.BLOCK_TAGS:
            if tag.lower() == "br":
                self.main_parts.append("\n")
            else:
                self.main_parts.append("\n")

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() == "a" and self._in_comment:
            self._in_comment = False
            return
        if not self._in_comment and tag.lower() in {"p", "div", "li", "tr", "h1", "h2", "h3", "h4", "h5", "h6"}:
            self.main_parts.append("\n")

    def handle_data(self, data: str) -> None:
        if not self._in_comment and data:
            self.main_parts.append(data)

    def result(self) -> Tuple[str, str, int]:
        main = "".join(self.main_parts)
        main = re.sub(r"[ \t]+\n", "\n", main)
        main = re.sub(r"\n[ \t]+", "\n", main)
        main = re.sub(r"\n{3,}", "\n\n", main)
        main = re.sub(r"[ \t]{2,}", " ", main)
        main = main.strip()

        footnotes = "\n\n".join(
            f"({idx}) {text}" for idx, text in enumerate(self.footnotes, 1) if text
        )
        return main, footnotes, len(self.footnotes)


class MuamalahRetrieval:
    SQLITE_DB = Path(r"D:\\AI_KITAB\\DATA\\content_catalog.db")

    DEFAULT_LIMIT = 5

    # Kandidat awal lebih besar agar ranking punya cukup bahan.
    SQLITE_CANDIDATE_LIMIT = 2000
    MYSQL_CANDIDATE_LIMIT = 200

    STOPWORDS = {
        "apa", "apakah", "bagaimana", "mengapa", "kenapa",
        "yang", "dan", "atau", "dengan", "dalam", "untuk",
        "dari", "pada", "oleh", "tentang", "menurut", "secara",
        "itu", "ini", "tersebut", "terhadap", "bagi", "kepada",
        "ke", "di", "ada", "adalah", "ialah", "akan", "dapat",
        "boleh", "tidak", "bisa", "kah", "saja",
        "حكم", "أحكام", "ما", "ماذا", "هل", "كيف", "لماذا",
        "في", "من", "إلى", "على", "عن", "مع", "هذا", "هذه",
        "ذلك", "تلك", "هو", "هي", "و", "ف", "ثم", "قد",
        "يجوز", "هل يجوز",
    }

    GENERIC_TERMS = {
        "حكم", "أحكام", "مسألة", "مسائل", "باب", "كتاب",
        "فصل", "فصول", "مبحث", "مباحث", "مطلب", "مطالب",
        "شرط", "شروط", "دليل", "أدلة", "تعريف",
    }

    STRUCTURAL_HEADING_MARKERS = (
        "كتاب", "الباب", "باب", "الفصل", "فصل",
        "المبحث", "مبحث", "المطلب", "مطلب",
        "المسألة", "مسألة", "الفرع", "فرع",
        "القسم", "قسم", "النوع", "نوع",
        "الركن", "ركن", "الشروط", "شروط",
        "الأركان", "أركان", "أنواع",
        "تعريف", "بيان", "ضابط", "الضابط",
    )

    SUBJECT_HEADING_MARKERS = (
        "حكم", "أحكام",
    )

    TOC_MARKERS = (
        "الفهرس", "فهرس", "المحتويات", "محتويات",
        "خطة الموضوع", "خطة البحث", "عناصر الدرس",
    )

    # Setiap konsep memiliki keluarga kata.
    # Penting: jangan mengubah ة -> ه karena database menyimpan kedua bentuk
    # secara nyata dan kita ingin mempertahankan kecocokan literal.
    CONCEPT_GROUPS: Dict[str, Tuple[str, ...]] = {
        "بيع": (
            "بيع", "البيع", "البيوع", "مبيع", "المبيع",
            "باع", "يبيع", "مبايعة", "المبايعة",
        ),
        "ربا": (
            "ربا", "الربا", "ربوي", "الربوي", "الربويات",
            "ربا الفضل", "ربا النسيئة",
        ),
        "سلم": (
            "سلم", "السلم", "بيع السلم", "السلف",
            "السلفية", "المسلم فيه",
        ),
        "إجارة": (
            "إجارة", "الإجارة", "استئجار", "الاستئجار",
            "مستأجر", "المستأجر", "أجرة", "الأجرة",
        ),
        "شركة": (
            "شركة", "الشركة", "شركات", "الشركات",
            "شركة العنان", "شركة المفاوضة",
        ),
        "مضاربة": (
            "مضاربة", "المضاربة", "قراض", "القراض",
        ),
        "وكالة": (
            "وكالة", "الوكالة", "وكيل", "الوكيل",
            "موكل", "الموكل",
        ),
        "كفالة": (
            "كفالة", "الكفالة", "كفيل", "الكفيل",
        ),
        "حوالة": (
            "حوالة", "الحوالة", "حوالات",
        ),
        "رهن": (
            "رهن", "الرهن", "مرتهن", "المرتهن",
            "راهن", "الراهن",
        ),
        "قرض": (
            "قرض", "القرض", "قروض", "القروض",
            "مقرض", "المقرض", "مقترض", "المقترض",
        ),
        "ضمان": (
            "ضمان", "الضمان", "ضامن", "الضامن",
        ),
        "جعالة": (
            "جعالة", "الجعالة",
        ),
        "وقف": (
            "وقف", "الوقف", "أوقاف", "الأوقاف",
        ),
        "زكاة": (
            "زكاة", "الزكاة", "زكاة التجارة", "زكاة المال",
        ),
        "مرابحة": (
            "مرابحة", "المرابحة",
        ),
        "مزارعة": (
            "مزارعة", "المزارعة",
        ),
        "مساقاة": (
            "مساقاة", "المساقاة",
        ),
        # Tambahan khusus diagnosis Stage 3.2.4.1
        "ذهب": (
            "ذهب", "الذهب",
        ),
        "تقسيط": (
            "تقسيط", "التقسيط",
            "بالتقسيط", "للـتقسيط", "للبيع بالتقسيط",
            "البيع بالتقسيط",
        ),
    }

    LIGHT_QUALIFIERS = {
        "شرعا", "لغة", "اصطلاحا", "فقها", "فقهي",
        "في الشرع", "في الفقه",
    }

    def __init__(self, sqlite_db: Optional[str | Path] = None) -> None:
        self.sqlite_db = Path(sqlite_db) if sqlite_db else self.SQLITE_DB

    # ------------------------------------------------------------------
    # NORMALIZATION
    # ------------------------------------------------------------------

    @staticmethod
    def normalize_arabic(
        text: Any,
        preserve_newlines: bool = False,
    ) -> str:
        if text is None:
            return ""

        text = str(text)

        # Harakat / tatweel.
        text = re.sub(
            r"[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]",
            "",
            text,
        )
        text = text.replace("ـ", "")

        # Normalisasi hamzah/alif saja.
        # JANGAN mengubah ة -> ه.
        text = (
            text.replace("أ", "ا")
            .replace("إ", "ا")
            .replace("آ", "ا")
            .replace("ٱ", "ا")
            .replace("ى", "ي")
        )

        text = text.replace("\r\n", "\n").replace("\r", "\n")

        if preserve_newlines:
            lines: List[str] = []
            for line in text.split("\n"):
                line = re.sub(r"[ \t\f\v]+", " ", line).strip()
                lines.append(line)
            return "\n".join(lines)

        text = re.sub(r"\s+", " ", text)
        return text.strip()

    def normalize_for_match(self, text: Any) -> str:
        return self.normalize_arabic(text, preserve_newlines=False)

    def normalize_for_heading(self, text: Any) -> str:
        text = self.normalize_arabic(
            text,
            preserve_newlines=True,
        )
        text = re.sub(
            r"[،,:;؛.!؟?!()\[\]{}«»\"“”‘’/\\|]+",
            " ",
            text,
        )
        text = re.sub(r"\s+", " ", text)
        return text.strip()

    def _literal_variants(self, text: str) -> List[str]:
        """
        Variant ringan untuk pencarian SQL.
        Berbeda dari normalize_arabic, di sini kita boleh membuat bentuk
        alternatif tambahan, tetapi bentuk asli tetap dipertahankan.
        """
        raw = str(text or "").strip()
        if not raw:
            return []

        variants: List[str] = []

        def add(value: str) -> None:
            value = self.normalize_for_match(value)
            if value and value not in variants:
                variants.append(value)

        add(raw)

        # Alternatif alif/hamzah.
        add(
            raw.replace("أ", "ا")
            .replace("إ", "ا")
            .replace("آ", "ا")
            .replace("ٱ", "ا")
        )

        return variants

    # ------------------------------------------------------------------
    # QUERY
    # ------------------------------------------------------------------

    def extract_keywords(self, query: str) -> List[str]:
        normalized = self.normalize_for_match(query)
        tokens = normalized.split()

        result: List[str] = []

        for token in tokens:
            token = token.strip(
                ".,،:;؛!?؟()[]{}\"'«»"
            )

            if not token:
                continue

            if token in self.STOPWORDS:
                continue

            if len(token) <= 1:
                continue

            if token not in result:
                result.append(token)

        return result

    def _concept_for_token(
        self,
        token: str,
    ) -> Optional[str]:
        token_n = self.normalize_for_match(token)

        for concept, variants in self.CONCEPT_GROUPS.items():
            normalized_variants = {
                self.normalize_for_match(v)
                for v in variants
            }

            if token_n in normalized_variants:
                return concept

        return None

    def extract_concepts(self, query: str) -> List[str]:
        normalized_query = self.normalize_for_match(query)
        concepts: List[str] = []

        # Frasa multi-kata terlebih dahulu.
        for concept, variants in self.CONCEPT_GROUPS.items():
            for variant in variants:
                v = self.normalize_for_match(variant)

                if " " in v and v in normalized_query:
                    if concept not in concepts:
                        concepts.append(concept)
                    break

        # Token utama.
        for token in self.extract_keywords(query):
            concept = self._concept_for_token(token)

            if concept and concept not in concepts:
                concepts.append(concept)

        return concepts

    def expand_keywords(
        self,
        query: str,
    ) -> List[str]:
        result: List[str] = []

        for concept in self.extract_concepts(query):
            for variant in self.CONCEPT_GROUPS.get(
                concept,
                (),
            ):
                normalized = self.normalize_for_match(variant)

                if normalized and normalized not in result:
                    result.append(normalized)

        for keyword in self.extract_keywords(query):
            if keyword not in result:
                result.append(keyword)

        return result

    # ------------------------------------------------------------------
    # HEADING ANALYSIS - mempertahankan Stage 3.2.3.2
    # ------------------------------------------------------------------

    def _line_words(self, line: str) -> List[str]:
        return [
            x
            for x in self.normalize_for_heading(line).split()
            if x
        ]

    def _strip_heading_number(self, line: str) -> str:
        line = self.normalize_for_heading(line)

        line = re.sub(
            r"^\s*(?:\d+|[١٢٣٤٥٦٧٨٩٠]+)\s*[-–—ـ:.]\s*",
            "",
            line,
        )

        return line.strip()

    def _starts_with_marker(
        self,
        line: str,
        markers: Sequence[str],
    ) -> Optional[str]:
        line_n = self._strip_heading_number(line)

        for marker in markers:
            marker_n = self.normalize_for_heading(marker)

            if not marker_n:
                continue

            if line_n == marker_n:
                return marker_n

            if line_n.startswith(marker_n + " "):
                return marker_n

        return None

    def is_heading_line(self, line: str) -> bool:
        if not line:
            return False

        normalized = self.normalize_for_heading(line)

        if not normalized:
            return False

        if len(normalized) > 180:
            return False

        words = normalized.split()

        if len(words) > 24:
            return False

        structural = self._starts_with_marker(
            normalized,
            self.STRUCTURAL_HEADING_MARKERS,
        )

        if structural:
            return True

        subject = self._starts_with_marker(
            normalized,
            self.SUBJECT_HEADING_MARKERS,
        )

        if subject:
            if len(normalized) <= 90 and len(words) <= 10:
                return True

        return False

    def _heading_lines(self, text: str) -> List[str]:
        text_n = self.normalize_arabic(
            text,
            preserve_newlines=True,
        )

        return [
            line.strip()
            for line in text_n.split("\n")
            if line.strip()
        ]

    def _detect_bab_from_text(self, text: str) -> Optional[str]:
        """
        Mendeteksi nama bab/topik dari konten kitab SQLite.

        Prioritas:
        1. Heading struktural: باب / الكتاب / الفصل / المبحث / المطلب /
           المسألة / الفرع / القسم / النوع / الركن / الشروط / تعريف /
           بيان / ضابط, dan variasinya.
        2. Heading "الفصل ...", lalu baris "في ...".
        3. Heading yang diawali "حكم" / "أحكام".
        4. Heading pendek yang diawali "في ...".

        Fungsi ini hanya mengambil teks yang benar-benar muncul di konten.
        Tidak membuat atau mengarang nama bab.
        """
        if not text:
            return None

        lines = self._heading_lines(text)
        if not lines:
            return None

        # 1) Prioritas heading struktural yang lengkap.
        structural_headings: List[str] = []
        subject_headings: List[str] = []

        for line in lines:
            if not self.is_heading_line(line):
                continue

            clean = self._strip_heading_number(line)
            if not clean:
                continue

            structural = self._starts_with_marker(
                clean,
                self.STRUCTURAL_HEADING_MARKERS,
            )
            subject = self._starts_with_marker(
                clean,
                self.SUBJECT_HEADING_MARKERS,
            )

            if structural:
                structural_headings.append(clean)

            if subject:
                subject_headings.append(clean)

        # Kasus penting:
        # "الفصل الأول" / "الفصل الثاني" sering menjadi penanda struktur,
        # sedangkan judul bab sebenarnya ada di baris berikutnya:
        #
        #   الفصل الأول
        #   في بيع مال الزكاة بعد وجوبها
        #
        # Untuk pola ini, prioritaskan baris "في ..." sebelum mengembalikan
        # "الفصل الأول".
        for source_index, line in enumerate(lines):
            clean = self._strip_heading_number(line)
            line_n = self.normalize_for_heading(clean)

            if not line_n:
                continue

            words = line_n.split()

            # "الفصل الأول", "الفصل الثاني", dst.
            is_bare_fasl_title = (
                line_n.startswith("الفصل ")
                and len(words) <= 3
            )

            # "فصل أول", "فصل ثاني", dst.
            is_bare_fasl_title_alt = (
                line_n.startswith("فصل ")
                and len(words) <= 3
            )

            # "الفصل" / "فصل" tanpa nomor juga ditangani.
            is_bare_fasl_marker = line_n in {"الفصل", "فصل"}

            if not (
                is_bare_fasl_title
                or is_bare_fasl_title_alt
                or is_bare_fasl_marker
            ):
                continue

            for next_line in lines[source_index + 1: source_index + 6]:
                candidate = self._strip_heading_number(next_line)
                candidate_n = self.normalize_for_heading(candidate)

                if not candidate_n:
                    continue

                if (
                    candidate_n.startswith("في ")
                    and 8 <= len(candidate_n) <= 180
                    and len(candidate_n.split()) <= 20
                ):
                    return candidate

        # Bila ada heading struktural lain yang lengkap, gunakan heading
        # tersebut. Pengecualian "الفصل الأول" sudah diproses di atas.
        if structural_headings:
            for heading in structural_headings:
                heading_n = self.normalize_for_heading(heading)

                if not heading_n:
                    continue

                if heading_n in {"فصل", "الفصل"}:
                    continue

                # Heading struktural yang mempunyai isi nyata.
                if len(heading_n.split()) >= 2:
                    return heading

            # Kalau yang tersisa hanya marker pendek seperti "باب",
            # jangan langsung menggunakannya; coba subject heading.
            if subject_headings:
                return subject_headings[0]

        # 2) Subject heading seperti:
        # "حكم البيع على المكشوف في الأسهم"
        if subject_headings:
            return subject_headings[0]

        # 3) Fallback konservatif untuk heading "في ...".
        for line in lines:
            clean = self._strip_heading_number(line)
            clean_n = self.normalize_for_heading(clean)

            if (
                clean_n.startswith("في ")
                and 8 <= len(clean_n) <= 180
                and len(clean_n.split()) <= 20
            ):
                return clean

        return None

    def _query_phrase_forms(
        self,
        query: str,
    ) -> List[str]:
        q = self.normalize_for_heading(query)

        if not q:
            return []

        forms = [q]

        tokens = q.split()

        while tokens and tokens[0] in {
            "ما", "هل", "ماذا", "كيف", "لماذا", "حكم", "احكام",
        }:
            if (
                len(tokens) <= 2
                and tokens[0] in {"حكم", "احكام"}
            ):
                break

            tokens.pop(0)

        if tokens:
            reduced = " ".join(tokens)

            if reduced and reduced not in forms:
                forms.append(reduced)

        return forms

    def _heading_relation(
        self,
        line: str,
        query: str,
    ) -> Dict[str, Any]:
        line_n = self.normalize_for_heading(line)
        query_n = self.normalize_for_heading(query)

        if not line_n or not query_n:
            return {
                "level": 0,
                "exact": False,
                "near_exact": False,
                "concept": False,
            }

        phrases = self._query_phrase_forms(query)

        if line_n == query_n:
            return {
                "level": 5,
                "exact": True,
                "near_exact": False,
                "concept": True,
            }

        for phrase in phrases:
            if not phrase:
                continue

            if line_n.startswith(phrase + " "):
                suffix = line_n[len(phrase):].strip()

                if suffix:
                    suffix_tokens = suffix.split()
                    suffix_normalized = " ".join(suffix_tokens)

                    if (
                        suffix_normalized in self.LIGHT_QUALIFIERS
                        or (
                            len(suffix_tokens) <= 2
                            and all(
                                token in self.LIGHT_QUALIFIERS
                                for token in suffix_tokens
                            )
                        )
                    ):
                        return {
                            "level": 4,
                            "exact": False,
                            "near_exact": True,
                            "concept": True,
                        }

                    return {
                        "level": 3,
                        "exact": False,
                        "near_exact": False,
                        "concept": True,
                    }

        for phrase in phrases:
            if phrase and f" {phrase} " in f" {line_n} ":
                return {
                    "level": 3,
                    "exact": False,
                    "near_exact": False,
                    "concept": True,
                }

        concepts = self.extract_concepts(query)
        line_concepts = self.extract_concepts(line)

        if concepts and any(
            concept in line_concepts
            for concept in concepts
        ):
            return {
                "level": 2,
                "exact": False,
                "near_exact": False,
                "concept": True,
            }

        if (
            len(query_n.split()) == 1
            and query_n in line_n.split()
        ):
            return {
                "level": 2,
                "exact": False,
                "near_exact": False,
                "concept": True,
            }

        return {
            "level": 0,
            "exact": False,
            "near_exact": False,
            "concept": False,
        }

    def heading_score(
        self,
        text: str,
        query: str,
    ) -> int:
        best = 0

        for line in self._heading_lines(text):
            if not self.is_heading_line(line):
                continue

            relation = self._heading_relation(
                line,
                query,
            )

            level = relation["level"]

            if level == 5:
                score = 60
            elif level == 4:
                score = 50
            elif level == 3:
                score = 32
            elif level == 2:
                score = 16
            else:
                score = 0

            structural = self._starts_with_marker(
                line,
                self.STRUCTURAL_HEADING_MARKERS,
            )

            subject = self._starts_with_marker(
                line,
                self.SUBJECT_HEADING_MARKERS,
            )

            if structural and score:
                score += 2

            if subject and score:
                score += 2

            if level == 5:
                score = min(score, 64)
            elif level == 4:
                score = min(score, 54)
            elif level == 3:
                score = min(score, 38)
            elif level == 2:
                score = min(score, 22)

            best = max(best, score)

        return best

    def exact_phrase_score(
        self,
        text: str,
        query: str,
    ) -> int:
        q = self.normalize_for_heading(query)

        if not q:
            return 0

        best = 0

        for line in self._heading_lines(text):
            line_n = self.normalize_for_heading(line)

            if not line_n:
                continue

            if line_n == q:
                best = max(best, 50)
                continue

            if line_n.startswith(q + " "):
                suffix = line_n[len(q):].strip()
                suffix_tokens = suffix.split()

                if (
                    suffix in self.LIGHT_QUALIFIERS
                    or (
                        len(suffix_tokens) <= 2
                        and all(
                            token in self.LIGHT_QUALIFIERS
                            for token in suffix_tokens
                        )
                    )
                ):
                    best = max(best, 42)

                elif (
                    len(line_n) <= 120
                    and len(line_n.split()) <= 14
                ):
                    best = max(best, 26)

        return best

    # ------------------------------------------------------------------
    # CONTEXT / PROXIMITY
    # ------------------------------------------------------------------

    def _find_positions(
        self,
        text: str,
        terms: Iterable[str],
    ) -> List[int]:
        normalized = self.normalize_for_match(text)
        positions: List[int] = []

        for term in terms:
            term_n = self.normalize_for_match(term)

            if not term_n:
                continue

            start = 0

            while True:
                pos = normalized.find(
                    term_n,
                    start,
                )

                if pos < 0:
                    break

                positions.append(pos)
                start = pos + max(
                    1,
                    len(term_n),
                )

        return sorted(set(positions))

    def _concept_positions(
        self,
        text: str,
        concepts: Sequence[str],
    ) -> Dict[str, List[int]]:
        positions: Dict[str, List[int]] = {}

        for concept in concepts:
            variants = self.CONCEPT_GROUPS.get(
                concept,
                (),
            )

            hits = self._find_positions(
                text,
                variants,
            )

            if hits:
                positions[concept] = hits[:80]

        return positions

    def concept_coverage_score(
        self,
        text: str,
        query: str,
    ) -> int:
        concepts = self.extract_concepts(query)

        if not concepts:
            return 0

        positions = self._concept_positions(
            text,
            concepts,
        )

        matched = len(positions)
        total = len(concepts)

        if total == 1:
            return 18 if matched else 0

        if matched == total:
            if total >= 3:
                return 40
            return 30

        if matched == total - 1:
            return 15

        if matched >= 1:
            return 5

        return 0

    def get_context(
        self,
        text: str,
        query: str,
        window: int = 450,
    ) -> str:
        normalized = self.normalize_for_match(text)

        if not normalized:
            return ""

        terms = self.expand_keywords(query)
        positions = self._find_positions(
            normalized,
            terms,
        )

        if not positions:
            return normalized[:window]

        candidates: List[Tuple[int, int, int]] = []

        for pos in positions[:50]:
            start = max(
                0,
                pos - window // 2,
            )
            end = min(
                len(normalized),
                start + window,
            )

            chunk = normalized[start:end]

            hits = 0

            for term in terms:
                if term and term in chunk:
                    hits += 1

            candidates.append(
                (
                    hits,
                    -abs(
                        pos - len(normalized) // 2
                    ),
                    start,
                )
            )

        _, _, best_start = max(
            candidates,
            key=lambda item: (
                item[0],
                item[1],
                -item[2],
            ),
        )

        return normalized[
            best_start : best_start + window
        ]

    def proximity_score(
        self,
        text: str,
        query: str,
    ) -> int:
        concepts = self.extract_concepts(query)

        if len(concepts) < 2:
            return 0

        positions = self._concept_positions(
            text,
            concepts,
        )

        if len(positions) < 2:
            return 0

        # Ambil jarak minimum antarkonsep yang berbeda.
        best_distance: Optional[int] = None

        concept_items = list(positions.items())

        for i in range(len(concept_items)):
            concept_a, pos_a = concept_items[i]

            for j in range(
                i + 1,
                len(concept_items),
            ):
                concept_b, pos_b = concept_items[j]

                if concept_a == concept_b:
                    continue

                for p1 in pos_a[:40]:
                    for p2 in pos_b[:40]:
                        distance = abs(p2 - p1)

                        if (
                            best_distance is None
                            or distance < best_distance
                        ):
                            best_distance = distance

        if best_distance is None:
            return 0

        if best_distance <= 80:
            return 20

        if best_distance <= 180:
            return 14

        if best_distance <= 350:
            return 8

        if best_distance <= 700:
            return 3

        return 0

    # ------------------------------------------------------------------
    # CONTENT / TOC
    # ------------------------------------------------------------------

    def content_score(
        self,
        text: str,
        query: str,
    ) -> int:
        concepts = self.extract_concepts(query)
        keywords = self.expand_keywords(query)

        if not keywords:
            return 0

        normalized = self.normalize_for_match(text)

        matched_variants = 0

        for term in keywords:
            if term and term in normalized:
                matched_variants += 1

        concept_hits = 0

        for concept in concepts:
            variants = self.CONCEPT_GROUPS.get(
                concept,
                (),
            )

            if any(
                self.normalize_for_match(v)
                in normalized
                for v in variants
            ):
                concept_hits += 1

        score = min(
            matched_variants * 4,
            20,
        )

        score += min(
            concept_hits * 10,
            35,
        )

        return min(score, 50)

    def toc_penalty(self, text: str) -> int:
        lines = self._heading_lines(text)

        marker_hits = 0

        for line in lines:
            line_n = self.normalize_for_heading(line)

            if any(
                line_n == self.normalize_for_heading(marker)
                or line_n.startswith(
                    self.normalize_for_heading(marker)
                    + " "
                )
                for marker in self.TOC_MARKERS
            ):
                marker_hits += 1

            if re.search(
                r"\.{4,}\s*\d+$",
                line_n,
            ):
                marker_hits += 1

        if marker_hits >= 3:
            return 25

        if marker_hits == 2:
            return 15

        if marker_hits == 1:
            return 8

        return 0

    # ------------------------------------------------------------------
    # SEMANTIC TIE-BREAKER - Stage 3.2.4.2H
    # ------------------------------------------------------------------

    RULING_MARKERS = (
        "حكمه", "حكمها", "حكم", "يجوز", "لا يجوز",
        "يصح", "لا يصح", "يبطل", "لا يبطل",
        "يشترط", "يشترطون", "شروط", "شرط",
        "يجب", "لا يجب", "يحرم", "لا يحرم",
        "فاسد", "باطل", "صحيح",
    )

    def semantic_tiebreaker_score(
        self,
        text: str,
        query: str,
    ) -> int:
        """
        Sinyal semantic generik untuk memecahkan tie-ranking.

        Guardrail:
        - Tidak memakai daftar khusus query.
        - Tidak menggantikan heading/phrase ranking.
        - Bonus dibatasi agar tidak mengalahkan prioritas heading
          hanya karena sebuah marker hukum berulang berkali-kali.
        """
        normalized = self.normalize_for_match(text)
        if not normalized:
            return 0

        concepts = self.extract_concepts(query)
        if not concepts:
            return 0

        concept_positions = self._concept_positions(normalized, concepts)
        if not concept_positions:
            return 0

        ruling_positions = self._find_positions(
            normalized,
            self.RULING_MARKERS,
        )

        if not ruling_positions:
            return 0

        score = 0

        # 1) Konsep query yang berada dekat marker hukum.
        #    Ini lebih kuat daripada sekadar jumlah kemunculan kata.
        covered_near_ruling = 0
        for positions in concept_positions.values():
            nearest = min(
                abs(ruling_pos - concept_pos)
                for concept_pos in positions[:40]
                for ruling_pos in ruling_positions[:80]
            )

            if nearest <= 80:
                score += 5
                covered_near_ruling += 1
            elif nearest <= 180:
                score += 3
                covered_near_ruling += 1
            elif nearest <= 320:
                score += 1

        # 2) Dorong konteks yang memuat beberapa konsep berdekatan
        #    dengan marker hukum, tetapi tetap dibatasi.
        if covered_near_ruling >= 2:
            score += 3

        # 3) Sinyal awal: marker hukum muncul di bagian awal konteks.
        first_ruling = min(ruling_positions)
        if first_ruling <= 120:
            score += 3
        elif first_ruling <= 300:
            score += 1

        return min(score, 14)

    # ------------------------------------------------------------------
    # RANKING
    # ------------------------------------------------------------------

    def _rank_result(
        self,
        item: Dict[str, Any],
        query: str,
    ) -> Dict[str, Any]:
        text = item.get("teks") or ""

        heading = self.heading_score(
            text,
            query,
        )
        phrase = self.exact_phrase_score(
            text,
            query,
        )
        content = self.content_score(
            text,
            query,
        )
        coverage = self.concept_coverage_score(
            text,
            query,
        )
        proximity = self.proximity_score(
            text,
            query,
        )
        toc = self.toc_penalty(text)
        semantic = self.semantic_tiebreaker_score(text, query)

        heading_level = 0
        exact_heading = False
        near_exact_heading = False
        qualified_heading = False

        for line in self._heading_lines(text):
            if not self.is_heading_line(line):
                continue

            relation = self._heading_relation(
                line,
                query,
            )

            level = int(
                relation["level"]
            )

            if level > heading_level:
                heading_level = level

            if level == 5:
                exact_heading = True
            elif level == 4:
                near_exact_heading = True
            elif level == 3:
                qualified_heading = True

        score = (
            content
            + coverage
            + heading
            + phrase
            + proximity
            + semantic
            - toc
        )

        # Prioritas heading tetap deterministik.
        if exact_heading:
            score += 20
        elif near_exact_heading:
            score += 12
        elif qualified_heading:
            score += 7

        result = dict(item)

        result.update(
            {
                "score": int(score),
                "heading_score": int(heading),
                "phrase_score": int(phrase),
                "heading_level": int(heading_level),
                "exact_heading": bool(exact_heading),
                "near_exact_heading": bool(
                    near_exact_heading
                ),
                "qualified_heading": bool(
                    qualified_heading
                ),
                "concept_coverage_score": int(
                    coverage
                ),
                "proximity_score": int(
                    proximity
                ),
                "semantic_tiebreaker_score": int(
                    semantic
                ),
                "content_score": int(
                    content
                ),
                "toc_penalty": int(
                    toc
                ),
                "matched_concepts": self.extract_concepts(
                    query
                ),
                "matched_keywords": self.extract_keywords(
                    query
                ),
                "context": self.get_context(
                    text,
                    query,
                ),
            }
        )

        return result

    def _deduplicate_results(
        self,
        results: Sequence[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        seen = set()
        output: List[Dict[str, Any]] = []

        for item in results:
            key = (
                item.get("kitab_id"),
                item.get("halaman"),
                item.get("page_id"),
                item.get("id"),
            )

            if key in seen:
                continue

            seen.add(key)
            output.append(item)

        return output

    # ------------------------------------------------------------------
    # SQLITE
    # ------------------------------------------------------------------

    def _resolve_source_sqlite_path(
        self,
        source_file: Any,
    ) -> Optional[Path]:
        """Resolve path source_file Shamela ke file SQLite lokal yang tersedia."""
        raw = str(source_file or "").strip()
        if not raw:
            return None

        candidates: List[Path] = []
        direct = Path(raw)
        candidates.append(direct)

        # Metadata lama mencatat D:\IslamicLibrary, sedangkan instalasi aktual
        # user berada di D:\AI_KITAB\IslamicLibrary.
        marker = "D:\\IslamicLibrary\\"
        raw_norm = raw.replace("/", "\\")
        if raw_norm.lower().startswith(marker.lower()):
            relative = raw_norm[len(marker):]
            candidates.append(Path(r"D:\AI_KITAB\IslamicLibrary") / relative)

        # Kandidat umum bila metadata berasal dari root D:\IslamicLibrary.
        tail = raw_norm.split("IslamicLibrary\\", 1)
        if len(tail) == 2:
            candidates.append(Path(r"D:\AI_KITAB\IslamicLibrary") / tail[1])

        # Hilangkan duplikat tetapi pertahankan prioritas.
        seen: set[str] = set()
        for candidate in candidates:
            key = str(candidate).lower()
            if key in seen:
                continue
            seen.add(key)
            try:
                if candidate.is_file():
                    return candidate
            except OSError:
                continue

        return None

    @staticmethod
    def _readonly_sqlite_connection(db_path: Path) -> sqlite3.Connection:
        uri = db_path.resolve().as_uri() + "?mode=ro"
        conn = sqlite3.connect(uri, uri=True)
        conn.row_factory = sqlite3.Row
        return conn

    def _parse_shamela_page_html(
        self,
        html_text: Any,
    ) -> Tuple[str, str, int]:
        """Keluarkan teks utama + catatan kaki dari HTML pages.page."""
        parser = _ShamelaPageParser()
        parser.feed(str(html_text or ""))
        parser.close()
        return parser.result()

    def _load_original_page(
        self,
        item: Dict[str, Any],
    ) -> Optional[Dict[str, Any]]:
        """Ambil HTML halaman asli dari DB kitab Shamela secara READ ONLY."""
        source_file = (
            item.get("metadata_source_file")
            or item.get("sumber_file")
        )
        db_path = self._resolve_source_sqlite_path(source_file)
        if db_path is None:
            return None

        page_id = item.get("page_id")
        jilid = item.get("jilid")
        halaman = item.get("halaman")

        try:
            with self._readonly_sqlite_connection(db_path) as conn:
                row = None

                if page_id is not None:
                    row = conn.execute(
                        "SELECT id, partnumber, pagenumber, page FROM pages WHERE id = ? LIMIT 1",
                        (int(page_id),),
                    ).fetchone()

                if row is None and halaman is not None:
                    if jilid is not None:
                        row = conn.execute(
                            "SELECT id, partnumber, pagenumber, page FROM pages WHERE partnumber = ? AND pagenumber = ? LIMIT 1",
                            (int(jilid), int(halaman)),
                        ).fetchone()
                    if row is None:
                        row = conn.execute(
                            "SELECT id, partnumber, pagenumber, page FROM pages WHERE pagenumber = ? LIMIT 1",
                            (int(halaman),),
                        ).fetchone()

                if row is None:
                    return None

                main_text, footnotes, count = self._parse_shamela_page_html(row["page"])

                return {
                    "source_db": str(db_path),
                    "source_page_id": int(row["id"]),
                    "source_partnumber": row["partnumber"],
                    "source_pagenumber": row["pagenumber"],
                    "teks_arab_asli": main_text,
                    "catatan_kaki": footnotes or None,
                    "jumlah_catatan_kaki": count,
                }
        except (OSError, sqlite3.Error, ValueError, TypeError):
            return None

    def _enrich_sqlite_result_from_source(
        self,
        item: Dict[str, Any],
    ) -> Dict[str, Any]:
        enriched = dict(item)
        original = self._load_original_page(enriched)
        if not original:
            return enriched

        main_text = original.get("teks_arab_asli")
        if main_text:
            enriched["teks"] = main_text
            enriched["teks_arab"] = main_text
            enriched["isi_materi"] = main_text

        enriched["catatan_kaki"] = original.get("catatan_kaki")
        enriched["source_db"] = original.get("source_db")
        enriched["source_page_id"] = original.get("source_page_id")
        enriched["source_partnumber"] = original.get("source_partnumber")
        enriched["source_pagenumber"] = original.get("source_pagenumber")
        enriched["jumlah_catatan_kaki"] = original.get("jumlah_catatan_kaki", 0)
        return enriched

    def _sqlite_connection(
        self,
    ) -> sqlite3.Connection:
        if not self.sqlite_db.exists():
            raise FileNotFoundError(
                f"SQLite tidak ditemukan: {self.sqlite_db}"
            )

        uri = (
            self.sqlite_db.resolve().as_uri()
            + "?mode=ro"
        )

        conn = sqlite3.connect(
            uri,
            uri=True,
        )

        conn.row_factory = sqlite3.Row

        return conn

    def _concept_sql_conditions(
        self,
        query: str,
    ) -> Tuple[List[str], List[Any]]:
        """
        Membuat kondisi AND antar konsep.
        Dalam satu konsep, semua variant-nya adalah OR.
        """
        concepts = self.extract_concepts(query)

        clauses: List[str] = []
        params: List[Any] = []

        for concept in concepts:
            variants = self.CONCEPT_GROUPS.get(
                concept,
                (),
            )

            variant_conditions: List[str] = []

            for variant in variants:
                normalized = self.normalize_for_match(
                    variant
                )

                if not normalized:
                    continue

                variant_conditions.append(
                    "teks LIKE ?"
                )
                params.append(
                    f"%{normalized}%"
                )

                # Bentuk literal asli tetap dicoba untuk
                # kasus Unicode yang tidak berubah.
                literal = str(variant).strip()

                if (
                    literal
                    and literal != normalized
                ):
                    variant_conditions.append(
                        "teks LIKE ?"
                    )
                    params.append(
                        f"%{literal}%"
                    )

            if variant_conditions:
                clauses.append(
                    "("
                    + " OR ".join(
                        variant_conditions
                    )
                    + ")"
                )

        return clauses, params

    def _sqlite_candidates(
        self,
        query: str,
        candidate_limit: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        candidate_limit = (
            candidate_limit
            or self.SQLITE_CANDIDATE_LIMIT
        )

        concepts = self.extract_concepts(query)
        keywords = self.expand_keywords(query)

        if not keywords:
            return []

        raw_query = (
            self.normalize_arabic(
                query,
                preserve_newlines=False,
            )
        )
        raw_query = re.sub(
            r"\s+",
            " ",
            raw_query,
        ).strip()

        # --------------------------------------------------------------
        # PASS 1:
        # exact phrase OR semua konsep hadir.
        # --------------------------------------------------------------
        conditions: List[str] = []
        params: List[Any] = []

        if raw_query:
            # Coba bentuk ter-normalisasi.
            conditions.append("teks LIKE ?")
            params.append(
                f"%{raw_query}%"
            )

            # Coba query literal asli jika berbeda.
            literal_query = str(query).strip()

            if (
                literal_query
                and literal_query != raw_query
            ):
                conditions.append(
                    "teks LIKE ?"
                )
                params.append(
                    f"%{literal_query}%"
                )

        concept_clauses, concept_params = (
            self._concept_sql_conditions(query)
        )

        if concept_clauses:
            conditions.append(
                "("
                + " AND ".join(
                    concept_clauses
                )
                + ")"
            )
            params.extend(concept_params)

        # --------------------------------------------------------------
        # PASS 2 fallback:
        # OR semua keyword bila PASS 1 terlalu sempit.
        # --------------------------------------------------------------
        fallback_conditions: List[str] = []
        fallback_params: List[Any] = []

        for term in keywords:
            fallback_conditions.append(
                "teks LIKE ?"
            )
            fallback_params.append(
                f"%{term}%"
            )

        if not conditions:
            conditions = fallback_conditions
            params = fallback_params

        order_case = (
            "CASE "
            "WHEN teks LIKE ? THEN 0 "
            "ELSE 1 END"
        )
        order_param = (
            f"%{raw_query}%"
            if raw_query
            else "%___never___%"
        )

        sql = f"""
            SELECT
            kc.id,
            kc.kitab_id,
            kc.page_id,
            kc.jilid,
            kc.halaman,
            kc.teks,
            kc.sumber_file,
            kc.created_at,
            sr.nama_kitab,
            sr.pengarang,
            sr.kategori AS kategori_kitab,
            sr.source_file AS metadata_source_file
            FROM kitab_content kc
            LEFT JOIN scan_results sr
            ON sr.kitab_id = kc.kitab_id
            WHERE {" OR ".join(conditions)}
            ORDER BY {order_case}, id
            LIMIT ?
        """

        params.append(order_param)
        params.append(int(candidate_limit))

        with self._sqlite_connection() as conn:
            rows = conn.execute(
                sql,
                params,
            ).fetchall()

            # Bila query multi-konsep dan hasil pertama terlalu lemah,
            # ambil fallback OR sebagai cadangan.
            if (
                len(rows) < max(
                    20,
                    min(200, candidate_limit // 10),
                )
                and len(concepts) >= 2
            ):
                fallback_sql = f"""
                    SELECT
                    kc.id,
                    kc.kitab_id,
                    kc.page_id,
                    kc.jilid,
                    kc.halaman,
                    kc.teks,
                    kc.sumber_file,
                    kc.created_at,
                    sr.nama_kitab,
                    sr.pengarang,
                    sr.kategori AS kategori_kitab,
                    sr.source_file AS metadata_source_file
                    FROM kitab_content kc
                    LEFT JOIN scan_results sr
                    ON sr.kitab_id = kc.kitab_id
                    WHERE {" OR ".join(fallback_conditions)}
                    ORDER BY kc.id
                    LIMIT ?
                     """
                fallback_rows = conn.execute(
                    fallback_sql,
                    fallback_params
                    + [int(candidate_limit)],
                ).fetchall()

                existing_ids = {
                    int(row["id"])
                    for row in rows
                }

                for row in fallback_rows:
                    if int(row["id"]) not in existing_ids:
                        rows.append(row)

                    if len(rows) >= int(
                        candidate_limit
                    ):
                        break

        return [
            dict(row)
            for row in rows
        ]

    def search_sqlite(
        self,
        query: str,
        limit: int = DEFAULT_LIMIT,
    ) -> List[Dict[str, Any]]:
        query = (query or "").strip()

        if not query:
            return []

        candidates = self._sqlite_candidates(
            query
        )

        ranked = [
            self._rank_result(
                item,
                query,
            )
            for item in candidates
        ]

        # Deteksi bab langsung dari konten SQLite.
        # Hanya menggunakan teks yang benar-benar ada di record.
        for item in ranked:
            detected_bab = self._detect_bab_from_text(
                item.get("teks") or ""
            )
            if detected_bab:
                item["bab"] = detected_bab

        ranked = self._deduplicate_results(
            ranked
        )

        ranked.sort(
            key=lambda x: (
                x.get("score", 0),
                x.get(
                    "heading_score",
                    0,
                ),
                x.get(
                    "phrase_score",
                    0,
                ),
                x.get(
                    "concept_coverage_score",
                    0,
                ),
                x.get(
                    "proximity_score",
                    0,
                ),
                x.get(
                    "semantic_tiebreaker_score",
                    0,
                ),
                -x.get(
                    "toc_penalty",
                    0,
                ),
            ),
            reverse=True,
        )

        final_limit = max(
            1,
            min(int(limit), 50),
        )
        final_results = ranked[:final_limit]

        # Setelah ranking selesai, ambil halaman asli hanya untuk hasil final.
        # Ini menjaga ranking tetap cepat dan tidak membuka ribuan DB sumber.
        for item in final_results:
            enriched = self._enrich_sqlite_result_from_source(item)
            item.clear()
            item.update(enriched)

        return final_results

    # ------------------------------------------------------------------
    # MYSQL
    # ------------------------------------------------------------------

    def search_mysql(
        self,
        db: Session,
        query: str,
        limit: int = DEFAULT_LIMIT,
    ) -> List[Dict[str, Any]]:
        query = (query or "").strip()

        if not query:
            return []

        terms = self.expand_keywords(query)

        if not terms:
            terms = [
                self.normalize_for_match(query)
            ]

        fields = (
            MuamalahMateri.pertanyaan,
            MuamalahMateri.judul,
            MuamalahMateri.isi_materi,
            MuamalahMateri.kategori,
            MuamalahMateri.teks_arab,
            MuamalahMateri.terjemah,
            MuamalahMateri.penjelasan,
            MuamalahMateri.catatan_kaki,
        )

        conditions = []

        for term in terms:
            pattern = f"%{term}%"

            conditions.extend(
                field.like(pattern)
                for field in fields
            )

        rows = (
            db.query(MuamalahMateri)
            .filter(
                MuamalahMateri.aktif == True,
                or_(*conditions),
            )
            .order_by(
                MuamalahMateri.judul.asc()
            )
            .limit(
                self.MYSQL_CANDIDATE_LIMIT
            )
            .all()
        )

        results: List[Dict[str, Any]] = []

        for row in rows:
            text_parts = [
                getattr(
                    row,
                    "pertanyaan",
                    None,
                ),
                getattr(
                    row,
                    "judul",
                    None,
                ),
                getattr(
                    row,
                    "isi_materi",
                    None,
                ),
                getattr(
                    row,
                    "kategori",
                    None,
                ),
                getattr(
                    row,
                    "teks_arab",
                    None,
                ),
                getattr(
                    row,
                    "terjemah",
                    None,
                ),
                getattr(
                    row,
                    "penjelasan",
                    None,
                ),
                getattr(
                    row,
                    "catatan_kaki",
                    None,
                ),
            ]

            text = "\n".join(
                str(value)
                for value in text_parts
                if value
            )

            item: Dict[str, Any] = {
                "source": "mysql",
                "id": getattr(
                    row,
                    "id",
                    None,
                ),
                "kitab_id": getattr(
                    row,
                    "kitab_id",
                    None,
                ),
                "kitab": getattr(
                    row,
                    "kitab",
                    None,
                ),
                "judul": getattr(
                    row,
                    "judul",
                    None,
                ),
                "pertanyaan": getattr(
                    row,
                    "pertanyaan",
                    None,
                ),
                "teks_arab": getattr(
                    row,
                    "teks_arab",
                    None,
                ),
                "terjemah": getattr(
                    row,
                    "terjemah",
                    None,
                ),
                "penjelasan": getattr(
                    row,
                    "penjelasan",
                    None,
                ),
                "catatan_kaki": getattr(
                    row,
                    "catatan_kaki",
                    None,
                ),
                "isi_materi": getattr(
                    row,
                    "isi_materi",
                    None,
                ),
                "kategori": getattr(
                    row,
                    "kategori",
                    None,
                ),
                "referensi_kitab": getattr(
                    row,
                    "referensi_kitab",
                    None,
                ),
                "halaman": getattr(
                    row,
                    "halaman",
                    None,
                ),
                "created_at": getattr(
                    row,
                      "created_at", 
                    None),
                "updated_at": getattr(
                    row,
                      "updated_at", 
                    None),
                "teks": text,
            }

            results.append(
                self._rank_result(
                    item,
                    query,
                )
            )

        results.sort(
            key=lambda x: (
                x.get("score", 0),
                x.get(
                    "heading_score",
                    0,
                ),
                x.get(
                    "phrase_score",
                    0,
                ),
                x.get(
                    "concept_coverage_score",
                    0,
                ),
                x.get(
                    "proximity_score",
                    0,
                ),
                x.get(
                    "semantic_tiebreaker_score",
                    0,
                ),
            ),
            reverse=True,
        )

        return results[
            : max(
                1,
                min(int(limit), 50),
            )
        ]

    # ------------------------------------------------------------------
    # COMBINED
    # ------------------------------------------------------------------

    def search(
        self,
        query: str,
        limit: int = DEFAULT_LIMIT,
        db: Optional[Session] = None,
    ) -> List[Dict[str, Any]]:
        query = (query or "").strip()

        if not query:
            return []

        sqlite_results = self.search_sqlite(
            query,
            limit=max(
                limit * 3,
                10,
            ),
        )

        mysql_results: List[Dict[str, Any]] = []

        if db is not None:
            mysql_results = self.search_mysql(
                db,
                query,
                limit=max(
                    limit * 3,
                    10,
                ),
            )

        combined = self._deduplicate_results(
            [
                *sqlite_results,
                *mysql_results,
            ]
        )

        combined.sort(
            key=lambda x: (
                x.get("score", 0),
                x.get(
                    "heading_score",
                    0,
                ),
                x.get(
                    "phrase_score",
                    0,
                ),
                x.get(
                    "concept_coverage_score",
                    0,
                ),
                x.get(
                    "proximity_score",
                    0,
                ),
                x.get(
                    "semantic_tiebreaker_score",
                    0,
                ),
                -x.get(
                    "toc_penalty",
                    0,
                ),
            ),
            reverse=True,
        )

        return combined[
            : max(
                1,
                min(int(limit), 50),
            )
        ]

    # ------------------------------------------------------------------
    # DEBUG
    # ------------------------------------------------------------------

    def debug_search(
        self,
        query: str,
        limit: int = 10,
    ) -> None:
        results = self.search_sqlite(
            query,
            limit=limit,
        )

        print("=" * 90)
        print("QUERY:", query)
        print("SQLite:", self.sqlite_db)
        print("RESULT:", len(results))
        print("CONCEPTS:", self.extract_concepts(query))
        print("KEYWORDS:", self.extract_keywords(query))
        print("=" * 90)

        for index, item in enumerate(
            results,
            1,
        ):
            print(
                f"{index}. "
                f"SCORE={item.get('score')} "
                f"KITAB={item.get('kitab_id')} "
                f"HAL={item.get('halaman')} "
                f"LEVEL={item.get('heading_level')} "
                f"EXACT={item.get('exact_heading')} "
                f"NEAR={item.get('near_exact_heading')} "
                f"QUALIFIED={item.get('qualified_heading')} "
                f"HEAD={item.get('heading_score')} "
                f"PHRASE={item.get('phrase_score')} "
                f"COVERAGE={item.get('concept_coverage_score')} "
                f"PROX={item.get('proximity_score')} "
                f"TOC={item.get('toc_penalty')} "
                f"MATCH={item.get('matched_concepts')}"
            )

            print(
                item.get("teks", "")[:700]
            )
            print("-" * 90)


if __name__ == "__main__":
    print(
        "MuamalahRetrieval - Stage 3.2.4.2"
    )
    print(
        "Jalankan dari backend dengan:"
    )
    print(
        "python -c "
        "\"from app.ai.muamalah.muamalah_retrieval "
        "import MuamalahRetrieval; "
        "r=MuamalahRetrieval(); "
        "print(r.sqlite_db, r.sqlite_db.exists())\""
    )
