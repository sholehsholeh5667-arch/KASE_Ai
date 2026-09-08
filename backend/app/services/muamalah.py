"""
Muamalah Service
================

Business logic untuk konsultasi Muamalah AI.
"""

from typing import Optional

from sqlalchemy.orm import Session

from app.ai.config import AIConfig
from app.ai.dispatcher import AIProviderDispatcher
from app.ai.knowledge.knowledge_api import KnowledgeAPI
from app.ai.prompts.muamalah_prompt import MUAMALAH_PROMPT


class MuamalahService:
    """
    Service utama Muamalah AI.
    """

    def __init__(
        self,
        knowledge_api=None,
        dispatcher=None,
    ):
        self.knowledge = (
            knowledge_api
            if knowledge_api is not None
            else KnowledgeAPI()
        )

        self.dispatcher = (
            dispatcher
            if dispatcher is not None
            else AIProviderDispatcher()
        )

    # ==========================================================
    # BUILD PROMPT
    # ==========================================================

    def _build_prompt(
        self,
        pertanyaan: str,
        context,
    ):
        """
        Membuat prompt Muamalah dengan context RAG.

        Context dari database harus dipertahankan utuh,
        terutama:
        - teks_arab
        - terjemah
        - penjelasan
        - catatan_kaki
        - isi_materi

        Tidak melakukan pemotongan teks.
        """

        if not context:
            context_text = (
                "Tidak ditemukan referensi knowledge "
                "Muamalah yang relevan."
            )

        elif isinstance(context, list):

            context_text = "\n\n".join(
                str(item)
                for item in context
            )

        elif isinstance(context, dict):

            context_text = str(context)

        else:

            context_text = str(context)

        return (
            f"{MUAMALAH_PROMPT}\n\n"
            "REFERENSI KNOWLEDGE:\n"
            f"{context_text}\n\n"
            "PERTANYAAN PENGGUNA:\n"
            f"{pertanyaan}\n\n"
            "ATURAN JAWABAN:\n"
            "- Gunakan referensi yang tersedia.\n"
            "- Pertahankan ibarat Arab jika tersedia.\n"
            "- Gunakan terjemah jika tersedia.\n"
            "- Gunakan penjelasan jika tersedia.\n"
            "- Gunakan catatan kaki secara utuh jika tersedia.\n"
            "- Jangan memotong atau meringkas catatan kaki "
            "menjadi sebagian teks.\n"
            "- Jangan mengarang sumber atau referensi.\n"
            "- Nama buku/referensi kitab tidak perlu "
            "ditampilkan kepada pengguna.\n"
            "- Jika referensi tidak cukup, katakan dengan jujur.\n"
        )

    # ==========================================================
    # KONSULTASI
    # ==========================================================

    async def konsultasi(
        self,
        pertanyaan: str,
        provider_name=None,
        session_id="default",
        db: Optional[Session] = None,
    ):
        """
        Memproses konsultasi Muamalah
        dengan Knowledge/RAG dan AI Provider.

        db:
            Session SQLAlchemy dari FastAPI.
        """

        # ======================================================
        # VALIDASI PERTANYAAN
        # ======================================================

        pertanyaan = (
            pertanyaan or ""
        ).strip()

        if not pertanyaan:

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
        # PROVIDER AI
        # ======================================================

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
                "provider": "muamalah",
                "module": "muamalah",
                "message": (
                    f"Provider AI '{provider_name}' "
                    "tidak tersedia."
                ),
                "data": {},
            }

        # ======================================================
        # KNOWLEDGE / RAG
        # ======================================================

        knowledge_result = self.knowledge.retrieve(
            session_id=session_id,
            message=pertanyaan,
            db=db,
        )

        if not isinstance(
            knowledge_result,
            dict,
        ):
            knowledge_result = {}

        # ======================================================
        # CONTEXT
        # ======================================================

        context = knowledge_result.get(
            "context",
            [],
        )

        knowledge_status = knowledge_result.get(
            "status",
            "not_found",
        )

        # ======================================================
        # PROMPT
        # ======================================================

        prompt = self._build_prompt(
            pertanyaan=pertanyaan,
            context=context,
        )

        # ======================================================
        # AI PROVIDER
        # ======================================================

        response = await provider.generate(
            prompt
        )

        # ======================================================
        # RESPONSE
        # ======================================================

        return {
            "status": "success",
            "success": True,
            "provider": provider_name,
            "module": "muamalah",
            "message": response,
            "data": {
                "pertanyaan": pertanyaan,
                "knowledge_status": knowledge_status,
                "context": context,
            },
        }


# ==========================================================
# INSTANCE SERVICE
# ==========================================================

muamalah_service = MuamalahService()