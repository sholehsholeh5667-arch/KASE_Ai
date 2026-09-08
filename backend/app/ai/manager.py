"""
AI Manager
==========

Mengelola seluruh proses AI.
"""

from datetime import datetime

from app.ai.router import AIRouter
from app.ai.logger import AILogger
from app.ai.memory import AIMemory
from app.ai.tools.tool_manager import ToolManager


class AIManager:
    """
    Manager utama AI.
    """

    def __init__(self):
        self.router = AIRouter()
        self.logger = AILogger()
        self.memory = AIMemory()
        self.tool_manager = ToolManager()

        self.sessions = {}
        self.contexts = {}

    async def process(
     self,
     request: dict,
     db=None,
    ):
        """
        Memproses request AI.

        Aturan routing:

        1. Jika module diberikan secara eksplisit:
           langsung ke AIRouter.

        2. Jika module tidak diberikan:
           beri kesempatan ToolManager untuk mendeteksi
           tool otomatis.

        3. Jika ToolManager tidak menghasilkan response:
           gunakan AIRouter.
        """

        session_id = (
            request.get(
                "session_id",
                "default",
            )
            if isinstance(request, dict)
            else "default"
        )

        try:

            # ==================================================
            # VALIDASI REQUEST
            # ==================================================

            if not isinstance(
                request,
                dict,
            ):
                return {
                    "status": "error",
                    "success": False,
                    "provider": "manager",
                    "module": None,
                    "message": (
                        "Request harus berupa dictionary."
                    ),
                    "data": {},
                    "timestamp": (
                        datetime.now().isoformat()
                    ),
                }

            # ==================================================
            # SESSION
            # ==================================================

            session_id = (
                request.get(
                    "session_id",
                    "default",
                )
                or "default"
            )

            if session_id not in self.sessions:

                self.sessions[session_id] = {
                    "session_id": session_id,
                    "created_at": (
                        datetime.now().isoformat()
                    ),
                    "last_activity": (
                        datetime.now().isoformat()
                    ),
                    "history": [],
                    "context": [],
                }

            self.sessions[
                session_id
            ][
                "last_activity"
            ] = datetime.now().isoformat()

            # ==================================================
            # MODULE
            # ==================================================

            raw_module = request.get(
                "module"
            )

            module_explicit = (
                isinstance(
                    raw_module,
                    str,
                )
                and raw_module.strip() != ""
                and raw_module.strip().lower()
                != "unknown"
            )

            if module_explicit:

                module = (
                    raw_module.strip().lower()
                )

                request["module"] = module

            else:

                module = "unknown"

            # ==================================================
            # LOGGING REQUEST
            # ==================================================

            self.logger.info(
                module,
                session_id,
                "Request diterima.",
            )

            # ==================================================
            # CONTEXT USER
            # ==================================================

            message = request.get(
                "message",
                "",
            )

            if message:

                self.add_context(
                    session_id,
                    "user",
                    str(message),
                )

                self.memory.save(
                    session_id,
                    "user",
                    str(message),
                )

            # ==================================================
            # AI ROUTING PIPELINE
            # ==================================================
            #
            # MODULE EKSPLISIT:
            #   langsung AIRouter
            #
            # MODULE TIDAK ADA:
            #   ToolManager dulu
            #   lalu AIRouter jika tool tidak menangani
            #
            # Ini penting agar:
            #
            # module = "zakat"
            #
            # tidak diambil alih oleh ZakatTool.
            # ==================================================

            if module_explicit:

                response = await self.router.process(
                    request,
                    db=db,
                )

            else:

                tool_response = (
                    await self.tool_manager.execute_multiple(
                        request
                    )
                )

                if tool_response is not None:

                    response = tool_response

                else:

                    response = await self.router.process(
                        request,
                        db=db,
                    )

            # ==================================================
            # CONTEXT AI
            # ==================================================

            if isinstance(
                response,
                dict,
            ):

                ai_message = response.get(
                    "message",
                    "",
                )

            else:

                ai_message = str(
                    response
                )

            self.add_context(
                session_id,
                "assistant",
                str(ai_message),
            )

            self.memory.save(
                session_id,
                "assistant",
                str(ai_message),
            )

            # ==================================================
            # HISTORY
            # ==================================================

            self.sessions[
                session_id
            ][
                "history"
            ].append(
                {
                    "request": request,
                    "response": response,
                }
            )

            self.sessions[
                session_id
            ][
                "context"
            ] = self.get_context(
                session_id
            )

            # ==================================================
            # NORMALISASI RESPONSE NON-DICT
            # ==================================================

            if not isinstance(
                response,
                dict,
            ):

                response = {
                    "status": "success",
                    "success": True,
                    "provider": "internal",
                    "module": module,
                    "message": str(
                        response
                    ),
                    "data": {},
                    "timestamp": (
                        datetime.now().isoformat()
                    ),
                }

            # ==================================================
            # DEFAULT RESPONSE FIELDS
            # ==================================================

            response.setdefault(
                "status",
                "success",
            )

            response.setdefault(
                "success",
                True,
            )

            response.setdefault(
                "provider",
                "internal",
            )

            response.setdefault(
                "module",
                module,
            )

            response.setdefault(
                "data",
                {},
            )

            response.setdefault(
                "timestamp",
                datetime.now().isoformat(),
            )

            # ==================================================
            # LOGGING RESPONSE
            # ==================================================

            self.logger.info(
                response.get(
                    "module",
                    module,
                ),
                session_id,
                "Response berhasil dikirim.",
            )

            return response

        except Exception as e:

            # ==================================================
            # ERROR LOGGING
            # ==================================================

            try:

                self.logger.error(
                    "manager",
                    session_id,
                    str(e),
                )

            except Exception:

                # Jangan sampai error logger
                # menutupi error asli.
                pass

            # ==================================================
            # ERROR RESPONSE
            # ==================================================

            return {
                "status": "error",
                "success": False,
                "provider": "manager",
                "module": (
                    request.get(
                        "module"
                    )
                    if isinstance(
                        request,
                        dict,
                    )
                    else None
                ),
                "message": str(e),
                "data": {},
                "timestamp": (
                    datetime.now().isoformat()
                ),
            }

    # ==========================================================
    # CONTEXT MANAGER
    # ==========================================================

    def add_context(
        self,
        session_id,
        role,
        content,
    ):

        if session_id not in self.contexts:

            self.contexts[
                session_id
            ] = []

        self.contexts[
            session_id
        ].append(
            {
                "role": role,
                "content": content,
            }
        )

    def get_context(
        self,
        session_id,
    ):

        return self.contexts.get(
            session_id,
            [],
        )

    # ==========================================================
    # SESSION MANAGER
    # ==========================================================

    def get_session(
        self,
        session_id,
    ):

        return self.sessions.get(
            session_id
        )

    # ==========================================================
    # MEMORY
    # ==========================================================

    def get_memory(
        self,
        session_id,
    ):

        return self.memory.load(
            session_id
        )