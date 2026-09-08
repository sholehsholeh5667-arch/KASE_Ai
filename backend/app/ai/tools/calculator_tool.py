"""
Calculator Tool
===============

Digunakan untuk melakukan perhitungan sederhana.
"""

import re


class CalculatorTool:
    """
    Tool kalkulator.
    """

    async def execute(self, data: dict):
        """
        Menjalankan perhitungan.
        """

        expression = data.get("message", "").strip()

        expression = expression.replace(" ", "")

        if not re.fullmatch(r"[0-9+\-*/().]+", expression):
            return {
                "status": "error",
                "success": False,
                "provider": "calculator",
                "module": "tool",
                "message": "Format perhitungan tidak valid.",
                "data": {}
            }

        try:
            result = eval(expression)

            return {
                "status": "success",
                "success": True,
                "provider": "calculator",
                "module": "tool",
                "message": f"Hasil perhitungan: {result}",
                "data": {
                    "expression": expression,
                    "result": result
                }
            }

        except Exception:
            return {
                "status": "error",
                "success": False,
                "provider": "calculator",
                "module": "tool",
                "message": "Perhitungan gagal.",
                "data": {}
            }