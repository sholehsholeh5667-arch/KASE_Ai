"""
AI Gateway
==========

Gerbang utama AI.
"""

from datetime import datetime

from app.ai.manager import AIManager
from app.ai.middleware import AIMiddleware


class AIGateway:
    """
    Gateway utama AI.
    """

    def __init__(self):

        self.manager = AIManager()
        self.middleware = AIMiddleware()

    async def handle_request(self, request):
        """
        Menangani request AI.
        """

        try:

            if not isinstance(request, dict):

                return {
                    "status": "error",
                    "success": False,
                    "message": "Request harus berupa dictionary.",
                    "data": {}
                }

            if not request.get("message"):

                return {
                    "status": "error",
                    "success": False,
                    "message": "Field 'message' wajib diisi.",
                    "data": {}
                }

            request = await self.middleware.process(request)

            response = await self.manager.process(request)

            return response

        except Exception as e:

            return {
                "status": "error",
                "success": False,
                "provider": "gateway",
                "module": request.get("module"),
                "message": str(e),
                "data": {},
                "timestamp": datetime.now().isoformat()
            }