"""
Tool Manager
============

Mengelola seluruh AI Tools.
"""

from app.ai.tools.tool_detector import ToolDetector
from app.ai.tools.calculator_tool import CalculatorTool
from app.ai.tools.zakat_tool import ZakatTool
from app.ai.tools.stock_tool import StockTool
from app.ai.tools.report_tool import ReportTool
from app.ai.tools.search_tool import SearchTool


class ToolManager:
    """
    Manager seluruh AI Tools.
    """

    def __init__(self):

        self.detector = ToolDetector()

        self.tools = {
            "calculator": CalculatorTool(),
            "zakat": ZakatTool(),
            "stok": StockTool(),
            "laporan": ReportTool(),
            "search": SearchTool(),
        }

    # ==========================================
    # Registry
    # ==========================================

    def register(self, name: str, tool):
        """
        Menambahkan tool baru.
        """
        self.tools[name] = tool

    def unregister(self, name: str):
        """
        Menghapus tool.
        """
        self.tools.pop(name, None)

    def exists(self, name: str):
        """
        Mengecek tool tersedia.
        """
        return name in self.tools

    def get_tools(self):
        """
        Mengambil daftar tool.
        """
        return list(self.tools.keys())

    # ==========================================
    # Execute
    # ==========================================

    async def execute(
        self,
        tool_name: str,
        request: dict
    ):
        """
        Menjalankan satu tool.
        """

        tool = self.tools.get(tool_name)

        if tool is None:

            return {
                "status": "error",
                "success": False,
                "provider": "tool_manager",
                "module": "tools",
                "message": f"Tool '{tool_name}' tidak ditemukan.",
                "data": {}
            }

        return await tool.execute(request)

    # ==========================================
    # Auto Tool
    # ==========================================

    async def execute_auto(
        self,
        request: dict
    ):
        """
        Menjalankan satu tool otomatis.
        """

        message = request.get("message", "")

        tool_name = self.detector.detect(message)

        if tool_name is None:
            return None

        return await self.execute(
            tool_name,
            request
        )

    # ==========================================
    # Multi Tool
    # ==========================================

    async def execute_multiple(
        self,
        request: dict
    ):
        """
        Menjalankan beberapa tool sekaligus.
        """

        message = request.get("message", "")

        tool_names = self.detector.detect_all(message)

        if not tool_names:
            return None

        results = []

        for tool_name in tool_names:

            response = await self.execute(
                tool_name,
                request
            )

            results.append(response)

        return {
            "status": "success",
            "success": True,
            "provider": "tool_manager",
            "module": "tools",
            "message": "Multi tool berhasil dijalankan.",
            "data": {
                "tools": results
            }
        }