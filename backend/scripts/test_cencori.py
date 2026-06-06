"""Simple runnable smoke-test for the Cencori client.

Usage:
  - Ensure `CENCORI_API_KEY` is present in the environment (or copy `.env.example` to `.env`).
  - From the `backend` folder with the project venv active, run:
      python scripts/test_cencori.py
"""
import os
import asyncio

from app.services.cencori_client import get_client, chat, PRIMARY_MEDICAL_MODEL


async def main() -> None:
    api_key = os.getenv("CENCORI_API_KEY")
    if not api_key:
        print("CENCORI_API_KEY is not set. Set it and re-run the script.")
        return

    messages = [{"role": "user", "content": "Hello from Alaafia Connect - quick integration test"}]

    try:
        resp = await chat(messages, model=PRIMARY_MEDICAL_MODEL, stream=False)
        print("Response:")
        print(resp)
    except Exception as exc:
        print("Error during request:", exc)
    finally:
        client = get_client()
        await client.close()


if __name__ == "__main__":
    asyncio.run(main())
