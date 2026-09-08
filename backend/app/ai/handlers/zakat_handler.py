"""
Zakat Handler
=============

Menangani request AI Zakat Tijarah.

Action utama:

    hitung

Perhitungan angka TIDAK dilakukan oleh AI.
Handler meneruskan seluruh angka ke
ZakatTijarahService yang bersifat deterministik.
"""

from __future__ import annotations

from typing import Any

from app.services.zakat_tijarah import (
    ZakatTijarahValidationError,
    zakat_tijarah_service,
)


class ZakatHandler:
    """
    Handler untuk AI Zakat Tijarah.
    """

    # ======================================================
    # HELPER ANGKA
    # ======================================================

    @staticmethod
    def _get_number(
        request: dict,
        *names: str,
    ) -> Any:
        """
        Mengambil angka dari beberapa kemungkinan nama field.

        Contoh:
            kas
            uang_kas
            kas_tunai
        """

        for name in names:

            if name in request:

                return request.get(
                    name
                )

        return 0

    # ======================================================
    # PROCESS
    # ======================================================

    async def process(
        self,
        request: dict,
    ):
        """
        Memproses request Zakat Tijarah.
        """

        # --------------------------------------------------
        # VALIDASI REQUEST
        # --------------------------------------------------

        if not isinstance(
            request,
            dict,
        ):

            return {
                "status": "error",
                "success": False,
                "provider": "zakat",
                "module": "zakat",
                "message": (
                    "Request harus berupa dictionary."
                ),
                "data": {},
            }

        # --------------------------------------------------
        # ACTION
        # --------------------------------------------------

        action = (
            str(
                request.get(
                    "action",
                    "hitung",
                )
                or "hitung"
            )
            .strip()
            .lower()
        )

        # --------------------------------------------------
        # ACTION YANG BELUM DIDUKUNG
        # --------------------------------------------------

        if action not in {
            "hitung",
            "calculate",
        }:

            return {
                "status": "error",
                "success": False,
                "provider": "zakat",
                "module": "zakat",
                "message": (
                    f"Action zakat '{action}' "
                    "belum didukung."
                ),
                "data": {
                    "supported_actions": [
                        "hitung",
                    ],
                },
            }

        # --------------------------------------------------
        # KALENDER
        # --------------------------------------------------

        kalender = (
            request.get(
                "kalender",
                "hijriah",
            )
            or "hijriah"
        )

        # --------------------------------------------------
        # AMBIL INPUT KEUANGAN
        # --------------------------------------------------

        kas = self._get_number(
            request,
            "kas",
            "kas_tunai",
            "uang_kas",
        )

        bank = self._get_number(
            request,
            "bank",
            "saldo_bank",
            "uang_bank",
        )

        persediaan = self._get_number(
            request,
            "persediaan",
            "nilai_persediaan",
            "stok_dagang",
        )

        piutang = self._get_number(
            request,
            "piutang",
            "piutang_dagang",
            "piutang_tertagih",
        )

        utang = self._get_number(
            request,
            "utang",
            "utang_usaha",
            "hutang_usaha",
        )

        # --------------------------------------------------
        # HARGA EMAS
        # --------------------------------------------------

        harga_emas = self._get_number(
            request,
            "harga_emas_per_gram",
            "harga_emas",
        )

        # --------------------------------------------------
        # HITUNG
        # --------------------------------------------------

        try:

            result = (
                zakat_tijarah_service.hitung(
                    kas=kas,
                    bank=bank,
                    persediaan=persediaan,
                    piutang=piutang,
                    utang=utang,
                    harga_emas_per_gram=(
                        harga_emas
                    ),
                    kalender=kalender,
                )
            )

        except ZakatTijarahValidationError as exc:

            return {
                "status": "error",
                "success": False,
                "provider": "zakat",
                "module": "zakat",
                "message": str(exc),
                "data": {},
            }

        except Exception as exc:

            print(
                "=========================================="
            )

            print(
                "ZAKAT HANDLER ERROR"
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
                "provider": "zakat",
                "module": "zakat",
                "message": (
                    "Terjadi kesalahan "
                    "saat menghitung zakat tijarah."
                ),
                "data": {},
            }

        # --------------------------------------------------
        # HASIL
        # --------------------------------------------------

        data = result.as_dict()

        # --------------------------------------------------
        # TAMBAHAN STATUS UNTUK UI
        # --------------------------------------------------

        if result.wajib_zakat:

            status_text = (
                "Wajib zakat."
            )

        else:

            status_text = (
                "Belum wajib zakat karena "
                "harta bersih belum mencapai nisab."
            )

        data.update(
            {
                "status_text": status_text,
                "nama_metode": (
                    "Zakat Tijarah"
                ),
                "dasar_nisab": (
                    "85 gram emas"
                ),
                "sumber_perhitungan": (
                    "Metode Zakat Tijarah "
                    "yang dikonfigurasi KasirAI."
                ),
            }
        )

        # --------------------------------------------------
        # RESPONSE
        # --------------------------------------------------

        return {
            "status": "success",
            "success": True,
            "provider": "calculator",
            "module": "zakat",
            "message": status_text,
            "data": data,
        }