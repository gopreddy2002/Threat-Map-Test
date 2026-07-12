from typing import Mapping, Optional

import httpx


MAX_WEBPAGE_BYTES = 256 * 1024


async def fetch_limited_text(
    client: httpx.AsyncClient,
    url: str,
    *,
    max_bytes: int = MAX_WEBPAGE_BYTES,
    headers: Optional[Mapping[str, str]] = None,
    follow_redirects: bool = True,
) -> tuple[str, httpx.Headers]:
    data = bytearray()
    async with client.stream("GET", url, headers=headers, follow_redirects=follow_redirects) as response:
        response.raise_for_status()
        async for chunk in response.aiter_bytes():
            remaining = max_bytes - len(data)
            if remaining <= 0:
                break
            data.extend(chunk[:remaining])

        encoding = response.encoding or "utf-8"
        return data.decode(encoding, errors="replace"), response.headers
