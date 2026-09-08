"""
Zakat Tijarah Service
=====================

Mesin penghitung zakat perdagangan/tijarah.

PRINSIP:
- Tidak menggunakan AI untuk menghitung angka.
- Perhitungan dilakukan secara deterministik.
- Nilai persediaan diperlakukan sebagai nilai pasar
  pada saat akhir haul.
- Kas + bank + persediaan + piutang tertagih
  dikurangi utang usaha.
- Nisab utama: 85 gram emas.
- Hijriah: 2,5%.
- Masehi: 2,577%.

Service ini nantinya dipanggil oleh ZakatHandler.
"""

from __future__ import annotations

from dataclasses import dataclass
from decimal import (
    Decimal,
    InvalidOperation,
    ROUND_HALF_UP,
)
from typing import Any


# ==========================================================
# KONSTANTA
# ==========================================================

GRAM_EMAS_NISAB = Decimal("85")

TARIF_HIJRIAH = Decimal("0.025")

TARIF_MASEHI = Decimal("0.02577")

KALENDER_HIJRIAH = "hijriah"
KALENDER_MASEHI = "masehi"

DUA_DESIMAL = Decimal("0.01")


# ==========================================================
# ERROR
# ==========================================================

class ZakatTijarahValidationError(
    ValueError
):
    """
    Error validasi khusus perhitungan zakat tijarah.
    """


# ==========================================================
# HELPER DECIMAL
# ==========================================================

def to_decimal(
    value: Any,
    field_name: str,
) -> Decimal:
    """
    Mengubah nilai menjadi Decimal dengan aman.

    Mendukung:
    - int
    - float
    - str
    - Decimal
    """

    if value is None:
        return Decimal("0")

    if isinstance(value, bool):
        raise ZakatTijarahValidationError(
            f"{field_name} harus berupa angka."
        )

    try:

        result = Decimal(
            str(value).strip()
        )

    except (
        InvalidOperation,
        AttributeError,
    ) as exc:

        raise ZakatTijarahValidationError(
            f"{field_name} harus berupa angka."
        ) from exc

    if not result.is_finite():

        raise ZakatTijarahValidationError(
            f"{field_name} harus berupa angka yang valid."
        )

    return result


def validate_non_negative(
    value: Decimal,
    field_name: str,
) -> None:
    """
    Memastikan nilai tidak negatif.
    """

    if value < 0:

        raise ZakatTijarahValidationError(
            f"{field_name} tidak boleh negatif."
        )


def money(
    value: Decimal,
) -> Decimal:
    """
    Membulatkan nilai rupiah ke 2 angka desimal.
    """

    return value.quantize(
        DUA_DESIMAL,
        rounding=ROUND_HALF_UP,
    )


# ==========================================================
# RESULT
# ==========================================================

@dataclass(frozen=True)
class ZakatTijarahResult:
    """
    Hasil final penghitungan zakat tijarah.
    """

    kalender: str

    kas: Decimal

    bank: Decimal

    persediaan: Decimal

    piutang: Decimal

    utang: Decimal

    total_harta: Decimal

    harta_bersih: Decimal

    harga_emas_per_gram: Decimal

    nisab: Decimal

    tarif: Decimal

    wajib_zakat: bool

    zakat: Decimal

    gram_emas_nisab: Decimal = (
        GRAM_EMAS_NISAB
    )

    def as_dict(self) -> dict:
        """
        Mengubah hasil menjadi dictionary
        yang siap dikirim API.
        """

        return {
            "kalender": self.kalender,

            "kas": str(self.kas),

            "bank": str(self.bank),

            "persediaan": str(
                self.persediaan
            ),

            "piutang": str(
                self.piutang
            ),

            "utang": str(
                self.utang
            ),

            "total_harta": str(
                self.total_harta
            ),

            "harta_bersih": str(
                self.harta_bersih
            ),

            "gram_emas_nisab": str(
                self.gram_emas_nisab
            ),

            "harga_emas_per_gram": str(
                self.harga_emas_per_gram
            ),

            "nisab": str(
                self.nisab
            ),

            "tarif": str(
                self.tarif
            ),

            "tarif_persen": str(
                self.tarif * Decimal("100")
            ),

            "wajib_zakat": self.wajib_zakat,

            "zakat": str(
                self.zakat
            ),

            "rumus": (
                "kas + bank + persediaan + "
                "piutang - utang"
            ),

            "rumus_nisab": (
                "85 gram emas x harga emas "
                "per gram"
            ),

            "rumus_zakat": (
                "harta bersih x tarif"
            ),
        }


# ==========================================================
# SERVICE
# ==========================================================

class ZakatTijarahService:
    """
    Service utama penghitungan zakat perdagangan.
    """

    # ======================================================
    # TARIF
    # ======================================================

    @staticmethod
    def get_tarif(
        kalender: str,
    ) -> Decimal:
        """
        Mendapatkan tarif sesuai kalender.

        Hijriah:
            2,5%

        Masehi:
            2,577%
        """

        normalized = (
            str(kalender or "")
            .strip()
            .lower()
        )

        if normalized == KALENDER_HIJRIAH:

            return TARIF_HIJRIAH

        if normalized == KALENDER_MASEHI:

            return TARIF_MASEHI

        raise ZakatTijarahValidationError(
            "Kalender harus 'hijriah' "
            "atau 'masehi'."
        )

    # ======================================================
    # HITUNG NISAB
    # ======================================================

    @staticmethod
    def hitung_nisab(
        harga_emas_per_gram: Any,
    ) -> Decimal:
        """
        Nisab = 85 gram emas x harga emas/gram.
        """

        harga_emas = to_decimal(
            harga_emas_per_gram,
            "Harga emas per gram",
        )

        if harga_emas <= 0:

            raise ZakatTijarahValidationError(
                "Harga emas per gram harus lebih dari 0."
            )

        nisab = (
            GRAM_EMAS_NISAB
            * harga_emas
        )

        return money(
            nisab
        )

    # ======================================================
    # HITUNG HARTA
    # ======================================================

    @staticmethod
    def hitung_total_harta(
        kas: Any,
        bank: Any,
        persediaan: Any,
        piutang: Any,
    ) -> Decimal:
        """
        Total harta objek zakat:

        kas
        + bank
        + persediaan
        + piutang
        """

        kas_d = to_decimal(
            kas,
            "Kas",
        )

        bank_d = to_decimal(
            bank,
            "Bank",
        )

        persediaan_d = to_decimal(
            persediaan,
            "Persediaan",
        )

        piutang_d = to_decimal(
            piutang,
            "Piutang",
        )

        validate_non_negative(
            kas_d,
            "Kas",
        )

        validate_non_negative(
            bank_d,
            "Bank",
        )

        validate_non_negative(
            persediaan_d,
            "Persediaan",
        )

        validate_non_negative(
            piutang_d,
            "Piutang",
        )

        total = (
            kas_d
            + bank_d
            + persediaan_d
            + piutang_d
        )

        return money(
            total
        )

    # ======================================================
    # HITUNG HARTA BERSIH
    # ======================================================

    @staticmethod
    def hitung_harta_bersih(
        total_harta: Any,
        utang: Any,
    ) -> Decimal:
        """
        Harta bersih:

        total harta - utang.

        Nilai minimum dianggap 0 karena
        harta bersih negatif tidak menjadi
        dasar zakat.
        """

        total_harta_d = to_decimal(
            total_harta,
            "Total harta",
        )

        utang_d = to_decimal(
            utang,
            "Utang usaha",
        )

        validate_non_negative(
            total_harta_d,
            "Total harta",
        )

        validate_non_negative(
            utang_d,
            "Utang usaha",
        )

        harta_bersih = (
            total_harta_d
            - utang_d
        )

        if harta_bersih < 0:

            harta_bersih = Decimal("0")

        return money(
            harta_bersih
        )

    # ======================================================
    # HITUNG ZAKAT
    # ======================================================

    @classmethod
    def hitung(
        cls,
        *,
        kas: Any,
        bank: Any,
        persediaan: Any,
        piutang: Any,
        utang: Any,
        harga_emas_per_gram: Any,
        kalender: str = KALENDER_HIJRIAH,
    ) -> ZakatTijarahResult:
        """
        Menghitung seluruh komponen zakat tijarah.

        Parameter:

        kas
            Uang tunai/kas.

        bank
            Saldo yang termasuk harta usaha.

        persediaan
            Nilai pasar persediaan saat akhir haul.

        piutang
            Piutang dagang yang masih dapat ditagih.

        utang
            Utang usaha yang dikurangkan.

        harga_emas_per_gram
            Harga emas per gram untuk menentukan nisab.

        kalender
            'hijriah' atau 'masehi'.
        """

        # --------------------------------------------------
        # NORMALISASI INPUT
        # --------------------------------------------------

        kalender_normalized = (
            str(kalender or "")
            .strip()
            .lower()
        )

        tarif = cls.get_tarif(
            kalender_normalized
        )

        # --------------------------------------------------
        # TOTAL HARTA
        # --------------------------------------------------

        total_harta = (
            cls.hitung_total_harta(
                kas=kas,
                bank=bank,
                persediaan=persediaan,
                piutang=piutang,
            )
        )

        # --------------------------------------------------
        # UTANG
        # --------------------------------------------------

        utang_d = to_decimal(
            utang,
            "Utang usaha",
        )

        validate_non_negative(
            utang_d,
            "Utang usaha",
        )

        utang_d = money(
            utang_d
        )

        # --------------------------------------------------
        # HARTA BERSIH
        # --------------------------------------------------

        harta_bersih = (
            cls.hitung_harta_bersih(
                total_harta=total_harta,
                utang=utang_d,
            )
        )

        # --------------------------------------------------
        # NISAB
        # --------------------------------------------------

        harga_emas = to_decimal(
            harga_emas_per_gram,
            "Harga emas per gram",
        )

        if harga_emas <= 0:

            raise ZakatTijarahValidationError(
                "Harga emas per gram harus lebih dari 0."
            )

        harga_emas = money(
            harga_emas
        )

        nisab = (
            cls.hitung_nisab(
                harga_emas
            )
        )

        # --------------------------------------------------
        # STATUS NISAB
        # --------------------------------------------------

        wajib_zakat = (
            harta_bersih >= nisab
        )

        # --------------------------------------------------
        # ZAKAT
        # --------------------------------------------------

        if wajib_zakat:

            zakat = money(
                harta_bersih
                * tarif
            )

        else:

            zakat = Decimal("0.00")

        # --------------------------------------------------
        # RESULT
        # --------------------------------------------------

        return ZakatTijarahResult(
            kalender=kalender_normalized,

            kas=money(
                to_decimal(
                    kas,
                    "Kas",
                )
            ),

            bank=money(
                to_decimal(
                    bank,
                    "Bank",
                )
            ),

            persediaan=money(
                to_decimal(
                    persediaan,
                    "Persediaan",
                )
            ),

            piutang=money(
                to_decimal(
                    piutang,
                    "Piutang",
                )
            ),

            utang=utang_d,

            total_harta=total_harta,

            harta_bersih=harta_bersih,

            harga_emas_per_gram=harga_emas,

            nisab=nisab,

            tarif=tarif,

            wajib_zakat=wajib_zakat,

            zakat=zakat,
        )


# ==========================================================
# SINGLETON
# ==========================================================

zakat_tijarah_service = (
    ZakatTijarahService()
)