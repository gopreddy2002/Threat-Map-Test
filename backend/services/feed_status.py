from typing import Any, Iterable


UNAVAILABLE_STATUSES = {"fallback", "error", "unavailable", "api_key_required"}


def is_live_feed_result(feed: Any) -> bool:
    if not isinstance(feed, dict) or not feed:
        return False

    status = str(feed.get("status") or feed.get("overall_status") or "").lower()
    if status:
        return status not in UNAVAILABLE_STATUSES

    return feed.get("raw") is not None


def has_no_live_reputation_feeds(raw_data: dict, feed_names: Iterable[str]) -> bool:
    feeds = [raw_data.get(name) for name in feed_names]
    present_feeds = [feed for feed in feeds if isinstance(feed, dict) and feed]
    return bool(present_feeds) and not any(is_live_feed_result(feed) for feed in present_feeds)
