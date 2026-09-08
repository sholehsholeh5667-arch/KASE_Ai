"""
AI Response
===========

Standarisasi response AI.
"""

from datetime import datetime


class AIResponse:
    """
    Response standar AI.
    """

    @staticmethod
    def success(
        message="Berhasil.",
        data=None,
        provider="internal",
        module=None,
    ):
        if data is None:
            data = {}

        return {
            "status": "success",
            "success": True,
            "provider": provider,
            "module": module,
            "message": message,
            "data": data,
            "timestamp": datetime.now().isoformat()
        }

    @staticmethod
    def error(
        message="Terjadi kesalahan.",
        provider="internal",
        module=None,
        data=None,
    ):
        if data is None:
            data = {}

        return {
            "status": "error",
            "success": False,
            "provider": provider,
            "module": module,
            "message": message,
            "data": data,
            "timestamp": datetime.now().isoformat()
        }