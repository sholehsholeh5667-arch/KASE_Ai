from __future__ import annotations

import html
import re
import sqlite3

from html.parser import HTMLParser
from pathlib import Path
from typing import Any


# ============================================================
# HTML → TEXT
# ============================================================

class HTMLTextParser(HTMLParser):

    def __init__(self):
        super().__init__()

        self.parts: list[str] = []

        self.block_tags = {
            "p",
            "div",
            "br",
            "h1",
            "h2",
            "h3",
            "h4",
            "h5",
            "h6",
            "li",
            "tr",
        }

    def handle_starttag(
        self,
        tag: str,
        attrs,
    ):
        tag = tag.lower()

        if tag in self.block_tags:
            self.parts.append("\n")

    def handle_endtag(
        self,
        tag: str,
    ):
        tag = tag.lower()

        if tag in self.block_tags:
            self.parts.append("\n")

    def handle_data(
        self,
        data: str,
    ):
        self.parts.append(data)

    def get_text(self) -> str:

        value = "".join(
            self.parts
        )

        value = html.unescape(
            value
        )

        value = value.replace(
            "\r",
            "",
        )

        value = re.sub(
            r"[ \t]+",
            " ",
            value,
        )

        value = re.sub(
            r"\n[ \t]+",
            "\n",
            value,
        )

        value = re.sub(
            r"\n{3,}",
            "\n\n",
            value,
        )

        return value.strip()


def clean_html(
    value: str | None,
) -> str:

    if not value:
        return ""

    parser = HTMLTextParser()

    parser.feed(value)

    parser.close()

    return parser.get_text()


# ============================================================
# SQLITE READER
# ============================================================

class SQLiteKitabReader:

    # ========================================================
    # CONNECT READ-ONLY
    # ========================================================

    @staticmethod
    def connect(
        path: str | Path,
    ) -> sqlite3.Connection:

        file_path = (
            Path(path)
            .expanduser()
            .resolve()
        )

        if not file_path.exists():
            raise FileNotFoundError(
                f"File SQLite tidak ditemukan: "
                f"{file_path}"
            )

        if not file_path.is_file():
            raise ValueError(
                f"Path bukan file: "
                f"{file_path}"
            )

        if file_path.suffix.lower() not in {
            ".sqlite",
            ".db",
        }:
            raise ValueError(
                "File harus .sqlite atau .db."
            )

        # URI mode=ro
        uri = (
            "file:"
            + str(file_path).replace(
                "\\",
                "/",
            )
            + "?mode=ro"
        )

        return sqlite3.connect(
            uri,
            uri=True,
        )

    # ========================================================
    # VALIDASI FORMAT
    # ========================================================

    @staticmethod
    def validate(
        conn: sqlite3.Connection,
    ):

        rows = conn.execute(
            """
            SELECT name
            FROM sqlite_master
            WHERE type='table'
            """
        ).fetchall()

        tables = {
            row[0]
            for row in rows
        }

        required = {
            "info",
            "pages",
            "titles",
        }

        missing = (
            required - tables
        )

        if missing:
            raise ValueError(
                "SQLite bukan format kitab "
                "yang didukung. Tabel hilang: "
                + ", ".join(
                    sorted(missing)
                )
            )

    # ========================================================
    # INFO KITAB
    # ========================================================

    @classmethod
    def get_info(
        cls,
        path: str | Path,
    ) -> dict[str, str]:

        conn = cls.connect(path)

        try:

            cls.validate(conn)

            rows = conn.execute(
                """
                SELECT name, value
                FROM info
                """
            ).fetchall()

            return {
                str(name):
                str(value or "")
                for name, value in rows
            }

        finally:

            conn.close()

    # ========================================================
    # TITLE / BAB
    # ========================================================

    @classmethod
    def get_titles(
        cls,
        path: str | Path,
    ) -> list[dict[str, Any]]:

        conn = cls.connect(path)

        try:

            cls.validate(conn)

            rows = conn.execute(
                """
                SELECT
                    id,
                    parentid,
                    pageid,
                    title
                FROM titles
                ORDER BY
                    pageid,
                    id
                """
            ).fetchall()

            return [
                {
                    "id": int(row[0]),
                    "parentid": int(row[1]),
                    "pageid": int(row[2]),
                    "title": str(
                        row[3] or ""
                    ).strip(),
                }
                for row in rows
            ]

        finally:

            conn.close()

    # ========================================================
    # BANGUN INFORMASI BAB
    # ========================================================

    @staticmethod
    def get_current_title(
        titles: list[dict[str, Any]],
        page_id: int,
    ):

        active = [
            item
            for item in titles
            if item["pageid"] <= page_id
        ]

        if not active:
            return None

        return active[-1]

    @staticmethod
    def get_current_bab(
        titles: list[dict[str, Any]],
        page_id: int,
    ):

        top_level = [
            item
            for item in titles
            if item["parentid"] == 0
            and item["pageid"] <= page_id
        ]

        if not top_level:
            return None

        return top_level[-1]

    # ========================================================
    # GET PAGE
    # ========================================================

    @classmethod
    def get_page(
        cls,
        path: str | Path,
        page_id: int,
    ) -> dict[str, Any] | None:

        conn = cls.connect(path)

        try:

            cls.validate(conn)

            row = conn.execute(
                """
                SELECT
                    id,
                    partnumber,
                    pagenumber,
                    page
                FROM pages
                WHERE id = ?
                LIMIT 1
                """,
                (page_id,),
            ).fetchone()

            if row is None:
                return None

            titles = cls.get_titles(
                path
            )

            raw_html = str(
                row[3] or ""
            )

            page_text = clean_html(
                raw_html
            )

            current_title = (
                cls.get_current_title(
                    titles,
                    int(row[0]),
                )
            )

            current_bab = (
                cls.get_current_bab(
                    titles,
                    int(row[0]),
                )
            )

            return {
                "id": int(row[0]),

                "partnumber": int(
                    row[1]
                ),

                "pagenumber": int(
                    row[2]
                ),

                "bab": (
                    current_bab["title"]
                    if current_bab
                    else None
                ),

                "title": (
                    current_title["title"]
                    if current_title
                    else None
                ),

                "page_html": raw_html,

                "page_text": page_text,
            }

        finally:

            conn.close()

    # ========================================================
    # SEARCH
    # ========================================================

    @classmethod
    def search(
        cls,
        path: str | Path,
        keyword: str,
        limit: int = 20,
    ) -> list[dict[str, Any]]:

        keyword = keyword.strip()

        if not keyword:
            return []

        conn = cls.connect(path)

        try:

            cls.validate(conn)

            titles = cls.get_titles(
                path
            )

            # ------------------------------------------------
            # LIKE
            # ------------------------------------------------

            pattern = (
                "%"
                + keyword
                + "%"
            )

            rows = conn.execute(
                """
                SELECT
                    id,
                    partnumber,
                    pagenumber,
                    page
                FROM pages
                WHERE page LIKE ?
                ORDER BY id
                LIMIT ?
                """,
                (
                    pattern,
                    limit,
                ),
            ).fetchall()

            hasil = []

            for row in rows:

                page_id = int(row[0])

                raw_html = str(
                    row[3] or ""
                )

                page_text = clean_html(
                    raw_html
                )

                current_title = (
                    cls.get_current_title(
                        titles,
                        page_id,
                    )
                )

                current_bab = (
                    cls.get_current_bab(
                        titles,
                        page_id,
                    )
                )

                hasil.append(
                    {
                        "id": page_id,

                        "partnumber": int(
                            row[1]
                        ),

                        "pagenumber": int(
                            row[2]
                        ),

                        "bab": (
                            current_bab["title"]
                            if current_bab
                            else None
                        ),

                        "title": (
                            current_title["title"]
                            if current_title
                            else None
                        ),

                        "text": page_text,
                    }
                )

            return hasil

        finally:

            conn.close()

    # ========================================================
    # DAFTAR HALAMAN
    # ========================================================

    @classmethod
    def list_pages(
        cls,
        path: str | Path,
        page: int = 1,
        size: int = 20,
    ):

        if page < 1:
            page = 1

        if size < 1:
            size = 20

        if size > 100:
            size = 100

        offset = (
            page - 1
        ) * size

        conn = cls.connect(path)

        try:

            cls.validate(conn)

            total = conn.execute(
                "SELECT COUNT(*) FROM pages"
            ).fetchone()[0]

            rows = conn.execute(
                """
                SELECT
                    id,
                    partnumber,
                    pagenumber,
                    page
                FROM pages
                ORDER BY id
                LIMIT ? OFFSET ?
                """,
                (
                    size,
                    offset,
                ),
            ).fetchall()

            titles = cls.get_titles(
                path
            )

            items = []

            for row in rows:

                page_id = int(
                    row[0]
                )

                text = clean_html(
                    str(
                        row[3] or ""
                    )
                )

                current_bab = (
                    cls.get_current_bab(
                        titles,
                        page_id,
                    )
                )

                items.append(
                    {
                        "id": page_id,

                        "partnumber": int(
                            row[1]
                        ),

                        "pagenumber": int(
                            row[2]
                        ),

                        "bab": (
                            current_bab["title"]
                            if current_bab
                            else None
                        ),

                        "text": text,
                    }
                )

            return {
                "items": items,
                "total": total,
                "page": page,
                "size": size,
                "pages": (
                    (
                        total + size - 1
                    ) // size
                    if total
                    else 0
                ),
            }

        finally:

            conn.close()


sqlite_kitab_reader = (
    SQLiteKitabReader()
)