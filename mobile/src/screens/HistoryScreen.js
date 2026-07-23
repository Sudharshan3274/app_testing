import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db, auth } from '../firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const promiseWithTimeout = (promise, ms = 4000) => {
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
    async function loadHistory() {
      // 1. Try local cache first
      try {
        const cached = await AsyncStorage.getItem('cachedHistory');
        if (cached) {
          setHistory(JSON.parse(cached));
          setLoading(false);
        }
      } catch (e) {
        console.warn("History cache read error:", e);
      }

      // 2. Query Firestore in background
      try {
        const user = auth.currentUser;
        if (user) {
          const q = query(
            collection(db, "interviews"),
            where("userId", "==", user.uid)
          );

          const querySnapshot = await promiseWithTimeout(getDocs(q), 4000);
          const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          data.sort((a, b) => new Date(b.date) - new Date(a.date));
          setHistory(data);
          await AsyncStorage.setItem('cachedHistory', JSON.stringify(data));
        }
      } catch (err) {
        console.warn("Firestore history fetch failed/timed-out, using cache:", err);
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, []);

  const getScoreColor = (score) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Interview History</Text>
          <Text style={styles.subtitle}>
            Review your past AI mock interviews and track your progress over time.
          </Text>
        </View>

        {history.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>🎥</Text>
            <Text style={styles.emptyTitle}>No Interviews Yet</Text>
            <Text style={styles.emptySubtitle}>
              You have not taken any AI mock interviews yet. Start one to see your history here!
            </Text>
            <TouchableOpacity 
              style={styles.startBtn}
              onPress={() => navigation.navigate('Interviews')}
            >
              <Text style={styles.startBtnText}>Start an Interview</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.list}>
            {history.map((record) => {
              const score = record.scores?.overall || 70;
              const scoreColor = getScoreColor(score);
              return (
                <TouchableOpacity
                  key={record.id}
                  style={[styles.item, { borderLeftColor: scoreColor }]}
                  onPress={() => navigation.navigate('InterviewResult', { id: record.id })}
                >
                  <View style={styles.itemLeft}>
                    <View style={styles.scoreBox}>
                      <Text style={styles.scoreLabel}>Score</Text>
                      <Text style={[styles.scoreVal, { color: scoreColor }]}>{score}</Text>
                    </View>
                    <View style={styles.info}>
                      <Text style={styles.domain}>{record.domain}</Text>
                      <Text style={styles.date}>
                        📅 {new Date(record.date).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.arrow}>›</Text>
                </TouchableOpacity>
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
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#6366F1',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#94A3B8',
    lineHeight: 22,
  },
  emptyBox: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderColor: '#334155',
    borderWidth: 1,
    marginTop: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  startBtn: {
    backgroundColor: '#6366F1',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  list: {
    flexDirection: 'column',
    gap: 16,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  scoreBox: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    minWidth: 64,
  },
  scoreLabel: {
    fontSize: 11,
    color: '#64748B',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  scoreVal: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  info: {
    justifyContent: 'center',
    flex: 1,
  },
  domain: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 6,
  },
  date: {
    fontSize: 14,
    color: '#94A3B8',
  },
  arrow: {
    fontSize: 28,
    color: '#64748B',
    fontWeight: '300',
    paddingLeft: 10,
  },
});
