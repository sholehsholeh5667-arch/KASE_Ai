"""
AI Middleware
=============

Middleware AI.
"""

from datetime import datetime


class AIMiddleware:
    """
    Middleware utama AI.
    """

    async def process(self, request: dict):
        """
        Memproses request.
        """

        request.setdefault(
            "timestamp",
            datetime.now().isoformat()
        )

        request.setdefault(
            "session_id",
            "default"
        )

        return request