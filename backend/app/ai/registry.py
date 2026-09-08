"""
AI Handler Registry
===================

Mendaftarkan seluruh handler AI.
"""


class AIRegistry:
    """
    Registry seluruh handler AI.
    """

    def __init__(self):
        self.handlers = {}

    def register(self, module: str, handler):
        """
        Mendaftarkan handler.
        """

        self.handlers[module.lower()] = handler

    def get(self, module: str):
        """
        Mengambil handler.
        """

        return self.handlers.get(module.lower())

    def exists(self, module: str):
        """
        Mengecek handler.
        """

        return module.lower() in self.handlers

    def all(self):
        """
        Mengambil seluruh handler.
        """

        return self.handlers