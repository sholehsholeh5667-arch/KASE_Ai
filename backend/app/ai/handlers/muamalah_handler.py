"""
Muamalah Handler
================

Menangani request Muamalah AI.
"""

from typing import Optional

from sqlalchemy.orm import Session

from app.services.muamalah import muamalah_service


class MuamalahHandler:
    """
    Handler untuk Muamalah AI.
    """

    async def process(
        self,
        request: dict,
        db: Optional[Session] = None,
    ):
        """
        Memproses request Muamalah.

        db diteruskan ke MuamalahService
        agar RAG dapat mengambil materi
        langsung dari database MySQL.
        """

        # ======================================================
        # VALIDASI REQUEST
        # ======================================================

        if not isinstance(request, dict):

            return {
                "status": "error",
                "success": False,
                "provider": "muamalah",
                "module": "muamalah",
                "message": (
                    "Request harus berupa dictionary."
                ),
                "data": {},
            }

        # ======================================================
        # AMBIL MESSAGE
        # ======================================================

        message = (
            request.get(
                "message",
                "",
            )
            or ""
        ).strip()

        # ======================================================
        # VALIDASI MESSAGE
        # ======================================================

        if not message:

            return {
                "status": "error",
                "success": False,
                "provider": "muamalah",
                "module": "muamalah",
                "message": (
                    "Pertanyaan Muamalah "
                    "tidak boleh kosong."
                ),
                "data": {},
            }

        # ======================================================
        # KONSULTASI
        # ======================================================

        return await muamalah_service.konsultasi(
            pertanyaan=message,

            provider_name=request.get(
                "provider"
            ),

            session_id=request.get(
                "session_id",
                "default",
            ),

            db=db,
        )