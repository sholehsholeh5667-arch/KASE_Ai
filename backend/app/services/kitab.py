"""
Kitab Service
=============

Business logic untuk AI Kitab Kuning.

Alur:

1. cari_ibarat
   → Knowledge/RAG
   → database ai_kitab_kuning
   → langsung mengembalikan referensi
   → TIDAK membutuhkan provider AI

2. terjemah
   → AI Provider
   → menerjemahkan teks Arab
"""

from app.ai.config import AIConfig
from app.ai.dispatcher import AIProviderDispatcher
from app.ai.knowledge.knowledge_api import KnowledgeAPI
from app.ai.prompts.kitab_prompt import KITAB_PROMPT


class KitabService:
    """
    Service utama Kitab AI.
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

    # ======================================================
    # BUILD CONTEXT
    # ======================================================

    def _build_context(
        self,
        context,
    ):
        """
        Mengubah hasil knowledge menjadi teks prompt.

        Method ini tetap dipertahankan karena digunakan
        oleh proses AI yang membutuhkan context.
        """

        if not context:
            return (
                "Tidak ditemukan referensi kitab "
                "yang relevan."
            )

        if isinstance(
            context,
            list,
        ):
            return "\n\n".join(
                str(item)
                for item in context
            )

        if isinstance(
            context,
            dict,
        ):
            return str(context)

        return str(context)

    # ======================================================
    # GENERATE DENGAN AI
    # ======================================================

    async def _generate(
        self,
        prompt,
        provider_name=None,
    ):
        """
        Mengirim prompt ke provider AI.

        Digunakan untuk proses yang memang membutuhkan AI,
        seperti terjemah.
        """

        provider_name = (
            provider_name
            or AIConfig.get_provider()
        )

        provider = (
            self.dispatcher.get_provider(
                provider_name
            )
        )

        if provider is None:
            return {
                "status": "error",
                "success": False,
                "provider": "kitab",
                "module": "kitab",
                "message": (
                    f"Provider AI '{provider_name}' "
                    "tidak tersedia."
                ),
                "data": {},
            }

        try:

            response = await provider.generate(
                prompt
            )

        except Exception as exc:

            return {
                "status": "error",
                "success": False,
                "provider": provider_name,
                "module": "kitab",
                "message": str(exc),
                "data": {},
            }

        return {
            "status": "success",
            "success": True,
            "provider": provider_name,
            "module": "kitab",
            "message": response,
            "data": {},
        }

    # ======================================================
    # CARI IBARAT
    # ======================================================

    async def cari_ibarat(
        self,
        kata_kunci: str,
        provider_name=None,
        session_id="default",
    ):
        """
        Mencari ibarat kitab langsung dari Knowledge/RAG.

        PENTING:
        Method ini TIDAK memanggil provider AI.

        Tujuannya supaya:
        - database kitab tetap bisa dicari
        - OpenAI tidak wajib tersedia
        - quota OpenAI habis tidak memblokir pencarian
        - hasil Arab tetap bisa ditampilkan frontend
        """

        # --------------------------------------------------
        # VALIDASI
        # --------------------------------------------------

        kata_kunci = (
            kata_kunci or ""
        ).strip()

        if not kata_kunci:
            return {
                "status": "error",
                "success": False,
                "provider": "knowledge",
                "module": "kitab",
                "message": (
                    "Kata kunci ibarat "
                    "tidak boleh kosong."
                ),
                "data": {
                    "kata_kunci": "",
                    "knowledge_status": "empty",
                    "jumlah_referensi": 0,
                    "context": [],
                },
            }

        # --------------------------------------------------
        # CARI KE KNOWLEDGE / DATABASE
        # --------------------------------------------------

        try:

            knowledge_result = (
                self.knowledge.retrieve(
                    session_id,
                    kata_kunci,
                )
            )

        except Exception as exc:

            print(
                "=========================================="
            )

            print(
                "KITAB KNOWLEDGE SEARCH ERROR"
            )

            print(
                type(exc).__name__
            )

            print(
                str(exc)
            )

            print(
                "=========================================="
            )

            return {
                "status": "error",
                "success": False,
                "provider": "knowledge",
                "module": "kitab",
                "message": (
                    "Gagal mencari database "
                    "Kitab Kuning: "
                    f"{exc}"
                ),
                "data": {
                    "kata_kunci": kata_kunci,
                    "knowledge_status": "error",
                    "jumlah_referensi": 0,
                    "context": [],
                },
            }

        # --------------------------------------------------
        # NORMALISASI RESPONSE KNOWLEDGE
        # --------------------------------------------------

        if not isinstance(
            knowledge_result,
            dict,
        ):
            knowledge_result = {}

        context = (
            knowledge_result.get(
                "context",
                [],
            )
        )

        knowledge_status = (
            knowledge_result.get(
                "status",
                "not_found",
            )
        )

        # --------------------------------------------------
        # NORMALISASI CONTEXT
        # --------------------------------------------------

        if context is None:
            context = []

        elif not isinstance(
            context,
            list,
        ):
            context = [context]

        # --------------------------------------------------
        # JUMLAH HASIL
        # --------------------------------------------------

        jumlah_referensi = len(
            context
        )

        # --------------------------------------------------
        # TIDAK DITEMUKAN
        # --------------------------------------------------

        if jumlah_referensi == 0:
            return {
                "status": "not_found",
                "success": True,
                "provider": "knowledge",
                "module": "kitab",
                "message": (
                    "Referensi Kitab Kuning "
                    "tidak ditemukan."
                ),
                "data": {
                    "kata_kunci": kata_kunci,
                    "knowledge_status": (
                        knowledge_status
                        or "not_found"
                    ),
                    "jumlah_referensi": 0,
                    "context": [],
                },
            }

        # --------------------------------------------------
        # DITEMUKAN
        # --------------------------------------------------

        return {
            "status": "success",
            "success": True,
            "provider": "knowledge",
            "module": "kitab",
            "message": (
                f"Ditemukan "
                f"{jumlah_referensi} "
                "referensi Kitab Kuning."
            ),
            "data": {
                "kata_kunci": kata_kunci,
                "knowledge_status": (
                    knowledge_status
                    or "found"
                ),
                "jumlah_referensi": (
                    jumlah_referensi
                ),
                "context": context,
            },
        }

    # ======================================================
    # TERJEMAH
    # ======================================================

    async def terjemah(
        self,
        teks: str,
        provider_name=None,
    ):
        """
        Menerjemahkan teks kitab menggunakan AI.
        """

        teks = (
            teks or ""
        ).strip()

        if not teks:
            return {
                "status": "error",
                "success": False,
                "provider": "kitab",
                "module": "kitab",
                "message": (
                    "Teks yang akan diterjemahkan "
                    "tidak boleh kosong."
                ),
                "data": {},
            }

        prompt = (
            f"{KITAB_PROMPT}\n\n"
            "TUGAS:\n"
            "Terjemahkan teks berikut ke bahasa Indonesia "
            "dengan menjaga makna teks.\n"
            "Jangan menambahkan sumber atau keterangan "
            "yang tidak terdapat dalam teks.\n\n"
            "TEKS:\n"
            f"{teks}"
        )

        result = await self._generate(
            prompt,
            provider_name,
        )

        if result["success"]:
            result["data"] = {
                "teks": teks,
            }

        return result


# ==========================================================
# SINGLETON SERVICE
# ==========================================================

    async def jelaskan(
        self,
        teks: str,
        provider_name=None
    ):
        """
        Menjelaskan teks kitab menggunakan AI.

        Teks Arab asli tidak diubah.
        AI hanya memberikan penjelasan dalam bahasa Indonesia.
        """

        teks = (
            teks or ""
        ).strip()

        if not teks:
            return {
                "status": "error",
                "success": False,
                "provider": "kitab",
                "module": "kitab",
                "message": (
                    "Teks yang akan dijelaskan "
                    "tidak boleh kosong."
                ),
                "data": {}
            }

        prompt = (
            f"{KITAB_PROMPT}\n\n"
            "TUGAS:\n"
            "Jelaskan teks kitab kuning Arab berikut "
            "dalam bahasa Indonesia dengan bahasa yang "
            "jelas dan mudah dipahami.\n\n"

            "ATURAN PENJELASAN:\n"
            "1. Pertahankan teks Arab asli apa adanya.\n"
            "2. Jangan mengubah atau menulis ulang "
            "teks Arab sebagai teks sumber baru.\n"
            "3. Jelaskan makna dan maksud teks berdasarkan "
            "teks yang diberikan.\n"
            "4. Jika terdapat istilah fiqih, jelaskan "
            "maknanya secara ringkas.\n"
            "5. Jangan mengarang nama kitab, penulis, "
            "juz, halaman, atau kutipan yang tidak diberikan.\n"
            "6. Bedakan antara isi teks kitab dan "
            "penjelasan AI.\n"
            "7. Jika informasi dalam teks tidak cukup "
            "untuk membuat kesimpulan tertentu, katakan "
            "bahwa informasi tersebut tidak cukup.\n\n"

            "TEKS ARAB ASLI:\n"
            f"{teks}\n\n"

            "PENJELASAN BAHASA INDONESIA:"
        )

        result = await self._generate(
            prompt,
            provider_name
        )

        if result["success"]:
            result["data"] = {
                "teks": teks
            }

        return result
kitab_service = KitabService()