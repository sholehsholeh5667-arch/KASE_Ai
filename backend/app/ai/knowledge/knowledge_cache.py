"""
Knowledge Cache
===============

Cache sederhana untuk Knowledge Base.
"""


class KnowledgeCache:
    """
    Menyimpan hasil pencarian knowledge.
    """

    def __init__(self):
        self.cache = {}

    # ==========================================

    def make_key(
        self,
        category: str,
        keyword: str
    ):
        """
        Membuat key cache.
        """

        category = (category or "general").lower().strip()
        keyword = (keyword or "").lower().strip()

        return f"{category}:{keyword}"

    # ==========================================

    def save(
        self,
        category: str,
        keyword: str,
        result
    ):
        """
        Menyimpan cache.
        """

        key = self.make_key(
            category,
            keyword
        )

        self.cache[key] = result

    # ==========================================

    def load(
        self,
        category: str,
        keyword: str
    ):
        """
        Mengambil cache.
        """

        key = self.make_key(
            category,
            keyword
        )

        return self.cache.get(key)

    # ==========================================

    def exists(
        self,
        category: str,
        keyword: str
    ):
        """
        Mengecek apakah cache tersedia.
        """

        key = self.make_key(
            category,
            keyword
        )

        return key in self.cache

    # ==========================================

    def delete(
        self,
        category: str,
        keyword: str
    ):
        """
        Menghapus satu cache.
        """

        key = self.make_key(
            category,
            keyword
        )

        if key in self.cache:
            del self.cache[key]

    # ==========================================

    def clear(self):
        """
        Menghapus seluruh cache.
        """

        self.cache.clear()

    # ==========================================

    def count(self):
        """
        Jumlah cache.
        """

        return len(self.cache)

    # ==========================================

    def keys(self):
        """
        Daftar key cache.
        """

        return list(self.cache.keys())

    # ==========================================

    def all(self):
        """
        Mengambil seluruh cache.
        """

        return self.cache