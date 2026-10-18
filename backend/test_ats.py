import asyncio
from core.database import connect_to_db, query_one, execute
from api.ats import analyze_ats, ATSRequest
from fastapi import HTTPException

async def test_analyze():
    await connect_to_db()
    
    # Insert a dummy resume if none exists
    await execute("INSERT INTO resumes (user_email, filename, parsed_text, skills, uploaded_at) VALUES (%s, %s, %s, %s, NOW())", ("test@example.com", "test.pdf", "Python developer with FastAPI experience.", "[]"))
    
    # Get a valid resume ID
    resume = await query_one("SELECT id FROM resumes LIMIT 1")
    if not resume:
        print("No resume found")
        return
        
    print(f"Testing with resume ID: {resume['id']}")
    request = ATSRequest(resume_id=str(resume['id']), job_description="Looking for a Python Developer with FastAPI skills.")
    
    try:
        result = await analyze_ats(request=request)
        print("Success:", result)
    except HTTPException as e:
        print("HTTPException:", e.status_code, e.detail)
    except Exception as e:
        print("Exception:", str(e))

asyncio.run(test_analyze())
