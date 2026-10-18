"""
ATS (Applicant Tracking System) Scorer.

Scoring method:
  - 60%  Semantic similarity  (Sentence Transformers cosine similarity)
  - 40%  TF-IDF keyword match (Scikit-learn)

Skill extraction uses NLTK lemmatization + spaCy entity matching.
"""
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity as sk_cosine


# ── Text cleaning ─────────────────────────────────────────────────────────────
def clean_text(text: str) -> str:
    try:
        from services.nlp_setup import preprocess
        return preprocess(text)
    except ImportError:
        text = text.lower()
        text = re.sub(r"[^a-z0-9\s]", " ", text)
        return re.sub(r"\s+", " ", text).strip()


# ── TF-IDF score ──────────────────────────────────────────────────────────────
def _tfidf_score(resume_clean: str, jd_clean: str) -> float:
    vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
    try:
        matrix = vectorizer.fit_transform([resume_clean, jd_clean])
        return float(sk_cosine(matrix[0:1], matrix[1:2])[0][0]) * 100
    except ValueError:
        return 0.0


# ── Semantic score ────────────────────────────────────────────────────────────
def _semantic_score(resume_text: str, jd_text: str) -> float:
    try:
        from services.nlp_setup import SENTENCE_MODEL, SEMANTIC_AVAILABLE
        if not SEMANTIC_AVAILABLE or SENTENCE_MODEL is None:
            return _tfidf_score(resume_text[:512], jd_text[:512])
        import numpy as np
        embeddings = SENTENCE_MODEL.encode([resume_text[:1024], jd_text[:1024]])
        sim = np.dot(embeddings[0], embeddings[1]) / (
            np.linalg.norm(embeddings[0]) * np.linalg.norm(embeddings[1]) + 1e-8
        )
        return float(sim) * 100
    except Exception:
        return 0.0


# ── Keyword extraction via spaCy ──────────────────────────────────────────────
def _extract_keywords(text: str, top_n: int = 20) -> set:
    """Extract meaningful technical keywords from text using TF-IDF."""
    try:
        from services.nlp_setup import NLP, TECH_SKILLS
        text_lower = text.lower()
        # Multi-word skills first
        found = set()
        for skill in TECH_SKILLS:
            if skill.lower() in text_lower:
                found.add(skill.lower())
        # spaCy noun chunks
        doc = NLP(text[:3000])
        for chunk in doc.noun_chunks:
            token = chunk.root.lemma_.lower()
            if len(token) > 2:
                found.add(token)
        return found
    except Exception:
        # Fallback: simple tokenization
        words = re.findall(r"\b[a-z]{3,}\b", text.lower())
        return set(words[:top_n])


# ── Main ATS function ─────────────────────────────────────────────────────────
def calculate_ats_score(resume_text: str, job_description: str) -> dict:
    if not resume_text or not job_description:
        return {"score": 0.0, "matched_keywords": [], "missing_keywords": []}

    resume_clean = clean_text(resume_text)
    jd_clean = clean_text(job_description)

    # Compute both scores
    tfidf = _tfidf_score(resume_clean, jd_clean)
    semantic = _semantic_score(resume_text, job_description)

    # Weighted blend: 60% semantic, 40% TF-IDF
    final_score = (semantic * 0.6) + (tfidf * 0.4)

    # Keyword analysis
    jd_keywords = _extract_keywords(job_description, top_n=30)
    resume_keywords = _extract_keywords(resume_text, top_n=50)

    matched = sorted(jd_keywords & resume_keywords)
    missing = sorted(jd_keywords - resume_keywords)

    if final_score >= 80:
        strength = "Excellent"
        suggestion = "Your resume is highly optimized for this role. Minor tweaks to specific missing keywords can make it perfect."
    elif final_score >= 60:
        strength = "Strong"
        suggestion = "Good match. Consider adding more context around the missing skills to improve your score further."
    elif final_score >= 40:
        strength = "Average"
        suggestion = "Your resume matches some requirements, but lacks several key skills. Strongly advise tailoring your experience sections to highlight the missing keywords."
    else:
        strength = "Weak"
        suggestion = "Your resume does not strongly align with this job description. Consider a major rewrite to focus on the required skills and experiences."

    keyword_opt = []
    if missing:
        keyword_opt.append(f"Consider incorporating these high-impact keywords: {', '.join(missing[:5])}.")
    if len(resume_keywords) < 10:
        keyword_opt.append("Your resume seems light on technical keywords overall. Ensure you list all relevant tools and frameworks you have used.")

    insights = {
        "strength": strength,
        "improvement_suggestions": suggestion,
        "keyword_optimization": " ".join(keyword_opt)
    }

    return {
        "score": round(final_score, 1),
        "semantic_score": round(semantic, 1),
        "tfidf_score": round(tfidf, 1),
        "matched_keywords": matched[:15],
        "missing_keywords": missing[:15],
        "insights": insights,
    }
