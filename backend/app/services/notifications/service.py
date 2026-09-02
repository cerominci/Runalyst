import logging

import httpx

logger = logging.getLogger(__name__)

EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"


def send_push_notification(
    *, push_token: str | None, title: str, body: str, data: dict | None = None
) -> None:
    """
    Fire-and-forget push notification via Expo's push API. Never raises -
    a failed/missing push token should not break the analysis-save flow
    that triggers this.
    """
    if not push_token:
        return

    try:
        resp = httpx.post(
            EXPO_PUSH_URL,
            json={
                "to": push_token,
                "title": title,
                "body": body,
                "data": data or {},
            },
            headers={"Accept": "application/json", "Content-Type": "application/json"},
            timeout=10,
        )
        if resp.status_code != 200:
            logger.warning(f"Expo push send failed ({resp.status_code}): {resp.text}")
    except Exception as e:
        logger.warning(f"Expo push send error: {e}")
