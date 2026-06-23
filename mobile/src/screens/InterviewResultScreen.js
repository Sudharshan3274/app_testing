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
    { key: 'contentKnowledge', label: 'Content Knowledge', color: '#8B5CF6' },
    { key: 'communication', label: 'Communication', color: '#3B82F6' },
    { key: 'confidence', label: 'Confidence', color: '#F59E0B' },
    { key: 'fluency', label: 'Fluency', color: '#EC4899' },
    { key: 'answerStructure', label: 'Answer Structure', color: '#10B981' }
  ];

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

        {/* Score Ring Summary */}
        <View style={styles.scoreSummaryCard}>
          <View style={[styles.gradeCircle, { borderColor: gradeColor }]}>
            <Text style={styles.gradeText}>{grade}</Text>
            <Text style={styles.scoreText}>{scores.overall}%</Text>
          </View>
          <Text style={[styles.gradeLabel, { color: gradeColor }]}>{gradeLabel} Performance</Text>
          <Text style={styles.overallFeedback}>
            {feedback.overall || "Your overall responses demonstrate good communication capabilities and structure."}
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

        {/* Performance Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Performance Breakdown</Text>
          {SECTORS.map(sec => {
            const val = scores[sec.key] || 70;
            return (
              <View key={sec.key} style={styles.breakdownItem}>
                <View style={styles.breakdownLabelRow}>
                  <Text style={styles.breakdownLabel}>{sec.label}</Text>
                  <Text style={[styles.breakdownVal, { color: sec.color }]}>{val}%</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${val}%`, backgroundColor: sec.color }]} />
                </View>
              </View>
            );
          })}
        </View>

        {/* Strengths & Improvement Areas */}
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
});
