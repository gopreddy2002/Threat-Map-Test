import pytest
from fastapi import HTTPException

from core.indicator_validation import (
    validate_domain,
    validate_file_hash,
    validate_public_ip,
    validate_public_url,
)


def test_public_ipv4_is_accepted():
    assert validate_public_ip("8.8.8.8") == "8.8.8.8"


def test_private_ipv4_is_rejected():
    with pytest.raises(HTTPException):
        validate_public_ip("10.0.0.1")


def test_loopback_ipv4_is_rejected():
    with pytest.raises(HTTPException):
        validate_public_ip("127.0.0.1")


def test_malformed_ipv4_is_rejected():
    with pytest.raises(HTTPException):
        validate_public_ip("999.1.1.1")


def test_ipv6_is_rejected_for_ip_scans():
    with pytest.raises(HTTPException):
        validate_public_ip("2001:4860:4860::8888")


def test_public_domain_is_accepted():
    assert validate_domain("Example.COM.") == "example.com"


def test_localhost_domain_is_rejected():
    with pytest.raises(HTTPException):
        validate_domain("localhost")


def test_domain_with_url_path_is_rejected():
    with pytest.raises(HTTPException):
        validate_domain("example.com/path")


def test_ip_in_domain_scanner_is_rejected():
    with pytest.raises(HTTPException):
        validate_domain("8.8.8.8")


def test_public_ip_url_is_accepted():
    assert validate_public_url("https://8.8.8.8/dns-query") == "https://8.8.8.8/dns-query"


def test_localhost_url_is_rejected():
    with pytest.raises(HTTPException):
        validate_public_url("http://localhost:8000")


def test_private_ip_url_is_rejected():
    with pytest.raises(HTTPException):
        validate_public_url("http://192.168.1.10/admin")


def test_url_with_credentials_is_rejected():
    with pytest.raises(HTTPException):
        validate_public_url("https://user:pass@example.com")


def test_sha256_hash_is_accepted():
    assert validate_file_hash("A" * 64) == "a" * 64


def test_invalid_hash_is_rejected():
    with pytest.raises(HTTPException):
        validate_file_hash("not-a-hash")
