"""
AI Logger
=========

Logging aktivitas AI.
"""

from datetime import datetime


class AILogger:
    """
    Logger sederhana untuk AI.
    """

    def __init__(self):
        self.logs = []

    def log(
        self,
        level: str,
        module: str,
        session_id: str,
        message: str
    ):
        """
        Menyimpan log.
        """

        item = {
            "time": datetime.now().isoformat(),
            "level": level.upper(),
            "module": module,
            "session_id": session_id,
            "message": message
        }

        self.logs.append(item)

        print(
            f"[{item['time']}] "
            f"[{item['level']}] "
            f"[{module}] "
            f"{message}"
        )

    def info(self, module, session_id, message):
        self.log("INFO", module, session_id, message)

    def warning(self, module, session_id, message):
        self.log("WARNING", module, session_id, message)

    def error(self, module, session_id, message):
        self.log("ERROR", module, session_id, message)

    def get_logs(self):
        """
        Mengambil seluruh log.
        """
        return self.logs

    def clear(self):
        """
        Menghapus seluruh log.
        """
        self.logs.clear()