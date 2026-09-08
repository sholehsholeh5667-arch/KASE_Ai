"""
Knowledge Search
================

Mencari data pada Knowledge Base.
"""


class KnowledgeSearch:
    """
    Pencarian Knowledge Base.
    """

    def __init__(self, manager):
        self.manager = manager

    # ==========================================
    # Search
    # ==========================================

    def search(self, keyword: str):
        """
        Mencari keyword pada seluruh kategori.
        """

        keyword = keyword.lower()

        results = []

        for category in self.manager.categories():

            items = self.manager.get_category(category)

            for item in items:

                if self._match(item, keyword):

                    results.append(
                        {
                            "category": category,
                            "data": item
                        }
                    )

        return results

    # ==========================================
    # Search Category
    # ==========================================

    def search_category(
        self,
        category: str,
        keyword: str
    ):
        """
        Mencari pada satu kategori.
        """

        keyword = keyword.lower()

        results = []

        items = self.manager.get_category(category)

        for item in items:

            if self._match(item, keyword):

                results.append(item)

        return results

    # ==========================================
    # Match
    # ==========================================

    def _match(
        self,
        item,
        keyword
    ):
        """
        Mengecek kecocokan keyword.
        """

        if isinstance(item, dict):

            for value in item.values():

                if keyword in str(value).lower():

                    return True

        else:

            if keyword in str(item).lower():

                return True

        return False