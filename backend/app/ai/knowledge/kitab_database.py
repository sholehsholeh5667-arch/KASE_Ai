from __future__ import annotations

from typing import Any

from sqlalchemy import text

from app.core.database import SessionLocal


class KitabDatabaseSearch:
    """Pencarian langsung ke tabel ai_kitab_kuning."""

    def __init__(self, session_factory=SessionLocal):
        self.session_factory = session_factory

    @staticmethod
    def _clean(value: Any) -> str:
        return "" if value is None else str(value).strip()

    @classmethod
    def _row_to_dict(cls, row: Any) -> dict[str, Any]:
        data = dict(row)

        data["category"] = "kitab"

        for key in (
            "kitab",
            "bab",
            "page_text",
            "arab",
            "terjemah",
            "penjelasan",
            "keyword",
            "source_file",
            "sha256",
        ):
            data[key] = cls._clean(data.get(key))

        return data

    def count(self) -> int:
        """Menghitung jumlah data kitab."""
        with self.session_factory() as db:
            result = db.execute(
                text(
                    "SELECT COUNT(*) "
                    "FROM ai_kitab_kuning"
                )
            )

            return int(result.scalar_one())

    def unique_page_count(self) -> int:
        """Menghitung jumlah halaman PDF yang unik."""
        with self.session_factory() as db:
            result = db.execute(
                text(
                    "SELECT COUNT(DISTINCT pdf_page) "
                    "FROM ai_kitab_kuning"
                )
            )

            return int(result.scalar_one())

    def page_range(self) -> tuple[int | None, int | None]:
        """Mengambil halaman PDF pertama dan terakhir."""
        with self.session_factory() as db:
            result = db.execute(
                text(
                    """
                    SELECT
                        MIN(pdf_page) AS first_page,
                        MAX(pdf_page) AS last_page
                    FROM ai_kitab_kuning
                    """
                )
            )

            row = result.mappings().one()

        return row["first_page"], row["last_page"]

    def search(
        self,
        keyword: str,
        limit: int = 5,
    ) -> list[dict[str, Any]]:
        """
        Mencari keyword pada data kitab.

        Pencarian dilakukan pada:
        - kitab
        - bab
        - page_text
        - arab
        - terjemah
        - penjelasan
        - keyword

        page_text tidak dipotong.
        """

        keyword = self._clean(keyword)

        if not keyword:
            return []

        try:
            limit = int(limit)
        except (TypeError, ValueError):
            limit = 5

        limit = max(1, min(limit, 20))

        like = f"%{keyword}%"

        query = text(
            """
            SELECT
                kitab,
                bab,
                bab_nomor,
                pdf_page,
                halaman,
                page_text,
                arab,
                terjemah,
                penjelasan,
                keyword,
                source_file,
                char_count,
                sha256
            FROM ai_kitab_kuning
            WHERE
                kitab LIKE :like
                OR bab LIKE :like
                OR page_text LIKE :like
                OR arab LIKE :like
                OR terjemah LIKE :like
                OR penjelasan LIKE :like
                OR keyword LIKE :like
            ORDER BY
                CASE
                    WHEN keyword LIKE :like THEN 0
                    WHEN bab LIKE :like THEN 1
                    WHEN kitab LIKE :like THEN 2
                    ELSE 3
                END,
                pdf_page ASC
            LIMIT :limit
            """
        )

        with self.session_factory() as db:
            rows = db.execute(
                query,
                {
                    "like": like,
                    "limit": limit,
                },
            ).mappings().all()

        return [
            self._row_to_dict(row)
            for row in rows
        ]

    def get_page(
        self,
        pdf_page: int,
    ) -> dict[str, Any] | None:
        """Mengambil satu halaman berdasarkan pdf_page."""

        with self.session_factory() as db:
            result = db.execute(
                text(
                    """
                    SELECT
                        kitab,
                        bab,
                        bab_nomor,
                        pdf_page,
                        halaman,
                        page_text,
                        arab,
                        terjemah,
                        penjelasan,
                        keyword,
                        source_file,
                        char_count,
                        sha256
                    FROM ai_kitab_kuning
                    WHERE pdf_page = :pdf_page
                    LIMIT 1
                    """
                ),
                {
                    "pdf_page": int(pdf_page),
                },
            )

            row = result.mappings().first()

        if not row:
            return None

        return self._row_to_dict(row)