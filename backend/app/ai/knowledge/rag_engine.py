"""
RAG Engine
==========

Retrieval-Augmented Generation Engine.

Sumber knowledge:
- Muamalah      -> MuamalahRetrieval
- Kategori lain -> KnowledgeManager lama
"""

from app.ai.knowledge.knowledge_router import KnowledgeRouter
from app.ai.knowledge.knowledge_memory import KnowledgeMemory
from app.ai.knowledge.knowledge_ranking import KnowledgeRanking
from app.ai.muamalah.muamalah_retrieval import MuamalahRetrieval


class RAGEngine:
    """
    Retrieval-Augmented Generation Engine.
    """

    def __init__(self, knowledge_manager):
        self.router = KnowledgeRouter(
            knowledge_manager
        )

        self.memory = KnowledgeMemory()

        self.ranking = KnowledgeRanking()

        # Retrieval khusus Muamalah
        self.muamalah_retrieval = MuamalahRetrieval()

    # ==========================================================
    # SEARCH MATERI MUAMALAH
    # ==========================================================

    def _search_muamalah(
        self,
        db,
        message: str,
        limit: int = 10
    ):
        """
        Mencari referensi Muamalah.

        Untuk pertanyaan bahasa Indonesia,
        query akan diperluas ke istilah fiqih Arab.
        """

        message = (message or "").strip()

        if not message:
            return []

        # ======================================================
        # QUERY UTAMA
        # ======================================================

        queries = [message]

        message_lower = message.lower()

        # ======================================================
        # QUERY EXPANSION
        # ======================================================

        if (
            "salam" in message_lower
            or "aqad salam" in message_lower
            or "akad salam" in message_lower
        ):
            queries.extend(
                [
                    "عقد السلم",
                    "السلم",
                    "السلف",
                ]
            )

        elif (
            "ijarah" in message_lower
            or "sewa" in message_lower
            or "sewa menyewa" in message_lower
        ):
            queries.extend(
                [
                    "الإجارة",
                    "إجارة",
                ]
            )

        elif "mudharabah" in message_lower:
            queries.extend(
                [
                    "المضاربة",
                    "القراض",
                ]
            )

        elif (
            "musyarakah" in message_lower
            or "syirkah" in message_lower
        ):
            queries.extend(
                [
                    "الشركة",
                    "المشاركة",
                ]
            )

        elif "murabahah" in message_lower:
            queries.append("المرابحة")

        elif "riba" in message_lower:
            queries.append("الربا")

        elif "gharar" in message_lower:
            queries.append("الغرر")

        elif "wakalah" in message_lower:
            queries.append("الوكالة")

        elif "rahn" in message_lower:
            queries.append("الرهن")

        elif (
            "qardh" in message_lower
            or "qard" in message_lower
            or "pinjaman" in message_lower
        ):
            queries.append("القرض")

        elif "zakat" in message_lower:
            queries.append("الزكاة")

        # ======================================================
        # HAPUS QUERY DUPLIKAT
        # ======================================================

        queries = list(
            dict.fromkeys(queries)
        )

        print(
            "[RAGEngine] Muamalah queries:",
            queries
        )

        # ======================================================
        # PENCARIAN
        # ======================================================

        for query in queries:
            try:
                results = self.muamalah_retrieval.search(
                    query=query,
                    db=db,
                    limit=limit,
                )

                jumlah = (
                    len(results)
                    if isinstance(results, list)
                    else 0
                )

                print(
                    f"[RAGEngine] "
                    f"query={query!r} "
                    f"hasil={jumlah}"
                )

                if (
                    isinstance(results, list)
                    and results
                ):
                    return results[:limit]

            except TypeError:
                # Fallback jika search tidak menerima db
                try:
                    results = self.muamalah_retrieval.search(
                        query=query,
                        limit=limit,
                    )

                    if (
                        isinstance(results, list)
                        and results
                    ):
                        return results[:limit]

                except Exception as e:
                    print(
                        "[RAGEngine] "
                        f"Muamalah retrieval error "
                        f"query={query!r}: {e}"
                    )

            except Exception as e:
                print(
                    "[RAGEngine] "
                    f"Muamalah retrieval error "
                    f"query={query!r}: {e}"
                )

        return []

    # ==========================================================
    # GENERATE
    # ==========================================================

    def generate(
        self,
        session_id: str,
        request: dict,
    ):
        """
        Menghasilkan context knowledge.
        """

        message = (
            request.get(
                "message",
                "",
            )
            .strip()
        )

        if not message:
            return {
                "status": "not_found",
                "context": [],
                "ranking": [],
                "message": (
                    "Pertanyaan kosong."
                ),
            }

        # ======================================================
        # DATABASE SESSION
        # ======================================================

        db = request.get(
            "db"
        )

        # ======================================================
        # DETECT CATEGORY
        # ======================================================

        category = (
            self.router.detect_category(
                message
            )
        )

        print(
            "[RAGEngine] "
            f"category={category!r}"
        )

        # ======================================================
        # CARI KNOWLEDGE
        # ======================================================

        if (
            category == "muamalah"
            and db is not None
        ):

            # --------------------------------------------------
            # MUAMALAH -> MuamalahRetrieval
            # --------------------------------------------------

            results = self._search_muamalah(
                db=db,
                message=message,
                limit=10,
            )

        else:

            # --------------------------------------------------
            # KNOWLEDGE LAMA
            # --------------------------------------------------

            results = self.router.route(
                request
            )

        # ======================================================
        # TIDAK DITEMUKAN
        # ======================================================

        if not results:
            return {
                "status": "not_found",
                "context": [],
                "ranking": [],
                "message": (
                    "Knowledge tidak ditemukan."
                ),
            }

        # ======================================================
        # RANKING
        # ======================================================

        ranked = self.ranking.rank(
            message,
            results,
        )

        if not ranked:
            return {
                "status": "not_found",
                "context": [],
                "ranking": [],
                "message": (
                    "Knowledge tidak ditemukan."
                ),
            }

        # ======================================================
        # KNOWLEDGE TERBAIK
        # ======================================================

        best = ranked[0]["result"]

        # ======================================================
        # SIMPAN MEMORY
        # ======================================================

        self.memory.save(
            session_id=session_id,
            category=category or "general",
            keyword=message,
            result=best,
        )

        # ======================================================
        # RESPONSE
        # ======================================================

        return {
            "status": "success",
            "context": best,
            "ranking": ranked,
            "message": (
                "Knowledge berhasil ditemukan."
            ),
        }

    # ==========================================================
    # RETRIEVE
    # ==========================================================

    def retrieve(
        self,
        request: dict,
    ):
        """
        Kompatibilitas dengan KnowledgeAPI.
        """

        session_id = request.get(
            "session_id",
            "default",
        )

        return self.generate(
            session_id=session_id,
            request=request,
        )

    # ==========================================================
    # MEMORY
    # ==========================================================

    def get_memory(
        self,
        session_id: str,
    ):
        """
        Mengambil memory knowledge.
        """

        return self.memory.load(
            session_id
        )

    # ==========================================================
    # LAST MEMORY
    # ==========================================================

    def last_memory(
        self,
        session_id: str,
    ):
        """
        Mengambil knowledge terakhir.
        """

        return self.memory.last(
            session_id
        )

    # ==========================================================
    # CLEAR MEMORY
    # ==========================================================

    def clear_memory(
        self,
        session_id: str,
    ):
        """
        Menghapus memory knowledge.
        """

        self.memory.clear(
            session_id
        )

    # ==========================================================
    # MEMORY COUNT
    # ==========================================================

    def memory_count(
        self,
        session_id: str,
    ):
        """
        Menghitung jumlah memory.
        """

        return len(
            self.memory.load(
                session_id
            )
        )