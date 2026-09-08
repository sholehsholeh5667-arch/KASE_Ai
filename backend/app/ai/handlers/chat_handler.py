"""
Chat Handler
============

Menangani request Chat AI.

AI-01:
Menggunakan AIProviderDispatcher agar provider AI
dapat dipilih melalui konfigurasi atau request.
"""

from app.ai.config import AIConfig
from app.ai.dispatcher import AIProviderDispatcher


class ChatHandler:
    """
    Handler Chat AI.
    """

    def __init__(self):
        self.dispatcher = AIProviderDispatcher()

    async def process(self, request: dict):
        """
        Memproses request chat menggunakan provider AI.
        """

        message = request.get("message", "").strip()

        if not message:
            return {
                "status": "error",
                "success": False,
                "provider": "chat",
                "module": "chat",
                "message": "Message tidak boleh kosong.",
                "data": {},
            }

        provider_name = (
            request.get("provider")
            or AIConfig.get_provider()
        )

        provider = self.dispatcher.get_provider(
            provider_name
        )

        if provider is None:
            return {
                "status": "error",
                "success": False,
                "provider": provider_name,
                "module": "chat",
                "message": (
                    f"Provider AI '{provider_name}' "
                    "tidak tersedia."
                ),
                "data": {},
            }

        response = await provider.generate(message)

        return {
            "status": "success",
            "success": True,
            "provider": provider.name,
            "module": "chat",
            "message": response,
            "data": {},
        }

    async def stream(self, request: dict):
        """
        Streaming response menggunakan provider AI.
        """

        message = request.get("message", "").strip()

        if not message:
            yield "Message tidak boleh kosong."
            return

        provider_name = (
            request.get("provider")
            or AIConfig.get_provider()
        )

        provider = self.dispatcher.get_provider(
            provider_name
        )

        if provider is None:
            yield (
                f"Provider AI '{provider_name}' "
                "tidak tersedia."
            )
            return

        if hasattr(provider, "stream_generate"):

            async for chunk in provider.stream_generate(
                message
            ):
                yield chunk

        else:

            response = await provider.generate(
                message
            )

            yield response