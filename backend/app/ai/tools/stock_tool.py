"""
Stock Tool
==========

Digunakan untuk mengecek stok barang.
"""


class StockTool:
    """
    Tool pengecekan stok.
    """

    async def execute(self, data: dict):
        """
        Menjalankan pengecekan stok.
        """

        nama_barang = data.get("message", "")

        return {
            "status": "success",
            "success": True,
            "provider": "stock",
            "module": "tool",
            "message": f"Stok untuk '{nama_barang}' belum terhubung ke database.",
            "data": {
                "stok": 0
            }
        }