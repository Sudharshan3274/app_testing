from fastapi import APIRouter, UploadFile, File
from services.ai_service import analyze_resume_with_ai
from pypdf import PdfReader
import io

router = APIRouter(prefix="/api/resume", tags=["Resume"])


@router.post("/analyze")
async def analyze_resume(file: UploadFile = File(...)):
    """Parses uploaded resume (PDF, DOCX, TXT) and analyzes with Gemini AI."""
    filename = file.filename
    content = await file.read()
    text = ""

    try:
        if filename.lower().endswith(".pdf"):
            pdf_file = io.BytesIO(content)
            reader = PdfReader(pdf_file)
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"

        elif filename.lower().endswith(".docx"):
            try:
                from docx import Document
                doc = Document(io.BytesIO(content))
                text = "\n".join(p.text for p in doc.paragraphs if p.text.strip())
            except ImportError:
                text = content.decode("utf-8", errors="ignore")

        else:
            try:
                text = content.decode("utf-8")
            except UnicodeDecodeError:
                text = content.decode("latin-1")
    except Exception as e:
        print(f"Error parsing resume: {e}")
        text = ""

    if not text.strip():
        return {
            "error": "Could not extract text from file. Please upload a readable PDF, DOCX, or TXT file.",
            "overall": 0,
        }

    analysis_result = await analyze_resume_with_ai(text)
    analysis_result["filename"] = filename
    return analysis_result
