"""
Kitab Handler
=============

Menangani seluruh request Kitab AI.
"""

from app.services.kitab import kitab_service


class KitabHandler:
    """
    Handler untuk Kitab AI.
    """

    async def process(self, request: dict):
        """
        Memproses request Kitab AI.
        """

        if not isinstance(request, dict):
            return {
                "status": "error",
                "success": False,
                "provider": "kitab",
                "module": "kitab",
                "message": (
                    "Request harus berupa dictionary."
                ),
                "data": {}
            }

        message = request.get(
            "message",
            ""
        ).strip()

        if not message:
            return {
                "status": "error",
                "success": False,
                "provider": "kitab",
                "module": "kitab",
                "message": (
                    "Pertanyaan Kitab "
                    "tidak boleh kosong."
                ),
                "data": {}
            }

        action = request.get(
            "action",
            "cari_ibarat"
        )

        provider = request.get(
            "provider"
        )

        session_id = request.get(
            "session_id",
            "default"
        )

        if action == "terjemah":
            return await kitab_service.terjemah(
                teks=message,
                provider_name=provider
            )
        if action == "jelaskan":
            return await kitab_service.jelaskan(
                teks=message,
                provider_name=provider
            )
        

        if action == "cari_ibarat":
            return await kitab_service.cari_ibarat(
                kata_kunci=message,
                provider_name=provider,
                session_id=session_id
            )

        return {
            "status": "error",
            "success": False,
            "provider": "kitab",
            "module": "kitab",
            "message": (
                f"Action Kitab '{action}' "
                "tidak tersedia."
            ),
            "data": {}
        }