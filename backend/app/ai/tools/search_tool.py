"""
Search Tool
===========

Digunakan untuk pencarian data.
"""


class SearchTool:
    """
    Tool pencarian.
    """

    async def execute(self, data: dict):
        """
        Menjalankan pencarian.
        """

        keyword = data.get("message", "").strip()

        return {
            "status": "success",
            "success": True,
            "provider": "search",
            "module": "tool",
            "message": f"Hasil pencarian untuk '{keyword}' belum terhubung ke database.",
            "data": {
                "keyword": keyword,
                "results": []
            }
        }