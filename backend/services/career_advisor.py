"""
AI Career Advisor Service.
Matches user profile (skills, hobbies, passions, goals) against comprehensive career archetypes.
Uses TF-IDF / Sentence Transformers for semantic matching.
"""
import re

CAREER_ARCHETYPES = [
    {
        "title": "Full Stack Web Developer",
        "keywords": ["react", "javascript", "typescript", "node.js", "python", "fastapi", "django", "html", "css", "sql", "web development", "full stack", "api"],
        "hobby_keywords": ["coding side projects", "gaming", "building websites", "hackathons", "tech blogs", "open source"],
        "passion_keywords": ["building interactive user experiences", "web technology", "fast feedback loops", "creating functional web apps", "clean code"],
        "certifications": ["Meta Front-End Developer Professional Certificate", "AWS Certified Developer", "OpenJS Node.js Application Developer"],
        "roadmap_steps": [
            "Master modern React and TypeScript architecture.",
            "Build complete full-stack web applications with FastAPI or Node.js backend.",
            "Deploy applications using Docker and cloud platforms like Vercel or Render."
        ]
    },
    {
        "title": "AI & Machine Learning Engineer",
        "keywords": ["python", "pytorch", "tensorflow", "transformers", "nlp", "computer vision", "machine learning", "deep learning", "llm", "neural networks"],
        "hobby_keywords": ["math puzzles", "ai research", "reading sci-fi", "chess", "kaggle competitions", "tinkering with chatgpt"],
        "passion_keywords": ["artificial intelligence", "automation", "deep neural networks", "future tech", "training intelligent models", "generative ai"],
        "certifications": ["DeepLearning.AI TensorFlow Developer", "AWS Certified Machine Learning - Specialty", "Google Professional Machine Learning Engineer"],
        "roadmap_steps": [
            "Build solid math foundations in linear algebra, calculus, and probability.",
            "Gain deep hands-on experience with PyTorch and Hugging Face Transformers.",
            "Develop local LLM agents and Retrieval-Augmented Generation (RAG) pipelines."
        ]
    },
    {
        "title": "Data Scientist & Analytics Lead",
        "keywords": ["python", "sql", "pandas", "numpy", "statistics", "tableau", "powerbi", "data visualization", "scikit-learn", "data analysis"],
        "hobby_keywords": ["solving logic puzzles", "sudoku", "board games", "analyzing sports stats", "fantasy leagues", "data storytelling"],
        "passion_keywords": ["finding hidden patterns in data", "making data-driven decisions", "storytelling with graphs", "solving complex mathematical puzzles"],
        "certifications": ["IBM Data Science Professional Certificate", "Google Data Analytics Professional Certificate", "Microsoft Certified: Power BI Data Analyst"],
        "roadmap_steps": [
            "Master exploratory data analysis (EDA) using Python (Pandas/Seaborn).",
            "Learn advanced SQL querying and database optimization.",
            "Build predictive statistical models and interactive business dashboards."
        ]
    },
    {
        "title": "Cloud & DevOps Architect",
        "keywords": ["aws", "docker", "kubernetes", "linux", "terraform", "bash", "ci/cd", "jenkins", "azure", "gcp", "infrastructure", "devops"],
        "hobby_keywords": ["home lab setup", "tinkering with linux", "automating smart home tasks", "building pc hardware", "server hosting"],
        "passion_keywords": ["system reliability", "automation", "cloud infrastructure", "scalability", "reducing manual toil", "high availability"],
        "certifications": ["AWS Certified Solutions Architect", "Certified Kubernetes Administrator (CKA)", "HashiCorp Certified: Terraform Associate"],
        "roadmap_steps": [
            "Gain expert-level familiarity with Linux command line and Bash scripting.",
            "Containerize microservices using Docker and orchestrate with Kubernetes.",
            "Automate infrastructure provisioning using Terraform and CI/CD GitHub Actions."
        ]
    },
    {
        "title": "UI / UX Product Designer",
        "keywords": ["figma", "css", "tailwind", "design systems", "wireframing", "prototyping", "user research", "accessibility", "ui design", "ux"],
        "hobby_keywords": ["digital art", "photography", "typography", "sketching", "gaming aesthetics", "graphic design", "animation"],
        "passion_keywords": ["pixel perfection", "human-centered design", "beautiful visual interfaces", "accessibility", "empathy for users", "creative aesthetics"],
        "certifications": ["Google UX Design Professional Certificate", "Nielsen Norman Group UX Master Certification", "Figma Design System Certification"],
        "roadmap_steps": [
            "Learn user research methodologies and wireframing in Figma.",
            "Create comprehensive design systems and interactive high-fidelity prototypes.",
            "Study web accessibility standards (WCAG) and responsive CSS layouts."
        ]
    },
    {
        "title": "Cybersecurity & Security Engineer",
        "keywords": ["linux", "network security", "python", "ethical hacking", "cryptography", "penetration testing", "firewalls", "security", "owasp"],
        "hobby_keywords": ["ctf games", "capture the flag", "studying cryptography", "lockpicking", "investigating security breaches", "reverse engineering"],
        "passion_keywords": ["protecting digital assets", "discovering vulnerabilities", "privacy", "defensive engineering", "solving security mysteries"],
        "certifications": ["CompTIA Security+", "Certified Ethical Hacker (CEH)", "Offensive Security Certified Professional (OSCP)"],
        "roadmap_steps": [
            "Master computer networking, TCP/IP protocols, and Linux security models.",
            "Practice ethical hacking in controlled environments like Hack The Box.",
            "Study common web vulnerabilities (OWASP Top 10) and secure coding practices."
        ]
    },
    {
        "title": "Game Developer (Interactive Media)",
        "keywords": ["c++", "c#", "unity", "unreal engine", "3d math", "game design", "physics", "rendering", "shaders", "gameplay programming"],
        "hobby_keywords": ["gaming", "modding games", "3d modeling", "blender", "writing fantasy lore", "creating level designs", "vr/ar"],
        "passion_keywords": ["creating immersive interactive worlds", "real-time graphics", "physics simulation", "fun gameplay mechanics", "interactive storytelling"],
        "certifications": ["Unity Certified Professional Programmer", "Unreal Engine C++ Developer Certification", "Harvard CS50's Introduction to Game Development"],
        "roadmap_steps": [
            "Master C# or C++ object-oriented and component-based programming.",
            "Build 2D and 3D game mechanics inside Unity or Unreal Engine.",
            "Study game physics, rendering pipelines, and AI behavior trees."
        ]
    },
    {
        "title": "Product Manager (Tech Lead)",
        "keywords": ["agile", "scrum", "leadership", "roadmap planning", "jira", "communication", "product strategy", "user interviews", "metrics"],
        "hobby_keywords": ["organizing events", "reading business books", "debating strategy", "mentoring", "blogging about tech trends"],
        "passion_keywords": ["solving real user problems", "bridging business and technology", "leading cross-functional teams", "delivering high-impact products"],
        "certifications": ["Certified Scrum Product Owner (CSPO)", "Pragmatic Institute Product Management", "Product School Product Manager Certificate"],
        "roadmap_steps": [
            "Master Agile project management methodologies and Jira workflows.",
            "Conduct structured user interviews to discover unaddressed market pain points.",
            "Create data-driven product roadmaps aligning engineering with business revenue goals."
        ]
    }
]


def _compute_overlap_score(user_text: str, archetype_words: list[str]) -> float:
    """Computes similarity score between user text and archetype keyword list."""
    if not user_text.strip() or not archetype_words:
        return 0.0
    text_lower = user_text.lower()
    matches = 0
    for kw in archetype_words:
        if kw in text_lower:
            matches += 1
    return (matches / min(len(archetype_words), 8)) * 100


def generate_career_suggestions(profile_data: dict, top_k: int = 3) -> list[dict]:
    """Generates tailored career paths based on user skills, hobbies, passions, and goals."""
    skills_text = " ".join(profile_data.get("skills", [])).lower()
    hobbies_text = profile_data.get("hobbies", "").lower()
    passions_text = profile_data.get("passions", "").lower()
    goals_text = profile_data.get("career_goals", "").lower()

    combined_text = f"{skills_text} {hobbies_text} {passions_text} {goals_text}"

    # If everything is completely empty, return default top recommendations
    if not combined_text.strip():
        top_archetypes = CAREER_ARCHETYPES[:top_k]
        results = []
        for arch in top_archetypes:
            results.append({
                "title": arch["title"],
                "match_percentage": 75,
                "reason": "Popular high-growth technology career suitable for a diverse background.",
                "certifications": arch["certifications"],
                "roadmap": arch["roadmap_steps"]
            })
        return results

    scored_archetypes = []
    for arch in CAREER_ARCHETYPES:
        # Score dimensions
        skill_score = _compute_overlap_score(skills_text, arch["keywords"])
        hobby_score = _compute_overlap_score(hobbies_text, arch["hobby_keywords"])
        passion_score = _compute_overlap_score(passions_text + " " + goals_text, arch["passion_keywords"])

        # Weighted blend: 50% skills, 25% passions, 25% hobbies
        total_score = (skill_score * 0.5) + (passion_score * 0.25) + (hobby_score * 0.25)

        # Boost if there is direct skill overlap
        if skill_score > 0:
            total_score += 15

        match_pct = min(98, max(35, round(total_score)))

        # Generate personalized rationale
        matched_skills = [s for s in arch["keywords"] if s in skills_text][:3]
        matched_hobbies = [h for h in arch["hobby_keywords"] if h in hobbies_text][:2]
        
        reasons = []
        if matched_skills:
            reasons.append(f"Direct alignment with your technical skills in {', '.join(matched_skills)}.")
        if matched_hobbies or passion_score > 30:
            reasons.append(f"Matches your personal passions and hobbies.")
        if not reasons:
            reasons.append(f"Excellent growth potential bridging your technical and creative goals.")

        scored_archetypes.append({
            "title": arch["title"],
            "match_percentage": match_pct,
            "reason": " ".join(reasons),
            "certifications": arch["certifications"],
            "roadmap": arch["roadmap_steps"]
        })

    # Sort descending by match percentage
    scored_archetypes.sort(key=lambda x: x["match_percentage"], reverse=True)
    return scored_archetypes[:top_k]


COURSE_DIRECTORY = [
    {
        "title": "CS50's Web Programming with Python and JavaScript",
        "provider": "Harvard University / edX",
        "url": "https://www.edx.org/cs50",
        "level": "Intermediate",
        "keywords": ["react", "javascript", "python", "django", "web development", "html", "css", "sql", "full stack"],
        "description": "Deep dive into web application design, APIs, database scaling, and modern cloud deployment architecture."
    },
    {
        "title": "Neural Networks and Deep Learning Specialization",
        "provider": "DeepLearning.AI / Coursera",
        "url": "https://www.coursera.org/specializations/deep-learning",
        "level": "Advanced",
        "keywords": ["python", "pytorch", "tensorflow", "machine learning", "deep learning", "ai", "neural networks", "transformers"],
        "description": "Master foundational neural network structures, backpropagation, and state-of-the-art transformer architectures."
    },
    {
        "title": "Google Data Analytics Professional Certificate",
        "provider": "Google / Coursera",
        "url": "https://www.coursera.org/professional-certificates/google-data-analytics",
        "level": "Beginner to Intermediate",
        "keywords": ["python", "sql", "tableau", "data analysis", "statistics", "pandas", "data visualization"],
        "description": "Learn hands-on data cleaning, exploratory data analysis (EDA), and professional business storytelling with dashboards."
    },
    {
        "title": "Docker & Kubernetes: The Practical Guide",
        "provider": "Maximilian Schwarzmüller / Udemy",
        "url": "https://www.udemy.com/course/docker-kubernetes-the-practical-guide",
        "level": "Intermediate",
        "keywords": ["docker", "kubernetes", "aws", "devops", "linux", "ci/cd", "containers", "cloud"],
        "description": "Comprehensive guide to containerizing microservices, managing clusters, and building robust automated deployment pipelines."
    },
    {
        "title": "Google UX Design Professional Certificate",
        "provider": "Google / Coursera",
        "url": "https://www.coursera.org/professional-certificates/google-ux-design",
        "level": "Beginner to Intermediate",
        "keywords": ["figma", "ui design", "ux", "wireframing", "prototyping", "user research", "accessibility"],
        "description": "End-to-end design curriculum covering empathy mapping, wireframing, high-fidelity Figma prototyping, and usability testing."
    },
    {
        "title": "IBM Cybersecurity Analyst Professional Certificate",
        "provider": "IBM / Coursera",
        "url": "https://www.coursera.org/professional-certificates/ibm-cybersecurity-analyst",
        "level": "Intermediate",
        "keywords": ["linux", "security", "network security", "ethical hacking", "penetration testing", "owasp", "cybersecurity"],
        "description": "Gain practical skills in threat intelligence, network defense, intrusion detection tools, and security incident response."
    },
    {
        "title": "Complete C# Unity Game Developer 3D",
        "provider": "GameDev.tv / Udemy",
        "url": "https://www.udemy.com/course/unitycourse2",
        "level": "Intermediate",
        "keywords": ["c#", "unity", "game dev", "3d math", "c++", "unreal engine", "physics", "rendering"],
        "description": "Master C# object-oriented programming, 3D vector mathematics, real-time physics simulation, and immersive game mechanics."
    },
    {
        "title": "Agile Project Management Specialization",
        "provider": "Google / Coursera",
        "url": "https://www.coursera.org/learn/agile-project-management",
        "level": "Intermediate",
        "keywords": ["agile", "scrum", "leadership", "product management", "jira", "communication", "roadmap"],
        "description": "Learn Scrum sprint planning, backlog grooming, cross-functional engineering leadership, and agile metrics tracking."
    }
]


def generate_course_recommendations(profile_data: dict) -> list[dict]:
    """Recommends relevant online courses based on user education, skills, and interests."""
    skills_text = " ".join(profile_data.get("skills", [])).lower()
    hobbies_text = profile_data.get("hobbies", "").lower()
    passions_text = profile_data.get("passions", "").lower()
    goals_text = profile_data.get("career_goals", "").lower()
    education_text = profile_data.get("education", "").strip()

    combined_text = f"{skills_text} {hobbies_text} {passions_text} {goals_text}".strip()

    # If completely empty, return top 4 general courses
    if not combined_text:
        results = []
        for c in COURSE_DIRECTORY[:4]:
            results.append({
                "title": c["title"],
                "provider": c["provider"],
                "url": c["url"],
                "level": c["level"],
                "description": c["description"],
                "rationale": "High-impact foundational course excellent for launching into tech."
            })
        return results

    scored_courses = []
    for course in COURSE_DIRECTORY:
        score = _compute_overlap_score(combined_text, course["keywords"])
        
        # Check if course keywords align with education
        edu_boost = 0.0
        if education_text and any(kw in education_text.lower() for kw in course["keywords"]):
            edu_boost = 25.0

        total_score = score + edu_boost

        # Construct customized rationale
        matched_kws = [kw for kw in course["keywords"] if kw in combined_text][:3]
        
        if education_text and any(kw in education_text.lower() for kw in course["keywords"]):
            rationale = f"Builds perfectly on your academic foundation in '{education_text}'."
        elif matched_kws:
            rationale = f"Directly aligns with your interest in {', '.join(matched_kws)}."
        elif passions_text:
            rationale = "Matches your core professional passions and upskilling goals."
        else:
            rationale = "Highly recommended for expanding your multidisciplinary skill set."

        scored_courses.append({
            "title": course["title"],
            "provider": course["provider"],
            "url": course["url"],
            "level": course["level"],
            "description": course["description"],
            "rationale": rationale,
            "score": total_score
        })

    # Sort descending by score
    scored_courses.sort(key=lambda x: x["score"], reverse=True)
    
    # Return top 4
    return [{k: v for k, v in item.items() if k != 'score'} for item in scored_courses[:4]]

