"""
Automation Handler
==================

Menangani seluruh request Automation AI.
"""

from app.services.automation import automation_service


class AutomationHandler:
    """
    Handler Automation AI.
    """

    async def process(self, request: dict):
        """
        Memproses request Automation AI.
        """

        if not isinstance(request, dict):
            return {
                "status": "error",
                "success": False,
                "module": "automation",
                "message": (
                    "Request harus berupa dictionary."
                ),
                "data": {}
            }

        action = (
            request.get("action", "create")
            or "create"
        ).strip().lower()

        if action == "create":

            return automation_service.create(
                name=request.get("name", ""),
                action=request.get("task", ""),
                schedule=request.get("schedule"),
            )

        if action == "get":

            return automation_service.get(
                automation_id=request.get(
                    "automation_id"
                )
            )

        if action == "list":

            return automation_service.list_all()

        if action == "cancel":

            return automation_service.cancel(
                automation_id=request.get(
                    "automation_id"
                )
            )

        if action == "run":

            return automation_service.run(
                automation_id=request.get(
                    "automation_id"
                )
            )

        return {
            "status": "error",
            "success": False,
            "module": "automation",
            "message": (
                f"Action automation "
                f"'{action}' tidak dikenal."
            ),
            "data": {}
        }