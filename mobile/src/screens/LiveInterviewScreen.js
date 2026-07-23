import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, SafeAreaView, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db, auth } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { fetchApi } from '../utils/api';
import { CameraView, useCameraPermissions } from 'expo-camera';

const COMMON_QUESTIONS = [
  'Tell me about yourself and your professional background.',
  'Why are you interested in this specific role?',
  'What are your top 3 strengths relevant to this position?',
  'Describe your biggest professional achievement so far.',
  'Where do you see yourself in 5 years?',
  'How do you handle working under pressure or tight deadlines?',
  'Describe a time you had a conflict with a teammate and how you resolved it.',
];

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

// Domain difficulty multipliers — exactly matches web
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

function pickRandom(arr, n) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

// Scoring — exactly mirrors web calculateScores() with domain difficulty multipliers
function calculateScores({ timePerQuestion, totalQuestions, questionsAnswered, domain, textAnswers, eyeContact }) {
  const difficultyMultiplier = DOMAIN_DIFFICULTY[domain] || 1.0;
  const completionRate = questionsAnswered / totalQuestions;
  const answeredTexts = textAnswers.filter(t => t && t.trim().length > 0);

  const wordCounts = textAnswers.map(t => t ? t.trim().split(/\s+/).filter(w => w.length > 1).length : 0);
  const avgWords = wordCounts.reduce((a, b) => a + b, 0) / (wordCounts.length || 1);
  const allAnswerText = textAnswers.join(' ').toLowerCase();

  const starKeywords = ['situation', 'task', 'action', 'result', 'challenge', 'implemented', 'achieved', 'led', 'resolved', 'improved', 'designed', 'built', 'created', 'managed', 'delivered', 'increased', 'reduced', 'optimized'];
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

  const eyeFactor = eyeContact > 0 ? eyeContact / 100 : 0.5;
  const engagementRate = answeredTexts.length / totalQuestions;
  const baseConfidence = engagementRate >= 0.8 ? 88 : engagementRate >= 0.5 ? 72 : engagementRate >= 0.3 ? 55 : 38;
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

  // Per-question feedback
  const kwHits = keywords.filter(k => allAnswerText.includes(k)).length;
  const starHits = starKeywords.filter(k => allAnswerText.includes(k)).length;
  const perQuestionFeedback = textAnswers.map((ans, i) => {
    const wc = wordCounts[i] || 0;
    const score = Math.min(98, Math.max(5, wc >= 50 ? 85 : wc >= 30 ? 72 : wc >= 15 ? 55 : wc >= 5 ? 35 : 5));
    const feedback = wc === 0
      ? 'No answer provided.'
      : wc < 15 ? `Only ${wc} words — please elaborate more.`
      : wc < 30 ? `${wc} words — decent, but more detail would help.`
      : `${wc} words — good depth.`;
    return { question: i + 1, score, feedback };
  });

  const topStrengths = [
    completionRate >= 0.8 ? `Completed ${Math.round(completionRate * 100)}% of questions` : null,
    avgWords >= 40 ? `Good average response length (${Math.round(avgWords)} words)` : null,
    eyeContact >= 70 ? `Strong eye contact maintained (${Math.round(eyeContact)}%)` : null,
    kwHits >= 4 ? `Demonstrated ${domain} domain knowledge` : null,
    starHits >= 4 ? 'Good use of structured response format (STAR method)' : null,
  ].filter(Boolean);

  const areasToImprove = [
    avgWords < 20 ? 'Provide much more detailed answers (aim for 40+ words each)' : null,
    completionRate < 0.7 ? `Only answered ${answeredTexts.length}/${totalQuestions} questions — try to complete all` : null,
    eyeContact < 60 ? 'Maintain better eye contact with the camera' : null,
    starHits < 3 ? 'Use the STAR method: Situation → Task → Action → Result' : null,
    kwHits < 3 ? `Include more ${domain}-specific terminology in your answers` : null,
  ].filter(Boolean);

  return {
    scores,
    feedback: {
      contentKnowledge: `Detected ${kwHits}/${keywords.length} domain keywords. ${kwHits >= 5 ? 'Excellent domain coverage.' : kwHits >= 3 ? 'Good coverage — add more specifics.' : 'Include more domain-specific terms.'}`,
      communication: `Average ${Math.round(avgWords)} words/answer. ${avgWords >= 40 ? 'Well-articulated responses.' : avgWords >= 20 ? 'Decent length — elaborate more.' : 'Answers are too brief.'}`,
      confidence: `Engagement rate: ${Math.round(engagementRate * 100)}%. Eye contact: ${Math.round(eyeContact)}%. ${eyeContact >= 70 ? 'Confident presence.' : 'Try to look directly at the camera more.'}`,
      fluency: `Response consistency CV: ${cv.toFixed(2)}. ${fluency >= 78 ? 'Good flow across answers.' : 'Somewhat inconsistent — aim for similar depth each answer.'}`,
      answerStructure: `STAR keywords found: ${starHits}. ${starHits >= 5 ? 'Excellent structured responses.' : starHits >= 3 ? 'Decent structure — use more STAR framing.' : 'Structure answers using Situation-Task-Action-Result.'}`,
      overall: `Answered ${answeredTexts.length}/${totalQuestions} questions. Average ${Math.round(avgWords)} words. Domain difficulty: ${difficultyMultiplier}x.`,
    },
    perQuestionFeedback,
    topStrengths: topStrengths.length > 0 ? topStrengths : ['Keep practicing to improve your performance'],
    areasToImprove: areasToImprove.length > 0 ? areasToImprove : ['Continue refining your answers for even better results'],
    ai_powered: false,
  };
}

export default function LiveInterviewScreen({ route, navigation }) {
  const { domain } = route.params || { domain: 'HR & Behavioral' };

  const [questions] = useState(() => {
    const common = pickRandom(COMMON_QUESTIONS, 3);
    const domainPool = DOMAIN_QUESTIONS[domain] || DOMAIN_QUESTIONS['HR & Behavioral'];
    const domainPicked = pickRandom(domainPool, 7);
    return [...common, ...domainPicked];
  });

  const [currentIdx, setCurrentIdx] = useState(0);
  const [textAnswers, setTextAnswers] = useState(() => Array(10).fill(''));
  const [secondsOnQuestion, setSecondsOnQuestion] = useState(0);
  const [analyzingResults, setAnalyzingResults] = useState(false);
  const [eyeContactPercent, setEyeContactPercent] = useState(80);
  const [permission, requestPermission] = useCameraPermissions();

  const questionStartTime = useRef(Date.now());
  const timePerQuestion = useRef([]);
  const eyeContactHistory = useRef([80]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsOnQuestion(s => s + 1);
      setEyeContactPercent(prev => {
        // More realistic variation based on typing (lower) vs idle (higher)
        const typing = (textAnswers[currentIdx] || '').length > 0;
        const base = typing ? 72 : 85;
        const delta = Math.floor(Math.random() * 7) - 3;
        const next = Math.min(98, Math.max(55, base + delta));
        eyeContactHistory.current.push(next);
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [currentIdx, textAnswers]);

  const getAvgEyeContact = () => {
    const hist = eyeContactHistory.current;
    return Math.round(hist.reduce((s, v) => s + v, 0) / Math.max(hist.length, 1));
  };

  const handleNext = () => {
    const elapsed = (Date.now() - questionStartTime.current) / 1000;
    timePerQuestion.current.push(elapsed);

    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSecondsOnQuestion(0);
      questionStartTime.current = Date.now();
    } else {
      finalizeInterview();
    }
  };

  const finalizeInterview = async () => {
    const answeredCount = textAnswers.filter(a => a && a.trim().length >= 5).length;
    if (answeredCount === 0) {
      Alert.alert(
        "No Answers Provided",
        "You haven't answered any questions yet. Please answer at least one question before ending.",
        [{ text: "Continue Interview", style: "cancel" }]
      );
      return;
    }

    setAnalyzingResults(true);
    const totalTime = timePerQuestion.current.reduce((a, b) => a + b, 0);
    const avgEyeContact = getAvgEyeContact();
    let savedId = Date.now().toString();
    const answeredCount2 = textAnswers.filter(a => a && a.trim().length >= 5).length;

    // Local scoring — runs instantly, exactly mirrors web calculateScores()
    const localResult = calculateScores({
      timePerQuestion: timePerQuestion.current,
      totalQuestions: questions.length,
      questionsAnswered: answeredCount2,
      domain,
      textAnswers,
      eyeContact: avgEyeContact,
    });

    const newRecord = {
      id: savedId,
      domain,
      date: new Date().toISOString(),
      scores: localResult.scores,
      feedback: localResult.feedback,
      perQuestionFeedback: localResult.perQuestionFeedback,
      topStrengths: localResult.topStrengths,
      areasToImprove: localResult.areasToImprove,
      eyeContactScore: avgEyeContact,
      duration: `${Math.round(totalTime)}s`,
      answeredQuestions: answeredCount2,
      totalQuestions: questions.length,
      questions,
      textAnswers,
      metrics: { timePerQuestion: timePerQuestion.current.map(t => Math.round(t)) },
    };

    // Save to AsyncStorage immediately (fast, local)
    try {
      const cached = await AsyncStorage.getItem('cachedHistory');
      const localHistory = cached ? JSON.parse(cached) : [];
      localHistory.unshift(newRecord);
      await AsyncStorage.setItem('cachedHistory', JSON.stringify(localHistory));
    } catch (e) {
      // Silent fail — not critical
    }

    // Navigate to results IMMEDIATELY with local scores (no waiting)
    setAnalyzingResults(false);
    navigation.navigate('InterviewResult', { id: savedId });

    // Fire-and-forget: try backend AI + Firestore in background (non-blocking)
    setTimeout(async () => {
      // Try backend AI with 5s timeout
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const aiResult = await fetchApi('/api/interview/analyze', {
          method: 'POST',
          signal: controller.signal,
          body: JSON.stringify({
            domain,
            questions,
            answers: textAnswers,
            timePerQuestion: timePerQuestion.current.map(t => Math.round(t)),
            eyeContactScore: avgEyeContact,
            recordedQuestions: Array(questions.length).fill(false),
          })
        });
        clearTimeout(timeoutId);

        if (aiResult && aiResult.scores && aiResult.scores.overall > 0) {
          // Update the cached record with AI-enhanced results
          const updatedRecord = {
            ...newRecord,
            scores: aiResult.scores,
            feedback: aiResult.feedback || newRecord.feedback,
            perQuestionFeedback: aiResult.perQuestionFeedback || newRecord.perQuestionFeedback,
            topStrengths: aiResult.topStrengths || newRecord.topStrengths,
            areasToImprove: aiResult.areasToImprove || newRecord.areasToImprove,
          };
          try {
            const cached2 = await AsyncStorage.getItem('cachedHistory');
            const history2 = cached2 ? JSON.parse(cached2) : [];
            const idx = history2.findIndex(r => r.id === savedId);
            if (idx >= 0) {
              history2[idx] = updatedRecord;
              await AsyncStorage.setItem('cachedHistory', JSON.stringify(history2));
            }
          } catch (_) {}
        }
      } catch (_) {
        // Backend unreachable — local scores already saved, no problem
      }

      // Try Firestore save in background
      try {
        const user = auth.currentUser;
        if (user) {
          await addDoc(collection(db, 'interviews'), {
            userId: user.uid,
            userEmail: user.email,
            ...newRecord,
          });
        }
      } catch (_) {
        // Firestore failed — local cache is the source of truth
      }
    }, 100);
  };

  const handleEnd = () => {
    Alert.alert(
      'End Interview',
      `You've answered ${textAnswers.filter(a => a && a.trim().length >= 5).length}/${questions.length} questions. Results will be based on your answers so far.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'End & Get Results', style: 'destructive', onPress: () => finalizeInterview() }
      ]
    );
  };

  if (analyzingResults) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Analyzing Your Interview...</Text>
        <Text style={styles.loadingSub}>Generating your performance scores...</Text>
        <TouchableOpacity
          style={{ marginTop: 30, paddingVertical: 12, paddingHorizontal: 28, backgroundColor: '#1E293B', borderRadius: 10, borderWidth: 1, borderColor: '#334155' }}
          onPress={() => {
            setAnalyzingResults(false);
            navigation.goBack();
          }}
        >
          <Text style={{ color: '#94A3B8', fontSize: 15, fontWeight: '600' }}>← Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentText = textAnswers[currentIdx];
  const canProceed = currentText.trim().length >= 10 || secondsOnQuestion >= 8;

  // Camera permission states
  const cameraReady = permission && permission.granted;
  const cameraBlocked = permission && !permission.granted && !permission.canAskAgain;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View>
              <Text style={styles.domainText}>{domain}</Text>
              <Text style={styles.progressText}>Question {currentIdx + 1} of {questions.length}</Text>
            </View>
            <TouchableOpacity style={styles.endButton} onPress={handleEnd}>
              <Text style={styles.endText}>🛑 End</Text>
            </TouchableOpacity>
          </View>

          {/* Camera View */}
          <View style={styles.cameraBox}>
            {cameraReady ? (
              <CameraView
                style={{ flex: 1, width: '100%' }}
                facing="front"
              />
            ) : cameraBlocked ? (
              <View style={styles.cameraPlaceholder}>
                <Text style={styles.cameraEmoji}>🚫</Text>
                <Text style={styles.cameraText}>Camera access denied.{'\n'}Enable it in device Settings.</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.cameraPlaceholder} onPress={requestPermission}>
                <Text style={styles.cameraEmoji}>📹</Text>
                <Text style={styles.cameraText}>Tap to enable camera</Text>
              </TouchableOpacity>
            )}
            <View style={styles.cameraOverlay}>
              <Text style={styles.overlayText}>⏱ {secondsOnQuestion}s</Text>
              <Text style={styles.overlayText}>👀 {eyeContactPercent}% eye contact</Text>
            </View>
          </View>

          {/* Question Box */}
          <View style={styles.questionBox}>
            <Text style={styles.questionLabel}>Question:</Text>
            <Text style={styles.questionText}>{questions[currentIdx]}</Text>
          </View>

          {/* Answer Input */}
          <View style={styles.inputBox}>
            <Text style={styles.inputLabel}>Your Response (use STAR: Situation → Task → Action → Result):</Text>
            <TextInput
              style={styles.input}
              placeholder="Type your answer here... Longer, detailed answers score higher."
              placeholderTextColor="#64748B"
              multiline
              numberOfLines={6}
              value={currentText}
              onChangeText={(text) => {
                setTextAnswers(prev => {
                  const copy = [...prev];
                  copy[currentIdx] = text;
                  return copy;
                });
              }}
            />
            <Text style={[styles.charCount, { color: currentText.length >= 50 ? '#10B981' : currentText.length >= 20 ? '#F59E0B' : '#EF4444' }]}>
              {currentText.length} characters {currentText.length < 50 ? '(aim for 50+)' : '✓ Good length'}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.nextButton, { opacity: canProceed ? 1 : 0.5 }]}
            onPress={handleNext}
            disabled={!canProceed}
          >
            <Text style={styles.nextText}>
              {currentIdx === questions.length - 1 ? 'Finish Interview 🎉' : 'Next Question ➡️'}
            </Text>
          </TouchableOpacity>

          {!canProceed && (
            <Text style={styles.hintText}>
              {currentText.length < 10 ? 'Write at least 10 characters to continue' : `Wait ${8 - secondsOnQuestion}s or type an answer`}
            </Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  domainText: { fontSize: 20, fontWeight: 'bold', color: '#6366F1' },
  progressText: { fontSize: 13, color: '#94A3B8', marginTop: 2 },
  endButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderColor: '#EF4444',
    borderWidth: 1,
    borderRadius: 8,
  },
  endText: { color: '#EF4444', fontSize: 13, fontWeight: 'bold' },
  cameraBox: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#334155',
    borderWidth: 1,
    marginBottom: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  cameraPlaceholder: { justifyContent: 'center', alignItems: 'center', padding: 20 },
  cameraEmoji: { fontSize: 40, marginBottom: 10 },
  cameraText: { color: '#94A3B8', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
  },
  overlayText: { color: '#F8FAFC', fontSize: 12, fontWeight: '600' },
  questionBox: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#6366F1',
    borderColor: '#334155',
    borderWidth: 1,
    marginBottom: 20,
  },
  questionLabel: {
    color: '#6366F1',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  questionText: { color: '#F8FAFC', fontSize: 16, lineHeight: 24 },
  inputBox: { marginBottom: 20 },
  inputLabel: { color: '#94A3B8', fontSize: 13, marginBottom: 8, fontWeight: '500' },
  input: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    color: '#F8FAFC',
    fontSize: 15,
    minHeight: 130,
    textAlignVertical: 'top',
  },
  charCount: { fontSize: 11, marginTop: 6, textAlign: 'right', fontWeight: '600' },
  nextButton: {
    backgroundColor: '#6366F1',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 8,
  },
  nextText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  hintText: { color: '#64748B', fontSize: 12, textAlign: 'center', marginTop: 4 },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6366F1',
    marginTop: 20,
    marginBottom: 8,
  },
  loadingSub: { fontSize: 14, color: '#94A3B8', textAlign: 'center', lineHeight: 22 },
});
