"""
Knowledge Ranking
=================

Melakukan ranking hasil Knowledge Base
berdasarkan tingkat kecocokan keyword.
"""


class KnowledgeRanking:
    """
    Ranking Knowledge Base.
    """

    def rank(
        self,
        keyword: str,
        results: list
    ):
        """
        Mengurutkan hasil berdasarkan skor.
        """

        keyword = keyword.lower()

        ranked = []

        for item in results:

            if "data" in item:
                data = item["data"]
            else:
                data = item

            score = self.calculate_score(
                keyword,
                data
            )

            ranked.append(
                {
                    "score": score,
                    "result": item
                }
            )

        ranked.sort(
            key=lambda x: x["score"],
            reverse=True
        )

        return ranked

    # ==========================================

    def calculate_score(
        self,
        keyword: str,
        data: dict
    ):
        """
        Menghitung skor kecocokan.
        """

        score = 0

        if not isinstance(data, dict):
            return score

        words = keyword.lower().split()

        for value in data.values():

            text = str(value).lower()

            for word in words:

                if word in text:
                    score += 10

                elif text.startswith(word):
                    score += 5

        return score

    # ==========================================

    def best(
        self,
        keyword: str,
        results: list
    ):
        """
        Mengambil hasil terbaik.
        """

        ranked = self.rank(
            keyword,
            results
        )

        if not ranked:
            return None

        return ranked[0]["result"]

    # ==========================================

    def top(
        self,
        keyword: str,
        results: list,
        limit=5
    ):
        """
        Mengambil beberapa hasil terbaik.
        """

        ranked = self.rank(
            keyword,
            results
        )

        return ranked[:limit]