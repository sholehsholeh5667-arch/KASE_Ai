"""
Knowledge Router
================

Menentukan kategori Knowledge Base
dan melakukan pencarian berdasarkan keyword.
"""

from app.ai.knowledge.knowledge_search import KnowledgeSearch


class KnowledgeRouter:
    """
    Router Knowledge Base.
    """

    def __init__(self, manager):
        self.manager = manager
        self.search_engine = KnowledgeSearch(manager)

    # ==========================================
    # Route
    # ==========================================

    def route(self, request: dict):
        """
        Routing pencarian knowledge.
        """

        message = request.get("message", "").strip()

        if not message:
            return []

        category = self.detect_category(message)

        keywords = self.extract_keywords(message)

        results = []

        if category:

            for keyword in keywords:

                results.extend(
                    self.search_engine.search_category(
                        category,
                        keyword
                    )
                )

        else:

            for keyword in keywords:

                results.extend(
                    self.search_engine.search(
                        keyword
                    )
                )

        # Hilangkan duplikasi
        unique = []
        seen = set()

        for item in results:

            key = str(item)

            if key not in seen:
                seen.add(key)
                unique.append(item)

        return unique

    # ==========================================
    # Detect Category
    # ==========================================

    def detect_category(self, message: str):
        """
        Menentukan kategori knowledge.
        """

        text = message.lower()

        mapping = {

            "kitab": [
                "kitab",
                "fathul",
                "muin",
                "qarib",
                "bajuri",
                "ianah",
                "i'anah"
            ],

            "muamalah": [
                "jual",
                "beli",
                "salam",
                "murabahah",
                "ijarah",
                "syirkah",
                "riba"
            ],

            "zakat": [
                "zakat",
                "tijarah",
                "nisab",
                "haul"
            ],

            "kasir": [
                "barang",
                "stok",
                "penjualan",
                "pembelian",
                "supplier",
                "pelanggan"
            ],

            "faq": [
                "faq",
                "help",
                "bantuan"
            ]

        }

        for category, keywords in mapping.items():

            for keyword in keywords:

                if keyword in text:
                    return category

        return None

    # ==========================================
    # Extract Keywords
    # ==========================================

    def extract_keywords(self, message: str):
        """
        Mengambil keyword utama dari kalimat.
        """

        stopwords = {

            "tolong",
            "jelaskan",
            "hitung",
            "berapa",
            "bagaimana",
            "apa",
            "adalah",
            "yang",
            "dan",
            "atau",
            "di",
            "ke",
            "dari",
            "untuk",
            "dengan",
            "agar",
            "supaya",
            "sebuah",
            "seorang",
            "para",
            "saya",
            "kami",
            "aku",
            "anda",
            "cari",
            "buat",
            "tentang",
            "mohon",
            "bisa",
            "kah",
            "nya"

        }

        keywords = []

        for word in message.lower().split():

            word = word.strip(".,?!:;()[]{}\"'")

            if not word:
                continue

            if word in stopwords:
                continue

            if len(word) < 2:
                continue

            keywords.append(word)

        return keywords

    # ==========================================
    # Route By Category
    # ==========================================

    def route_category(
        self,
        category: str,
        keyword: str
    ):
        """
        Routing langsung ke kategori tertentu.
        """

        return self.search_engine.search_category(
            category,
            keyword
        )

    # ==========================================
    # Global Search
    # ==========================================

    def global_search(
        self,
        keyword: str
    ):
        """
        Pencarian ke seluruh knowledge.
        """

        return self.search_engine.search(
            keyword
        )