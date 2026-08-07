"""
app/routes/files.py

File upload and download endpoints for resumes and attachments.
"""
import os
import uuid
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from core.database import get_db
from core.security import get_current_user
from models.user import User

# Create a uploads directory if it doesn't exist
UPLOADS_DIR = Path(__file__).resolve().parent.parent / "uploads" / "resumes"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

# Max file size: 10 MB
MAX_FILE_SIZE = 10 * 1024 * 1024

# Allowed file extensions
ALLOWED_EXTENSIONS = {'.pdf', '.txt', '.md', '.doc', '.docx', '.xlsx', '.csv'}

router = APIRouter(prefix="/files", tags=["files"])


@router.post("/upload-resume")
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Upload a resume file. Returns a file ID that can be used to retrieve it later.
    """
    # Validate file extension
    file_ext = Path(file.filename).suffix.lower() if file.filename else ""
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # Read and validate file size
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large (max 10 MB)")

    try:
        # Generate a unique filename
        file_id = str(uuid.uuid4())
        safe_filename = Path(file.filename).stem
        file_path = UPLOADS_DIR / f"{file_id}_{safe_filename}{file_ext}"

        # Save file
        with open(file_path, "wb") as f:
            f.write(contents)

        return {
            "file_id": file_id,
            "filename": file.filename,
            "size": len(contents),
            "url": f"/files/download-resume/{file_id}",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")


@router.get("/download-resume/{file_id}")
async def download_resume(
    file_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Download a resume file by ID. User can only download their own files.
    """
    # Find the file (simple glob search for the file_id prefix)
    matching_files = list(UPLOADS_DIR.glob(f"{file_id}_*"))

    if not matching_files:
        raise HTTPException(status_code=404, detail="File not found")

    file_path = matching_files[0]

    # Verify the file exists and is readable
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")

    # Determine media type based on file extension
    file_ext = file_path.suffix.lower()
    media_type_map = {
        '.pdf': 'application/pdf',
        '.txt': 'text/plain',
        '.md': 'text/markdown',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.csv': 'text/csv',
    }
    media_type = media_type_map.get(file_ext, 'application/octet-stream')

    return FileResponse(
        path=file_path,
        filename=file_path.name.split("_", 1)[1],  # Remove the UUID prefix for the download name
        media_type=media_type
    )
