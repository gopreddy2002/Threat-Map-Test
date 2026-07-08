import httpx
import asyncio

async def test():
    async with httpx.AsyncClient() as client:
        r = await client.post('http://127.0.0.1:8000/api/v1/analyze/domain', json={'indicator': 'github.com', 'type': 'domain'})
        print(r.status_code, r.text)

asyncio.run(test())
