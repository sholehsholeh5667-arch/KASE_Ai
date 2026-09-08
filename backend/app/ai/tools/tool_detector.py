"""
Tool Detector
=============

Mendeteksi tool yang harus dijalankan berdasarkan isi pesan.
"""


class ToolDetector:
    """
    Mendeteksi tool AI dari pesan pengguna.
    """

    def detect(self, message: str):
        """
        Mengembalikan satu tool pertama yang cocok.
        """

        tools = self.detect_all(message)

        if tools:
            return tools[0]

        return None

    def detect_all(self, message: str):
        """
        Mengembalikan seluruh tool yang cocok.
        """

        if not message:
            return []

        message = message.lower()

        tools = []

        # ==========================
        # Calculator
        # ==========================

        if (
            "+" in message
            or "-" in message
            or "*" in message
            or "/" in message
            or "hitung" in message
            or "kalkulasi" in message
        ):
            tools.append("calculator")

        # ==========================
        # Zakat
        # ==========================

        if (
            "zakat" in message
            or "nisab" in message
            or "dagangan" in message
            or "perdagangan" in message
        ):
            tools.append("zakat")

        # ==========================
        # Stock
        # ==========================

        if (
            "stok" in message
            or "stock" in message
            or "barang" in message
            or "persediaan" in message
        ):
            tools.append("stok")

        # ==========================
        # Report
        # ==========================

        if (
            "laporan" in message
            or "report" in message
            or "rekap" in message
        ):
            tools.append("laporan")

        # ==========================
        # Search
        # ==========================

        if (
            "cari" in message
            or "search" in message
            or "temukan" in message
            or "lookup" in message
        ):
            tools.append("search")

        # Hapus duplikasi
        return list(dict.fromkeys(tools))