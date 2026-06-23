import React, { useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle, AlertTriangle, XCircle, TrendingUp, Award, Briefcase, GraduationCap, Code, Mail, BarChart3, RefreshCw, Brain, Sparkles } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';


// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;


// --- ATS Keyword Database per Category ---
const ATS_KEYWORDS = {
  technical: [
    'javascript', 'python', 'java', 'react', 'node', 'sql', 'html', 'css', 'typescript',
    'aws', 'docker', 'kubernetes', 'git', 'api', 'rest', 'graphql', 'mongodb', 'postgresql',
    'linux', 'agile', 'scrum', 'ci/cd', 'devops', 'machine learning', 'data analysis',
    'tensorflow', 'pandas', 'numpy', 'flask', 'django', 'express', 'angular', 'vue',
    'spring', 'microservices', 'cloud', 'azure', 'gcp', 'firebase', 'redis', 'elasticsearch',
    'c++', 'c#', '.net', 'ruby', 'php', 'swift', 'kotlin', 'go', 'rust', 'scala',
    'hadoop', 'spark', 'tableau', 'power bi', 'figma', 'sketch', 'adobe', 'photoshop',
    'jira', 'confluence', 'slack', 'trello', 'notion', 'github', 'gitlab', 'bitbucket'
  ],
  action_verbs: [
    'achieved', 'improved', 'developed', 'managed', 'created', 'designed', 'implemented',
    'led', 'coordinated', 'analyzed', 'built', 'delivered', 'established', 'generated',
    'increased', 'launched', 'optimized', 'reduced', 'resolved', 'streamlined',
    'supervised', 'trained', 'transformed', 'collaborated', 'contributed', 'executed',
    'facilitated', 'initiated', 'mentored', 'negotiated', 'organized', 'presented',
    'proposed', 'researched', 'spearheaded', 'upgraded', 'automated', 'maintained'
  ],
  metrics_patterns: [
    /\d+%/, /\$[\d,]+/, /\d+\+?\s*(users|customers|clients|projects|teams|people)/i,
    /increased.*by\s*\d+/i, /reduced.*by\s*\d+/i, /improved.*by\s*\d+/i,
    /\d+x\s/i, /revenue/i, /growth/i, /roi/i, /kpi/i
  ],
  contact_keywords: [
    'email', 'phone', 'linkedin', 'github', 'portfolio', '@', 'http', 'www',
    '.com', '.org', '.io', '.dev'
  ],
  section_headers: [
    'experience', 'education', 'skills', 'projects', 'certifications', 'summary',
    'objective', 'profile', 'work history', 'employment', 'achievements', 'awards',
    'publications', 'volunteer', 'interests', 'languages', 'references'
  ],
  education_keywords: [
    'bachelor', 'master', 'phd', 'degree', 'university', 'college', 'gpa',
    'certification', 'certified', 'diploma', 'coursework', 'b.tech', 'm.tech',
    'b.sc', 'm.sc', 'mba', 'b.e', 'm.e', 'bca', 'mca'
  ]
};

/**
 * Analyze resume text and produce detailed ATS scoring
 */
function analyzeResume(text) {
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/);
  const wordCount = words.length;
  const lines = text.split('\n').filter(l => l.trim());

  // 1. Contact Information (0-100)
  const contactFound = ATS_KEYWORDS.contact_keywords.filter(k => lower.includes(k));
  const hasEmail = /@/.test(text) || /email/i.test(text);
  const hasPhone = /(\+?\d[\d\s\-]{7,}|\bphone\b)/i.test(text);
  const hasLinkedIn = /linkedin/i.test(text);
  const contactScore = Math.min(100, (hasEmail ? 35 : 0) + (hasPhone ? 30 : 0) + (hasLinkedIn ? 20 : 0) + Math.min(15, contactFound.length * 5));

  // 2. Technical Keywords (0-100)
  const techFound = ATS_KEYWORDS.technical.filter(k => lower.includes(k));
  const techScore = Math.min(100, Math.round((techFound.length / 8) * 100)); // 8+ tech keywords = 100

  // 3. Action Verbs (0-100)
  const verbsFound = ATS_KEYWORDS.action_verbs.filter(v => lower.includes(v));
  const verbScore = Math.min(100, Math.round((verbsFound.length / 6) * 100)); // 6+ action verbs = 100

  // 4. Quantifiable Metrics (0-100)
  let metricsCount = 0;
  ATS_KEYWORDS.metrics_patterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) metricsCount += matches.length;
  });
  const metricsScore = Math.min(100, Math.round((metricsCount / 3) * 100)); // 3+ metrics = 100

  // 5. Section Structure (0-100)
  const sectionsFound = ATS_KEYWORDS.section_headers.filter(s => lower.includes(s));
  const structureScore = Math.min(100, Math.round((sectionsFound.length / 5) * 100)); // 5+ sections = 100

  // 6. Education (0-100)
  const eduFound = ATS_KEYWORDS.education_keywords.filter(k => lower.includes(k));
  const educationScore = Math.min(100, Math.round((eduFound.length / 3) * 100)); // 3+ education keywords = 100

  // 7. Length/Formatting Check (0-100)
  let lengthScore = 100;
  if (wordCount < 100) lengthScore = 30; // Too short
  else if (wordCount < 200) lengthScore = 55;
  else if (wordCount < 300) lengthScore = 75;
  else if (wordCount > 1200) lengthScore = 70; // Too long
  else if (wordCount > 800) lengthScore = 85;

  // Overall ATS Score (weighted average)
  const overall = Math.round(
    contactScore * 0.10 +
    techScore * 0.25 +
    verbScore * 0.15 +
    metricsScore * 0.15 +
    structureScore * 0.15 +
    educationScore * 0.10 +
    lengthScore * 0.10
  );

  // Generate strengths
  const strengths = [];
  if (techFound.length >= 5) strengths.push(`Strong technical skills — found ${techFound.length} relevant technologies: ${techFound.slice(0, 5).join(', ')}${techFound.length > 5 ? '...' : ''}`);
  if (verbsFound.length >= 4) strengths.push(`Good use of ${verbsFound.length} action verbs showing impact and initiative`);
  if (metricsCount >= 2) strengths.push(`Includes ${metricsCount} quantifiable metrics demonstrating measurable achievements`);
  if (sectionsFound.length >= 4) strengths.push(`Well-structured resume with clear sections: ${sectionsFound.slice(0, 4).join(', ')}`);
  if (contactScore >= 70) strengths.push('Complete contact information makes it easy for recruiters to reach you');
  if (eduFound.length >= 2) strengths.push('Education section is well-documented');
  if (wordCount >= 300 && wordCount <= 800) strengths.push('Resume length is optimal for ATS parsing');

  // Generate weaknesses
  const weaknesses = [];
  if (techFound.length < 3) weaknesses.push('Lacks sufficient technical keywords — ATS may not match your profile to job descriptions');
  if (verbsFound.length < 3) weaknesses.push('Missing strong action verbs — use words like "achieved", "implemented", "led" to describe accomplishments');
  if (metricsCount === 0) weaknesses.push('No quantifiable metrics found — add numbers like "improved performance by 20%" or "managed team of 8"');
  if (sectionsFound.length < 3) weaknesses.push('Resume structure needs more standard sections (Experience, Skills, Education, Projects)');
  if (!hasEmail) weaknesses.push('Email address not detected — ensure your email is clearly visible');
  if (!hasPhone) weaknesses.push('Phone number not detected — add a contact number');
  if (!hasLinkedIn) weaknesses.push('No LinkedIn profile found — adding one can boost credibility');
  if (wordCount < 200) weaknesses.push('Resume is too short — most ATS systems expect at least 300-600 words');
  if (wordCount > 1000) weaknesses.push('Resume may be too lengthy — aim for 1-2 pages (300-800 words)');

  // Suggestions
  const suggestions = [];
  if (techFound.length < 5) suggestions.push('Add more technical skills relevant to the job description you\'re targeting');
  if (metricsCount < 2) suggestions.push('Quantify your achievements: "Reduced page load time by 40%" is stronger than "Improved page load time"');
  if (verbsFound.length < 4) suggestions.push('Start bullet points with action verbs: Developed, Implemented, Analyzed, Coordinated');
  if (!lower.includes('summary') && !lower.includes('objective') && !lower.includes('profile')) {
    suggestions.push('Add a Professional Summary at the top — it\'s the first thing ATS and recruiters scan');
  }
  if (!lower.includes('project')) suggestions.push('Include a Projects section to showcase hands-on experience');
  if (sectionsFound.length < 4) suggestions.push('Use standard section headers (Experience, Skills, Education, Projects) for better ATS compatibility');

  return {
    overall,
    categories: {
      contact: { score: contactScore, label: 'Contact Info', icon: 'mail' },
      technical: { score: techScore, label: 'Technical Keywords', icon: 'code' },
      actionVerbs: { score: verbScore, label: 'Action Verbs', icon: 'trending' },
      metrics: { score: metricsScore, label: 'Quantifiable Impact', icon: 'chart' },
      structure: { score: structureScore, label: 'Resume Structure', icon: 'briefcase' },
      education: { score: educationScore, label: 'Education', icon: 'education' }
    },
    strengths: strengths.length > 0 ? strengths : ['Upload a more detailed resume for specific strengths analysis'],
    weaknesses: weaknesses.length > 0 ? weaknesses : ['Great job! No major weaknesses detected'],
    suggestions: suggestions.length > 0 ? suggestions : ['Your resume looks well-optimized for ATS!'],
    stats: {
      wordCount,
      techKeywords: techFound.length,
      actionVerbs: verbsFound.length,
      metrics: metricsCount,
      sections: sectionsFound.length
    }
  };
}

const CATEGORY_ICONS = {
  mail: <Mail size={18} />,
  code: <Code size={18} />,
  trending: <TrendingUp size={18} />,
  chart: <BarChart3 size={18} />,
  briefcase: <Briefcase size={18} />,
  education: <GraduationCap size={18} />
};

const CATEGORY_COLORS = {
  contact: '#3B82F6',
  technical: '#8B5CF6',
  actionVerbs: '#EC4899',
  metrics: '#10B981',
  structure: '#F59E0B',
  education: '#06B6D4'
};

export default function ResumeAnalysis() {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [matching, setMatching] = useState(false);
  const [jobDescription, setJobDescription] = useState(() => {
    return localStorage.getItem('resumeATSJobDescription') || '';
  });
  const [result, setResult] = useState(() => {
    const saved = localStorage.getItem('resumeATSResult');
    return saved ? JSON.parse(saved) : null;
  });
  const [matchResult, setMatchResult] = useState(() => {
    const saved = localStorage.getItem('resumeATSMatchResult');
    return saved ? JSON.parse(saved) : null;
  });

  const handleJobDescChange = (e) => {
    const val = e.target.value;
    setJobDescription(val);
    localStorage.setItem('resumeATSJobDescription', val);
  };

  const calculateJobMatch = useCallback(async (resumeText, jobDesc) => {
    const textToUse = resumeText || (result && (result.raw_text || result.text));
    const descToUse = jobDesc !== undefined ? jobDesc : jobDescription;
    
    if (!textToUse) {
      alert("Please upload a resume first.");
      return;
    }
    if (!descToUse.trim()) {
      alert("Please enter a job description.");
      return;
    }
    
    setMatching(true);
    try {
      const response = await fetch('http://localhost:8000/api/resume/ats-match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          resume_text: textToUse,
          job_description: descToUse
        })
      });
      
      if (!response.ok) {
        throw new Error('Server match prediction failed');
      }
      
      const matchData = await response.json();
      setMatchResult(matchData);
      localStorage.setItem('resumeATSMatchResult', JSON.stringify(matchData));
    } catch (err) {
      console.warn('Backend match prediction failed, falling back to local overlap calculation:', err);
      // Client-side fallback overlap score
      const rText = textToUse.toLowerCase();
      const jText = descToUse.toLowerCase();
      const rWords = new Set(rText.match(/\b\w{3,}\b/g) || []);
      const jWords = new Set(jText.match(/\b\w{3,}\b/g) || []);
      
      let matchData;
      if (jWords.size === 0) {
        matchData = { score: 20.0, label: "No Fit", ai_powered: false };
      } else {
        const overlap = [...rWords].filter(w => jWords.has(w));
        const matchRatio = overlap.length / jWords.size;
        const score = Math.round(Math.min(100.0, 20.0 + (matchRatio * 120.0)) * 10) / 10;
        
        let label = "No Fit";
        if (score >= 70.0) label = "Good Fit";
        else if (score >= 40.0) label = "Potential Fit";
        
        matchData = {
          score,
          label,
          ai_powered: false
        };
      }
      setMatchResult(matchData);
      localStorage.setItem('resumeATSMatchResult', JSON.stringify(matchData));
    } finally {
      setMatching(false);
    }
  }, [result, jobDescription]);

  const handleFile = useCallback(async (selectedFile) => {
    if (!selectedFile) return;

    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(pdf|doc|docx|txt)$/i)) {
      alert('Please upload a PDF, DOC, DOCX, or TXT file.');
      return;
    }

    setFile(selectedFile);
    setAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const response = await fetch('http://localhost:8000/api/resume/analyze', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Server analysis failed');
      }
      
      const analysis = await response.json();
      
      if (analysis.error) {
        throw new Error(analysis.error);
      }
      
      if (!analysis.categories || !analysis.stats) {
        throw new Error("Invalid analysis format received from server.");
      }
      
      analysis.analyzedAt = new Date().toISOString();
      
      setResult(analysis);
      localStorage.setItem('resumeATSResult', JSON.stringify(analysis));
      localStorage.setItem('resumeATSScore', analysis.overall.toString());

      // If job description exists, run match
      if (jobDescription.trim()) {
        await calculateJobMatch(analysis.raw_text || analysis.text, jobDescription);
      } else {
        setMatchResult(null);
        localStorage.removeItem('resumeATSMatchResult');
      }
    } catch (err) {
      console.warn('Backend connection or analysis failed, falling back to local analysis:', err);
      try {
        const text = await readFileAsText(selectedFile);
        const analysis = analyzeResume(text);
        analysis.filename = selectedFile.name;
        analysis.raw_text = text;
        analysis.analyzedAt = new Date().toISOString();
        
        setResult(analysis);
        localStorage.setItem('resumeATSResult', JSON.stringify(analysis));
        localStorage.setItem('resumeATSScore', analysis.overall.toString());

        // Run match
        if (jobDescription.trim()) {
          await calculateJobMatch(text, jobDescription);
        } else {
          setMatchResult(null);
          localStorage.removeItem('resumeATSMatchResult');
        }
      } catch (localErr) {
        console.error('Local analysis also failed:', localErr);
        alert(err.message && err.message !== "Server analysis failed" ? err.message : 'Could not analyze the file. Please make sure the file is not corrupted.');
      }
    } finally {
      setAnalyzing(false);
    }
  }, [jobDescription, calculateJobMatch]);

  const readFileAsText = async (file) => {
    // PDF files — extract text using pdfjs-dist
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
      }
      return fullText;
    }
    
    // DOCX files — extract text using mammoth
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')) {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    }

    // DOC files (legacy) — try mammoth, fallback to raw text
    if (file.type === 'application/msword' || file.name.endsWith('.doc')) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value;
      } catch {
        // Fallback for old .doc format
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = reject;
          reader.readAsText(file);
        });
      }
    }

    // TXT files — direct read
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFile(droppedFile);
  }, [handleFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--success)';
    if (score >= 60) return 'var(--warning)';
    return 'var(--danger)';
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    if (score >= 50) return 'Needs Work';
    return 'Poor';
  };

  const clearAnalysis = () => {
    setFile(null);
    setResult(null);
    setMatchResult(null);
    localStorage.removeItem('resumeATSResult');
    localStorage.removeItem('resumeATSScore');
    localStorage.removeItem('resumeATSMatchResult');
  };

  // Keyword extraction for Job Match insights
  const getJobMatchKeywords = () => {
    const resumeText = result ? (result.raw_text || result.text) : '';
    if (!resumeText || !jobDescription) return null;
    const resumeLower = resumeText.toLowerCase();
    const jobLower = jobDescription.toLowerCase();
    
    const rWords = new Set(resumeLower.match(/\b\w{3,}\b/g) || []);
    const jWords = new Set(jobLower.match(/\b\w{3,}\b/g) || []);
    
    // Filter common English stop words
    const stopWords = new Set([
      'the', 'and', 'for', 'you', 'with', 'that', 'this', 'have', 'from', 'your',
      'are', 'will', 'our', 'their', 'about', 'more', 'work', 'team', 'experience',
      'skills', 'position', 'role', 'requirements', 'must', 'candidate', 'ability',
      'responsibilities', 'responsible', 'required', 'preferred', 'description',
      'strong', 'good', 'ability', 'excellent', 'written', 'verbal', 'communication'
    ]);
    
    const importantWords = Array.from(jWords).filter(w => {
      return w.length > 3 && !stopWords.has(w) && !/^\d+$/.test(w);
    });
    
    const matching = importantWords.filter(w => rWords.has(w));
    const missing = importantWords.filter(w => !rWords.has(w));
    
    return { matching, missing };
  };

  const keywordInsights = getJobMatchKeywords();

  const overallDeg = result ? result.overall * 3.6 + 'deg' : '0deg';
  const matchDeg = matchResult ? matchResult.score * 3.6 + 'deg' : '0deg';

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Resume ATS & Job Matching</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '700px' }}>
            Upload your resume and optionally paste a job description to analyze semantic alignment, keyword fit, and predict compatibility scores using our machine learning model.
          </p>
        </div>
        {result && (
          <button className="btn-secondary" onClick={clearAnalysis} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <RefreshCw size={16} /> Reset Analysis
          </button>
        )}
      </div>

      {!result && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          {/* Job Description Box */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.3rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Brain size={20} color="var(--accent-primary)" />
              1. Job Description (Optional)
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              Paste the target job description here to check your semantic compatibility score using our trained Ridge Regression model.
            </p>
            <textarea
              placeholder="Paste job requirements, responsibilities, or complete job description here..."
              value={jobDescription}
              onChange={handleJobDescChange}
              style={{
                flex: 1,
                minHeight: '220px',
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '1rem',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                fontSize: '0.95rem',
                resize: 'none',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
            />
            {jobDescription && (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', alignSelf: 'flex-end' }}>
                {jobDescription.length} characters
              </span>
            )}
          </div>

          {/* Upload Zone */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.3rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={20} color="var(--accent-primary)" />
              2. Upload Resume
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              Drag and drop your PDF, DOCX, or TXT resume file.
            </p>
            <div
              className={`resume-upload-zone ${dragOver ? 'drag-over' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => document.getElementById('resume-file-input').click()}
              style={{
                flex: 1,
                border: `2px dashed ${dragOver ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: dragOver ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255,255,255,0.02)',
                minHeight: '260px'
              }}
            >
              <input
                id="resume-file-input"
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                style={{ display: 'none' }}
                onChange={(e) => handleFile(e.target.files[0])}
              />
              {analyzing ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem', textAlign: 'center' }}>
                  <RefreshCw size={48} color="var(--accent-primary)" style={{ animation: 'spin 1s linear infinite' }} />
                  <p style={{ color: 'var(--accent-primary)', fontWeight: 600, fontSize: '1.2rem', margin: 0 }}>Analyzing Resume...</p>
                  <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Parsing skills, matching keyword sets and predicting compatibility</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem', textAlign: 'center' }}>
                  <Upload size={48} color="var(--text-secondary)" />
                  <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.2rem', margin: 0 }}>
                    {file ? file.name : 'Drag & drop resume here'}
                  </p>
                  <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                    or click to browse • Supports PDF, DOC, DOCX, TXT
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Results Screen */}
      {result && !analyzing && (
        <div style={{ animation: 'fadeInUp 0.6s ease' }}>
          {/* Top Row: Overall Scores + Category Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: matchResult ? 'repeat(3, 1fr)' : '1fr 2fr', gap: '2rem', marginBottom: '2rem' }}>
            
            {/* Standard Profile Score Dial */}
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
              <h2 style={{ color: 'var(--text-secondary)', marginBottom: '1.2rem', marginTop: 0, fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FileText size={16} /> Resume Quality Score
              </h2>
              <div style={{
                width: '160px', height: '160px', borderRadius: '50%',
                background: `conic-gradient(${getScoreColor(result.overall)} ${overallDeg}, rgba(255,255,255,0.05) 0deg)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1.2rem'
              }}>
                <div style={{
                  width: '132px', height: '132px', borderRadius: '50%',
                  background: 'var(--bg-card)', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center'
                }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: getScoreColor(result.overall), lineHeight: 1 }}>
                    {result.overall}
                  </span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.2rem' }}>/ 100</span>
                </div>
              </div>
              <p style={{ color: getScoreColor(result.overall), fontWeight: 600, fontSize: '1rem', textAlign: 'center', margin: 0 }}>
                {getScoreLabel(result.overall)}
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textAlign: 'center', marginTop: '0.4rem', margin: 0 }}>
                Keyword & structure audit
              </p>
            </div>

            {/* ML-powered Job Match Score Dial (if matching was requested) */}
            {matchResult && (
              <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', border: '1px solid rgba(99, 102, 241, 0.3)', position: 'relative', overflow: 'hidden' }}>
                <div style={{
                  position: 'absolute', top: '10px', right: '10px',
                  background: matchResult.ai_powered ? 'linear-gradient(135deg, #6366F1, #8B5CF6)' : 'rgba(255,255,255,0.08)',
                  padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: '3px', color: '#fff'
                }}>
                  {matchResult.ai_powered ? <Sparkles size={10} /> : null}
                  {matchResult.ai_powered ? 'ML Matcher' : 'Local Overlap'}
                </div>
                <h2 style={{ color: 'var(--text-secondary)', marginBottom: '1.2rem', marginTop: 0, fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Brain size={16} color="var(--accent-primary)" /> Job Match Score
                </h2>
                <div style={{
                  width: '160px', height: '160px', borderRadius: '50%',
                  background: `conic-gradient(${getScoreColor(matchResult.score)} ${matchDeg}, rgba(255,255,255,0.05) 0deg)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '1.2rem'
                }}>
                  <div style={{
                    width: '132px', height: '132px', borderRadius: '50%',
                    background: 'var(--bg-card)', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center'
                  }}>
                    <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: getScoreColor(matchResult.score), lineHeight: 1 }}>
                      {matchResult.score}
                    </span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.2rem' }}>/ 100</span>
                  </div>
                </div>
                <p style={{ color: getScoreColor(matchResult.score), fontWeight: 600, fontSize: '1rem', textAlign: 'center', margin: 0 }}>
                  {matchResult.label}
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textAlign: 'center', marginTop: '0.4rem', margin: 0 }}>
                  Fit prediction vs job roles
                </p>
              </div>
            )}

            {/* Category Breakdown (occupies 1 column if matching, or 2 columns if not matching) */}
            <div className="glass-panel" style={{ padding: '2rem', gridColumn: matchResult ? 'auto' : 'span 1' }}>
              <h2 style={{ marginBottom: '1.2rem', color: '#fff', marginTop: 0, fontSize: '1.1rem', fontWeight: 600 }}>Category Breakdown</h2>
              {Object.entries(result.categories).map(([key, cat]) => {
                const barColor = getScoreColor(cat.score);
                return (
                  <div key={key} style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)' }}>
                        <span style={{ color: CATEGORY_COLORS[key] }}>{CATEGORY_ICONS[cat.icon]}</span>
                        <span style={{ fontWeight: 500, fontSize: '0.85rem' }}>{cat.label}</span>
                      </div>
                      <span style={{ fontWeight: 'bold', color: barColor, fontSize: '0.85rem' }}>{cat.score}</span>
                    </div>
                    <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{
                        width: cat.score + '%', height: '100%',
                        background: CATEGORY_COLORS[key],
                        borderRadius: '3px',
                        transition: 'width 1s ease-out'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* If no match score exists, allow user to run a match score on their uploaded resume */}
          {!matchResult && (
            <div className="glass-panel" style={{ marginBottom: '2rem', padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px dashed rgba(99, 102, 241, 0.4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Sparkles size={18} color="var(--accent-primary)" /> Compare against a Job Description
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
                    Paste a job description below to run semantic alignment scoring against this resume.
                  </p>
                </div>
                <button
                  className="btn-primary"
                  onClick={() => calculateJobMatch()}
                  disabled={matching || !jobDescription.trim()}
                  style={{
                    padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                    opacity: (!jobDescription.trim() || matching) ? 0.6 : 1,
                    cursor: (!jobDescription.trim() || matching) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {matching ? <RefreshCw size={14} className="spin" /> : <Brain size={14} />}
                  {matching ? 'Calculating...' : 'Predict Job Fit'}
                </button>
              </div>
              <textarea
                placeholder="Paste the target job description here..."
                value={jobDescription}
                onChange={handleJobDescChange}
                style={{
                  width: '100%',
                  minHeight: '90px',
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  color: 'var(--text-primary)',
                  fontFamily: 'inherit',
                  fontSize: '0.9rem',
                  resize: 'vertical',
                  outline: 'none',
                }}
              />
            </div>
          )}

          {/* Quick Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { label: 'Word Count', value: result.stats.wordCount, color: '#3B82F6' },
              { label: 'Tech Keywords', value: result.stats.techKeywords, color: '#8B5CF6' },
              { label: 'Action Verbs', value: result.stats.actionVerbs, color: '#EC4899' },
              { label: 'Metrics Found', value: result.stats.metrics, color: '#10B981' },
              { label: 'Sections', value: result.stats.sections, color: '#F59E0B' }
            ].map((stat, i) => (
              <div key={i} className="glass-panel" style={{ padding: '1.25rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</p>
                <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: stat.color, margin: 0 }}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Job Match Keyword Insights (if Job Description comparison has been executed) */}
          {matchResult && keywordInsights && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
              
              {/* Matching terms */}
              <div className="glass-panel" style={{ padding: '2rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', marginTop: 0, marginBottom: '1rem', fontSize: '1.15rem' }}>
                  <CheckCircle size={18} /> Matching Role Keywords ({keywordInsights.matching.length})
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.2rem', marginTop: 0 }}>
                  These key terms from the job requirements were successfully parsed in your resume.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {keywordInsights.matching.length > 0 ? (
                    keywordInsights.matching.map((word, i) => (
                      <span key={i} style={{
                        padding: '0.35rem 0.75rem',
                        background: 'rgba(16, 185, 129, 0.08)',
                        borderRadius: '20px',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        color: 'var(--success)',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        textTransform: 'capitalize'
                      }}>
                        {word}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No direct keyword overlaps detected.</span>
                  )}
                </div>
              </div>

              {/* Missing terms */}
              <div className="glass-panel" style={{ padding: '2rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)', marginTop: 0, marginBottom: '1rem', fontSize: '1.15rem' }}>
                  <XCircle size={18} /> Missing Role Keywords ({keywordInsights.missing.length})
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.2rem', marginTop: 0 }}>
                  Add these target skills/requirements to your resume to increase compatibility and score higher.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {keywordInsights.missing.length > 0 ? (
                    keywordInsights.missing.slice(0, 30).map((word, i) => (
                      <span key={i} style={{
                        padding: '0.35rem 0.75rem',
                        background: 'rgba(239, 68, 68, 0.08)',
                        borderRadius: '20px',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: 'var(--danger)',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        textTransform: 'capitalize'
                      }}>
                        {word}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: 'var(--success)', fontSize: '0.9rem', fontWeight: 500 }}>Incredible! You matched all major keywords.</span>
                  )}
                  {keywordInsights.missing.length > 30 && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', alignSelf: 'center', paddingLeft: '0.2rem' }}>
                      + {keywordInsights.missing.length - 30} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Strengths & Weaknesses */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', marginTop: 0, marginBottom: '1.5rem', fontSize: '1.15rem' }}>
                <CheckCircle size={20} /> Resume Strengths
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {result.strengths.map((s, i) => (
                  <li key={i} style={{
                    padding: '0.75rem 1rem',
                    background: 'rgba(16, 185, 129, 0.08)',
                    borderRadius: '8px',
                    borderLeft: '3px solid var(--success)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    lineHeight: 1.5
                  }}>
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)', marginTop: 0, marginBottom: '1.5rem', fontSize: '1.15rem' }}>
                <XCircle size={20} /> Areas to Improve
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {result.weaknesses.map((w, i) => (
                  <li key={i} style={{
                    padding: '0.75rem 1rem',
                    background: 'rgba(239, 68, 68, 0.08)',
                    borderRadius: '8px',
                    borderLeft: '3px solid var(--danger)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    lineHeight: 1.5
                  }}>
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Suggestions */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warning)', marginTop: 0, marginBottom: '1.5rem', fontSize: '1.15rem' }}>
              <AlertTriangle size={20} /> Suggestions for Improvement
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
              {result.suggestions.map((s, i) => (
                <div key={i} style={{
                  padding: '1rem 1.25rem',
                  background: 'rgba(245, 158, 11, 0.08)',
                  borderRadius: '8px',
                  borderLeft: '3px solid var(--warning)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'flex-start'
                }}>
                  <Award size={16} color="var(--warning)" style={{ flexShrink: 0, marginTop: '3px' }} />
                  {s}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        .resume-upload-zone:hover {
          border-color: var(--accent-primary) !important;
          background: rgba(99, 102, 241, 0.05) !important;
        }
      `}} />
    </div>
  );
}

