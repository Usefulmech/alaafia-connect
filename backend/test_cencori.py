import asyncio
import os
import sys

from app.services.cencori_client import chat

async def test():
    messages = [{"role": "user", "content": "Explain how AI works in a few words"}]
    try:
        res = await chat(messages=messages)
        print("Success:", res)
    except Exception as e:
        print("Failed test")
        if hasattr(e, 'response'):
            print("Response body:", e.response.text)

if __name__ == "__main__":
    asyncio.run(test())
