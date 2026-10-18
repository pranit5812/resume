import json
from fastapi import APIRouter, Depends, HTTPException
from core.database import get_db, query_all
from core.security import get_current_user
from datetime import datetime

router = APIRouter()


def safe_json_load(val):
    if not val:
        return {}
    if isinstance(val, dict):
        return val
    try:
        return json.loads(val)
    except Exception:
        return {}


def safe_format_date(val):
    if not val:
        return datetime.utcnow().strftime("%Y-%m-%d")
    if isinstance(val, datetime):
        return val.strftime("%Y-%m-%d")
    return str(val)[:10]


@router.get("/summary")
async def get_analytics_summary(user_email: str = Depends(get_current_user), db=Depends(get_db)):
    try:
        ats_reports = await query_all(
            "SELECT * FROM ats_reports WHERE user_email = %s ORDER BY created_at DESC LIMIT 10",
            (user_email,),
        )
        if not ats_reports:
            ats_reports = []

        interviews = await query_all(
            "SELECT * FROM interview_results WHERE user_email = %s AND status = %s ORDER BY created_at DESC LIMIT 10",
            (user_email, "completed"),
        )
        if not interviews:
            interviews = []

        valid_ats = [float(r.get("similarity_score") or 0) for r in ats_reports if r.get("similarity_score") is not None]
        avg_ats = sum(valid_ats) / len(valid_ats) if valid_ats else 0

        valid_int_scores = [float(safe_json_load(i.get("results")).get("overall_score") or 0) for i in interviews if i.get("results")]
        avg_int = sum(valid_int_scores) / len(valid_int_scores) if valid_int_scores else 0

        recent_ats_list = [
            {
                "date": safe_format_date(r.get("created_at")),
                "score": round(float(r.get("similarity_score") or 0), 1),
                "role": "Software Engineer"
            }
            for r in ats_reports[:5]
        ]

        recent_int_list = [
            {
                "date": safe_format_date(i.get("created_at")),
                "role": str(i.get("role") or "Software Engineer"),
                "score": round(float(safe_json_load(i.get("results")).get("overall_score") or 0), 1),
            }
            for i in interviews[:5]
        ]

        return {
            "avg_ats_score": round(avg_ats, 1),
            "total_resumes_analyzed": len(ats_reports),
            "avg_interview_score": round(avg_int, 1),
            "total_interviews": len(interviews),
            "recent_ats": recent_ats_list,
            "recent_interviews": recent_int_list,
        }
    except Exception as e:
        print(f"Error in analytics summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))
