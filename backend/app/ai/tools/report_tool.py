"""
Report Tool
===========

Digunakan untuk membuat laporan.
"""


class ReportTool:
    """
    Tool pembuatan laporan.
    """

    async def execute(self, data: dict):
        """
        Menjalankan pembuatan laporan.
        """

        report_type = data.get("message", "").strip()

        return {
            "status": "success",
            "success": True,
            "provider": "report",
            "module": "tool",
            "message": f"Laporan '{report_type}' berhasil dibuat (dummy).",
            "data": {
                "report_type": report_type,
                "report": {}
            }
        }