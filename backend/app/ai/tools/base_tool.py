"""
Base Tool
=========

Kelas dasar seluruh AI Tool.
"""


class BaseTool:
    """
    Base class untuk seluruh tool AI.
    """

    def __init__(self):

        self.name = "base"
        self.description = ""

    async def execute(self, request: dict):
        """
        Method utama tool.
        """

        raise NotImplementedError(
            "execute() harus dioverride."
        )

    def info(self):
        """
        Informasi tool.
        """

        return {
            "name": self.name,
            "description": self.description
        }