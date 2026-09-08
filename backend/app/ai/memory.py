"""
AI Memory
=========

Menyimpan memory AI.
"""


class AIMemory:
    """
    Memory AI.
    """

    def __init__(self):
        self.memories = {}

    def save(self, session_id: str, role: str, content: str):
        """
        Menyimpan memory.
        """

        if session_id not in self.memories:
            self.memories[session_id] = []

        self.memories[session_id].append(
            {
                "role": role,
                "content": content
            }
        )

    def load(self, session_id: str):
        """
        Mengambil memory.
        """

        return self.memories.get(session_id, [])

    def clear(self, session_id: str):
        """
        Menghapus memory.
        """

        self.memories.pop(session_id, None)