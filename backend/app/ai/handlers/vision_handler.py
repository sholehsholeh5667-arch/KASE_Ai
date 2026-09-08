"""
Vision Handler
==============

Menangani seluruh request Vision AI.
"""

from app.services.vision import vision_service


class VisionHandler:
    """
    Handler Vision AI.
    """

    async def process(self, request: dict):
        """
        Memproses request Vision AI.
        """

        if not isinstance(request, dict):
            return {
                "status": "error",
                "success": False,
                "provider": "vision",
                "module": "vision",
                "message": (
                    "Request harus berupa dictionary."
                ),
                "data": {}
            }

        image_url = request.get(
            "image_url",
            ""
        )

        prompt = request.get(
            "message",
            ""
        )

        return await vision_service.analyze(
            image_url=image_url,
            prompt=prompt,
            provider_name=request.get("provider")
        )