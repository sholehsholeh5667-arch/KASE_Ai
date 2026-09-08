"""
Automation Scheduler
====================

Scheduler sederhana untuk Automation AI.

Tahap AI-06B:
- Mengecek automation ACTIVE.
- Mengecek waktu schedule.
- Menjalankan automation yang sudah waktunya.
- Mencegah double execution dalam satu siklus.
- Tidak menggunakan thread/background worker terlebih dahulu.
"""

from datetime import datetime

from app.services.automation import AutomationService


class AutomationScheduler:
    """
    Scheduler Automation AI.

    Scheduler ini sengaja dibuat sinkron dan sederhana
    agar business logic mudah diuji terlebih dahulu.
    """

    def __init__(
        self,
        automation_service=None,
    ):
        self.service = (
            automation_service
            if automation_service is not None
            else AutomationService()
        )

        # Menyimpan automation yang sudah dijalankan
        # pada siklus scheduler saat ini.
        self._executed = set()

    # ==========================================
    # SCHEDULE PARSER
    # ==========================================

    @staticmethod
    def _schedule_due(
        schedule,
        now,
    ):
        """
        Mengecek apakah schedule sudah jatuh tempo.

        Format awal:
            HH:MM

        Contoh:
            02:00
            14:30
        """

        if not schedule:
            return False

        schedule = str(schedule).strip()

        try:
            hour, minute = map(
                int,
                schedule.split(":"),
            )

            if not (
                0 <= hour <= 23
                and 0 <= minute <= 59
            ):
                return False

            scheduled_time = now.replace(
                hour=hour,
                minute=minute,
                second=0,
                microsecond=0,
            )

            return now >= scheduled_time

        except (
            ValueError,
            TypeError,
        ):
            return False

    # ==========================================
    # RUN ONCE
    # ==========================================

    def run_once(
        self,
        now=None,
    ):
        """
        Menjalankan satu siklus scheduler.

        Return:
            {
                "status": "success",
                "executed": [...],
                "skipped": [...]
            }
        """

        if now is None:
            now = datetime.now()

        executed = []
        skipped = []

        automations = (
            self.service.list_all()
            .get("data", [])
        )

        for automation in automations:

            automation_id = automation.get(
                "id"
            )

            status = automation.get(
                "status"
            )

            schedule = automation.get(
                "schedule"
            )

            # ==================================
            # CANCELLED
            # ==================================

            if status == "CANCELLED":

                skipped.append({
                    "id": automation_id,
                    "reason": "CANCELLED",
                })

                continue

            # ==================================
            # STATUS BUKAN ACTIVE
            # ==================================

            if status != "ACTIVE":

                skipped.append({
                    "id": automation_id,
                    "reason": "NOT_ACTIVE",
                })

                continue

            # ==================================
            # BELUM JATUH TEMPO
            # ==================================

            if not self._schedule_due(
                schedule,
                now,
            ):

                skipped.append({
                    "id": automation_id,
                    "reason": "NOT_DUE",
                })

                continue

            # ==================================
            # CEGAH DOUBLE EXECUTION
            # ==================================

            if automation_id in self._executed:

                skipped.append({
                    "id": automation_id,
                    "reason": "ALREADY_EXECUTED",
                })

                continue

            # ==================================
            # RUN
            # ==================================

            try:

                hasil = self.service.run(
                    automation_id
                )

                if hasil.get(
                    "success"
                ):

                    self._executed.add(
                        automation_id
                    )

                    executed.append(
                        automation_id
                    )

                else:

                    skipped.append({
                        "id": automation_id,
                        "reason": (
                            "EXECUTION_FAILED"
                        ),
                    })

            except Exception as exc:

                skipped.append({
                    "id": automation_id,
                    "reason": "EXECUTION_ERROR",
                    "error": str(exc),
                })

        return {
            "status": "success",
            "executed": executed,
            "skipped": skipped,
        }

    # ==========================================
    # RESET CYCLE
    # ==========================================

    def reset_cycle(self):
        """
        Menghapus catatan execution cycle.

        Digunakan saat memulai siklus scheduler
        baru.
        """

        self._executed.clear()


automation_scheduler = AutomationScheduler()