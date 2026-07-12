from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import List, Dict, Any
from services.groq_service import chat_with_ai, chat_with_image
import base64

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    history: List[Dict[str, Any]] = []
    model: str = "openai/gpt-oss-120b"

class ChatResponse(BaseModel):
    response: str

@router.post("/chat", response_model=ChatResponse)
async def ai_chat_endpoint(req: ChatRequest):
    try:
        response_text = await chat_with_ai(req.message, req.history, req.model)
        return ChatResponse(response=response_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail="AI chat request failed.")

@router.post("/chat/image", response_model=ChatResponse)
async def ai_chat_image_endpoint(message: str = Form(...), file: UploadFile = File(...)):
    allowed_types = {"image/jpeg", "image/png", "image/webp"}
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported image type. Use one of: {', '.join(sorted(allowed_types))}.",
        )
    try:
        contents = await file.read()
        if not contents:
            raise HTTPException(status_code=400, detail="Uploaded image is empty.")
        if len(contents) > 5 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="Image exceeds the 5 MB limit.")
        base64_image = base64.b64encode(contents).decode("utf-8")
        response_text = await chat_with_image(message, base64_image, file.content_type)
        return ChatResponse(response=response_text)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Vision provider failed: {e}")
