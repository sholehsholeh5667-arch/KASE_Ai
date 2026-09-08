from __future__ import annotations

from app.ai.providers.openai_provider import OpenAIProvider


class KitabTranslationProvider:
    """
    Adapter penerjemahan kitab menggunakan OpenAIProvider
    yang sudah dimiliki KasirAI.
    """

    def __init__(self, provider=None):
        self.provider = provider or OpenAIProvider()

    async def translate(self, prompt: str) -> str:
        result = await self.provider.generate(prompt)

        if not result:
            raise RuntimeError(
                "AI tidak mengembalikan hasil terjemahan."
            )

        result = str(result).strip()

        if result.startswith("OpenAI Error:"):
            raise RuntimeError(result)

        if result == "OPENAI_API_KEY belum diatur.":
            raise RuntimeError(result)

        return result