"""
Resume text extraction + NLP-powered skill extraction.
Supports PDF (via pdfplumber) and DOCX (via python-docx).
"""
from io import BytesIO

# ── PDF extraction ────────────────────────────────────────────────────────────
def extract_text_from_pdf(file_bytes: bytes) -> str:
    try:
        import pdfplumber
        with pdfplumber.open(BytesIO(file_bytes)) as pdf:
            pages = []
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    pages.append(text)
            return "\n".join(pages)
    except Exception as e:
        raise Exception(f"Failed to extract text from PDF: {str(e)}")


# ── DOCX extraction ───────────────────────────────────────────────────────────
def extract_text_from_docx(file_bytes: bytes) -> str:
    try:
        from docx import Document
        doc = Document(BytesIO(file_bytes))
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        return "\n".join(paragraphs)
    except Exception as e:
        raise Exception(f"Failed to extract text from DOCX: {str(e)}")


# ── NLP-powered skill extraction ──────────────────────────────────────────────
def extract_skills_basic(text: str) -> list[str]:
    """
    Use spaCy + a curated skill vocabulary to extract skills from resume text.
    Falls back to keyword matching if spaCy is unavailable.
    """
    try:
        from services.nlp_setup import NLP, TECH_SKILLS

        text_lower = text.lower()
        found = set()

        # 1. Direct vocabulary match (handles multi-word skills like "machine learning")
        for skill in TECH_SKILLS:
            if skill.lower() in text_lower:
                found.add(skill.lower())

        # 2. spaCy NER: pick up ORG / PRODUCT entities that are tech-related
        doc = NLP(text[:5000])  # limit to first 5000 chars for speed
        for ent in doc.ents:
            if ent.label_ in ("ORG", "PRODUCT", "WORK_OF_ART"):
                candidate = ent.text.lower().strip()
                if len(candidate) > 1 and candidate in TECH_SKILLS:
                    found.add(candidate)

        # 3. spaCy noun chunks: pick up technical noun phrases
        for chunk in doc.noun_chunks:
            candidate = chunk.text.lower().strip()
            if candidate in TECH_SKILLS:
                found.add(candidate)

        return sorted(found) if found else _fallback_extract(text_lower)

    except ImportError:
        return _fallback_extract(text.lower())


def _fallback_extract(text_lower: str) -> list[str]:
    """Simple keyword matching if NLP models aren't loaded yet."""
    common_skills = [
        "python", "java", "javascript", "react", "node", "sql", "mongodb",
        "aws", "docker", "kubernetes", "machine learning", "data science",
        "fastapi", "django", "flask", "c++", "c#", "ruby", "go", "rust",
        "html", "css", "tailwind", "typescript", "git", "linux", "agile",
        "tensorflow", "pytorch", "pandas", "numpy",
    ]
    return [s for s in common_skills if s in text_lower]
