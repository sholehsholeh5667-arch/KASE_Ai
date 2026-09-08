"""
AI Config
=========

Pusat konfigurasi seluruh sistem AI.

Semua pengaturan AI disimpan di sini agar
tidak tersebar di berbagai file.
"""

import os


class AIConfig:
    """
    Konfigurasi utama AI.
    """

    # ==========================
    # Provider
    # ==========================
    PROVIDER = os.getenv(
        "AI_PROVIDER",
        "openai"
    )

    # ==========================
    # Model
    # ==========================
    MODEL = os.getenv(
        "AI_MODEL",
        "gpt-5-mini"
    )

    # ==========================
    # Parameter AI
    # ==========================
    TEMPERATURE = 0.2

    MAX_TOKENS = 2048

    TIMEOUT = 60

    # ==========================
    # Logging
    # ==========================
    ENABLE_LOGGING = True

    # ==========================
    # Cache
    # ==========================
    ENABLE_CACHE = False

    # ==========================
    # Bahasa Default
    # ==========================
    DEFAULT_LANGUAGE = "id"

    # ==========================
    # Session
    # ==========================
    SESSION_TIMEOUT = 1800

    @classmethod
    def get_provider(cls):
        return cls.PROVIDER

    @classmethod
    def get_model(cls):
        return cls.MODEL