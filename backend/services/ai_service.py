import os
import json
import re
from dotenv import load_dotenv

load_dotenv()

# ── Gemini AI Setup ──────────────────────────────────────────────────────────
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
gemini_model = None

def get_gemini_model():
    """Lazy-load Gemini model to avoid import errors if package isn't installed."""
    global gemini_model
    if gemini_model is not None:
        return gemini_model
    try:
        import google.generativeai as genai
        if not GEMINI_API_KEY or GEMINI_API_KEY == "your_gemini_api_key_here":
            print("[AI Service] No valid Gemini API key found. Using local fallback.")
            return None
        genai.configure(api_key=GEMINI_API_KEY)
        gemini_model = genai.GenerativeModel('gemini-2.0-flash')
        print("[AI Service] Gemini AI connected successfully.")
        return gemini_model
    except Exception as e:
        print(f"[AI Service] Gemini init failed: {e}. Using local fallback.")
        return None


# ══════════════════════════════════════════════════════════════════════════════
#  RESUME ANALYSIS
# ══════════════════════════════════════════════════════════════════════════════

RESUME_ANALYSIS_PROMPT = """You are a professional ATS (Applicant Tracking System) resume analyzer. Analyze the following resume text and provide a detailed, accurate evaluation.

Return your analysis as valid JSON with this exact structure:
{
  "overall": <number 0-100>,
  "categories": {
    "contact": {"score": <0-100>, "label": "Contact Info", "icon": "mail"},
    "technical": {"score": <0-100>, "label": "Technical Keywords", "icon": "code"},
    "actionVerbs": {"score": <0-100>, "label": "Action Verbs", "icon": "trending"},
    "metrics": {"score": <0-100>, "label": "Quantifiable Impact", "icon": "chart"},
    "structure": {"score": <0-100>, "label": "Resume Structure", "icon": "briefcase"},
    "education": {"score": <0-100>, "label": "Education", "icon": "education"}
  },
  "strengths": ["strength1", "strength2", ...],
  "weaknesses": ["weakness1", "weakness2", ...],
  "suggestions": ["suggestion1", "suggestion2", ...],
  "stats": {
    "wordCount": <number>,
    "techKeywords": <number>,
    "actionVerbs": <number>,
    "metrics": <number>,
    "sections": <number>
  }
}

Scoring guidelines:
- Contact (0-100): Email, phone, LinkedIn, portfolio presence
- Technical (0-100): Relevant tech skills, tools, frameworks mentioned
- Action Verbs (0-100): Strong action verbs (achieved, developed, managed, etc.)
- Metrics (0-100): Quantifiable achievements (percentages, dollar amounts, team sizes)
- Structure (0-100): Clear sections (Experience, Education, Skills, Projects)
- Education (0-100): Degrees, certifications, relevant coursework
- Overall: Weighted average reflecting true ATS compatibility

Be strict and accurate. A typical college student resume should score 45-65. Only exceptional resumes score 80+.
Provide 3-5 specific, actionable strengths, weaknesses, and suggestions.

RESUME TEXT:
{resume_text}

Return ONLY the JSON, no markdown formatting, no code blocks."""


async def analyze_resume_with_ai(text: str) -> dict:
    """Analyze resume using Gemini AI. Falls back to local analysis if unavailable."""
    model = get_gemini_model()
    
    if model is None:
        return analyze_resume_locally(text)
    
    try:
        prompt = RESUME_ANALYSIS_PROMPT.replace("{resume_text}", text[:8000])
        response = model.generate_content(prompt)
        
        response_text = response.text.strip()
        # Clean markdown code block if present
        if response_text.startswith("```"):
            response_text = re.sub(r'^```[a-z]*\n?', '', response_text)
            response_text = re.sub(r'\n?```$', '', response_text)
        
        result = json.loads(response_text)
        result["ai_powered"] = True
        return result
    except Exception as e:
        print(f"[AI Service] Gemini resume analysis failed: {e}. Using local fallback.")
        return analyze_resume_locally(text)


# ══════════════════════════════════════════════════════════════════════════════
#  INTERVIEW ANALYSIS
# ══════════════════════════════════════════════════════════════════════════════

INTERVIEW_ANALYSIS_PROMPT = """You are a professional interview coach and evaluator. Analyze the following interview responses and provide detailed scoring.

Interview Domain: {domain}
Eye Contact Score: {eye_contact}% (from webcam gaze tracking)

Questions and Answers:
{qa_text}

Time spent per question (seconds): {time_per_question}

Evaluate the candidate across these 5 categories (0-98 scale each):

1. **Content Knowledge** — How well do the answers demonstrate domain expertise? Are the concepts accurate and relevant?
2. **Communication** — Clarity, coherence, and articulation of ideas. Are answers well-structured and easy to understand?
3. **Confidence** — Does the candidate sound confident? (Consider eye contact: {eye_contact}%, answer length, engagement)
4. **Fluency** — Consistency across answers, natural flow, appropriate depth without rambling
5. **Answer Structure** — Use of STAR method, structured reasoning, logical flow from problem to solution

Return your analysis as valid JSON with this exact structure:
{{
  "scores": {{
    "contentKnowledge": <0-98>,
    "communication": <0-98>,
    "confidence": <0-98>,
    "fluency": <0-98>,
    "answerStructure": <0-98>,
    "overall": <0-98>
  }},
  "feedback": {{
    "contentKnowledge": "Detailed feedback on content knowledge...",
    "communication": "Detailed feedback on communication...",
    "confidence": "Detailed feedback on confidence...",
    "fluency": "Detailed feedback on fluency...",
    "answerStructure": "Detailed feedback on answer structure...",
    "overall": "Overall summary feedback..."
  }},
  "perQuestionFeedback": [
    {{"question": 1, "score": <0-100>, "feedback": "Brief feedback for Q1"}},
    ...
  ],
  "topStrengths": ["strength1", "strength2", "strength3"],
  "areasToImprove": ["area1", "area2", "area3"]
}}

Be strict and professional. Score realistically:
- Vague/short answers = 30-50
- Decent answers without specifics = 50-70  
- Good answers with examples = 70-85
- Excellent, detailed, structured answers = 85-98

The overall score should be a weighted average: Content (25%), Communication (25%), Confidence (15%), Fluency (15%), Structure (20%).

Return ONLY the JSON, no markdown formatting, no code blocks."""


async def analyze_interview_with_ai(data: dict) -> dict:
    """Analyze interview using Gemini AI. Falls back to local scoring if unavailable."""
    model = get_gemini_model()
    
    domain = data.get("domain", "General")
    questions = data.get("questions", [])
    answers = data.get("answers", [])
    time_per_question = data.get("timePerQuestion", [])
    eye_contact = data.get("eyeContactScore", 0)
    
    if model is None:
        return analyze_interview_locally(domain, questions, answers, time_per_question, eye_contact)
    
    try:
        # Build Q&A text
        qa_text = ""
        for i, (q, a) in enumerate(zip(questions, answers)):
            answer = a.strip() if a else "(No answer provided)"
            qa_text += f"Q{i+1}: {q}\nA{i+1}: {answer}\n\n"
        
        prompt = INTERVIEW_ANALYSIS_PROMPT.replace("{domain}", domain)
        prompt = prompt.replace("{eye_contact}", str(round(eye_contact)))
        prompt = prompt.replace("{qa_text}", qa_text[:10000])
        prompt = prompt.replace("{time_per_question}", str(time_per_question))
        
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        # Clean markdown code block if present
        if response_text.startswith("```"):
            response_text = re.sub(r'^```[a-z]*\n?', '', response_text)
            response_text = re.sub(r'\n?```$', '', response_text)
        
        result = json.loads(response_text)
        result["ai_powered"] = True
        return result
    except Exception as e:
        print(f"[AI Service] Gemini interview analysis failed: {e}. Using local fallback.")
        return analyze_interview_locally(domain, questions, answers, time_per_question, eye_contact)


# ══════════════════════════════════════════════════════════════════════════════
#  LOCAL FALLBACK — RESUME ANALYSIS
# ══════════════════════════════════════════════════════════════════════════════

ATS_KEYWORDS = {
    'technical': [
        'javascript', 'python', 'java', 'react', 'node', 'sql', 'html', 'css', 'typescript',
        'aws', 'docker', 'kubernetes', 'git', 'api', 'rest', 'graphql', 'mongodb', 'postgresql',
        'linux', 'agile', 'scrum', 'ci/cd', 'devops', 'machine learning', 'data analysis',
        'tensorflow', 'pandas', 'numpy', 'flask', 'django', 'express', 'angular', 'vue',
        'spring', 'microservices', 'cloud', 'azure', 'gcp', 'firebase', 'redis',
        'c++', 'c#', '.net', 'ruby', 'php', 'swift', 'kotlin', 'go', 'rust',
    ],
    'action_verbs': [
        'achieved', 'improved', 'developed', 'managed', 'created', 'designed', 'implemented',
        'led', 'coordinated', 'analyzed', 'built', 'delivered', 'established', 'generated',
        'increased', 'launched', 'optimized', 'reduced', 'resolved', 'streamlined',
        'automated', 'maintained', 'collaborated', 'executed', 'mentored',
    ],
    'education': [
        'bachelor', 'master', 'phd', 'degree', 'university', 'college', 'gpa',
        'certification', 'certified', 'diploma', 'b.tech', 'm.tech', 'b.sc', 'm.sc', 'mba',
    ],
    'section_headers': [
        'experience', 'education', 'skills', 'projects', 'certifications', 'summary',
        'objective', 'profile', 'achievements', 'awards', 'publications',
    ],
}


def analyze_resume_locally(text: str) -> dict:
    """Fallback local resume analysis using keyword matching."""
    lower = text.lower()
    words = lower.split()
    word_count = len(words)

    # Contact
    has_email = '@' in text
    has_phone = bool(re.search(r'(\+?\d[\d\s\-]{7,}|\bphone\b)', text, re.I))
    has_linkedin = 'linkedin' in lower
    contact_score = min(100, (35 if has_email else 0) + (30 if has_phone else 0) + (20 if has_linkedin else 0) + 15)

    tech_found = [k for k in ATS_KEYWORDS['technical'] if k in lower]
    tech_score = min(100, round((len(tech_found) / 8) * 100))

    verbs_found = [v for v in ATS_KEYWORDS['action_verbs'] if v in lower]
    verb_score = min(100, round((len(verbs_found) / 6) * 100))

    metrics_count = len(re.findall(r'\d+%|\$[\d,]+|\d+\+?\s*(?:users|customers|projects|teams)', text, re.I))
    metrics_score = min(100, round((metrics_count / 3) * 100))

    sections_found = [s for s in ATS_KEYWORDS['section_headers'] if s in lower]
    structure_score = min(100, round((len(sections_found) / 5) * 100))

    edu_found = [k for k in ATS_KEYWORDS['education'] if k in lower]
    education_score = min(100, round((len(edu_found) / 3) * 100))

    overall = round(
        contact_score * 0.10 + tech_score * 0.25 + verb_score * 0.15 +
        metrics_score * 0.15 + structure_score * 0.15 + education_score * 0.10 +
        (100 if 200 <= word_count <= 800 else 60) * 0.10
    )

    strengths = []
    if len(tech_found) >= 5: strengths.append(f"Strong technical profile with {len(tech_found)} relevant technologies")
    if len(verbs_found) >= 4: strengths.append(f"Good use of {len(verbs_found)} action verbs")
    if metrics_count >= 2: strengths.append(f"Includes {metrics_count} quantifiable metrics")
    if not strengths: strengths.append("Resume uploaded successfully for analysis")

    weaknesses = []
    if len(tech_found) < 3: weaknesses.append("Lacks sufficient technical keywords for ATS matching")
    if len(verbs_found) < 3: weaknesses.append("Missing strong action verbs")
    if metrics_count == 0: weaknesses.append("No quantifiable metrics found")
    if not weaknesses: weaknesses.append("No major weaknesses detected")

    suggestions = []
    if len(tech_found) < 5: suggestions.append("Add more relevant technical skills")
    if metrics_count < 2: suggestions.append("Quantify achievements with numbers and percentages")
    if len(sections_found) < 4: suggestions.append("Use standard section headers for better ATS compatibility")
    if not suggestions: suggestions.append("Resume looks well-optimized for ATS")

    return {
        "overall": overall,
        "categories": {
            "contact": {"score": contact_score, "label": "Contact Info", "icon": "mail"},
            "technical": {"score": tech_score, "label": "Technical Keywords", "icon": "code"},
            "actionVerbs": {"score": verb_score, "label": "Action Verbs", "icon": "trending"},
            "metrics": {"score": metrics_score, "label": "Quantifiable Impact", "icon": "chart"},
            "structure": {"score": structure_score, "label": "Resume Structure", "icon": "briefcase"},
            "education": {"score": education_score, "label": "Education", "icon": "education"},
        },
        "strengths": strengths,
        "weaknesses": weaknesses,
        "suggestions": suggestions,
        "stats": {
            "wordCount": word_count,
            "techKeywords": len(tech_found),
            "actionVerbs": len(verbs_found),
            "metrics": metrics_count,
            "sections": len(sections_found),
        },
        "ai_powered": False
    }


# ══════════════════════════════════════════════════════════════════════════════
#  LOCAL FALLBACK — INTERVIEW ANALYSIS
# ══════════════════════════════════════════════════════════════════════════════

def analyze_interview_locally(domain, questions, answers, time_per_question, eye_contact):
    """Fallback local interview analysis using heuristics."""
    total = len(questions)
    answered_texts = [a for a in answers if a and a.strip()]
    word_counts = [len(a.split()) if a else 0 for a in answers]
    avg_words = sum(word_counts) / max(len(word_counts), 1)
    completion = len(answered_texts) / max(total, 1)

    # Content Knowledge
    domain_kw = {
        'HR & Behavioral': ['team', 'leadership', 'conflict', 'communication', 'stakeholder', 'deadline', 'priority', 'feedback'],
        'Frontend Developer': ['react', 'component', 'state', 'hook', 'dom', 'css', 'javascript', 'api', 'performance'],
        'Backend Developer': ['api', 'database', 'server', 'rest', 'sql', 'cache', 'scale', 'microservice', 'docker'],
        'Data Scientist': ['model', 'training', 'data', 'feature', 'accuracy', 'algorithm', 'prediction', 'regression'],
        'Product Manager': ['user', 'feature', 'roadmap', 'stakeholder', 'metric', 'priority', 'launch', 'feedback'],
        'UI/UX Designer': ['user', 'wireframe', 'prototype', 'accessibility', 'design', 'usability', 'research', 'persona'],
    }
    all_text = ' '.join(answers).lower()
    keywords = domain_kw.get(domain, [])
    kw_hits = sum(1 for k in keywords if k in all_text)
    content_knowledge = min(98, round(kw_hits * 9 * 0.65 + completion * 25))

    # Communication
    word_score = 92 if avg_words >= 50 else 80 if avg_words >= 30 else 65 if avg_words >= 15 else 48
    time_scores = [min(95, max(10, 75 if 30 <= t <= 60 else 60)) for t in (time_per_question or [30])]
    avg_time_score = sum(time_scores) / max(len(time_scores), 1)
    communication = min(98, round(word_score * 0.6 + avg_time_score * 0.25 + completion * 15))

    # Confidence (includes eye contact)
    eye_factor = eye_contact / 100 if eye_contact else 0.5
    engagement = len(answered_texts) / max(total, 1)
    confidence = min(98, round((engagement * 40 + eye_factor * 40 + avg_time_score * 0.2) * 1.0))

    # Fluency
    valid_words = [w for w in word_counts if w > 2]
    avg_w = sum(valid_words) / max(len(valid_words), 1)
    variance = sum((w - avg_w) ** 2 for w in valid_words) / max(len(valid_words), 1)
    cv = (variance ** 0.5) / avg_w if avg_w > 0 else 1
    consistency = 90 if cv < 0.3 else 78 if cv < 0.5 else 63 if cv < 0.7 else 45
    fluency = min(98, round(consistency * 0.7 + avg_time_score * 0.3))

    # Answer Structure
    star_kw = ['situation', 'task', 'action', 'result', 'challenge', 'implemented', 'achieved', 'led', 'resolved', 'improved']
    star_hits = sum(1 for k in star_kw if k in all_text)
    answer_structure = min(98, round(min(100, star_hits * 6) * 0.7 + completion * 20))

    overall = round((content_knowledge * 0.25 + communication * 0.25 + confidence * 0.15 + fluency * 0.15 + answer_structure * 0.20))

    return {
        "scores": {
            "contentKnowledge": content_knowledge,
            "communication": communication,
            "confidence": confidence,
            "fluency": fluency,
            "answerStructure": answer_structure,
            "overall": overall,
        },
        "feedback": {
            "contentKnowledge": f"Demonstrated knowledge with {kw_hits} domain-relevant concepts.",
            "communication": f"Average response length: {round(avg_words)} words. {'Good depth.' if avg_words >= 30 else 'Consider providing more detail.'}",
            "confidence": f"Eye contact: {round(eye_contact)}%. {'Maintained good camera focus.' if eye_contact >= 70 else 'Try to maintain more eye contact with the camera.'}",
            "fluency": f"Response consistency: {'Excellent' if cv < 0.3 else 'Good' if cv < 0.5 else 'Needs improvement'}.",
            "answerStructure": f"STAR method keywords detected: {star_hits}. {'Good structure.' if star_hits >= 4 else 'Use more structured responses (Situation-Task-Action-Result).'}",
            "overall": f"Completed {len(answered_texts)}/{total} questions with average {round(avg_words)} words per answer.",
        },
        "perQuestionFeedback": [
            {"question": i + 1, "score": min(98, max(20, word_counts[i] * 2)), "feedback": f"{word_counts[i]} words, {'good depth' if word_counts[i] >= 25 else 'consider elaborating more'}"}
            for i in range(len(questions))
        ],
        "topStrengths": [
            s for s in [
                f"Completed {round(completion * 100)}% of questions" if completion >= 0.8 else None,
                f"Good average response length ({round(avg_words)} words)" if avg_words >= 30 else None,
                f"Strong eye contact ({round(eye_contact)}%)" if eye_contact >= 70 else None,
            ] if s
        ] or ["Keep practicing to improve your interview skills"],
        "areasToImprove": [
            s for s in [
                "Provide more detailed answers" if avg_words < 25 else None,
                "Maintain better eye contact with camera" if eye_contact < 60 else None,
                "Use STAR method for behavioral questions" if star_hits < 3 else None,
            ] if s
        ] or ["Continue refining your responses"],
        "ai_powered": False
    }
