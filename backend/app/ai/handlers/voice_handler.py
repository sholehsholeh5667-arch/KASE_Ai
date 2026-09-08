"""
Voice Handler
=============

Menangani seluruh request Voice AI.
"""

from app.services.voice import voice_service


class VoiceHandler:
    """
    Handler Voice AI.
    """

    async def process(self, request: dict):
        """
        Memproses request Voice AI.
        """

        if not isinstance(request, dict):
            return {
                "status": "error",
                "success": False,
                "module": "voice",
                "message": (
                    "Request harus berupa dictionary."
                ),
                "data": {}
            }

        audio_file = request.get(
            "audio_file",
            ""
        )

        language = request.get(
            "language",
            "id"
        )

        return await voice_service.transcribe(
            audio_file=audio_file,
            language=language,
            provider_name=request.get(
                "provider"
            )
        )