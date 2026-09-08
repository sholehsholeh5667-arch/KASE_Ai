"""
Automation Service
==================

Business logic untuk Automation AI.

Tahap AI-06:
- Membuat automation
- Mengambil automation
- Membatalkan automation
- Menjalankan automation secara manual
- Tidak menggunakan scheduler/background worker
"""

from datetime import datetime
from typing import Optional


class AutomationService:
    """
    Service utama Automation AI.
    """

    def __init__(self):
        self._automations = {}
        self._next_id = 1

    # ==========================================
    # CREATE
    # ==========================================

    def create(
        self,
        name: str,
        action: str,
        schedule: Optional[str] = None,
    ):
        """
        Membuat automation baru.
        """

        name = (name or "").strip()
        action = (action or "").strip()

        if not name:
            return {
                "status": "error",
                "success": False,
                "message": (
                    "Nama automation tidak boleh kosong."
                ),
                "data": {},
            }

        if not action:
            return {
                "status": "error",
                "success": False,
                "message": (
                    "Action automation tidak boleh kosong."
                ),
                "data": {},
            }

        automation_id = self._next_id
        self._next_id += 1

        data = {
            "id": automation_id,
            "name": name,
            "action": action,
            "schedule": schedule,
            "status": "ACTIVE",
            "created_at": datetime.now(),
            "last_run": None,
        }

        self._automations[automation_id] = data

        return {
            "status": "success",
            "success": True,
            "message": (
                "Automation berhasil dibuat."
            ),
            "data": data,
        }

    # ==========================================
    # GET
    # ==========================================

    def get(self, automation_id: int):
        """
        Mengambil satu automation.
        """

        automation = self._automations.get(
            automation_id
        )

        if automation is None:
            return {
                "status": "error",
                "success": False,
                "message": (
                    "Automation tidak ditemukan."
                ),
                "data": {},
            }

        return {
            "status": "success",
            "success": True,
            "message": (
                "Automation ditemukan."
            ),
            "data": automation,
        }

    # ==========================================
    # LIST
    # ==========================================

    def list_all(self):
        """
        Mengambil seluruh automation.
        """

        return {
            "status": "success",
            "success": True,
            "message": (
                "Automation berhasil diambil."
            ),
            "data": list(
                self._automations.values()
            ),
        }

    # ==========================================
    # CANCEL
    # ==========================================

    def cancel(self, automation_id: int):
        """
        Membatalkan automation.
        """

        automation = self._automations.get(
            automation_id
        )

        if automation is None:
            return {
                "status": "error",
                "success": False,
                "message": (
                    "Automation tidak ditemukan."
                ),
                "data": {},
            }

        automation["status"] = "CANCELLED"

        return {
            "status": "success",
            "success": True,
            "message": (
                "Automation berhasil dibatalkan."
            ),
            "data": automation,
        }

    # ==========================================
    # RUN
    # ==========================================

    def run(self, automation_id: int):
        """
        Menjalankan automation secara manual.

        Tahap AI-06 awal belum menjalankan
        action eksternal. Method ini hanya
        mengubah status eksekusi.
        """

        automation = self._automations.get(
            automation_id
        )

        if automation is None:
            return {
                "status": "error",
                "success": False,
                "message": (
                    "Automation tidak ditemukan."
                ),
                "data": {},
            }

        if automation["status"] == "CANCELLED":
            return {
                "status": "error",
                "success": False,
                "message": (
                    "Automation sudah dibatalkan."
                ),
                "data": automation,
            }

        automation["last_run"] = datetime.now()

        return {
            "status": "success",
            "success": True,
            "message": (
                "Automation berhasil dijalankan."
            ),
            "data": automation,
        }


automation_service = AutomationService()