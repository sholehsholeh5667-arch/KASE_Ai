"""
Knowledge Loader
================

Memuat Knowledge Base ke dalam Knowledge Manager.
"""

import json
from pathlib import Path

from app.ai.knowledge.knowledge_manager import KnowledgeManager


class KnowledgeLoader:
    """
    Loader Knowledge Base.
    """

    def __init__(self, manager: KnowledgeManager):
        self.manager = manager

    # ==========================================
    # Load dari List
    # ==========================================

    def load(self, category: str, items: list):
        """
        Memuat data dari list.
        """

        if not self.manager.exists(category):
            self.manager.register(category, [])

        for item in items:
            self.manager.add_item(category, item)

    # ==========================================
    # Load dari JSON
    # ==========================================

    def load_json(self, category: str, file_path: str):
        """
        Memuat data dari file JSON.
        """

        path = Path(file_path)

        if not path.exists():
            raise FileNotFoundError(file_path)

        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)

        if not isinstance(data, list):
            raise ValueError(
                "Isi JSON harus berupa list."
            )

        self.load(category, data)

    # ==========================================
    # Clear Category
    # ==========================================

    def clear(self, category: str):
        """
        Menghapus seluruh knowledge pada kategori.
        """

        if self.manager.exists(category):
            self.manager.remove(category)