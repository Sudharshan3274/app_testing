import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Video, Mic, StopCircle, ArrowRight, CheckCircle2, Eye, EyeOff } from 'lucide-react';

// ─── Common / Behavioral pool (always pick 3 randomly) ───────────────────────
const COMMON_QUESTIONS = [
  'Tell me about yourself and your professional background.',
  'Why are you interested in this specific role?',
  'What are your top 3 strengths relevant to this position?',
  'Describe your biggest professional achievement so far.',
  'Where do you see yourself in 5 years?',
  'How do you handle working under pressure or tight deadlines?',
  'Describe a time you had a conflict with a teammate and how you resolved it.',
];

// ─── Domain-specific pools (pick 7 randomly) ─────────────────────────────────
const DOMAIN_QUESTIONS = {
  'HR & Behavioral': [
    'Describe a challenging situation at work and how you handled it.',
    'Give an example of when you showed leadership.',
    'How do you prioritize tasks when you have multiple deadlines?',
    'Tell me about a time you failed and what you learned from it.',
    'How do you handle feedback and criticism?',
    'Describe a time you went above and beyond for a project.',
    'What motivates you in your professional life?',
    'How do you adapt to sudden changes in a project?',
    'Tell me about a time you worked effectively in a team.',
    'What is your approach to problem-solving?',
    'Describe a time you had to persuade stakeholders.',
    'How do you manage your time and stay organized?',
    'Tell me about your most challenging project.',
    'What are your short-term professional goals?',
    'Describe your ideal work environment.',
    'How do you handle ambiguous or unclear requirements?',
    'Tell me about a time you proactively solved a problem before it escalated.',
    'How do you stay updated with industry trends?',
    'What values are most important to you in a workplace?',
    'Describe a time you had to learn something very quickly.',
    'How do you build trust with your coworkers?',
    'What strategies do you use for managing stress?',
    'Tell me about a time you mentored or helped a colleague.',
    'How do you approach setting goals for yourself?',
    'Describe a situation where you had to make a difficult decision quickly.',
    'How have you dealt with a difficult manager or coworker?',
    'What does success look like to you professionally?',
    'How do you ensure accountability in your work?',
    'Tell me about a project you are especially proud of.',
    'How do you handle receiving conflicting instructions from different managers?',
  ],
  'Frontend Developer': [
    'Explain the Virtual DOM and how React uses it to optimize rendering.',
    'What are React Hooks and why were they introduced in React 16.8?',
    'How do you optimize the performance of a React application?',
    'Explain the CSS box model in detail.',
    'What is the difference between == and === in JavaScript?',
    'What is event delegation and why is it useful?',
    'Explain the difference between localStorage, sessionStorage, and cookies.',
    'What is a Promise and how does async/await work in JavaScript?',
    'How does the browser render a web page (critical rendering path)?',
    'What is CSS specificity and how does the cascade work?',
    'Explain closures in JavaScript with an example.',
    'What is the difference between flexbox and CSS Grid?',
    'How do you handle state management in a large React app?',
    'What is lazy loading and code splitting in React?',
    'Explain the concept of hydration in server-side rendering.',
    'What are Web Vitals (LCP, FID, CLS) and how do you improve them?',
    'How does CORS work and how do you handle it in a frontend app?',
    'What is the difference between controlled and uncontrolled components in React?',
    'Explain the useEffect cleanup function and when to use it.',
    'How do you implement accessibility (a11y) in a web application?',
    'What is the difference between useMemo and useCallback?',
    'How would you implement infinite scroll in React?',
    'What is tree shaking and how does it work in webpack/Vite?',
    'Explain the concept of a service worker and its use in PWAs.',
    'What is the Shadow DOM and how does it relate to Web Components?',
    'How do you handle forms and validation in React?',
    'What are the key differences between React 17 and React 18?',
    'Explain how TypeScript improves maintainability in large React projects.',
    'What testing strategies do you use for React components?',
    'How do you handle error boundaries in React?',
  ],
  'Backend Developer': [
    'What is the difference between REST and GraphQL?',
    'Explain database normalization (1NF, 2NF, 3NF) and why it matters.',
    'How would you design a URL shortener service at scale?',
    'What is the difference between SQL and NoSQL databases? When to use each?',
    'How do you handle API authentication using JWT?',
    'Explain the CAP theorem in distributed systems.',
    'What is database indexing and how does it improve performance?',
    'How do you implement rate limiting in an API?',
    'What is a message queue and when would you use one?',
    'Explain the difference between horizontal and vertical scaling.',
    'What is database connection pooling and why is it important?',
    'How do you handle database migrations in a production system?',
    'What is the N+1 query problem and how do you solve it?',
    'Explain the difference between synchronous and asynchronous processing.',
    'How do you implement caching in a backend system?',
    'What is microservices architecture and what are its trade-offs?',
    'How do you handle transactions across multiple services?',
    'What is Docker and how does containerization help in backend development?',
    'Explain idempotency in REST APIs.',
    'How do you design a system to handle 1 million concurrent users?',
    'What is event sourcing and how does it differ from CRUD?',
    'How do you secure an API against common vulnerabilities?',
    'What is the difference between SOAP and REST?',
    'Explain blue-green deployments and canary releases.',
    'What is a distributed cache and when would you use Redis vs Memcached?',
    'How do you monitor and trace requests in a microservices architecture?',
    'Explain the concept of eventual consistency.',
    'What is a circuit breaker pattern and when do you use it?',
    'How do you handle secrets management in a backend application?',
    'What are the trade-offs between a monolith and microservices?',
  ],
  'Data Scientist': [
    'What is overfitting and how do you prevent it?',
    'Explain how a Random Forest algorithm works.',
    'What is the p-value and how do you interpret it in hypothesis testing?',
    'What is the difference between supervised, unsupervised, and reinforcement learning?',
    'How do you handle missing data in a dataset?',
    'Explain the bias-variance tradeoff.',
    'What is regularization and when would you use L1 vs L2?',
    'How does gradient descent work?',
    'What is cross-validation and why do we use it?',
    'Explain the ROC curve and AUC score.',
    'What is PCA and when would you apply dimensionality reduction?',
    'How do you handle class imbalance in a dataset?',
    'What is feature engineering and why is it important?',
    'Explain the difference between bagging and boosting.',
    'What metrics would you use to evaluate a classification model?',
    'How do you detect and handle outliers?',
    'What is the difference between correlation and causation?',
    'Explain how a neural network learns through backpropagation.',
    'What is the curse of dimensionality?',
    'How do you approach an A/B test from start to finish?',
    'What is the difference between a parametric and non-parametric test?',
    'Explain how k-means clustering works.',
    'What is transfer learning and when would you use it?',
    'How do you interpret SHAP values?',
    'What is the difference between precision and recall?',
    'Explain the concept of attention mechanisms in transformers.',
    'How do you deploy a machine learning model to production?',
    'What is data leakage and how do you prevent it?',
    'Explain time-series forecasting approaches.',
    'How do you handle high-dimensional sparse data?',
  ],
  'Product Manager': [
    'How do you prioritize features in a product backlog?',
    'Describe a product you think is poorly designed and why.',
    'How do you measure the success of a product launch?',
    'How do you collaborate with engineering and design teams?',
    'Tell me about a product decision you made that failed.',
    'How do you gather and incorporate user feedback into the product roadmap?',
    'Explain the concept of MVP (Minimum Viable Product).',
    'How do you define user personas and use them in product decisions?',
    'What metrics do you use to measure product-market fit?',
    'How do you handle competing stakeholder priorities?',
    'Describe your process for writing a Product Requirements Document (PRD).',
    'How do you decide when to cut features vs launch on time?',
    'What is your approach to competitive analysis?',
    'How do you work with data to make product decisions?',
    'What frameworks do you use for product strategy (e.g., OKRs, RICE)?',
    'How do you handle a situation where engineering says a feature is impossible?',
    'Describe a time you launched a feature that users did not adopt as expected.',
    'How do you balance short-term revenue vs long-term user experience?',
    'What does good product discovery look like to you?',
    'How do you measure and improve user retention?',
    'What is your process for running a discovery sprint?',
    'How do you communicate a product vision to a diverse audience?',
    'Describe how you would sunset an underperforming feature.',
    'What is North Star Metric and how do you choose one?',
    'How do you handle a scenario where the data contradicts user feedback?',
    'Describe your experience with agile ceremonies and their value.',
    'How do you build empathy for users who are very different from yourself?',
    'What is opportunity sizing and how do you do it?',
    'How do you create alignment on product priorities across teams?',
    'Describe a time you had to pivot your product strategy mid-cycle.',
  ],
  'UI/UX Designer': [
    'Walk me through your design process for a new feature.',
    'How do you handle negative feedback on your designs?',
    'Explain the difference between responsive and adaptive design.',
    'How do you conduct user research effectively?',
    'What tools do you use for wireframing and prototyping?',
    'How do you ensure accessibility in your designs?',
    'What is design thinking and how do you apply it?',
    'How do you design for mobile-first?',
    'Explain the 80/20 rule (Pareto principle) in UX.',
    'How do you measure the success of a UX design?',
    'What is a design system and why is it important?',
    'How do you balance aesthetics vs usability?',
    'Describe a time when user research changed your design direction.',
    'What is Gestalt theory and how does it apply to UI design?',
    'How do you approach designing for users with disabilities?',
    'What is the difference between UX and UI?',
    'How do you handle a brief where business goals conflict with user needs?',
    'What is information architecture and why does it matter?',
    'How do you present your design decisions to stakeholders?',
    'Describe your process for usability testing.',
    'What is a jobs-to-be-done framework and how do you use it?',
    'How do you handle designing for multiple screen sizes and densities?',
    'What role does typography play in UX design?',
    'How do you create inclusive designs for diverse user groups?',
    'Describe your approach to interaction design and micro-interactions.',
    'How do you document design decisions for handoff to developers?',
    'What is cognitive load and how do you reduce it in your designs?',
    'How do you conduct a heuristic evaluation?',
    'Describe a situation where you had to redesign an existing feature.',
    'How do you stay current with UI/UX trends without blindly following them?',
  ],
};

// Domain difficulty multipliers
const DOMAIN_DIFFICULTY = {
  'HR & Behavioral': 1.0,
  'Frontend Developer': 1.05,
  'Backend Developer': 1.08,
  'Data Scientist': 1.1,
  'Product Manager': 1.03,
  'UI/UX Designer': 1.02,
};

const IDEAL_MIN_TIME = 30;
const IDEAL_MAX_TIME = 120;
const IDEAL_SWEET_SPOT = 60;

function scoreTimeSpent(seconds) {
  if (seconds <= 3) return 10;
  if (seconds < 10) return 25;
  if (seconds < IDEAL_MIN_TIME) return Math.round(40 + (seconds / IDEAL_MIN_TIME) * 30);
  if (seconds <= IDEAL_SWEET_SPOT) {
    const ratio = (seconds - IDEAL_MIN_TIME) / (IDEAL_SWEET_SPOT - IDEAL_MIN_TIME);
    return Math.round(75 + ratio * 20);
  }
  if (seconds <= IDEAL_MAX_TIME) {
    return Math.round(95 - ((seconds - IDEAL_SWEET_SPOT) / (IDEAL_MAX_TIME - IDEAL_SWEET_SPOT)) * 10);
  }
  const overTime = seconds - IDEAL_MAX_TIME;
  return Math.max(50, Math.round(85 - overTime * 0.5));
}

function calculateScores({ timePerQuestion, recordedQuestions, totalQuestions, questionsAnswered, domain, textAnswers }) {
  const difficultyMultiplier = DOMAIN_DIFFICULTY[domain] || 1.0;
  const completionRate = questionsAnswered / totalQuestions;
  const answeredTexts = textAnswers.filter(t => t && t.trim().length > 0);

  const wordCounts = textAnswers.map(t => t ? t.trim().split(/\s+/).filter(w => w.length > 1).length : 0);
  const avgWords = wordCounts.reduce((a, b) => a + b, 0) / (wordCounts.length || 1);

  const starKeywords = ['situation', 'task', 'action', 'result', 'challenge', 'implemented', 'achieved', 'led', 'resolved', 'improved', 'designed', 'built', 'created', 'managed', 'delivered', 'increased', 'reduced', 'optimized'];
  const allAnswerText = textAnswers.join(' ').toLowerCase();
  const starScore = Math.min(100, starKeywords.filter(k => allAnswerText.includes(k)).length * 6);

  const domainKeywords = {
    'HR & Behavioral': ['team', 'leadership', 'conflict', 'communication', 'stakeholder', 'deadline', 'priority', 'feedback', 'motivation', 'growth'],
    'Frontend Developer': ['react', 'component', 'state', 'hook', 'dom', 'css', 'javascript', 'api', 'performance', 'render', 'async', 'promise'],
    'Backend Developer': ['api', 'database', 'server', 'rest', 'sql', 'cache', 'scale', 'microservice', 'docker', 'authentication', 'query', 'index'],
    'Data Scientist': ['model', 'training', 'data', 'feature', 'accuracy', 'algorithm', 'prediction', 'regression', 'classification', 'overfitting', 'validation'],
    'Product Manager': ['user', 'feature', 'roadmap', 'stakeholder', 'metric', 'priority', 'launch', 'feedback', 'customer', 'revenue', 'sprint'],
    'UI/UX Designer': ['user', 'wireframe', 'prototype', 'accessibility', 'design', 'usability', 'research', 'persona', 'flow', 'interface', 'feedback'],
  };
  const keywords = domainKeywords[domain] || [];
  const knowledgeScore = Math.min(100, keywords.filter(k => allAnswerText.includes(k)).length * 9);

  const wordScore = avgWords >= 50 ? 92 : avgWords >= 30 ? 80 : avgWords >= 15 ? 65 : avgWords >= 5 ? 48 : 30;
  const timeScores = timePerQuestion.map(t => scoreTimeSpent(t));
  const avgTimeScore = timeScores.reduce((a, b) => a + b, 0) / (timeScores.length || 1);
  const communication = Math.min(98, Math.round(wordScore * 0.6 + avgTimeScore * 0.25 + completionRate * 15));

  const engagementRate = answeredTexts.length / totalQuestions;
  const recordedCount = recordedQuestions.filter(Boolean).length;
  const recordingRate = recordedCount / totalQuestions;
  const combinedEngagement = engagementRate * 0.6 + recordingRate * 0.4;
  const baseConfidence = combinedEngagement >= 0.8 ? 88 : combinedEngagement >= 0.5 ? 72 : combinedEngagement >= 0.3 ? 55 : 38;
  const confidence = Math.min(98, Math.round(baseConfidence * 0.7 + avgTimeScore * 0.3));

  const validWords = wordCounts.filter(w => w > 2);
  const avgW = validWords.reduce((a, b) => a + b, 0) / (validWords.length || 1);
  const variance = validWords.reduce((s, w) => s + Math.pow(w - avgW, 2), 0) / (validWords.length || 1);
  const cv = avgW > 0 ? Math.sqrt(variance) / avgW : 1;
  const consistencyScore = cv < 0.3 ? 90 : cv < 0.5 ? 78 : cv < 0.7 ? 63 : 45;
  const fluency = Math.min(98, Math.round(consistencyScore * 0.7 + avgTimeScore * 0.3));

  const answerStructure = Math.min(98, Math.round(starScore * 0.7 + completionRate * 20 + (avgWords > 20 ? 10 : 0)));

  const contentKnowledge = Math.min(98, Math.round(knowledgeScore * 0.65 + completionRate * 25 + (difficultyMultiplier - 1.0) * 200));

  const applyDifficulty = (score) => Math.min(98, Math.round(score * difficultyMultiplier));

  const scores = {
    contentKnowledge: applyDifficulty(contentKnowledge),
    communication: applyDifficulty(communication),
    confidence: applyDifficulty(confidence),
    fluency: applyDifficulty(fluency),
    answerStructure: applyDifficulty(answerStructure),
  };
  scores.overall = Math.round(
    (scores.contentKnowledge + scores.communication + scores.confidence + scores.fluency + scores.answerStructure) / 5
  );
  return scores;
}

/** Shuffle array and return first n elements */
function pickRandom(arr, n) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

export default function LiveInterview() {
  const location = useLocation();
  const navigate = useNavigate();
  const domain = location.state?.domain || 'HR & Behavioral';
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  // Build the 10-question set once on mount
  const [questions] = useState(() => {
    const common = pickRandom(COMMON_QUESTIONS, 3);
    const domainPool = DOMAIN_QUESTIONS[domain] || DOMAIN_QUESTIONS['HR & Behavioral'];
    const domainPicked = pickRandom(domainPool, 7);
    return [...common, ...domainPicked];
  });

  const [cameraReady, setCameraReady] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);

  // Per-question text answers
  const [textAnswers, setTextAnswers] = useState(() => Array(10).fill(''));

  // Tracking metrics
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [timePerQuestion, setTimePerQuestion] = useState([]);
  const [recordedQuestions, setRecordedQuestions] = useState([]);
  const [wasRecordingThisQuestion, setWasRecordingThisQuestion] = useState(false);

  // Timer-based fallback: seconds spent on current question
  const [secondsOnQuestion, setSecondsOnQuestion] = useState(0);

  // ── Eye Tracking State ──
  const [eyeContactActive, setEyeContactActive] = useState(true);  // is user looking at camera RIGHT NOW
  const [eyeContactPercent, setEyeContactPercent] = useState(100);
  const eyeTrackRef = useRef({ lookingFrames: 0, totalFrames: 0, faceMesh: null, animFrame: null });
  const canvasRef = useRef(null);
  const [analyzingResults, setAnalyzingResults] = useState(false);

  // ── Next button enabled when: text ≥15 chars OR ≥10 s on this question ──
  const currentText = textAnswers[currentQuestionIdx] || '';
  const canProceed = currentText.length >= 15 || secondsOnQuestion >= 10;

  // Camera setup + Eye Tracking
  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = mediaStream;
        if (videoRef.current) videoRef.current.srcObject = mediaStream;
        setCameraReady(true);
        // Initialize eye tracking after camera is ready
        initEyeTracking();
      } catch (err) {
        console.error('Camera error:', err);
        setCameraReady(false);
      }
    };
    startCamera();
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (eyeTrackRef.current.animFrame) cancelAnimationFrame(eyeTrackRef.current.animFrame);
    };
  }, []);

  // ── Eye Tracking with MediaPipe FaceMesh ──
  const initEyeTracking = useCallback(async () => {
    try {
      // Dynamically load MediaPipe FaceMesh via CDN
      const FaceMesh = window.FaceMesh;
      if (!FaceMesh) {
        // Load the script dynamically
        await new Promise((resolve, reject) => {
          if (document.querySelector('script[src*="face_mesh"]')) { resolve(); return; }
          const s1 = document.createElement('script');
          s1.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js';
          s1.crossOrigin = 'anonymous';
          s1.onload = resolve;
          s1.onerror = reject;
          document.head.appendChild(s1);
        });
        // Also load camera utils
        await new Promise((resolve, reject) => {
          if (document.querySelector('script[src*="camera_utils"]')) { resolve(); return; }
          const s2 = document.createElement('script');
          s2.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js';
          s2.crossOrigin = 'anonymous';
          s2.onload = resolve;
          s2.onerror = reject;
          document.head.appendChild(s2);
        });
      }

      // Wait a moment for scripts to initialize
      await new Promise(r => setTimeout(r, 500));

      if (!window.FaceMesh) {
        console.warn('FaceMesh not available, eye tracking disabled');
        return;
      }

      const faceMesh = new window.FaceMesh({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      faceMesh.onResults((results) => {
        const tracker = eyeTrackRef.current;
        tracker.totalFrames++;

        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
          const landmarks = results.multiFaceLandmarks[0];
          // Iris landmarks: left iris center = 468, right iris center = 473
          // Eye corners: left eye inner=133, outer=33 | right eye inner=362, outer=263
          const leftIris = landmarks[468];
          const rightIris = landmarks[473];
          const leftInner = landmarks[133];
          const leftOuter = landmarks[33];
          const rightInner = landmarks[362];
          const rightOuter = landmarks[263];

          if (leftIris && rightIris && leftInner && leftOuter && rightInner && rightOuter) {
            // Calculate horizontal gaze ratio for each eye
            const leftEyeWidth = Math.abs(leftOuter.x - leftInner.x);
            const leftIrisPos = (leftIris.x - leftOuter.x) / (leftEyeWidth || 0.001);
            
            const rightEyeWidth = Math.abs(rightInner.x - rightOuter.x);
            const rightIrisPos = (rightIris.x - rightOuter.x) / (rightEyeWidth || 0.001);
            
            const avgGaze = (leftIrisPos + rightIrisPos) / 2;
            
            // Looking at camera if gaze is roughly centered (0.3 to 0.7)
            const isLooking = avgGaze > 0.25 && avgGaze < 0.75;
            
            if (isLooking) {
              tracker.lookingFrames++;
            }
            setEyeContactActive(isLooking);
          }
        } else {
          // No face detected = not looking
          setEyeContactActive(false);
        }

        // Update percentage
        if (tracker.totalFrames > 0) {
          setEyeContactPercent(Math.round((tracker.lookingFrames / tracker.totalFrames) * 100));
        }
      });

      eyeTrackRef.current.faceMesh = faceMesh;

      // Process frames from video
      const processFrame = async () => {
        if (videoRef.current && videoRef.current.readyState >= 2 && eyeTrackRef.current.faceMesh) {
          try {
            await eyeTrackRef.current.faceMesh.send({ image: videoRef.current });
          } catch (e) {
            // Ignore frame processing errors
          }
        }
        eyeTrackRef.current.animFrame = requestAnimationFrame(processFrame);
      };
      
      // Start processing after a delay to let video stabilize
      setTimeout(() => {
        eyeTrackRef.current.animFrame = requestAnimationFrame(processFrame);
      }, 2000);

      console.log('[Eye Tracking] MediaPipe FaceMesh initialized');
    } catch (err) {
      console.warn('[Eye Tracking] Could not initialize:', err.message);
    }
  }, []);

  // Reset per-question state when question changes
  useEffect(() => {
    setQuestionStartTime(Date.now());
    setWasRecordingThisQuestion(isRecording);
    setSecondsOnQuestion(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIdx]);

  // Track recording mark
  useEffect(() => {
    if (isRecording) setWasRecordingThisQuestion(true);
  }, [isRecording]);

  // Tick the per-question seconds counter
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSecondsOnQuestion(s => s + 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [currentQuestionIdx]);

  const recordCurrentQuestionMetrics = useCallback(() => {
    const elapsed = (Date.now() - questionStartTime) / 1000;
    setTimePerQuestion(prev => [...prev, elapsed]);
    setRecordedQuestions(prev => [...prev, wasRecordingThisQuestion]);
  }, [questionStartTime, wasRecordingThisQuestion]);

  const finalizeInterview = useCallback(async (extraTime, extraRecorded) => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (eyeTrackRef.current.animFrame) cancelAnimationFrame(eyeTrackRef.current.animFrame);

    const finalElapsed = extraTime ?? (Date.now() - questionStartTime) / 1000;
    const finalTimePerQuestion = [...timePerQuestion, finalElapsed];
    const finalRecordedQuestions = [...recordedQuestions, extraRecorded ?? wasRecordingThisQuestion];
    const finalEyeContact = eyeContactPercent;

    // Try AI-powered analysis from backend first
    setAnalyzingResults(true);
    let scores, aiFeedback;
    try {
      const response = await fetch('http://localhost:8000/api/interview/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain,
          questions,
          answers: textAnswers,
          timePerQuestion: finalTimePerQuestion.map(t => Math.round(t)),
          eyeContactScore: finalEyeContact,
          recordedQuestions: finalRecordedQuestions,
        })
      });
      if (!response.ok) throw new Error('Backend unavailable');
      const aiResult = await response.json();
      scores = aiResult.scores;
      aiFeedback = {
        feedback: aiResult.feedback,
        perQuestionFeedback: aiResult.perQuestionFeedback,
        topStrengths: aiResult.topStrengths,
        areasToImprove: aiResult.areasToImprove,
        ai_powered: aiResult.ai_powered || false,
      };
    } catch (err) {
      console.warn('Backend AI analysis unavailable, using local scoring:', err.message);
      scores = calculateScores({
        timePerQuestion: finalTimePerQuestion,
        recordedQuestions: finalRecordedQuestions,
        totalQuestions: questions.length,
        questionsAnswered: currentQuestionIdx + 1,
        domain,
        textAnswers,
      });
      aiFeedback = { ai_powered: false };
    }
    setAnalyzingResults(false);

    const result = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      domain,
      scores,
      questions,
      textAnswers,
      eyeContactScore: finalEyeContact,
      aiFeedback,
      metrics: {
        timePerQuestion: finalTimePerQuestion.map(t => Math.round(t)),
        recordedQuestions: finalRecordedQuestions,
        totalTime: Math.round(finalTimePerQuestion.reduce((a, b) => a + b, 0)),
      },
    };

    const history = JSON.parse(localStorage.getItem('interviewHistory') || '[]');
    history.push(result);
    localStorage.setItem('interviewHistory', JSON.stringify(history));
    navigate('/interview/result/' + result.id);
  }, [currentQuestionIdx, domain, navigate, questions, questionStartTime, recordedQuestions, textAnswers, timePerQuestion, wasRecordingThisQuestion, eyeContactPercent]);

  const handleNextQuestion = () => {
    recordCurrentQuestionMetrics();
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      const elapsed = (Date.now() - questionStartTime) / 1000;
      finalizeInterview(elapsed, wasRecordingThisQuestion);
    }
  };

  const handleEndInterview = () => {
    recordCurrentQuestionMetrics();
    const elapsed = (Date.now() - questionStartTime) / 1000;
    finalizeInterview(elapsed, wasRecordingThisQuestion);
  };

  const handleTextChange = (e) => {
    const val = e.target.value;
    setTextAnswers(prev => {
      const copy = [...prev];
      copy[currentQuestionIdx] = val;
      return copy;
    });
  };

  const progress = Math.round((currentQuestionIdx / questions.length) * 100);
  const charCount = currentText.length;

  // Show analyzing overlay
  if (analyzingResults) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ width: '60px', height: '60px', border: '3px solid var(--border-color)', borderTop: '3px solid var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <h2 style={{ color: 'var(--text-primary)', margin: 0 }}>Analyzing Your Interview...</h2>
        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>AI is evaluating your responses across 5 categories</p>
        <style dangerouslySetInnerHTML={{ __html: '@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }' }} />
      </div>
    );
  }

  return (
    <div className="li-container" style={{ padding: '1.5rem', minHeight: '100vh', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
      {/* ── Header ── */}
      <div className="li-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h1 className="gradient-text li-title" style={{ fontSize: '1.6rem', margin: 0 }}>{domain}</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.2rem 0 0', fontSize: '0.85rem' }}>
            Question {currentQuestionIdx + 1} of {questions.length}
          </p>
        </div>
        <div className="li-header-actions" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {isRecording && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--danger)', fontSize: '0.8rem', fontWeight: 'bold' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--danger)', animation: 'pulse 1.5s infinite' }} />
              REC
            </div>
          )}
          <button
            className="btn-primary li-action-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: isRecording ? 'var(--danger)' : undefined }}
            onClick={() => setIsRecording(!isRecording)}
          >
            <Mic size={16} />
            <span className="li-btn-text">{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
          </button>
          <button
            className="btn-secondary li-action-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: 'var(--danger)', color: 'var(--danger)' }}
            onClick={handleEndInterview}
          >
            <StopCircle size={16} /> <span className="li-btn-text">End Interview</span>
          </button>
        </div>
      </div>

      {/* ── Progress Bar ── */}
      <div style={{ width: '100%', height: '4px', background: 'var(--border-color)', borderRadius: '2px', marginBottom: '1.25rem' }}>
        <div style={{ width: progress + '%', height: '100%', background: 'var(--accent-primary)', borderRadius: '2px', transition: 'width 0.5s ease' }} />
      </div>

      {/* ── Main Content ── */}
      <div className="li-main-content" style={{ display: 'flex', gap: '1.5rem', flex: 1, minHeight: 0 }}>

        {/* Left: Video */}
        <div className="glass-panel li-video-panel" style={{ flex: '0 0 340px', display: 'flex', flexDirection: 'column', padding: '1rem' }}>
          <div style={{ flex: 1, background: '#000', borderRadius: '10px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '220px' }}>
            {cameraReady ? (
              <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
            ) : (
              <div style={{ color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', textAlign: 'center', padding: '1rem' }}>
                <Video size={40} />
                <p style={{ margin: 0, fontSize: '0.85rem' }}>Requesting camera access…</p>
                <p style={{ margin: 0, fontSize: '0.75rem' }}>Allow permissions in your browser</p>
              </div>
            )}
          </div>

          {/* Hint bar with eye contact */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '0.6rem 0.75rem', marginTop: '0.6rem',
            background: 'rgba(255,255,255,0.03)', borderRadius: '8px',
            fontSize: '0.75rem', color: 'var(--text-secondary)'
          }}>
            <span>⏱ {secondsOnQuestion}s on this question</span>
            <span style={{ 
              display: 'flex', alignItems: 'center', gap: '0.3rem',
              color: eyeContactActive ? 'var(--success)' : 'var(--danger)', 
              fontWeight: 600 
            }}>
              {eyeContactActive ? <Eye size={13} /> : <EyeOff size={13} />}
              {eyeContactPercent}% eye contact
            </span>
          </div>

          {/* Question dots */}
          <div style={{ display: 'flex', gap: '4px', marginTop: '0.75rem', flexWrap: 'wrap' }}>
            {questions.map((_, idx) => (
              <div key={idx} style={{
                flex: '1 0 8%', height: '4px', borderRadius: '2px',
                background: idx < currentQuestionIdx ? 'var(--success)' : idx === currentQuestionIdx ? 'var(--accent-primary)' : 'var(--border-color)',
                transition: 'all 0.3s'
              }} />
            ))}
          </div>
        </div>

        {/* Right: Question + Answer */}
        <div className="glass-panel li-qa-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '2rem', gap: '1.25rem' }}>
          {/* Question label */}
          <div>
            <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {currentQuestionIdx < 3 ? '🎯 Behavioral Question' : '🧩 Domain Question'}
            </span>
          </div>

          {/* Question text */}
          <h2 className="li-question-text" style={{ fontSize: '1.35rem', lineHeight: 1.55, margin: 0, color: 'var(--text-primary)' }}>
            {questions[currentQuestionIdx]}
          </h2>

          {/* Text answer area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                ✏️ <em>Tip: type your answer below to improve your score</em>
              </label>
              <span style={{
                fontSize: '0.75rem', fontWeight: 600,
                color: charCount >= 15 ? 'var(--success)' : 'var(--text-secondary)'
              }}>
                {charCount} chars{charCount >= 15 ? ' ✓' : ' (min 15)'}
              </span>
            </div>
            <textarea
              className="li-textarea"
              value={currentText}
              onChange={handleTextChange}
              placeholder="Type your answer here… Use the STAR method: Situation, Task, Action, Result."
              style={{
                flex: 1,
                minHeight: '160px',
                width: '100%',
                boxSizing: 'border-box',
                padding: '0.9rem 1rem',
                borderRadius: '10px',
                border: `1.5px solid ${charCount >= 15 ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                background: 'rgba(255,255,255,0.04)',
                color: 'var(--text-primary)',
                fontSize: '0.95rem',
                lineHeight: 1.6,
                resize: 'vertical',
                outline: 'none',
                fontFamily: 'inherit',
                transition: 'border-color 0.2s',
              }}
            />
          </div>

          {/* Next / Finish button */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {!canProceed && (
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, textAlign: 'center' }}>
                {secondsOnQuestion < 10
                  ? `Button enables in ${10 - secondsOnQuestion}s or once you type 15+ characters`
                  : 'Button enabled — type an answer or click to proceed'}
              </p>
            )}
            <button
              className="btn-primary"
              disabled={!canProceed}
              style={{
                width: '100%',
                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
                padding: '0.9rem',
                opacity: canProceed ? 1 : 0.45,
                cursor: canProceed ? 'pointer' : 'not-allowed',
                transition: 'opacity 0.3s',
              }}
              onClick={handleNextQuestion}
            >
              {currentQuestionIdx < questions.length - 1
                ? <><span>Next Question</span> <ArrowRight size={18} /></>
                : <><span>Finish &amp; Submit</span> <CheckCircle2 size={18} /></>}
            </button>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse { 0% { opacity:1; } 50% { opacity:0.3; } 100% { opacity:1; } }
        textarea:focus { border-color: var(--accent-primary) !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
      `}} />
    </div>
  );
}
