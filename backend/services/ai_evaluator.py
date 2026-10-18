"""
Interview question generation + Sentence Transformer-based answer evaluation.
"""
import re
import random

# ── Gold-standard answer templates per question ───────────────────────────────
ANSWER_TEMPLATES = {
    "Explain the virtual DOM in React and how it improves performance.":
        "The virtual DOM is an in-memory representation of the real DOM. React uses it to batch updates, diff changes, and apply only the minimal set of real DOM mutations. This avoids expensive reflows and repaints, improving rendering performance significantly.",
    "What are React Hooks and how do they replace class lifecycle methods?":
        "React Hooks like useState, useEffect, and useContext allow functional components to manage state and side effects. useEffect replaces componentDidMount, componentDidUpdate, and componentWillUnmount. They simplify code and enable better logic reuse through custom hooks.",
    "How do you handle state management in large React applications?":
        "For large apps I use Redux or Zustand for global state, and React Context for theming or auth. I colocate component state where possible and lift state only when needed. I also use React Query or SWR for server state management.",
    "Explain CSS Grid vs Flexbox and when to use each.":
        "Flexbox is one-dimensional and ideal for laying out items in a row or column. CSS Grid is two-dimensional and suits complex layouts with rows and columns. Use Flexbox for navigation bars and card rows, Grid for full page layouts and dashboards.",
    "How do you optimize a React app for performance and SEO?":
        "Use React.memo, useMemo, useCallback to prevent unnecessary renders. Lazy load components with React.lazy and Suspense. For SEO use Next.js for server-side rendering, add meta tags, and use semantic HTML.",
    "Explain the difference between Server-Side Rendering (SSR) and Client-Side Rendering (CSR).":
        "CSR renders pages in the browser using JavaScript, which is fast after initial load but poor for SEO. SSR renders HTML on the server per request, improving SEO and initial load time. Next.js supports both SSR and static generation.",
    "What is the Context API in React, and when should you avoid using it?":
        "Context API provides a way to pass data through the component tree without prop drilling. Avoid it for high-frequency updates like animation state since it causes all consumers to re-render. Use it for auth, theme, or locale data.",
    "How does Event Delegation work in JavaScript?":
        "Event delegation attaches a single event listener to a parent element instead of multiple listeners on children. When an event bubbles up, you check the target element. This is memory efficient and works for dynamically added elements.",
    "Describe the concept of closures in JavaScript and provide a practical use case.":
        "A closure is a function that retains access to its outer scope even after the outer function returns. A practical use case is creating private variables in a module pattern or memoizing expensive function results.",
    "Explain the concept of 'hoisting' in JavaScript.":
        "Hoisting moves variable and function declarations to the top of their scope before execution. var declarations are hoisted and initialized as undefined. let and const are hoisted but not initialized creating a temporal dead zone. Function declarations are fully hoisted.",
    "How do you ensure web accessibility (a11y) in your frontend applications?":
        "Use semantic HTML elements like button nav header main. Add ARIA labels and roles where needed. Ensure keyboard navigability and sufficient color contrast. Test with screen readers like NVDA and use automated tools like axe.",
    "Explain RESTful API design principles.":
        "REST APIs are stateless and use standard HTTP methods GET POST PUT DELETE. Resources are identified by URIs. Responses use appropriate status codes. Use versioning in the URL, consistent JSON responses, and pagination for large datasets.",
    "How do you prevent SQL injection and other common security vulnerabilities?":
        "Use parameterized queries or prepared statements instead of string concatenation. Validate and sanitize all user inputs. Use ORM frameworks that handle escaping. Implement HTTPS, CORS policies, rate limiting, and JWT authentication.",
    "Describe the difference between microservices and a monolithic architecture.":
        "A monolith packages all functionality into one deployable unit which is simple but hard to scale. Microservices split the app into independent services communicating via APIs. Microservices allow independent scaling and deployment but add complexity in orchestration.",
    "Explain the difference between supervised and unsupervised learning.":
        "Supervised learning trains on labeled data to predict outputs. Examples are linear regression and neural networks. Unsupervised learning finds patterns in unlabeled data. Examples are k-means clustering and PCA for dimensionality reduction.",
    "What is the bias-variance tradeoff?":
        "High bias means the model underfits and is too simple. High variance means the model overfits and is too complex. The tradeoff is finding the right model complexity that minimizes total error. Regularization and cross-validation help manage this.",
    "Explain how Random Forest works.":
        "Random Forest builds multiple decision trees on random subsets of data and features. For classification it takes a majority vote across trees. For regression it averages predictions. This ensemble approach reduces overfitting compared to single decision trees.",
    "Explain the architecture of a Transformer model.":
        "A Transformer uses self-attention mechanisms to process sequences in parallel. It has an encoder and decoder with multi-head attention layers and feed-forward networks. Positional encodings add sequence order information. This architecture powers BERT and GPT models.",
    "What is self-attention, and why is it crucial for modern NLP?":
        "Self-attention allows each token to attend to all other tokens in the sequence. It computes query key and value vectors to weight the importance of each token. This captures long-range dependencies better than RNNs and enables parallel processing.",
    "Explain Retrieval-Augmented Generation (RAG) and its benefits.":
        "RAG combines a retrieval system with a generative language model. The retriever fetches relevant documents from a knowledge base which are passed as context to the generator. This improves factual accuracy and reduces hallucinations without full fine-tuning.",
    "Tell me about a time you had a conflict with a team member and how you resolved it.":
        "I experienced a conflict about code architecture with a colleague. I scheduled a one-on-one meeting, listened to their perspective, and we agreed to prototype both approaches. We evaluated results objectively and chose the better solution collaboratively.",
    "Where do you see yourself in 5 years?":
        "In 5 years I see myself as a senior engineer or tech lead contributing to architectural decisions. I want to deepen expertise in distributed systems and mentor junior developers. I aim to grow within a company where I can have meaningful technical impact.",
    "What is your greatest strength and weakness?":
        "My greatest strength is systematic problem solving. I break complex problems into smaller parts and approach them methodically. My weakness is that I sometimes spend too long seeking a perfect solution. I have been working on time-boxing tasks to balance quality and speed.",
}

GENERIC_GOOD_ANSWER = (
    "This is a well-structured technical response demonstrating understanding of the concept, "
    "practical application, and clear communication with relevant examples and terminology."
)

PROFANITY = {"fuck","shit","bitch","asshole","cunt","bastard","slut","whore"}

# ── Question bank ─────────────────────────────────────────────────────────────
QUESTIONS_DB = {
    "Frontend Developer": list(ANSWER_TEMPLATES.keys())[:12],
    "Backend Developer": [
        "Explain RESTful API design principles.",
        "How do you prevent SQL injection and other common security vulnerabilities?",
        "Describe the difference between microservices and a monolithic architecture.",
        "How does database indexing work, and when should you use it?",
        "Explain how async/await works in Python (FastAPI/Node.js).",
        "What are the differences between SQL and NoSQL databases?",
        "How do you handle distributed transactions in a microservices architecture?",
        "Explain the concept of dependency injection.",
        "What are JWTs and how do they work for authentication?",
        "How do you implement rate limiting in an API?",
        "Describe the differences between an API Gateway and a Load Balancer.",
        "What is caching, and what strategies (e.g., Redis) do you use to implement it?",
    ],
    "Data Scientist": [
        "Explain the difference between supervised and unsupervised learning.",
        "How do you handle missing or imbalanced data in a dataset?",
        "What is the bias-variance tradeoff?",
        "Explain how Random Forest works.",
        "How do you evaluate a machine learning model's performance?",
        "What is cross-validation, and why is it important?",
        "Explain the difference between L1 (Lasso) and L2 (Ridge) regularization.",
        "How does Principal Component Analysis (PCA) work?",
        "What is the difference between boosting and bagging?",
        "Describe the k-means clustering algorithm.",
        "What are confusion matrices, precision, and recall?",
        "How do you prevent overfitting in deep learning networks?",
    ],
    "AI Engineer": [
        "Explain the architecture of a Transformer model.",
        "What is transfer learning and how do you use it?",
        "How do you optimize a deep learning model for inference speed?",
        "Explain vanishing gradients and how to mitigate them.",
        "Describe how you would approach fine-tuning an LLM.",
        "What is self-attention, and why is it crucial for modern NLP?",
        "How does LoRA (Low-Rank Adaptation) work in fine-tuning?",
        "Explain the differences between GANs and Diffusion Models.",
        "What is vector quantization, and where is it used in AI?",
        "How do you evaluate generative AI models?",
        "Explain Retrieval-Augmented Generation (RAG) and its benefits.",
        "What are the challenges of deploying deep learning models on edge devices?",
    ],
    "HR": [
        "Tell me about a time you had a conflict with a team member and how you resolved it.",
        "Where do you see yourself in 5 years?",
        "Why do you want to work at this company?",
        "What is your greatest strength and weakness?",
        "Describe a challenging project you worked on and how you handled it.",
        "Tell me about a time you failed and what you learned from it.",
        "How do you prioritize your tasks when you have multiple deadlines?",
        "Describe a situation where you had to adapt to a significant change at work.",
        "How do you stay motivated during repetitive or mundane tasks?",
        "Tell me about a time you went above and beyond for a project.",
        "How do you handle constructive criticism?",
        "Describe your ideal work environment and team culture.",
    ],
}


def generate_interview_questions(role: str) -> list[dict]:
    pool = QUESTIONS_DB.get(role, QUESTIONS_DB["Frontend Developer"])
    selected = random.sample(pool, min(3, len(pool)))
    return [{"id": i, "question": q} for i, q in enumerate(selected)]


# ── Gibberish detection ───────────────────────────────────────────────────────
def _is_gibberish(text: str) -> bool:
    if not re.search(r"[aeiouAEIOU]", text):
        return True
    words = text.split()
    if not words:
        return True
    if sum(len(w) for w in words) / len(words) > 15:
        return True
    return False


# ── Semantic evaluation using Sentence Transformers ───────────────────────────
def _semantic_similarity(text_a: str, text_b: str) -> float:
    try:
        from services.nlp_setup import SENTENCE_MODEL, SEMANTIC_AVAILABLE
        if not SEMANTIC_AVAILABLE or SENTENCE_MODEL is None:
            return _tfidf_fallback(text_a, text_b)
        import numpy as np
        embs = SENTENCE_MODEL.encode([text_a[:512], text_b[:512]])
        sim = np.dot(embs[0], embs[1]) / (
            np.linalg.norm(embs[0]) * np.linalg.norm(embs[1]) + 1e-8
        )
        return float(sim)
    except Exception:
        return _tfidf_fallback(text_a, text_b)


def _tfidf_fallback(text_a: str, text_b: str) -> float:
    """Fallback: TF-IDF cosine similarity when torch is unavailable."""
    try:
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.metrics.pairwise import cosine_similarity
        vec = TfidfVectorizer()
        mat = vec.fit_transform([text_a, text_b])
        return float(cosine_similarity(mat[0:1], mat[1:2])[0][0])
    except Exception:
        return 0.0


def evaluate_answer(question: str, answer: str) -> dict:
    answer_lower = answer.lower()

    # 1. Profanity
    for bw in PROFANITY:
        if re.search(rf"\b{bw}\b", answer_lower):
            return {"score": 0, "confidence": 0, "technical": 0, "communication": 0,
                    "feedback": "Inappropriate content detected. Please keep answers professional."}

    # 2. Length
    words = answer.split()
    if len(words) < 5:
        return {"score": 10, "confidence": 5, "technical": 0, "communication": 5,
                "feedback": "Answer is too short. Please provide a detailed explanation."}

    # 3. Gibberish
    if _is_gibberish(answer):
        return {"score": 0, "confidence": 0, "technical": 0, "communication": 0,
                "feedback": "Answer appears to be random text. Please provide a meaningful response."}

    # 4. Semantic similarity vs gold-standard answer
    gold = ANSWER_TEMPLATES.get(question, GENERIC_GOOD_ANSWER)
    sim = _semantic_similarity(answer, gold)  # 0.0 – 1.0

    # Scale: sim < 0.20 → poor, 0.20–0.45 → average, 0.45–0.65 → good, >0.65 → excellent
    technical  = round(min(100, sim * 150))          # technical depth
    confidence = round(min(100, sim * 130 + min(20, len(words) * 0.4)))  # confidence
    communication = round(min(100, 30 + min(40, len(words) * 1.2) + sim * 30))  # clarity

    avg_score = round((technical + confidence + communication) / 3)

    if avg_score >= 75:
        feedback = "Excellent answer! You demonstrated strong technical understanding with relevant depth."
    elif avg_score >= 50:
        feedback = "Good attempt, but add more technical depth and specific examples to improve your score."
    elif avg_score >= 25:
        feedback = "Partial answer detected. Make sure to address the core concept directly and use proper terminology."
    else:
        feedback = "Answer is off-topic or lacks technical relevance. Please study the topic and try again."

    return {
        "score": avg_score,
        "confidence": confidence,
        "technical": technical,
        "communication": communication,
        "feedback": feedback,
    }
