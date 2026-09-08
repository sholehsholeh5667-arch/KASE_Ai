"""
Knowledge Manager
=================

Mengelola seluruh Knowledge Base AI.
"""

from datetime import datetime


class KnowledgeManager:
    """
    Manager utama Knowledge Base.
    """

    def __init__(self):
        self.knowledge = {}

    # ==========================================
    # Register
    # ==========================================

    def register(self, category: str, data):
        """
        Menambahkan kategori knowledge.
        """

        self.knowledge[category] = {
            "category": category,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "items": data
        }

    # ==========================================
    # Add Item
    # ==========================================

    def add_item(self, category: str, item: dict):
        """
        Menambahkan satu knowledge.
        """

        if category not in self.knowledge:

            self.register(category, [])

        self.knowledge[category]["items"].append(item)
        self.knowledge[category]["updated_at"] = (
            datetime.now().isoformat()
        )

    # ==========================================
    # Get Category
    # ==========================================

    def get_category(self, category: str):
        """
        Mengambil seluruh knowledge dalam kategori.
        """

        if category not in self.knowledge:
            return []

        return self.knowledge[category]["items"]

    # ==========================================
    # Get All
    # ==========================================

    def get_all(self):
        """
        Mengambil seluruh knowledge.
        """

        return self.knowledge

    # ==========================================
    # Exists
    # ==========================================

    def exists(self, category: str):
        """
        Mengecek kategori.
        """

        return category in self.knowledge

    # ==========================================
    # Categories
    # ==========================================

    def categories(self):
        """
        Mengambil daftar kategori.
        """

        return list(self.knowledge.keys())

    # ==========================================
    # Count
    # ==========================================

    def count(self):
        """
        Menghitung jumlah kategori.
        """

        return len(self.knowledge)

    # ==========================================
    # Remove
    # ==========================================

    def remove(self, category: str):
        """
        Menghapus kategori.
        """

        self.knowledge.pop(category, None)

    # ==========================================
    # Clear
    # ==========================================

    def clear(self):
        """
        Menghapus seluruh knowledge.
        """

        self.knowledge.clear()