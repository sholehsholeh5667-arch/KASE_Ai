"""
Vision Service
==============

Business logic untuk Vision AI.
"""

from app.ai.config import AIConfig
from app.ai.dispatcher import AIProviderDispatcher


VISION_PROMPT = """
Anda adalah Vision AI KasirAI.

Tugas Anda adalah menganalisis gambar yang diberikan
pengguna secara hati-hati.

Berikan jawaban berdasarkan isi gambar.
Jangan mengarang informasi yang tidak terlihat.
Jika gambar tidak jelas atau informasi tidak dapat
dipastikan, katakan dengan jujur.
""".strip()


class VisionService:
    """
    Service utama Vision AI.
    """

    def __init__(self, dispatcher=None):
        self.dispatcher = (
            dispatcher
            if dispatcher is not None
            else AIProviderDispatcher()
        )

    async def analyze(
        self,
        image_url: str,
        prompt: str = "",
        provider_name=None
    ):
        """
        Menganalisis gambar.
        """

        image_url = (image_url or "").strip()
        prompt = (prompt or "").strip()

        if not image_url:
            return {
                "status": "error",
                "success": False,
                "provider": "vision",
                "module": "vision",
                "message": "Image URL tidak boleh kosong.",
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
                "provider": "vision",
                "module": "vision",
                "message": (
                    f"Provider AI '{provider_name}' "
                    "tidak tersedia."
                ),
                "data": {}
            }

        if not hasattr(provider, "generate_vision"):
            return {
                "status": "error",
                "success": False,
                "provider": provider_name,
                "module": "vision",
                "message": (
                    f"Provider '{provider_name}' "
                    "belum mendukung Vision."
                ),
                "data": {}
            }

        final_prompt = VISION_PROMPT

        if prompt:
            final_prompt += (
                "\n\nPertanyaan pengguna:\n"
                f"{prompt}"
            )

        response = await provider.generate_vision(
            final_prompt,
            image_url
        )

        return {
            "status": "success",
            "success": True,
            "provider": provider_name,
            "module": "vision",
            "message": response,
            "data": {
                "image_url": image_url,
                "prompt": prompt
            }
        }


vision_service = VisionService()