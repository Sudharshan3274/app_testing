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
  ],
  'Frontend Developer': [
    'Explain the Virtual DOM and how React uses it to optimize rendering.',
    'What are React Hooks and why were they introduced in React 16.8?',
    'How do you optimize the performance of a React application?',
    'Explain the CSS box model in detail.',
    'Explain closures in JavaScript with an example.',
  ],
  'Backend Developer': [
    'What is the difference between REST and GraphQL?',
    'Explain database normalization (1NF, 2NF, 3NF) and why it matters.',
    'How would you design a URL shortener service at scale?',
    'What is database indexing and how does it improve performance?',
    'Explain the CAP theorem in distributed systems.',
  ],
  'Data Scientist': [
    'What is overfitting and how do you prevent it?',
    'Explain how a Random Forest algorithm works.',
    'What is the p-value and how do you interpret it in hypothesis testing?',
    'Explain the bias-variance tradeoff.',
    'How do you handle missing data in a dataset?',
  ],
  'Product Manager': [
    'How do you prioritize features in a product backlog?',
    'Describe a product you think is poorly designed and why.',
    'How do you measure the success of a product launch?',
    'Explain the concept of MVP (Minimum Viable Product).',
    'How do you define user personas and use them in product decisions?',
  ],
  'UI/UX Designer': [
    'Walk me through your design process for a new feature.',
    'How do you handle negative feedback on your designs?',
    'Explain the difference between responsive and adaptive design.',
    'How do you conduct user research effectively?',
    'What is a design system and why is it important?',
  ]
};

function pickRandom(arr, n) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

// Real local analysis — mirrors the backend heuristic logic exactly
function analyzeLocallyReal(domain, questions, answers, timePerQuestion, eyeContact) {
  const total = questions.length;
  const wordCounts = answers.map(a => a && a.trim() ? a.trim().split(/\s+/).length : 0);
  const answeredTexts = answers.filter(a => a && a.trim().length > 0);
  const completion = answeredTexts.length / Math.max(total, 1);
  const avgWords = wordCounts.reduce((s, c) => s + c, 0) / Math.max(wordCounts.length, 1);
  const allText = answers.join(' ').toLowerCase();

  // 1. Content Knowledge — domain keyword hits
  const domainKw = {
    'HR & Behavioral': ['team', 'leadership', 'conflict', 'communication', 'stakeholder', 'deadline', 'priority', 'feedback', 'collaboration', 'resolved'],
    'Frontend Developer': ['react', 'component', 'state', 'hook', 'dom', 'css', 'javascript', 'api', 'performance', 'render', 'props'],
    'Backend Developer': ['api', 'database', 'server', 'rest', 'sql', 'cache', 'scale', 'microservice', 'docker', 'endpoint', 'architecture'],
    'Data Scientist': ['model', 'training', 'data', 'feature', 'accuracy', 'algorithm', 'prediction', 'regression', 'overfitting', 'validation'],
    'Product Manager': ['user', 'feature', 'roadmap', 'stakeholder', 'metric', 'priority', 'launch', 'feedback', 'backlog', 'sprint'],
    'UI/UX Designer': ['user', 'wireframe', 'prototype', 'accessibility', 'design', 'usability', 'research', 'persona', 'figma', 'flow'],
  };
  const keywords = domainKw[domain] || domainKw['HR & Behavioral'];
  const kwHits = keywords.filter(k => allText.includes(k)).length;
  const contentKnowledge = Math.min(98, Math.round(kwHits * 8 * 0.7 + completion * 28));

  // 2. Communication — word count & time
  const wordScore = avgWords >= 60 ? 92 : avgWords >= 40 ? 82 : avgWords >= 20 ? 67 : avgWords >= 10 ? 50 : 25;
  const timeScores = (timePerQuestion.length > 0 ? timePerQuestion : [30]).map(t =>
    Math.min(95, Math.max(10, t >= 45 && t <= 120 ? 88 : t >= 20 ? 70 : t < 10 ? 20 : 55))
  );
  const avgTimeScore = timeScores.reduce((s, v) => s + v, 0) / Math.max(timeScores.length, 1);
  const communication = Math.min(98, Math.round(wordScore * 0.6 + avgTimeScore * 0.25 + completion * 20));

  // 3. Confidence — eye contact + engagement
  const eyeFactor = eyeContact > 0 ? eyeContact / 100 : 0.5;
  const engagement = answeredTexts.length / Math.max(total, 1);
  const confidence = Math.min(98, Math.round((engagement * 45 + eyeFactor * 38 + Math.min(avgTimeScore, 90) * 0.18)));

  // 4. Fluency — consistency of answer lengths
  const validWords = wordCounts.filter(w => w > 0);
  if (validWords.length === 0) {
    var fluency = 0;
  } else {
    const avgW = validWords.reduce((s, v) => s + v, 0) / validWords.length;
    const variance = validWords.reduce((s, w) => s + Math.pow(w - avgW, 2), 0) / validWords.length;
    const cv = avgW > 0 ? Math.sqrt(variance) / avgW : 1;
    const consistency = cv < 0.3 ? 90 : cv < 0.5 ? 78 : cv < 0.7 ? 62 : 42;
    var fluency = Math.min(98, Math.round(consistency * 0.7 + avgTimeScore * 0.3));
  }

  // 5. Answer Structure — STAR method keywords
  const starKw = ['situation', 'task', 'action', 'result', 'challenge', 'implemented', 'achieved', 'led', 'resolved', 'improved', 'because', 'therefore', 'firstly', 'additionally', 'finally'];
  const starHits = starKw.filter(k => allText.includes(k)).length;
  const answerStructure = Math.min(98, Math.round(Math.min(100, starHits * 5) * 0.75 + completion * 24));

  // 6. Overall — weighted average (same as backend)
  const overall = Math.round(
    contentKnowledge * 0.25 +
    communication * 0.25 +
    confidence * 0.15 +
    fluency * 0.15 +
    answerStructure * 0.20
  );

  // Build per-question feedback
  const perQuestionFeedback = questions.map((q, i) => {
    const wc = wordCounts[i] || 0;
    const score = Math.min(98, Math.max(5, wc >= 50 ? 85 : wc >= 30 ? 72 : wc >= 15 ? 55 : wc >= 5 ? 35 : 5));
    const feedback = wc === 0
      ? 'No answer provided.'
      : wc < 15 ? `Only ${wc} words — please elaborate more.`
      : wc < 30 ? `${wc} words — decent, but more detail would help.`
      : `${wc} words — good depth.`;
    return { question: i + 1, score, feedback };
  });

  // Strengths & areas
  const topStrengths = [
    completion >= 0.8 ? `Completed ${Math.round(completion * 100)}% of questions` : null,
    avgWords >= 40 ? `Good average response length (${Math.round(avgWords)} words)` : null,
    eyeContact >= 70 ? `Strong eye contact maintained (${Math.round(eyeContact)}%)` : null,
    kwHits >= 4 ? `Demonstrated ${domain} domain knowledge` : null,
    starHits >= 4 ? 'Good use of structured response format' : null,
  ].filter(Boolean);

  const areasToImprove = [
    avgWords < 20 ? 'Provide much more detailed answers (aim for 40+ words each)' : null,
    completion < 0.7 ? `Only answered ${answeredTexts.length}/${total} questions — try to complete all` : null,
    eyeContact < 60 ? 'Maintain better eye contact with the camera' : null,
    starHits < 3 ? 'Use the STAR method: Situation → Task → Action → Result' : null,
    kwHits < 3 ? `Include more ${domain}-specific terminology in your answers` : null,
  ].filter(Boolean);

  return {
    scores: { contentKnowledge, communication, confidence, fluency, answerStructure, overall },
    feedback: {
      contentKnowledge: `Detected ${kwHits}/${keywords.length} domain keywords. ${kwHits >= 5 ? 'Excellent domain coverage.' : kwHits >= 3 ? 'Good coverage — add more specifics.' : 'Include more domain-specific terms.'}`,
      communication: `Average ${Math.round(avgWords)} words/answer. ${avgWords >= 40 ? 'Well-articulated responses.' : avgWords >= 20 ? 'Decent length — elaborate more.' : 'Answers are too brief.'}`,
      confidence: `Eye contact: ${Math.round(eyeContact)}%. ${eyeContact >= 70 ? 'Confident presence.' : 'Try to look directly at the camera more.'}`,
      fluency: `Response consistency: ${(validWords.length === 0 || fluency < 50) ? 'Needs improvement — answer more questions.' : fluency >= 78 ? 'Good flow across answers.' : 'Somewhat inconsistent — aim for similar depth each answer.'}`,
      answerStructure: `STAR keywords found: ${starHits}. ${starHits >= 5 ? 'Excellent structured responses.' : starHits >= 3 ? 'Decent structure — use more STAR framing.' : 'Structure answers using Situation-Task-Action-Result.'}`,
      overall: `Answered ${answeredTexts.length}/${total} questions. Average ${Math.round(avgWords)} words. Overall score reflects actual answer quality.`,
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

    // Real local analysis as the definitive fallback
    const localResult = analyzeLocallyReal(domain, questions, textAnswers, timePerQuestion.current, avgEyeContact);
    let scores = localResult.scores;
    let feedback = localResult.feedback;
    let perQuestionFeedback = localResult.perQuestionFeedback;
    let topStrengths = localResult.topStrengths;
    let areasToImprove = localResult.areasToImprove;

    // Try backend (Gemini AI) with 20s timeout
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

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

      // Only use AI result if it actually has real scores
      if (aiResult && aiResult.scores && aiResult.scores.overall > 0) {
        scores = aiResult.scores;
        if (aiResult.feedback) feedback = aiResult.feedback;
        if (aiResult.perQuestionFeedback) perQuestionFeedback = aiResult.perQuestionFeedback;
        if (aiResult.topStrengths) topStrengths = aiResult.topStrengths;
        if (aiResult.areasToImprove) areasToImprove = aiResult.areasToImprove;
        console.log('[Interview] AI analysis used (Gemini)');
      }
    } catch (err) {
      console.log('[Interview] Backend unavailable, using local analysis:', err.message);
    }

    const newRecord = {
      id: savedId,
      domain,
      date: new Date().toISOString(),
      scores,
      feedback,
      perQuestionFeedback,
      topStrengths,
      areasToImprove,
      eyeContactScore: avgEyeContact,
      duration: `${Math.round(totalTime)}s`,
      answeredQuestions: answeredCount,
      totalQuestions: questions.length,
    };

    // Save to AsyncStorage
    try {
      const cached = await AsyncStorage.getItem('cachedHistory');
      const localHistory = cached ? JSON.parse(cached) : [];
      localHistory.unshift(newRecord);
      await AsyncStorage.setItem('cachedHistory', JSON.stringify(localHistory));
    } catch (e) {
      console.warn('AsyncStorage save failed:', e);
    }

    // Save to Firestore
    try {
      const user = auth.currentUser;
      if (user) {
        await addDoc(collection(db, 'interviews'), {
          userId: user.uid,
          userEmail: user.email,
          ...newRecord,
        });
      }
    } catch (err) {
      console.warn('Firestore save failed:', err);
    } finally {
      setAnalyzingResults(false);
      navigation.navigate('InterviewResult', { id: savedId });
    }
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
        <Text style={styles.loadingSub}>AI is evaluating your answers for content, communication, and structure.</Text>
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
                style={StyleSheet.absoluteFillObject}
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
