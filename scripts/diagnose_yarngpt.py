#!/usr/bin/env python3
"""Simple diagnostic script to call the local Yarngpt diagnostic endpoint.

Usage:
  # from repo root
  python scripts/diagnose_yarngpt.py --url http://localhost:8000

You may pass an API key via env `YARNGPT_API_KEY` or with `--key`.
"""
import os
import argparse
import json

import httpx


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--url", default="http://localhost:8000", help="Base URL of local backend")
    p.add_argument("--key", default=os.getenv("YARNGPT_API_KEY"), help="Optional Yarngpt API key")
    args = p.parse_args()

    url = args.url.rstrip("/") + "/api/voice/diagnose/yarngpt"
    headers = {}
    if args.key:
        headers["Authorization"] = f"Bearer {args.key}"

    print(f"Calling: {url}")
    try:
        with httpx.Client(timeout=10.0) as client:
            r = client.get(url, headers=headers)
            try:
                payload = r.json()
            except Exception:
                payload = {"status_text": r.text}

        print("Status:", r.status_code)
        print(json.dumps(payload, indent=2, ensure_ascii=False))
    except Exception as exc:
        print("Request failed:", exc)


if __name__ == "__main__":
    main()
