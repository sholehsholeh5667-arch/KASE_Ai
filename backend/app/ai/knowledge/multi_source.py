"""
Multi Knowledge Source
======================

Mengelola banyak sumber Knowledge Base.
"""

from app.ai.knowledge.knowledge_search import KnowledgeSearch


class MultiKnowledgeSource:
    """
    Mengelola banyak source knowledge.
    """

    def __init__(self, manager):
        self.manager = manager
        self.search_engine = KnowledgeSearch(manager)

    # ==========================================

    def available_sources(self):
        """
        Mengambil daftar source yang tersedia.
        """

        return self.manager.categories()

    # ==========================================

    def count_sources(self):
        """
        Menghitung jumlah source.
        """

        return len(self.manager.categories())

    # ==========================================

    def search_all(self, keyword: str):
        """
        Mencari ke seluruh source.
        """

        return self.search_engine.search(keyword)

    # ==========================================

    def search_categories(
        self,
        keyword: str,
        categories: list
    ):
        """
        Mencari hanya pada kategori tertentu.
        """

        results = []

        for category in categories:

            data = self.search_engine.search_category(
                category,
                keyword
            )

            if data:

                results.append(
                    {
                        "category": category,
                        "results": data
                    }
                )

        return results

    # ==========================================

    def has_source(
        self,
        category: str
    ):
        """
        Mengecek apakah source tersedia.
        """

        return category in self.manager.categories()

    # ==========================================

    def get_source(
        self,
        category: str
    ):
        """
        Mengambil seluruh data dari satu source.
        """

        return self.manager.get_category(category)

    # ==========================================

    def add_source(
        self,
        category: str,
        data: list
    ):
        """
        Menambahkan source baru.
        """

        self.manager.register(category, data)

    # ==========================================

    def remove_source(
        self,
        category: str
    ):
        """
        Menghapus source.
        """

        if self.has_source(category):
            self.manager.unregister(category)

    # ==========================================

    def reload(self):
        """
        Placeholder untuk reload seluruh source.
        """

        return {
            "status": "success",
            "message": "Knowledge source berhasil direload."
        }