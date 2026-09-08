"""
Ollama Provider
===============

Penghubung antara AI Manager dengan Ollama.
"""


class OllamaProvider:
    """
    Provider Ollama.
    """

    def __init__(self):
        self.name = "Ollama"

    async def generate(self, prompt: str) -> dict:
        """
        Generate response dari Ollama.

        Tahap ini masih template.
        """

        return {
            "provider": self.name,
            "response": "Ollama Provider belum diimplementasikan."
        }