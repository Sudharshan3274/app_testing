import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db, auth } from '../firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut } from 'firebase/auth';

function StatCard({ icon, title, value, color }) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIconContainer, { backgroundColor: color + '15' }]}>
        <Text style={[styles.statIcon, { color }]}>{icon}</Text>
      </View>
      <View style={styles.statInfo}>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={styles.statValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function DashboardScreen({ navigation }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ avgScore: 0, totalTaken: 0, practiceHours: 0 });
  const [userName, setUserName] = useState('User');

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
    async function loadData() {
      const storedName = await AsyncStorage.getItem('userFullName');
      if (storedName) setUserName(storedName);

      // 1. Try local cache first
      try {
        const cached = await AsyncStorage.getItem('cachedHistory');
        if (cached) {
          const data = JSON.parse(cached);
          setHistory(data);
          if (data.length > 0) {
            const totalScore = data.reduce((acc, curr) => acc + (curr.scores?.overall || 0), 0);
            setStats({
              avgScore: Math.round(totalScore / data.length),
              totalTaken: data.length,
              practiceHours: +(data.length * 0.75).toFixed(1)
            });
          }
          setLoading(false);
        }
      } catch (e) {
        console.warn("Dashboard cache read error:", e);
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

          if (data.length > 0) {
            const totalScore = data.reduce((acc, curr) => acc + (curr.scores?.overall || 0), 0);
            setStats({
              avgScore: Math.round(totalScore / data.length),
              totalTaken: data.length,
              practiceHours: +(data.length * 0.75).toFixed(1)
            });
          }
          await AsyncStorage.setItem('cachedHistory', JSON.stringify(data));
        }
      } catch (err) {
        console.warn("Firestore dashboard fetch failed/timed-out, using cache:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    }
  };

  const chartData = (() => {
    const scores = history.slice(0, 5).map(h => h.scores?.overall || 0).reverse();
    while (scores.length < 5) scores.unshift(10);
    return scores;
  })();

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
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.nameText}>{userName}!</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>🚪 Logout</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.ctaCard}
          onPress={() => navigation.navigate('Interviews')}
        >
          <View style={styles.ctaContent}>
            <Text style={styles.ctaTitle}>Start New AI Interview</Text>
            <Text style={styles.ctaSubtitle}>Test your skills with standard or custom role questions.</Text>
          </View>
          <Text style={styles.ctaArrow}>🎙️</Text>
        </TouchableOpacity>

        {/* Stats Section */}
        <View style={styles.statsGrid}>
          <StatCard icon="📈" title="Avg Score" value={stats.avgScore + '%'} color="#10B981" />
          <StatCard icon="🎙️" title="Taken" value={stats.totalTaken} color="#F59E0B" />
          <StatCard icon="⏱️" title="Hours" value={stats.practiceHours} color="#6366F1" />
        </View>

        {/* Performance Chart */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Performance History</Text>
          <View style={styles.chartContainer}>
            {chartData.map((score, i) => (
              <View key={i} style={styles.chartBarWrapper}>
                <View 
                  style={[
                    styles.chartBar, 
                    { 
                      height: `${score}%`,
                      backgroundColor: score > 10 ? '#6366F1' : '#334155'
                    }
                  ]} 
                />
                <Text style={styles.barLabel}>{score}%</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Interviews */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent Interviews</Text>
          {history.length === 0 ? (
            <Text style={styles.emptyText}>No interviews completed yet. Start one to see results here!</Text>
          ) : (
            history.slice(0, 3).map(record => (
              <TouchableOpacity
                key={record.id}
                style={styles.interviewItem}
                onPress={() => navigation.navigate('InterviewResult', { id: record.id })}
              >
                <View style={styles.interviewInfo}>
                  <Text style={styles.interviewDomain}>{record.domain}</Text>
                  <Text style={styles.interviewDate}>{new Date(record.date).toLocaleDateString()}</Text>
                </View>
                <Text 
                  style={[
                    styles.interviewScore,
                    { color: record.scores?.overall >= 80 ? '#10B981' : record.scores?.overall >= 60 ? '#F59E0B' : '#EF4444' }
                  ]}
                >
                  {record.scores?.overall}%
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 16,
    color: '#94A3B8',
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    borderRadius: 8,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 14,
  },
  ctaCard: {
    backgroundColor: 'linear-gradient(135deg, #6366F1, #4F46E5)',
    backgroundColor: '#6366F1',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  ctaContent: {
    flex: 1,
  },
  ctaTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  ctaSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
  },
  ctaArrow: {
    fontSize: 28,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    width: '31%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIcon: {
    fontSize: 18,
  },
  statInfo: {
    alignItems: 'center',
  },
  statTitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F8FAFC',
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
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
    paddingTop: 10,
  },
  chartBarWrapper: {
    alignItems: 'center',
    width: 40,
  },
  chartBar: {
    width: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 10,
    color: '#64748B',
  },
  emptyText: {
    color: '#64748B',
    textAlign: 'center',
    fontSize: 14,
    paddingVertical: 12,
  },
  interviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  interviewInfo: {
    flex: 1,
  },
  interviewDomain: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  interviewDate: {
    fontSize: 12,
    color: '#64748B',
  },
  interviewScore: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
