"""
AI Intent Detection
===================

Menentukan intent berdasarkan pesan pengguna.
"""


class AIIntent:

    def __init__(self):

        self.rules = {
            "zakat": [
                "zakat",
                "nisab",
                "haul",
                "dagangan",
                "perdagangan"
            ],

            "kitab": [
                "kitab",
                "fathul",
                "ibarat",
                "arab",
                "terjemah"
            ],

            "muamalah": [
                "jual beli",
                "muamalah",
                "riba",
                "utang",
                "akad"
            ],

            "vision": [
                "gambar",
                "foto",
                "image"
            ],

            "voice": [
                "suara",
                "audio",
                "voice"
            ],

            "automation": [
                "laporan",
                "otomatis",
                "jadwal"
            ]
        }

    def detect(self, message: str):

        message = message.lower()

        for module, keywords in self.rules.items():

            for keyword in keywords:

                if keyword in message:
                    return module

        return "chat"