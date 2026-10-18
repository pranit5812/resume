import json
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from core.database import get_db, query_one, execute
from core.security import get_current_user
from services.ai_evaluator import generate_interview_questions, evaluate_answer
from datetime import datetime

router = APIRouter()


class RoleRequest(BaseModel):
    role: str


class AnswerSubmission(BaseModel):
    interview_id: str
    answers: list[dict]  # [{"question_id": 0, "answer": "..."}]


@router.post("/generate-questions")
async def generate_questions(request: RoleRequest, user_email: str = Depends(get_current_user), db=Depends(get_db)):
    questions = generate_interview_questions(request.role)

    interview_id = await execute(
        "INSERT INTO interview_results (user_email, role, questions, status, created_at) VALUES (%s, %s, %s, %s, %s) RETURNING id",
        (user_email, request.role, json.dumps(questions), "pending", datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')),
    )

    return {
        "interview_id": str(interview_id),
        "questions": questions,
    }


@router.post("/submit-answers")
async def submit_answers(submission: AnswerSubmission, user_email: str = Depends(get_current_user), db=Depends(get_db)):
    try:
        interview = await query_one(
            "SELECT * FROM interview_results WHERE id = %s", (int(submission.interview_id),)
        )
        if not interview:
            raise HTTPException(status_code=404, detail="Interview not found")
        if interview.get("user_email") != user_email:
            raise HTTPException(status_code=403, detail="Not authorized to submit answers for this interview")

        questions = json.loads(interview["questions"])
        evaluations = []
        total_score = 0
        total_conf = 0
        total_tech = 0
        total_comm = 0

        for ans in submission.answers:
            q_id = ans.get("question_id")
            answer_text = ans.get("answer", "")

            question_text = ""
            for q in questions:
                if q.get("id") == q_id:
                    question_text = q.get("question", "")
                    break

            eval_result = evaluate_answer(question_text, answer_text)
            evaluations.append({
                "question_id": q_id,
                "question": question_text,
                "answer": answer_text,
                "evaluation": eval_result,
            })

            total_score += eval_result.get("score", 0)
            total_conf += eval_result.get("confidence", 0)
            total_tech += eval_result.get("technical", 0)
            total_comm += eval_result.get("communication", 0)

        num_q = len(submission.answers)
        final_results = {
            "overall_score": round(total_score / num_q) if num_q > 0 else 0,
            "avg_confidence": round(total_conf / num_q) if num_q > 0 else 0,
            "avg_technical": round(total_tech / num_q) if num_q > 0 else 0,
            "avg_communication": round(total_comm / num_q) if num_q > 0 else 0,
            "detailed_feedback": evaluations,
        }

        await execute(
            "UPDATE interview_results SET status = %s, answers = %s, results = %s, completed_at = %s WHERE id = %s",
            (
                "completed",
                json.dumps(submission.answers),
                json.dumps(final_results),
                datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S'),
                int(submission.interview_id),
            ),
        )

        return final_results
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid interview ID")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
