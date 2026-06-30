from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from models.database import get_db, AICopilotConversation
import uuid
import datetime
import json

router = APIRouter(prefix="/ai-copilot", tags=["AI Copilot"])

# Mock AI Service Integration for now (could link to ai_service.py in real implementation)
async def generate_mock_response(prompt: str, uploaded_content: str = None) -> dict:
    # A mock response that simulates what the AI might return
    response_text = f"Mock AI Response for: '{prompt}'"
    if uploaded_content:
        response_text += f"\n\nAnalyzed context from upload."
    return {
        "text": response_text,
        "confidence": 85,
        "summary": "Mock summary of the interaction."
    }

@router.post("/chat")
async def send_chat_prompt(
    prompt: str = Form(...),
    session_id: str = Form("default-session"),
    db: Session = Depends(get_db)
):
    try:
        # Here we would call the actual LLM service
        ai_result = await generate_mock_response(prompt)
        
        conversation = AICopilotConversation(
            id=str(uuid.uuid4()),
            session_id=session_id,
            prompt=prompt,
            response=ai_result["text"],
            confidence_score=ai_result["confidence"],
            conversation_summary=ai_result["summary"],
            timestamp=datetime.datetime.utcnow()
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

        return {
            "status": "success",
            "data": {
                "id": conversation.id,
                "response": conversation.response,
                "confidence_score": conversation.confidence_score,
                "timestamp": conversation.timestamp
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload")
async def upload_file(
    prompt: str = Form(...),
    session_id: str = Form("default-session"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    try:
        content = await file.read()
        # Depending on file type, we might decode it differently.
        try:
            text_content = content.decode("utf-8")
        except:
            text_content = "Binary/Unreadable content"
            
        ai_result = await generate_mock_response(prompt, text_content)
        
        conversation = AICopilotConversation(
            id=str(uuid.uuid4()),
            session_id=session_id,
            prompt=prompt,
            response=ai_result["text"],
            uploaded_file=file.filename,
            confidence_score=ai_result["confidence"],
            conversation_summary=ai_result["summary"],
            timestamp=datetime.datetime.utcnow()
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

        return {
            "status": "success",
            "data": {
                "id": conversation.id,
                "response": conversation.response,
                "file_name": file.filename,
                "confidence_score": conversation.confidence_score,
                "timestamp": conversation.timestamp
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history")
async def get_history(session_id: str = "default-session", db: Session = Depends(get_db)):
    try:
        conversations = db.query(AICopilotConversation).filter(
            AICopilotConversation.session_id == session_id
        ).order_by(AICopilotConversation.timestamp.asc()).all()
        
        return {
            "status": "success",
            "data": [
                {
                    "id": c.id,
                    "prompt": c.prompt,
                    "response": c.response,
                    "uploaded_file": c.uploaded_file,
                    "timestamp": c.timestamp,
                    "confidence_score": c.confidence_score
                }
                for c in conversations
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/history")
async def clear_history(session_id: str = "default-session", db: Session = Depends(get_db)):
    try:
        db.query(AICopilotConversation).filter(
            AICopilotConversation.session_id == session_id
        ).delete()
        db.commit()
        return {"status": "success", "message": "History cleared."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/export/{id}")
async def export_conversation(id: str, db: Session = Depends(get_db)):
    try:
        conversation = db.query(AICopilotConversation).filter(
            AICopilotConversation.id == id
        ).first()
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
            
        # For simplicity, returning as JSON text payload. Could return a StreamingResponse for real file download.
        export_text = f"--- Exported Chat ---\nPrompt: {conversation.prompt}\n\nResponse:\n{conversation.response}"
        return {
            "status": "success",
            "data": {
                "export_text": export_text
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
