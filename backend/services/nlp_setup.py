"""
Central NLP model loader — all models loaded once at startup.
Sentence Transformers are optional; falls back to TF-IDF if torch is unavailable.
"""

# ── NLTK ──────────────────────────────────────────────────────────────────────
import nltk
for corpus in ["stopwords", "punkt", "punkt_tab", "wordnet", "averaged_perceptron_tagger"]:
    try:
        nltk.download(corpus, quiet=True)
    except Exception:
        pass

from nltk.corpus import stopwords as _sw
from nltk.stem import WordNetLemmatizer
from nltk.tokenize import word_tokenize

STOPWORDS = set(_sw.words("english"))
LEMMATIZER = WordNetLemmatizer()

# ── spaCy ─────────────────────────────────────────────────────────────────────
import spacy, subprocess, sys

def _load_spacy():
    try:
        return spacy.load("en_core_web_sm")
    except OSError:
        print("[nlp_setup] Downloading spaCy model en_core_web_sm …")
        subprocess.run([sys.executable, "-m", "spacy", "download", "en_core_web_sm"], check=True)
        return spacy.load("en_core_web_sm")

NLP = _load_spacy()
print("[nlp_setup] spaCy model loaded:", NLP.meta["name"])

# ── Sentence Transformers (optional — requires torch) ─────────────────────────
SENTENCE_MODEL = None
SEMANTIC_AVAILABLE = False

try:
    # Monkey-patch for torch 2.1.x compatibility with sentence-transformers
    import torch.utils._pytree as _pytree
    if not hasattr(_pytree, "register_pytree_node"):
        _pytree.register_pytree_node = _pytree._register_pytree_node

    from sentence_transformers import SentenceTransformer
    print("[nlp_setup] Loading Sentence Transformer model (first run downloads ~80MB) …")
    SENTENCE_MODEL = SentenceTransformer("all-MiniLM-L6-v2")
    SEMANTIC_AVAILABLE = True
    print("[nlp_setup] Sentence Transformer loaded OK.")
except Exception as e:
    print(f"[nlp_setup] Sentence Transformers unavailable ({e}). Using TF-IDF fallback for scoring.")

# ── Skill vocabulary ──────────────────────────────────────────────────────────
TECH_SKILLS = [
    "python","java","javascript","typescript","c++","c#","go","rust","ruby","php","kotlin","swift",
    "react","react.js","angular","vue","html","css","tailwind","bootstrap","next.js","node.js","node",
    "express","fastapi","django","flask","spring","graphql","rest","sql","postgresql","mysql",
    "mongodb","redis","cassandra","elasticsearch","pandas","numpy","scipy","tensorflow","keras",
    "pytorch","scikit-learn","sklearn","xgboost","machine learning","deep learning","nlp",
    "computer vision","aws","azure","gcp","docker","kubernetes","terraform","jenkins","linux",
    "bash","git","agile","scrum","spark","kafka","airflow","snowflake","bigquery",
    "communication","leadership","teamwork","problem solving","time management","adaptability",
]

def preprocess(text: str) -> str:
    """Lowercase, tokenize, remove stopwords, lemmatize."""
    tokens = word_tokenize(text.lower())
    cleaned = [LEMMATIZER.lemmatize(t) for t in tokens if t.isalpha() and t not in STOPWORDS]
    return " ".join(cleaned)
