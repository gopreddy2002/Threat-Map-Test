import asyncio

from routers import tools


def test_start_scan_forwards_advanced_options(monkeypatch):
    captured = {}

    async def fake_request(path, method="GET", params=None, data=None):
        captured.update(path=path, method=method, params=params, data=data)
        return {"status": "success", "data": ["SUCCESS", "scan-123"]}

    monkeypatch.setattr(tools, "_spiderfoot_request", fake_request)
    request = tools.SpiderFootRequest(
        target="AS15169",
        target_type="asn",
        scan_name="ASN audit",
        module_list="sfp_dns,sfp_shodan",
        type_list="IP_ADDRESS,DOMAIN_NAME",
        use_case="investigate",
    )
    response = asyncio.run(tools.start_spiderfoot_scan(request))

    assert response["status"] == "started"
    assert response["scan_id"] == "scan-123"
    assert captured == {
        "path": "/startscan",
        "method": "POST",
        "params": None,
        "data": {
            "scanname": "ASN audit",
            "scantarget": "AS15169",
            "typelist": "IP_ADDRESS,DOMAIN_NAME",
            "modulelist": "sfp_dns,sfp_shodan",
            "usecase": "investigate",
        },
    }


def test_scan_lifecycle_routes_map_to_spiderfoot_api(monkeypatch):
    calls = []

    async def fake_request(path, method="GET", params=None, data=None):
        calls.append((path, method, params, data))
        return {"status": "success", "endpoint": path}

    monkeypatch.setattr(tools, "_spiderfoot_request", fake_request)
    asyncio.run(tools.spiderfoot_scan_logs("scan-1", 25))
    asyncio.run(tools.spiderfoot_scan_summary("scan-1", "module"))
    asyncio.run(tools.spiderfoot_scan_results("scan-1", "IP_ADDRESS", True))
    asyncio.run(tools.spiderfoot_scan_correlations("scan-1", "corr-1"))
    asyncio.run(tools.spiderfoot_scan_export("scan-1", "gexf"))
    asyncio.run(tools.spiderfoot_stop_scan("scan-1"))
    asyncio.run(tools.spiderfoot_delete_scan("scan-1"))

    assert calls == [
        ("/scanlog", "POST", None, {"id": "scan-1", "limit": "25"}),
        ("/scansummary", "GET", {"id": "scan-1", "by": "module"}, None),
        ("/scaneventresultsunique", "POST", None, {"id": "scan-1", "eventType": "IP_ADDRESS"}),
        ("/scaneventresults", "POST", None, {"id": "scan-1", "correlationId": "corr-1"}),
        ("/scanvizmulti", "POST", None, {"ids": "scan-1"}),
        ("/stopscan", "GET", {"id": "scan-1"}, None),
        ("/scandelete", "GET", {"id": "scan-1"}, None),
    ]


def test_configuration_save_serializes_options(monkeypatch):
    captured = {}

    async def fake_request(path, method="GET", params=None, data=None):
        captured.update(path=path, method=method, data=data)
        return {"status": "success"}

    monkeypatch.setattr(tools, "_spiderfoot_request", fake_request)
    request = tools.SpiderFootConfigUpdateRequest(token="csrf", allopts={"__logging": True})
    asyncio.run(tools.spiderfoot_save_config(request))

    assert captured["path"] == "/savesettingsraw"
    assert captured["method"] == "POST"
    assert captured["data"]["token"] == "csrf"
    assert '"__logging": true' in captured["data"]["allopts"]
