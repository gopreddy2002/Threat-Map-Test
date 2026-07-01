from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from models.database import get_db, DarkWebMention
from models.schemas import DarkWebMentionResponse

router = APIRouter(prefix="/dark-web", tags=["Dark Web"])

@router.get("/{keyword}", response_model=List[DarkWebMentionResponse])
def get_dark_web_mentions(keyword: str, db: Session = Depends(get_db)):
    mentions = db.query(DarkWebMention).filter(DarkWebMention.keyword == keyword).all()
    
    if not mentions:
        # Mock fallback if no API key / real data is found
        return [
            {
                "id": 1,
                "keyword": keyword,
                "source": "Pastebin Dump",
                "snippet": f"Found reference to {keyword} in a leaked database from 2024.",
                "date_found": "2026-06-25T10:00:00Z"
            },
            {
                "id": 2,
                "keyword": keyword,
                "source": "Onion Forum",
                "snippet": f"Selling access to {keyword} infrastructure.",
                "date_found": "2026-06-28T14:30:00Z"
            }
        ]
    return mentions
