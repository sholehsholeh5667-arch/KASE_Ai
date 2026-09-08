"""
Gemini Provider
===============

Penghubung antara AI Manager dengan Google Gemini.
"""


class GeminiProvider:
    """
    Provider Gemini.
    """

    def __init__(self):
        self.name = "Gemini"

    async def generate(self, prompt: str) -> dict:
        """
        Generate response dari Gemini.

        Tahap ini masih template.
        """

        return {
            "provider": self.name,
            "response": "Gemini Provider belum diimplementasikan."
        }