import ipaddress
import re
import socket
from typing import Iterable
from urllib.parse import urlparse

from fastapi import HTTPException, status


DOMAIN_RE = re.compile(
    r"^(?=.{1,253}$)(?!-)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$",
    re.IGNORECASE,
)
HASH_RE = re.compile(r"^(?:[a-f0-9]{32}|[a-f0-9]{40}|[a-f0-9]{64})$", re.IGNORECASE)
BLOCKED_HOSTNAMES = {"localhost", "localhost.localdomain"}


def _bad_request(message: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)


def is_public_ip(value: str) -> bool:
    try:
        ip = ipaddress.ip_address(value)
    except ValueError:
        return False
    return not (
        ip.is_private
        or ip.is_loopback
        or ip.is_link_local
        or ip.is_multicast
        or ip.is_reserved
        or ip.is_unspecified
    )


def validate_public_ip(value: str) -> str:
    indicator = value.strip()
    try:
        ip = ipaddress.ip_address(indicator)
    except ValueError:
        raise _bad_request("Invalid IP address.")

    if ip.version != 4:
        raise _bad_request("Only public IPv4 indicators are supported.")
    if not is_public_ip(indicator):
        raise _bad_request("Private, loopback, reserved, or internal IP addresses are not allowed.")
    return str(ip)


def validate_domain(value: str) -> str:
    domain = value.strip().rstrip(".").lower()
    if not domain or "/" in domain or ":" in domain or "@" in domain:
        raise _bad_request("Invalid domain.")
    if domain in BLOCKED_HOSTNAMES or domain.endswith(".localhost"):
        raise _bad_request("Localhost and internal domains are not allowed.")
    try:
        ipaddress.ip_address(domain)
        raise _bad_request("Use the IP scanner for IP addresses.")
    except ValueError:
        pass

    try:
        domain.encode("idna").decode("ascii")
    except UnicodeError:
        raise _bad_request("Invalid domain.")

    if not DOMAIN_RE.match(domain):
        raise _bad_request("Invalid domain.")
    return domain


def _resolved_addresses(hostname: str) -> Iterable[str]:
    try:
        for result in socket.getaddrinfo(hostname, None):
            yield result[4][0]
    except socket.gaierror:
        return


def validate_public_url(value: str) -> str:
    target = value.strip()
    try:
        parsed = urlparse(target)
    except Exception:
        raise _bad_request("Invalid URL.")

    if parsed.scheme not in {"http", "https"}:
        raise _bad_request("Only http and https URLs are supported.")
    if not parsed.hostname:
        raise _bad_request("URL must include a hostname.")
    if parsed.username or parsed.password:
        raise _bad_request("URLs with embedded credentials are not allowed.")

    host = parsed.hostname.strip().rstrip(".").lower()
    if host in BLOCKED_HOSTNAMES or host.endswith(".localhost"):
        raise _bad_request("Localhost and internal-network URLs are not allowed.")

    try:
        ip = ipaddress.ip_address(host)
        if not is_public_ip(str(ip)):
            raise _bad_request("Private, loopback, reserved, or internal-network URLs are not allowed.")
    except ValueError:
        validate_domain(host)
        for address in _resolved_addresses(host):
            if not is_public_ip(address):
                raise _bad_request("URLs resolving to private or internal networks are not allowed.")

    return target


def validate_file_hash(value: str) -> str:
    file_hash = value.strip().lower()
    if not HASH_RE.match(file_hash):
        raise _bad_request("Invalid file hash. Must be MD5, SHA-1, or SHA-256 hex.")
    return file_hash
