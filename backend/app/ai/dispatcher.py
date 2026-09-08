"""
AI Provider Dispatcher
======================

Memilih provider AI yang akan digunakan.
"""

from app.ai.providers.openai_provider import OpenAIProvider
from app.ai.providers.gemini_provider import GeminiProvider
from app.ai.providers.ollama_provider import OllamaProvider


class AIProviderDispatcher:
    """
    Dispatcher provider AI.
    """

    def __init__(self):
        self.providers = {
            "openai": OpenAIProvider(),
            "gemini": GeminiProvider(),
            "ollama": OllamaProvider(),
        }

    def get_provider(self, provider: str = "openai"):
        """
        Mengambil provider AI.
        """

        provider = provider.lower()

        return self.providers.get(provider)