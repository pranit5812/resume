import json
from fastapi import APIRouter, Depends
from core.database import get_db, query_one
from core.security import get_current_user
from pydantic import BaseModel
from services.career_advisor import generate_career_suggestions, generate_course_recommendations

router = APIRouter()


ROLE_SKILLS = {
    "Frontend Developer": ["react", "javascript", "typescript", "css", "html", "redux", "tailwind", "next.js", "webpack", "testing"],
    "Backend Developer": ["python", "java", "sql", "docker", "aws", "fastapi", "linux", "mongodb", "redis", "kubernetes"],
    "Data Scientist": ["python", "sql", "machine learning", "pandas", "numpy", "statistics", "tableau", "tensorflow", "pytorch", "scikit-learn"],
    "AI Engineer": ["python", "pytorch", "tensorflow", "transformers", "nlp", "computer vision", "docker", "kubernetes", "mlops", "cuda"],
    "HR": ["communication", "leadership", "teamwork", "problem solving", "time management", "adaptability", "recruitment", "onboarding"],
}

ROADMAP_RESOURCES = {
    "react": "Learn React – https://react.dev",
    "javascript": "JavaScript – https://javascript.info",
    "typescript": "TypeScript Handbook – https://www.typescriptlang.org/docs",
    "python": "Python Tutorial – https://docs.python.org/3/tutorial",
    "sql": "SQL Tutorial – https://www.w3schools.com/sql",
    "docker": "Docker Getting Started – https://docs.docker.com/get-started",
    "machine learning": "ML Course – https://www.coursera.org/learn/machine-learning",
    "pandas": "Pandas Docs – https://pandas.pydata.org/docs",
    "pytorch": "PyTorch Tutorials – https://pytorch.org/tutorials",
    "aws": "AWS Training – https://aws.amazon.com/training",
    "kubernetes": "Kubernetes Docs – https://kubernetes.io/docs",
    "transformers": "HuggingFace Course – https://huggingface.co/course",
}


class SkillGapRequest(BaseModel):
    current_skills: list[str]
    target_role: str


def _tfidf_skill_score(user_skills: list[str], required_skills: list[str]) -> float:
    """Use TF-IDF cosine similarity to score skill overlap."""
    try:
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.metrics.pairwise import cosine_similarity
        user_text = " ".join(user_skills).lower()
        req_text = " ".join(required_skills).lower()
        if not user_text.strip() or not req_text.strip():
            return 0.0
        vec = TfidfVectorizer()
        matrix = vec.fit_transform([user_text, req_text])
        return float(cosine_similarity(matrix[0:1], matrix[1:2])[0][0]) * 100
    except Exception:
        return 0.0


@router.post("/skill-gap")
async def analyze_skill_gap(
    request: SkillGapRequest,
    user_email: str = Depends(get_current_user),
    db=Depends(get_db),
):
    required = ROLE_SKILLS.get(request.target_role, ROLE_SKILLS["Frontend Developer"])
    current_lower = [s.lower().strip() for s in request.current_skills]
    required_lower = [r.lower() for r in required]

    matched = [r for r in required if r.lower() in current_lower]
    missing = [r for r in required if r.lower() not in current_lower]

    tfidf_score = _tfidf_skill_score(current_lower, required_lower)

    roadmap = []
    for skill in missing:
        resource = ROADMAP_RESOURCES.get(skill.lower())
        roadmap.append(resource if resource else f"Study {skill} — search for tutorials on YouTube or Coursera")

    return {
        "target_role": request.target_role,
        "skill_match_score": round(tfidf_score, 1),
        "matched_skills": matched,
        "missing_skills": missing,
        "roadmap": roadmap,
    }


@router.get("/career-paths")
async def get_career_paths(
    user_email: str = Depends(get_current_user),
    db=Depends(get_db),
):
    try:
        row = await query_one("SELECT * FROM profiles WHERE user_email = %s", (user_email,))
        profile_dict = {}
        if row:
            try:
                skills = json.loads(row["skills"]) if row["skills"] else []
            except Exception:
                skills = []
            profile_dict = {
                "skills": skills,
                "hobbies": row["hobbies"] or "",
                "passions": row["passions"] or "",
                "career_goals": row["career_goals"] or "",
            }
    except Exception:
        profile_dict = {}

    suggestions = generate_career_suggestions(profile_dict, top_k=6)
    courses = generate_course_recommendations(profile_data={"education": profile_dict.get("education", ""), "skills": profile_dict.get("skills", []), "hobbies": profile_dict.get("hobbies", ""), "passions": profile_dict.get("passions", ""), "career_goals": profile_dict.get("career_goals", "")} if profile_dict else {})

    # Collect certifications across suggested roles
    cert_set = set()
    for s in suggestions:
        for c in s.get("certifications", []):
            cert_set.add(c)
            
    # Guarantee a rich fallback list of certifications if needed
    fallback_certs = [
        "AWS Certified Solutions Architect",
        "Meta Front-End Developer Professional Certificate",
        "Google Professional Machine Learning Engineer",
        "Certified Kubernetes Administrator (CKA)",
        "CompTIA Security+",
        "Google UX Design Professional Certificate",
        "Certified Scrum Product Owner (CSPO)",
        "IBM Data Science Professional Certificate",
        "HashiCorp Certified: Terraform Associate",
        "Microsoft Certified: Azure Fundamentals",
        "Google Data Analytics Professional Certificate",
        "OpenJS Node.js Application Developer",
    ]
    for fc in fallback_certs:
        cert_set.add(fc)

    all_certs = sorted(list(cert_set))[:15]

    return {
        "recommended_roles": suggestions,
        "suggested_certifications": all_certs,
        "suggested_courses": courses,
    }
