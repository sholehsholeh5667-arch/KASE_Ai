"""
Base AI Provider
================

Kontrak dasar seluruh AI Provider.
"""

from abc import ABC, abstractmethod


class BaseProvider(ABC):
    """
    Abstract Base Class seluruh provider AI.
    """

    def __init__(self, name: str):
        self.name = name

    @abstractmethod
    async def generate(self, prompt: str):
        """
        Menghasilkan respon AI.
        """
        pass

    @abstractmethod
    async def health_check(self):
        """
        Mengecek status provider.
        """
        pass