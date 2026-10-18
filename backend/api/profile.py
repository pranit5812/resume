import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from core.security import get_current_user
from core.database import get_db, query_one, execute
from services.career_advisor import generate_career_suggestions

router = APIRouter()


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = ""
    education: Optional[str] = ""
    experience_years: Optional[int] = 0
    skills: Optional[List[str]] = []
    hobbies: Optional[str] = ""
    passions: Optional[str] = ""
    career_goals: Optional[str] = ""


@router.get("")
async def get_profile(
    user_email: str = Depends(get_current_user),
    db=Depends(get_db),
):
    try:
        row = await query_one(
            "SELECT * FROM profiles WHERE user_email = %s",
            (user_email,)
        )
        if not row:
            # Return empty defaults
            return {
                "user_email": user_email,
                "full_name": "",
                "education": "",
                "experience_years": 0,
                "skills": [],
                "hobbies": "",
                "passions": "",
                "career_goals": "",
                "suggested_career_paths": [],
            }

        # Parse JSON fields
        try:
            skills = json.loads(row["skills"]) if row["skills"] else []
        except Exception:
            skills = []

        try:
            suggestions = json.loads(row["suggested_career_paths"]) if row["suggested_career_paths"] else []
        except Exception:
            suggestions = []

        return {
            "user_email": row["user_email"],
            "full_name": row["full_name"] or "",
            "education": row["education"] or "",
            "experience_years": row["experience_years"] or 0,
            "skills": skills,
            "hobbies": row["hobbies"] or "",
            "passions": row["passions"] or "",
            "career_goals": row["career_goals"] or "",
            "suggested_career_paths": suggestions,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("")
async def save_profile(
    data: ProfileUpdate,
    user_email: str = Depends(get_current_user),
    db=Depends(get_db),
):
    try:
        # Check if profile already exists
        existing = await query_one(
            "SELECT id FROM profiles WHERE user_email = %s",
            (user_email,)
        )

        profile_dict = {
            "full_name": data.full_name,
            "education": data.education,
            "experience_years": data.experience_years,
            "skills": data.skills,
            "hobbies": data.hobbies,
            "passions": data.passions,
            "career_goals": data.career_goals,
        }

        # Generate AI recommendations
        suggestions = generate_career_suggestions(profile_dict)
        now_str = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
        skills_json = json.dumps(data.skills)
        suggestions_json = json.dumps(suggestions)

        if existing:
            await execute(
                """
                UPDATE profiles 
                SET full_name = %s, education = %s, experience_years = %s, 
                    skills = %s, hobbies = %s, passions = %s, career_goals = %s, 
                    suggested_career_paths = %s, updated_at = %s
                WHERE user_email = %s
                """,
                (
                    data.full_name,
                    data.education,
                    data.experience_years,
                    skills_json,
                    data.hobbies,
                    data.passions,
                    data.career_goals,
                    suggestions_json,
                    now_str,
                    user_email,
                )
            )
        else:
            await execute(
                """
                INSERT INTO profiles 
                (user_email, full_name, education, experience_years, skills, hobbies, passions, career_goals, suggested_career_paths, updated_at) 
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    user_email,
                    data.full_name,
                    data.education,
                    data.experience_years,
                    skills_json,
                    data.hobbies,
                    data.passions,
                    data.career_goals,
                    suggestions_json,
                    now_str,
                )
            )

        return {
            "message": "Profile updated successfully",
            "profile": {
                "user_email": user_email,
                "full_name": data.full_name,
                "education": data.education,
                "experience_years": data.experience_years,
                "skills": data.skills,
                "hobbies": data.hobbies,
                "passions": data.passions,
                "career_goals": data.career_goals,
                "suggested_career_paths": suggestions,
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
