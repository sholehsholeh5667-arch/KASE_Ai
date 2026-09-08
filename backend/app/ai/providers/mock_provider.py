"""
Mock Provider
=============

Provider AI untuk testing.
"""

from app.ai.response import AIResponse


class MockProvider:

    def __init__(self):
        self.name = "mock"

    async def generate(self, request):

        message = request.get("message", "")

        return AIResponse.success(
            provider=self.name,
            module=request.get("module"),
            message=f"Mock AI menerima pesan: {message}",
            data={
                "echo": message
            }
        )

    async def stream_generate(self, request):

        message = request.get("message", "")

        yield f"Mock: {message}"