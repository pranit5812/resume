import json
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from core.database import get_db, execute, query_all
from core.security import get_current_user
from services.text_extractor import extract_text_from_pdf, extract_skills_basic
from datetime import datetime

router = APIRouter()


@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    user_email: str = Depends(get_current_user),
    db=Depends(get_db),
):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    try:
        contents = await file.read()
        extracted_text = extract_text_from_pdf(contents)
        skills = extract_skills_basic(extracted_text)

        resume_id = await execute(
            "INSERT INTO resumes (user_email, filename, parsed_text, skills, uploaded_at) VALUES (%s, %s, %s, %s, %s) RETURNING id",
            (user_email, file.filename, extracted_text, json.dumps(skills), datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')),
        )

        return {
            "message": "Resume uploaded successfully",
            "resume_id": str(resume_id),
            "skills_extracted": skills,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/my-resumes")
async def get_my_resumes(user_email: str = Depends(get_current_user), db=Depends(get_db)):
    try:
        resumes = await query_all(
            "SELECT * FROM resumes WHERE user_email = %s ORDER BY uploaded_at DESC LIMIT 10",
            (user_email,),
        )
        for r in resumes:
            r["_id"] = str(r["id"])
            r["skills"] = json.loads(r["skills"])
        return resumes
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
