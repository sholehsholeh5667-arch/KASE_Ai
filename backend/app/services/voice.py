"""
Voice Service
=============

Business logic untuk Voice AI.
"""

from app.ai.config import AIConfig
from app.ai.dispatcher import AIProviderDispatcher


class VoiceService:
    """
    Service utama Voice AI.
    """

    def __init__(self, dispatcher=None):
        self.dispatcher = (
            dispatcher
            if dispatcher is not None
            else AIProviderDispatcher()
        )

    async def transcribe(
        self,
        audio_file: str,
        language: str = "id",
        provider_name=None
    ):
        """
        Mengubah audio menjadi teks.
        """

        audio_file = (
            audio_file or ""
        ).strip()

        language = (
            language or "id"
        ).strip()

        if not audio_file:
            return {
                "status": "error",
                "success": False,
                "module": "voice",
                "message": (
                    "Audio file tidak boleh kosong."
                ),
                "data": {}
            }

        provider_name = (
            provider_name
            or AIConfig.get_provider()
        )

        provider = self.dispatcher.get_provider(
            provider_name
        )

        if provider is None:
            return {
                "status": "error",
                "success": False,
                "module": "voice",
                "message": (
                    f"Provider AI '{provider_name}' "
                    "tidak tersedia."
                ),
                "data": {}
            }

        if not hasattr(
            provider,
            "generate_voice"
        ):
            return {
                "status": "error",
                "success": False,
                "module": "voice",
                "message": (
                    f"Provider '{provider_name}' "
                    "belum mendukung Voice."
                ),
                "data": {}
            }

        response = await provider.generate_voice(
            audio_file=audio_file,
            language=language
        )

        return {
            "status": "success",
            "success": True,
            "module": "voice",
            "provider": provider_name,
            "message": response,
            "data": {
                "audio_file": audio_file,
                "language": language
            }
        }


voice_service = VoiceService()