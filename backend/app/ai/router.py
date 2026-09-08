"""
AI Router
=========

Menentukan tujuan request AI.
"""

from app.ai.intent import AIIntent
from app.ai.registry import AIRegistry

from app.ai.handlers.chat_handler import ChatHandler
from app.ai.handlers.muamalah_handler import MuamalahHandler
from app.ai.handlers.kitab_handler import KitabHandler
from app.ai.handlers.zakat_handler import ZakatHandler
from app.ai.handlers.vision_handler import VisionHandler
from app.ai.handlers.voice_handler import VoiceHandler
from app.ai.handlers.automation_handler import AutomationHandler


class AIRouter:
    """
    Router utama AI.
    """

    def __init__(self):

        self.intent = AIIntent()

        self.registry = AIRegistry()

        self.registry.register(
            "chat",
            ChatHandler()
        )

        self.registry.register(
            "muamalah",
            MuamalahHandler()
        )

        self.registry.register(
            "kitab",
            KitabHandler()
        )

        self.registry.register(
            "zakat",
            ZakatHandler()
        )

        self.registry.register(
            "vision",
            VisionHandler()
        )

        self.registry.register(
            "voice",
            VoiceHandler()
        )

        self.registry.register(
            "automation",
            AutomationHandler()
        )

    async def process(self, request: dict, db=None):
        """
        Routing request AI.
        """

        module = request.get("module")

        if not module:

            module = self.intent.detect(
                request.get("message", "")
            )

            request["module"] = module

        handler = self.registry.get(module)

        if handler is None:

            return {
                "status": "error",
                "success": False,
                "provider": "router",
                "module": module,
                "message": f"Module '{module}' belum terdaftar.",
                "data": {}
            }

        if module == "muamalah":
          return await handler.process(
            request,
            db=db,
        )

        return await handler.process(request)