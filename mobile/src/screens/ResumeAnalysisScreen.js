import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, SafeAreaView, ActivityIndicator, Alert, Platform
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { fetchApi, getApiBaseUrl } from '../utils/api';

export default function ResumeAnalysisScreen() {
  const [mode, setMode] = useState('upload'); // 'upload' | 'paste'
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  // ── File Picker ──────────────────────────────────────────────────────────
  const handlePickFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
        ],
        copyToCacheDirectory: true,
      });

      if (res.canceled) return;
      const file = res.assets[0];
      setSelectedFile(file);
    } catch (err) {
      Alert.alert('Error', 'Could not open file picker. Please try again.');
    }
  };

  // ── Upload File to Backend ───────────────────────────────────────────────
  const handleFileAnalyze = async () => {
    if (!selectedFile) {
      Alert.alert('No File', 'Please pick a resume file first.');
      return;
    }
    setAnalyzing(true);
    setResult(null);
    try {
      const baseUrl = await getApiBaseUrl();
      const formData = new FormData();
      formData.append('file', {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: selectedFile.mimeType || 'application/octet-stream',
      });

      const response = await fetch(`${baseUrl}/api/resume/analyze`, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || 'Backend error');
      }

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      // Populate text area with extracted text for ATS matching
      if (data.raw_text) setResumeText(data.raw_text);

      setResult(buildResultFromAnalyze(data));
    } catch (err) {
      console.warn('File upload analysis failed:', err.message);
      // Fall back to local if text was extracted or user pasted
      if (resumeText.trim()) {
        handleTextAtsLocal();
      } else {
        Alert.alert(
          'Analysis Failed',
          'Could not connect to backend. Start the backend server and try again, or switch to "Paste Text" mode.',
          [{ text: 'OK' }]
        );
        setAnalyzing(false);
      }
    }
  };

  // ── ATS Match via Text ───────────────────────────────────────────────────
  const handleTextAnalyze = async () => {
    if (!resumeText.trim()) {
      Alert.alert('Input Required', 'Please paste your resume text to begin analysis.');
      return;
    }
    setAnalyzing(true);
    setResult(null);
    try {
      const data = await fetchApi('/api/resume/ats-match', {
        method: 'POST',
        body: JSON.stringify({
          resume_text: resumeText,
          job_description: jobDescription || 'general software developer role',
        }),
      });
      setResult(buildResultFromAts(data, resumeText, jobDescription));
    } catch (err) {
      console.warn('Backend ATS match failed, calculating locally:', err.message);
      handleTextAtsLocal();
    }
  };

  // ── Real local ATS calculation ───────────────────────────────────────────
  const handleTextAtsLocal = () => {
    const rLower = resumeText.toLowerCase();
    const jLower = (jobDescription || 'software engineering developer python javascript react api').toLowerCase();

    const rWords = new Set((rLower.match(/\b\w{3,}\b/g) || []));
    const jWords = new Set((jLower.match(/\b\w{3,}\b/g) || []));

    const overlap = [...rWords].filter(w => jWords.has(w));
    const ratio = jWords.size > 0 ? overlap.length / jWords.size : 0;
    const score = Math.round(Math.min(98, 15 + ratio * 110));
    const label = score >= 75 ? 'Strong Match' : score >= 55 ? 'Potential Fit' : 'Needs Improvement';

    // Real category analysis
    const hasEmail = /@/.test(resumeText);
    const hasPhone = /(\+?\d[\d\s\-]{7,}|\bphone\b)/i.test(resumeText);
    const hasLinkedin = /linkedin/i.test(resumeText);
    const contact = Math.min(98, (hasEmail ? 40 : 0) + (hasPhone ? 30 : 0) + (hasLinkedin ? 20 : 0) + 8);

    const techKw = ['javascript', 'python', 'java', 'react', 'node', 'sql', 'html', 'css', 'typescript', 'aws', 'docker', 'git', 'api', 'rest', 'mongodb', 'linux', 'ci/cd', 'tensorflow', 'flask', 'django'];
    const techFound = techKw.filter(k => rLower.includes(k));
    const technical = Math.min(98, Math.round((techFound.length / 8) * 100));

    const actionVerbs = ['achieved', 'improved', 'developed', 'managed', 'created', 'designed', 'implemented', 'led', 'built', 'delivered', 'launched', 'optimized', 'reduced', 'resolved', 'automated'];
    const verbsFound = actionVerbs.filter(v => rLower.includes(v));
    const actionVerbScore = Math.min(98, Math.round((verbsFound.length / 5) * 100));

    const metricsCount = (resumeText.match(/\d+%|\$[\d,]+|\d+\+?\s*(?:users|customers|projects|teams|people)/gi) || []).length;
    const metricsScore = Math.min(98, Math.round((metricsCount / 3) * 100));

    const sections = ['experience', 'education', 'skills', 'projects', 'certifications', 'summary', 'objective'];
    const sectionsFound = sections.filter(s => rLower.includes(s));
    const structure = Math.min(98, Math.round((sectionsFound.length / 5) * 100));

    const eduKw = ['bachelor', 'master', 'phd', 'degree', 'university', 'college', 'certification', 'b.tech', 'm.tech'];
    const eduFound = eduKw.filter(k => rLower.includes(k));
    const education = Math.min(98, Math.round((eduFound.length / 3) * 100));

    const matchingKeywords = overlap.filter(w => w.length > 4).slice(0, 10).map(w => w.charAt(0).toUpperCase() + w.slice(1));
    const missingKeywords = [...jWords].filter(w => !rWords.has(w) && w.length > 4).slice(0, 8).map(w => w.charAt(0).toUpperCase() + w.slice(1));

    setResult({
      overall: score,
      label,
      categories: { contact, technical, actionVerbs: actionVerbScore, metrics: metricsScore, structure, education },
      matchingKeywords,
      missingKeywords,
      ai_powered: false,
    });
    setAnalyzing(false);
  };

  // ── Result builders ──────────────────────────────────────────────────────
  const buildResultFromAnalyze = (data) => ({
    overall: data.overall || 0,
    label: data.overall >= 75 ? 'Strong Match' : data.overall >= 55 ? 'Potential Fit' : 'Needs Improvement',
    categories: Object.fromEntries(
      Object.entries(data.categories || {}).map(([k, v]) => [k, typeof v === 'object' ? v.score : v])
    ),
    strengths: data.strengths || [],
    weaknesses: data.weaknesses || [],
    suggestions: data.suggestions || [],
    matchingKeywords: [],
    missingKeywords: [],
    ai_powered: data.ai_powered || false,
  });

  const buildResultFromAts = (data, resumeText, jobDescription) => {
    const score = data.score || data.overall || 0;
    return {
      overall: score,
      label: data.label || (score >= 75 ? 'Strong Match' : score >= 55 ? 'Potential Fit' : 'Needs Improvement'),
      categories: {
        contact: data.contact || 70,
        technical: data.technical || 70,
        actionVerbs: data.action_verbs || 65,
        metrics: data.metrics || 60,
        structure: data.structure || 75,
        education: data.education || 70,
      },
      matchingKeywords: data.matching_keywords || [],
      missingKeywords: data.missing_keywords || [],
      ai_powered: false,
    };
  };

  const getScoreColor = (score) => {
    if (score >= 75) return '#10B981';
    if (score >= 55) return '#F59E0B';
    return '#EF4444';
  };

  const categoryLabels = {
    contact: 'Contact Info',
    technical: 'Technical Skills',
    actionVerbs: 'Action Verbs',
    metrics: 'Quantifiable Impact',
    structure: 'Resume Structure',
    education: 'Education',
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>📄 Resume ATS Analyzer</Text>
          <Text style={styles.subtitle}>
            Upload your resume or paste text to get an AI-powered ATS compatibility score.
          </Text>
        </View>

        {!result ? (
          <View>
            {/* Mode Toggle */}
            <View style={styles.modeToggle}>
              <TouchableOpacity
                style={[styles.modeBtn, mode === 'upload' && styles.modeBtnActive]}
                onPress={() => setMode('upload')}
              >
                <Text style={[styles.modeBtnText, mode === 'upload' && styles.modeBtnTextActive]}>
                  📁 Upload File
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeBtn, mode === 'paste' && styles.modeBtnActive]}
                onPress={() => setMode('paste')}
              >
                <Text style={[styles.modeBtnText, mode === 'paste' && styles.modeBtnTextActive]}>
                  ✏️ Paste Text
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              {/* Upload Mode */}
              {mode === 'upload' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>1. Upload Resume File</Text>
                  <Text style={styles.labelSub}>Supports PDF, DOCX, and TXT files</Text>

                  <TouchableOpacity style={styles.uploadArea} onPress={handlePickFile}>
                    {selectedFile ? (
                      <View style={styles.fileSelected}>
                        <Text style={styles.fileIcon}>✅</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.fileName} numberOfLines={1}>{selectedFile.name}</Text>
                          <Text style={styles.fileSize}>
                            {selectedFile.size ? `${Math.round(selectedFile.size / 1024)} KB` : 'File selected'}
                          </Text>
                        </View>
                        <TouchableOpacity onPress={() => setSelectedFile(null)}>
                          <Text style={styles.removeFile}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.uploadPrompt}>
                        <Text style={styles.uploadIcon}>📂</Text>
                        <Text style={styles.uploadText}>Tap to browse files</Text>
                        <Text style={styles.uploadSub}>PDF, DOCX, TXT supported</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              {/* Paste Mode */}
              {mode === 'paste' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>1. Paste Resume Text</Text>
                  <TextInput
                    style={styles.textArea}
                    placeholder="Paste your complete resume here (Experience, Education, Skills, Projects)..."
                    placeholderTextColor="#64748B"
                    multiline
                    numberOfLines={10}
                    value={resumeText}
                    onChangeText={setResumeText}
                  />
                  <Text style={styles.charHint}>{resumeText.length} characters</Text>
                </View>
              )}

              {/* Job Description (both modes) */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>2. Job Description (Optional but Recommended)</Text>
                <TextInput
                  style={[styles.textArea, { height: 110 }]}
                  placeholder="Paste the job description to get keyword match analysis..."
                  placeholderTextColor="#64748B"
                  multiline
                  value={jobDescription}
                  onChangeText={setJobDescription}
                />
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, analyzing && { opacity: 0.7 }]}
                onPress={mode === 'upload' ? handleFileAnalyze : handleTextAnalyze}
                disabled={analyzing}
              >
                {analyzing ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <ActivityIndicator color="#FFFFFF" size="small" />
                    <Text style={styles.submitBtnText}>Analyzing...</Text>
                  </View>
                ) : (
                  <Text style={styles.submitBtnText}>
                    {mode === 'upload' ? '🚀 Analyze Resume File' : '📊 Analyze & Match'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.resultsContainer}>
            {/* AI Badge */}
            {result.ai_powered && (
              <View style={styles.aiBadge}>
                <Text style={styles.aiBadgeText}>✨ Analyzed by Gemini AI</Text>
              </View>
            )}

            {/* Score Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>ATS Match Score</Text>
              <View style={styles.scoreRow}>
                <View style={[styles.scoreCircle, { borderColor: getScoreColor(result.overall) }]}>
                  <Text style={[styles.scoreVal, { color: getScoreColor(result.overall) }]}>{result.overall}</Text>
                  <Text style={styles.scoreMax}>/100</Text>
                </View>
                <View style={styles.scoreMeta}>
                  <Text style={[styles.scoreLabel, { color: getScoreColor(result.overall) }]}>{result.label}</Text>
                  <Text style={styles.scoreSub}>Based on keyword & content analysis</Text>
                </View>
              </View>
            </View>

            {/* Category Breakdown */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Category Breakdown</Text>
              {Object.entries(result.categories).map(([key, val]) => {
                const numVal = typeof val === 'object' ? val.score || 0 : val || 0;
                return (
                  <View key={key} style={styles.breakdownItem}>
                    <View style={styles.breakdownLabelRow}>
                      <Text style={styles.breakdownLabel}>{categoryLabels[key] || key}</Text>
                      <Text style={[styles.breakdownVal, { color: getScoreColor(numVal) }]}>{numVal}%</Text>
                    </View>
                    <View style={styles.barBg}>
                      <View style={[styles.barFill, { width: `${Math.min(100, numVal)}%`, backgroundColor: getScoreColor(numVal) }]} />
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Strengths / Suggestions */}
            {(result.strengths || result.weaknesses || result.suggestions) && (
              <>
                {result.strengths && result.strengths.length > 0 && (
                  <View style={[styles.card, styles.greenCard]}>
                    <Text style={styles.cardTitleGreen}>✅ Strengths</Text>
                    {result.strengths.map((s, i) => <Text key={i} style={styles.tipItem}>• {s}</Text>)}
                  </View>
                )}
                {result.weaknesses && result.weaknesses.length > 0 && (
                  <View style={[styles.card, styles.redCard]}>
                    <Text style={styles.cardTitleRed}>⚠️ Weaknesses</Text>
                    {result.weaknesses.map((w, i) => <Text key={i} style={styles.tipItem}>• {w}</Text>)}
                  </View>
                )}
                {result.suggestions && result.suggestions.length > 0 && (
                  <View style={[styles.card, styles.yellowCard]}>
                    <Text style={styles.cardTitleYellow}>💡 Suggestions</Text>
                    {result.suggestions.map((s, i) => <Text key={i} style={styles.tipItem}>• {s}</Text>)}
                  </View>
                )}
              </>
            )}

            {/* Keyword Analysis */}
            {result.matchingKeywords && result.matchingKeywords.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitleGreen}>✅ Matching Keywords</Text>
                <View style={styles.tagGrid}>
                  {result.matchingKeywords.map((tag, i) => (
                    <View key={i} style={styles.tagGreen}>
                      <Text style={styles.tagTextGreen}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {result.missingKeywords && result.missingKeywords.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitleRed}>❌ Missing Keywords</Text>
                <View style={styles.tagGrid}>
                  {result.missingKeywords.map((tag, i) => (
                    <View key={i} style={styles.tagRed}>
                      <Text style={styles.tagTextRed}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <TouchableOpacity style={styles.resetBtn} onPress={() => { setResult(null); setSelectedFile(null); }}>
              <Text style={styles.resetBtnText}>🔄 Analyze Another Resume</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  scrollContent: { padding: 20, paddingBottom: 50 },
  header: { marginBottom: 24 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#6366F1', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#94A3B8', lineHeight: 22 },

  modeToggle: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  modeBtnActive: { backgroundColor: '#6366F1' },
  modeBtnText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  modeBtnTextActive: { color: '#FFFFFF' },

  form: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    borderColor: '#334155',
    borderWidth: 1,
  },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 4 },
  labelSub: { fontSize: 12, color: '#64748B', marginBottom: 10 },

  uploadArea: {
    borderWidth: 2,
    borderColor: '#334155',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 20,
    backgroundColor: '#0F172A',
  },
  uploadPrompt: { alignItems: 'center' },
  uploadIcon: { fontSize: 40, marginBottom: 10 },
  uploadText: { fontSize: 16, fontWeight: '600', color: '#94A3B8', marginBottom: 4 },
  uploadSub: { fontSize: 13, color: '#475569' },
  fileSelected: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  fileIcon: { fontSize: 28 },
  fileName: { fontSize: 14, fontWeight: '600', color: '#F8FAFC', flex: 1 },
  fileSize: { fontSize: 12, color: '#64748B', marginTop: 2 },
  removeFile: { fontSize: 18, color: '#EF4444', fontWeight: 'bold', padding: 4 },

  textArea: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    color: '#F8FAFC',
    fontSize: 14,
    textAlignVertical: 'top',
    height: 160,
  },
  charHint: { color: '#475569', fontSize: 11, marginTop: 4, textAlign: 'right' },

  submitBtn: {
    backgroundColor: '#6366F1',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },

  resultsContainer: { flexDirection: 'column', gap: 16 },
  aiBadge: {
    backgroundColor: 'rgba(99,102,241,0.15)',
    borderColor: '#6366F1',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  aiBadgeText: { color: '#818CF8', fontSize: 13, fontWeight: '600' },

  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    borderColor: '#334155',
    borderWidth: 1,
  },
  greenCard: { borderLeftWidth: 4, borderLeftColor: '#10B981' },
  redCard: { borderLeftWidth: 4, borderLeftColor: '#EF4444' },
  yellowCard: { borderLeftWidth: 4, borderLeftColor: '#F59E0B' },

  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 16 },
  cardTitleGreen: { fontSize: 15, fontWeight: 'bold', color: '#10B981', marginBottom: 10 },
  cardTitleRed: { fontSize: 15, fontWeight: 'bold', color: '#EF4444', marginBottom: 10 },
  cardTitleYellow: { fontSize: 15, fontWeight: 'bold', color: '#F59E0B', marginBottom: 10 },

  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  scoreCircle: {
    width: 90, height: 90, borderRadius: 45, borderWidth: 5,
    justifyContent: 'center', alignItems: 'center',
  },
  scoreVal: { fontSize: 28, fontWeight: 'bold' },
  scoreMax: { fontSize: 12, color: '#64748B' },
  scoreMeta: { flex: 1 },
  scoreLabel: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  scoreSub: { fontSize: 12, color: '#94A3B8' },

  breakdownItem: { marginBottom: 14 },
  breakdownLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  breakdownLabel: { color: '#94A3B8', fontSize: 13 },
  breakdownVal: { fontWeight: 'bold', fontSize: 13 },
  barBg: { height: 6, backgroundColor: '#0F172A', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },

  tipItem: { color: '#94A3B8', fontSize: 13.5, lineHeight: 20, marginBottom: 6 },
  tagGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagGreen: {
    backgroundColor: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.3)',
    borderWidth: 1, borderRadius: 20, paddingVertical: 5, paddingHorizontal: 12,
  },
  tagTextGreen: { color: '#10B981', fontSize: 12, fontWeight: '600' },
  tagRed: {
    backgroundColor: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)',
    borderWidth: 1, borderRadius: 20, paddingVertical: 5, paddingHorizontal: 12,
  },
  tagTextRed: { color: '#EF4444', fontSize: 12, fontWeight: '600' },

  resetBtn: {
    backgroundColor: '#1E293B', borderColor: '#334155', borderWidth: 1,
    borderRadius: 10, padding: 14, alignItems: 'center',
  },
  resetBtnText: { color: '#94A3B8', fontSize: 15, fontWeight: 'bold' },
});
