import json
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from core.database import get_db, query_one, execute
from core.security import get_current_user
from services.ats_matcher import calculate_ats_score
from datetime import datetime

router = APIRouter()


class ATSRequest(BaseModel):
    resume_id: str
    job_description: str


@router.post("/analyze")
async def analyze_ats(
    request: ATSRequest,
    user_email: str = Depends(get_current_user),
    db=Depends(get_db),
):
    try:
        resume_id = int(request.resume_id)
        resume = await query_one("SELECT * FROM resumes WHERE id = %s", (resume_id,))
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")

        analysis_result = calculate_ats_score(resume["parsed_text"], request.job_description)

        report_id = await execute(
            "INSERT INTO ats_reports (user_email, resume_id, job_description, similarity_score, matched_keywords, missing_keywords, insights, created_at) VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
            (
                user_email,
                resume_id,
                request.job_description,
                analysis_result["score"],
                json.dumps(analysis_result["matched_keywords"]),
                json.dumps(analysis_result["missing_keywords"]),
                json.dumps(analysis_result.get("insights", {})),
                datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S'),
            ),
        )

        return {
            "message": "ATS analysis complete",
            "report_id": str(report_id),
            "analysis": analysis_result,
        }
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid resume ID")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history")
async def get_ats_history(
    user_email: str = Depends(get_current_user),
    db=Depends(get_db),
):
    try:
        from core.database import query_all
        # Fetch reports along with resume filename if possible, using JOIN or subquery
        reports = await query_all(
            """
            SELECT a.id, a.resume_id, a.job_description, a.similarity_score, 
                   a.matched_keywords, a.missing_keywords, a.insights, a.created_at,
                   r.filename 
            FROM ats_reports a
            LEFT JOIN resumes r ON a.resume_id = r.id
            WHERE a.user_email = %s 
            ORDER BY a.created_at DESC
            """,
            (user_email,)
        )
        
        history = []
        for row in reports:
            # Parse JSON fields safely
            try:
                matched = json.loads(row["matched_keywords"]) if row["matched_keywords"] else []
            except Exception:
                matched = []
            try:
                missing = json.loads(row["missing_keywords"]) if row["missing_keywords"] else []
            except Exception:
                missing = []
            try:
                insights = json.loads(row["insights"]) if row["insights"] else {}
            except Exception:
                insights = {}

            history.append({
                "id": row["id"],
                "resume_id": row["resume_id"],
                "filename": row["filename"] or f"Resume #{row['resume_id']}",
                "job_description_snippet": row["job_description"][:100] + "..." if len(row["job_description"]) > 100 else row["job_description"],
                "score": row["similarity_score"],
                "matched_keywords": matched,
                "missing_keywords": missing,
                "insights": insights,
                "created_at": str(row["created_at"]),
            })

        return {"history": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

