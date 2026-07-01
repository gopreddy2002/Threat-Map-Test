from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from models.database import get_db, EvidenceFile
from models.schemas import EvidenceFileResponse
import os
import shutil

router = APIRouter(prefix="/evidence", tags=["Evidence Locker"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/", response_model=list[EvidenceFileResponse])
def get_evidence_files(db: Session = Depends(get_db)):
    return db.query(EvidenceFile).all()

@router.post("/upload", response_model=EvidenceFileResponse)
def upload_evidence(file: UploadFile = File(...), incident_id: int = None, db: Session = Depends(get_db)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    db_file = EvidenceFile(
        filename=file.filename,
        file_path=file_path,
        incident_id=incident_id
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    
    return db_file

@router.delete("/{file_id}")
def delete_evidence(file_id: int, db: Session = Depends(get_db)):
    db_file = db.query(EvidenceFile).filter(EvidenceFile.id == file_id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")
        
    # Delete from filesystem
    if os.path.exists(db_file.file_path):
        os.remove(db_file.file_path)
        
    db.delete(db_file)
    db.commit()
    return {"message": "File deleted"}
