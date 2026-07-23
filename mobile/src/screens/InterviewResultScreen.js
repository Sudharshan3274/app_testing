import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function InterviewResultScreen({ route, navigation }) {
  const { id } = route.params || {};
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const promiseWithTimeout = (promise, ms = 3000) => {
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error("Request timed out")), ms);
    });
    return Promise.race([
      promise.then(res => {
        clearTimeout(timeoutId);
        return res;
      }),
      timeoutPromise
    ]);
  };

  useEffect(() => {
    async function loadResult() {
      if (!id) {
        setLoading(false);
        return;
      }

      // 1. Try local cache first for instant loading
      try {
        const cached = await AsyncStorage.getItem('cachedHistory');
        if (cached) {
          const list = JSON.parse(cached);
          const found = list.find(item => item.id === id);
          if (found) {
            setResult(found);
            setLoading(false);
          }
        }
      } catch (e) {
        console.warn("Result cache read error:", e);
      }

      // 2. Query Firestore in background/fallback
      try {
        const docRef = doc(db, "interviews", id);
        const docSnap = await promiseWithTimeout(getDoc(docRef), 3000);

        if (docSnap.exists()) {
          setResult({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (err) {
        console.warn("Firestore result fetch failed/timed-out, using cache:", err);
      } finally {
        setLoading(false);
      }
    }
    loadResult();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Loading Scorecard...</Text>
      </View>
    );
  }

  if (!result) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerBox}>
          <Text style={styles.errorText}>No result details found.</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('MainTabs')}>
            <Text style={styles.backBtnText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { scores = {}, domain, date, feedback = {}, topStrengths = [], areasToImprove = [], eyeContactScore = 80, duration = '0s' } = result;

  const getGrade = (score) => {
    if (score >= 85) return { grade: 'A', label: 'Exceptional', color: '#10B981' };
    if (score >= 70) return { grade: 'B', label: 'Good', color: '#6366F1' };
    if (score >= 55) return { grade: 'C', label: 'Developing', color: '#F59E0B' };
    return { grade: 'D', label: 'Needs Practice', color: '#EF4444' };
  };

  const { grade, label: gradeLabel, color: gradeColor } = getGrade(scores.overall || 70);

  const SECTORS = [
    { key: 'contentKnowledge', label: 'Content Knowledge', color: '#8B5CF6', tip: 'Add more domain-specific terminology to your answers' },
    { key: 'communication', label: 'Communication', color: '#3B82F6', tip: 'Aim for 40-80 word answers. Elaborate with specific examples' },
    { key: 'confidence', label: 'Confidence', color: '#F59E0B', tip: 'Use the text box to answer every question. Skipping questions lowers this score' },
    { key: 'fluency', label: 'Fluency', color: '#EC4899', tip: 'Keep your answers consistently detailed. Avoid very short then very long answers' },
    { key: 'answerStructure', label: 'Answer Structure', color: '#10B981', tip: 'Use the STAR method: Situation → Task → Action → Result' },
  ];

  const weakSectors = SECTORS.filter(s => (scores[s.key] ?? 50) < 70);

  const questions = result.questions || [];
  const textAnswers = result.textAnswers || [];
  const timePerQuestion = (result.metrics && result.metrics.timePerQuestion) || [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('MainTabs')}>
          <Text style={styles.backBtnText}>⬅ Back to Dashboard</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Interview Evaluation Report</Text>
          <Text style={styles.subtitle}>
            Role: {domain} • {new Date(date).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.scoreSummaryCard}>
          <View style={[styles.gradeCircle, { borderColor: gradeColor }]}>
            <Text style={styles.gradeText}>{grade}</Text>
            <Text style={styles.scoreText}>{scores.overall}%</Text>
          </View>
          <Text style={[styles.gradeLabel, { color: gradeColor }]}>{gradeLabel} Performance</Text>
          <Text style={styles.overallFeedback}>
            {feedback.overall ||
              (scores.overall >= 85
                ? 'Outstanding response pattern! Your industry terminologies, structured arguments, and detailed justifications show advanced readiness.'
                : scores.overall >= 70
                ? 'Solid showing. You have a good base. Incorporating the suggested structural frameworks will push you into the top tier.'
                : 'A valuable diagnostic run. To raise your profile, focus on providing more thorough explanations and using industry keywords.')}
          </Text>
          <View style={styles.metaBadgeRow}>
            <View style={styles.metaBadge}>
              <Text style={styles.metaBadgeText}>⏱ {duration}</Text>
            </View>
            <View style={styles.metaBadge}>
              <Text style={styles.metaBadgeText}>👀 {eyeContactScore}% Eye Contact</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Performance Breakdown</Text>
          {SECTORS.map(sec => {
            const val = scores[sec.key] || 70;
            const barColor = val >= 85 ? '#10B981' : val >= 70 ? '#6366F1' : val >= 55 ? '#F59E0B' : '#EF4444';
            return (
              <View key={sec.key} style={styles.breakdownItem}>
                <View style={styles.breakdownLabelRow}>
                  <Text style={styles.breakdownLabel}>{sec.label}</Text>
                  <Text style={[styles.breakdownVal, { color: barColor }]}>{val}%</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${val}%`, backgroundColor: barColor }]} />
                </View>
                {feedback[sec.key] ? (
                  <Text style={styles.sectorFeedback}>{feedback[sec.key]}</Text>
                ) : null}
              </View>
            );
          })}
        </View>

        {topStrengths.length > 0 || areasToImprove.length > 0 ? (
          <View style={styles.grid}>
            {topStrengths.length > 0 && (
              <View style={[styles.tipCard, { borderLeftColor: '#10B981' }]}>
                <Text style={styles.tipCardTitleGreen}>🌟 Strengths</Text>
                {topStrengths.map((str, idx) => (
                  <Text key={idx} style={styles.tipItem}>• {str}</Text>
                ))}
              </View>
            )}
            {areasToImprove.length > 0 && (
              <View style={[styles.tipCard, { borderLeftColor: '#F59E0B' }]}>
                <Text style={styles.tipCardTitleYellow}>⚠️ Areas to Improve</Text>
                {areasToImprove.map((area, idx) => (
                  <Text key={idx} style={styles.tipItem}>• {area}</Text>
                ))}
              </View>
            )}
          </View>
        ) : null}

        <View style={[styles.tipCard, { borderLeftColor: '#6366F1', marginTop: 16 }]}>
          <Text style={[styles.tipCardTitleGreen, { color: '#6366F1' }]}>💡 Recommendations for Improvement</Text>
          {weakSectors.length > 0 ? (
            weakSectors.map(s => (
              <Text key={s.key} style={styles.tipItem}>
                <Text style={{ color: '#F8FAFC', fontWeight: 'bold' }}>{s.label}: </Text>{s.tip}
              </Text>
            ))
          ) : (
            <Text style={styles.tipItem}>
              ✨ Excellent work! All your sectors scored above 70. Keep practicing to maintain this level of consistent performance.
            </Text>
          )}
        </View>

        {questions.length > 0 && (
          <View style={{ marginTop: 24 }}>
            <Text style={styles.sectionTitle}>📝 Response Log & Timing</Text>
            {questions.map((question, index) => {
              const ans = textAnswers[index] || '';
              const words = ans.trim() ? ans.trim().split(/\s+/).filter(w => w.length > 1).length : 0;
              const time = timePerQuestion[index] ? Math.round(timePerQuestion[index]) : 0;
              const tag = index < 3 ? 'Behavioral' : 'Domain Specific';
              const tagColor = index < 3 ? '#6366F1' : '#10B981';
              const tagBg = index < 3 ? 'rgba(99,102,241,0.15)' : 'rgba(16,185,129,0.15)';

              return (
                <View key={index} style={styles.qnaCard}>
                  <View style={styles.qnaHeader}>
                    <View style={[styles.qnaTag, { backgroundColor: tagBg }]}>
                      <Text style={[styles.qnaTagText, { color: tagColor }]}>{tag}</Text>
                    </View>
                    <Text style={styles.qnaQuestionNum}>Question {index + 1}</Text>
                    <View style={styles.qnaMeta}>
                      <Text style={styles.qnaMetaText}>⏱ {time}s</Text>
                      <Text style={styles.qnaMetaText}>📝 {words} words</Text>
                    </View>
                  </View>
                  <Text style={styles.qnaQuestion}>{question}</Text>
                  <View style={styles.qnaAnswerBox}>
                    {ans.trim() ? (
                      <Text style={styles.qnaAnswer}>"{ans}"</Text>
                    ) : (
                      <Text style={styles.qnaNoAnswer}>⚠️ No written response was provided for this question.</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94A3B8',
    marginTop: 12,
    fontSize: 16,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    marginBottom: 20,
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: 24,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  backBtnText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
  },
  scoreSummaryCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
    borderColor: '#334155',
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 24,
  },
  gradeCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  gradeText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#F8FAFC',
  },
  scoreText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 2,
  },
  gradeLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  overallFeedback: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  metaBadgeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metaBadge: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  metaBadgeText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    borderColor: '#334155',
    borderWidth: 1,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 18,
  },
  breakdownItem: {
    marginBottom: 16,
  },
  breakdownLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  breakdownLabel: {
    color: '#94A3B8',
    fontSize: 14,
  },
  breakdownVal: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#0F172A',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  grid: {
    flexDirection: 'column',
    gap: 16,
  },
  tipCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderColor: '#334155',
    borderWidth: 1,
  },
  tipCardTitleGreen: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 10,
  },
  tipCardTitleYellow: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#F59E0B',
    marginBottom: 10,
  },
  tipItem: {
    color: '#94A3B8',
    fontSize: 13.5,
    lineHeight: 20,
    marginBottom: 6,
  },
  sectorFeedback: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 16,
  },
  qnaCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  qnaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    paddingBottom: 10,
  },
  qnaTag: {
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  qnaTagText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  qnaQuestionNum: {
    fontSize: 13,
    color: '#94A3B8',
    flex: 1,
  },
  qnaMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  qnaMetaText: {
    fontSize: 12,
    color: '#64748B',
  },
  qnaQuestion: {
    fontSize: 15,
    color: '#F8FAFC',
    lineHeight: 22,
    marginBottom: 12,
    fontWeight: '500',
  },
  qnaAnswerBox: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  qnaAnswer: {
    fontSize: 14,
    color: '#CBD5E1',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  qnaNoAnswer: {
    fontSize: 14,
    color: '#EF4444',
    lineHeight: 20,
    fontStyle: 'italic',
  },
});
