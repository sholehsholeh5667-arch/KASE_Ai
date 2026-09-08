"""
Knowledge Memory
================

Menyimpan riwayat Knowledge Base
yang digunakan setiap session.
"""


class KnowledgeMemory:
    """
    Memory untuk Knowledge Base.
    """

    def __init__(self):
        self.memories = {}

    # ==========================================
    # Save
    # ==========================================

    def save(
        self,
        session_id: str,
        category: str,
        keyword: str,
        result
    ):
        """
        Menyimpan knowledge yang digunakan.
        """

        if session_id not in self.memories:
            self.memories[session_id] = []

        self.memories[session_id].append(
            {
                "category": category,
                "keyword": keyword,
                "result": result
            }
        )

    # ==========================================
    # Load
    # ==========================================

    def load(
        self,
        session_id: str
    ):
        """
        Mengambil seluruh memory.
        """

        return self.memories.get(
            session_id,
            []
        )

    # ==========================================
    # Last
    # ==========================================

    def last(
        self,
        session_id: str
    ):
        """
        Mengambil memory terakhir.
        """

        data = self.load(session_id)

        if not data:
            return None

        return data[-1]

    # ==========================================
    # Clear
    # ==========================================

    def clear(
        self,
        session_id: str
    ):
        """
        Menghapus memory session.
        """

        self.memories.pop(
            session_id,
            None
        )

    # ==========================================
    # Count
    # ==========================================

    def count(
        self,
        session_id: str
    ):
        """
        Jumlah memory pada session.
        """

        return len(
            self.load(session_id)
        )

    # ==========================================
    # Sessions
    # ==========================================

    def sessions(self):
        """
        Mengambil daftar session.
        """

        return list(
            self.memories.keys()
        )