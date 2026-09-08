"""
OpenAI Provider
===============

Provider untuk OpenAI SDK.
"""

import os

from dotenv import load_dotenv
from openai import AsyncOpenAI

from app.ai.providers.base_provider import BaseProvider


# Memuat file .env
load_dotenv()


class OpenAIProvider(BaseProvider):
    """
    Provider OpenAI.
    """

    def __init__(self):
        super().__init__("OpenAI")

        self.api_key = os.getenv(
            "OPENAI_API_KEY"
        )

        self.model = os.getenv(
            "OPENAI_MODEL",
            "gpt-5-mini"
        )

        # Lazy initialization
        self.client = None

    async def health_check(self):
        """
        Mengecek apakah provider siap digunakan.
        """

        if not self.api_key:
            return {
                "status": False,
                "provider": self.name,
                "message": (
                    "OPENAI_API_KEY belum diatur."
                )
            }

        return {
            "status": True,
            "provider": self.name,
            "model": self.model
        }

    async def generate(self, prompt: str):
        """
        Mengirim prompt teks ke OpenAI.
        """

        if not self.api_key:
            return (
                "OPENAI_API_KEY belum diatur."
            )

        if self.client is None:
            self.client = AsyncOpenAI(
                api_key=self.api_key
            )

        try:
            response = await self.client.responses.create(
                model=self.model,
                input=prompt
            )

            return response.output_text

        except Exception as e:
            return f"OpenAI Error: {e}"

    async def generate_vision(
        self,
        prompt: str,
        image_url: str
    ):
        """
        Mengirim prompt + gambar ke OpenAI Vision.

        image_url harus berupa URL gambar yang
        dapat diakses oleh API.
        """

        if not self.api_key:
            return (
                "OPENAI_API_KEY belum diatur."
            )

        if not image_url:
            return (
                "Image URL tidak boleh kosong."
            )

        if self.client is None:
            self.client = AsyncOpenAI(
                api_key=self.api_key
            )

        try:
            response = await self.client.responses.create(
                model=self.model,
                input=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "input_text",
                                "text": prompt
                            },
                            {
                                "type": "input_image",
                                "image_url": image_url
                            }
                        ]
                    }
                ]
            )

            return response.output_text

        except Exception as e:
            return (
                f"OpenAI Vision Error: {e}"
            )
    async def generate_voice(
        self,
        audio_file: str,
        language: str = "id"
    ):
        """
        Mengubah audio menjadi teks menggunakan
        OpenAI Speech-to-Text.

        audio_file:
            Path file audio yang akan ditranskripsi.

        language:
            Bahasa audio. Default: Bahasa Indonesia.
        """

        if not self.api_key:
            return (
                "OPENAI_API_KEY belum diatur."
            )

        if not audio_file:
            return (
                "Audio file tidak boleh kosong."
            )

        if not os.path.exists(audio_file):
            return (
                "Audio file tidak ditemukan."
            )

        if self.client is None:
            self.client = AsyncOpenAI(
                api_key=self.api_key
            )

        try:
            with open(
                audio_file,
                "rb"
            ) as audio:

                transcription = (
                    await self.client.audio.transcriptions.create(
                        model="gpt-4o-mini-transcribe",
                        file=audio,
                        language=language,
                    )
                )

            return transcription.text

        except Exception as e:
            return (
                f"OpenAI Voice Error: {e}"
            )

    async def stream_generate(
        self,
        prompt: str
    ):
        """
        Mengirim prompt ke OpenAI dengan streaming.
        """

        if not self.api_key:
            yield (
                "OPENAI_API_KEY belum diatur."
            )
            return

        if self.client is None:
            self.client = AsyncOpenAI(
                api_key=self.api_key
            )

        try:
            stream = await self.client.responses.create(
                model=self.model,
                input=prompt,
                stream=True,
            )

            async for event in stream:

                if event.type == (
                    "response.output_text.delta"
                ):
                    yield event.delta

        except Exception as e:
            yield f"OpenAI Error: {e}"