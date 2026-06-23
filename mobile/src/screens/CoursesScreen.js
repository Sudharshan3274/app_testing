import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  SafeAreaView, Linking, Alert,
} from 'react-native';

const COURSES = [
  {
    id: 'dsa',
    category: 'Computer Science',
    color: '#6366F1',
    icon: '🧮',
    title: 'Data Structures & Algorithms',
    description: 'Master arrays, trees, graphs, sorting, dynamic programming and more — essential for coding interviews.',
    level: 'Intermediate',
    duration: '40 hrs',
    lessons: [
      { title: 'Arrays & Strings', desc: 'Two-pointer, sliding window, prefix sums', done: false },
      { title: 'Linked Lists', desc: 'Reversal, cycle detection, merge sort on lists', done: false },
      { title: 'Stacks & Queues', desc: 'Monotonic stacks, BFS/DFS traversal', done: false },
      { title: 'Binary Trees & BSTs', desc: 'Traversals, LCA, BST operations', done: false },
      { title: 'Dynamic Programming', desc: 'Memoization, tabulation, knapsack, LCS', done: false },
      { title: 'Graphs', desc: 'BFS, DFS, Dijkstra, Union-Find', done: false },
    ],
    topics: ['Arrays', 'Trees', 'Graphs', 'DP', 'Sorting', 'Recursion'],
    link: 'https://leetcode.com/explore/',
  },
  {
    id: 'system-design',
    category: 'Backend / Architecture',
    color: '#10B981',
    icon: '🏗️',
    title: 'System Design Fundamentals',
    description: 'Learn to design scalable distributed systems. Essential for senior engineering roles.',
    level: 'Advanced',
    duration: '30 hrs',
    lessons: [
      { title: 'Scalability Basics', desc: 'Horizontal vs vertical scaling, load balancers', done: false },
      { title: 'Databases at Scale', desc: 'SQL vs NoSQL, sharding, replication', done: false },
      { title: 'Caching Strategies', desc: 'Redis, CDN, cache eviction policies', done: false },
      { title: 'Message Queues', desc: 'Kafka, RabbitMQ, pub-sub patterns', done: false },
      { title: 'Microservices', desc: 'Service mesh, API gateway, containerization', done: false },
      { title: 'Design Real Systems', desc: 'URL shortener, Twitter feed, WhatsApp', done: false },
    ],
    topics: ['Scalability', 'Databases', 'Caching', 'Microservices', 'API Design'],
    link: 'https://github.com/donnemartin/system-design-primer',
  },
  {
    id: 'frontend',
    category: 'Frontend Development',
    color: '#EC4899',
    icon: '💻',
    title: 'React & Modern Frontend',
    description: 'Build production-ready React applications with hooks, state management, and performance optimization.',
    level: 'Intermediate',
    duration: '25 hrs',
    lessons: [
      { title: 'React Hooks Deep Dive', desc: 'useState, useEffect, useRef, useMemo, useCallback', done: false },
      { title: 'State Management', desc: 'Context API, Redux Toolkit, Zustand', done: false },
      { title: 'Performance Optimization', desc: 'Lazy loading, code splitting, memoization', done: false },
      { title: 'TypeScript for React', desc: 'Types, interfaces, generics in React', done: false },
      { title: 'Testing React Apps', desc: 'Jest, React Testing Library, Cypress', done: false },
      { title: 'CSS & Animations', desc: 'Flexbox, Grid, Tailwind, Framer Motion', done: false },
    ],
    topics: ['React', 'TypeScript', 'Redux', 'Testing', 'CSS', 'Performance'],
    link: 'https://react.dev/learn',
  },
  {
    id: 'ml-basics',
    category: 'Machine Learning',
    color: '#8B5CF6',
    icon: '🧠',
    title: 'Machine Learning Essentials',
    description: 'From linear regression to neural networks — understand the math and intuition behind modern ML.',
    level: 'Advanced',
    duration: '50 hrs',
    lessons: [
      { title: 'Linear & Logistic Regression', desc: 'Gradient descent, cost functions, regularization', done: false },
      { title: 'Decision Trees & Random Forests', desc: 'Entropy, Gini index, feature importance', done: false },
      { title: 'Neural Networks', desc: 'Backpropagation, activation functions, layers', done: false },
      { title: 'Model Evaluation', desc: 'Bias-variance tradeoff, cross-validation, metrics', done: false },
      { title: 'NLP Basics', desc: 'Tokenization, TF-IDF, word embeddings', done: false },
      { title: 'Python for ML', desc: 'NumPy, Pandas, Scikit-learn, Matplotlib', done: false },
    ],
    topics: ['Regression', 'Neural Networks', 'Scikit-learn', 'NLP', 'Python', 'Statistics'],
    link: 'https://www.coursera.org/learn/machine-learning',
  },
  {
    id: 'behavioral',
    category: 'Soft Skills',
    color: '#F59E0B',
    icon: '🎯',
    title: 'Behavioral Interview Mastery',
    description: 'Ace HR and behavioral interviews using the STAR method with real examples and storytelling techniques.',
    level: 'Beginner',
    duration: '10 hrs',
    lessons: [
      { title: 'The STAR Method', desc: 'Situation, Task, Action, Result — with examples', done: false },
      { title: 'Leadership & Initiative', desc: 'How to frame leadership stories powerfully', done: false },
      { title: 'Conflict Resolution', desc: 'Handling disagreements, difficult stakeholders', done: false },
      { title: 'Failure & Learnings', desc: 'Turn failures into growth stories', done: false },
      { title: 'Questions to Ask', desc: 'Thoughtful questions that impress interviewers', done: false },
      { title: 'Salary Negotiation', desc: 'Research, anchoring, counter-offers', done: false },
    ],
    topics: ['STAR Method', 'Storytelling', 'Communication', 'Leadership', 'Negotiation'],
    link: 'https://www.themuse.com/advice/star-interview-method',
  },
  {
    id: 'sql',
    category: 'Databases',
    color: '#14B8A6',
    icon: '🗄️',
    title: 'SQL & Database Design',
    description: 'Write complex queries, design normalized schemas, and optimize database performance for interviews.',
    level: 'Intermediate',
    duration: '15 hrs',
    lessons: [
      { title: 'SQL Foundations', desc: 'SELECT, WHERE, JOIN, GROUP BY, HAVING', done: false },
      { title: 'Advanced Queries', desc: 'CTEs, window functions, subqueries', done: false },
      { title: 'Schema Design', desc: 'Normalization (1NF-3NF), ER diagrams', done: false },
      { title: 'Indexes & Performance', desc: 'B-trees, query optimization, EXPLAIN', done: false },
      { title: 'Transactions & ACID', desc: 'Isolation levels, deadlocks, rollbacks', done: false },
      { title: 'NoSQL Overview', desc: 'MongoDB, Redis, DynamoDB use cases', done: false },
    ],
    topics: ['SQL', 'Joins', 'Indexing', 'ACID', 'MongoDB', 'Schema Design'],
    link: 'https://sqlzoo.net/',
  },
];

export default function CoursesScreen() {
  const [expandedId, setExpandedId] = useState(null);
  const [progressMap, setProgressMap] = useState({}); // { courseId: Set of done lesson indices }

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const toggleLesson = (courseId, lessonIdx) => {
    setProgressMap(prev => {
      const set = new Set(prev[courseId] || []);
      if (set.has(lessonIdx)) set.delete(lessonIdx);
      else set.add(lessonIdx);
      return { ...prev, [courseId]: set };
    });
  };

  const getProgress = (courseId, total) => {
    const done = (progressMap[courseId] || new Set()).size;
    return { done, total, pct: Math.round((done / total) * 100) };
  };

  const openLink = (url) => {
    Linking.canOpenURL(url).then(supported => {
      if (supported) Linking.openURL(url);
      else Alert.alert('Cannot open URL', url);
    });
  };

  const levelColor = (level) => {
    if (level === 'Beginner') return '#10B981';
    if (level === 'Intermediate') return '#F59E0B';
    return '#EF4444';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>🎓 Learning Courses</Text>
          <Text style={styles.subtitle}>
            Structured courses to help you prepare for technical and behavioral interviews.
            Track your progress lesson by lesson.
          </Text>
        </View>

        {COURSES.map(course => {
          const isExpanded = expandedId === course.id;
          const { done, total, pct } = getProgress(course.id, course.lessons.length);

          return (
            <View key={course.id} style={[styles.card, { borderLeftColor: course.color }]}>
              {/* Card Header */}
              <TouchableOpacity onPress={() => toggleExpand(course.id)} activeOpacity={0.8}>
                <View style={styles.cardTop}>
                  <View style={[styles.iconBox, { backgroundColor: course.color + '18' }]}>
                    <Text style={styles.cardIcon}>{course.icon}</Text>
                  </View>
                  <View style={styles.cardMeta}>
                    <Text style={styles.cardCategory}>{course.category}</Text>
                    <Text style={styles.cardTitle}>{course.title}</Text>
                    <View style={styles.badgeRow}>
                      <View style={[styles.levelBadge, { backgroundColor: levelColor(course.level) + '22', borderColor: levelColor(course.level) }]}>
                        <Text style={[styles.levelText, { color: levelColor(course.level) }]}>{course.level}</Text>
                      </View>
                      <Text style={styles.durationText}>⏱ {course.duration}</Text>
                    </View>
                  </View>
                  <Text style={styles.chevron}>{isExpanded ? '▲' : '▼'}</Text>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressRow}>
                  <View style={styles.progressBg}>
                    <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: course.color }]} />
                  </View>
                  <Text style={styles.progressLabel}>{done}/{total}</Text>
                </View>

                <Text style={styles.cardDesc}>{course.description}</Text>

                {/* Topic Tags */}
                <View style={styles.tagRow}>
                  {course.topics.map((t, i) => (
                    <View key={i} style={[styles.topicTag, { borderColor: course.color + '44', backgroundColor: course.color + '11' }]}>
                      <Text style={[styles.topicText, { color: course.color }]}>{t}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>

              {/* Expanded Lessons */}
              {isExpanded && (
                <View style={styles.lessonsContainer}>
                  <Text style={styles.lessonsHeader}>📚 Lessons</Text>
                  {course.lessons.map((lesson, idx) => {
                    const isDone = (progressMap[course.id] || new Set()).has(idx);
                    return (
                      <TouchableOpacity
                        key={idx}
                        style={[styles.lessonItem, isDone && styles.lessonDone]}
                        onPress={() => toggleLesson(course.id, idx)}
                        activeOpacity={0.75}
                      >
                        <View style={[styles.lessonCheck, isDone && { backgroundColor: course.color }]}>
                          {isDone && <Text style={styles.checkMark}>✓</Text>}
                        </View>
                        <View style={styles.lessonText}>
                          <Text style={[styles.lessonTitle, isDone && styles.lessonTitleDone]}>
                            {lesson.title}
                          </Text>
                          <Text style={styles.lessonDesc}>{lesson.desc}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}

                  {/* Start Learning Button */}
                  <TouchableOpacity
                    style={[styles.startBtn, { backgroundColor: course.color }]}
                    onPress={() => openLink(course.link)}
                  >
                    <Text style={styles.startBtnText}>🔗 Start Learning Online</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  scrollContent: { padding: 20, paddingBottom: 50 },
  header: { marginBottom: 28 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#6366F1', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#94A3B8', lineHeight: 22 },

  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#334155',
    borderLeftWidth: 4,
    marginBottom: 16,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 14 },
  iconBox: {
    width: 52, height: 52, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    flexShrink: 0,
  },
  cardIcon: { fontSize: 26 },
  cardMeta: { flex: 1 },
  cardCategory: { fontSize: 11, color: '#64748B', fontWeight: '600', textTransform: 'uppercase', marginBottom: 2 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 6, lineHeight: 22 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  levelBadge: { borderWidth: 1, borderRadius: 12, paddingVertical: 2, paddingHorizontal: 10 },
  levelText: { fontSize: 11, fontWeight: '700' },
  durationText: { fontSize: 12, color: '#64748B' },
  chevron: { color: '#475569', fontSize: 12, marginTop: 4 },

  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  progressBg: { flex: 1, height: 5, backgroundColor: '#0F172A', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  progressLabel: { fontSize: 11, color: '#64748B', fontWeight: '600', minWidth: 28, textAlign: 'right' },

  cardDesc: { fontSize: 13.5, color: '#94A3B8', lineHeight: 20, marginBottom: 12 },

  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  topicTag: {
    borderWidth: 1, borderRadius: 20,
    paddingVertical: 3, paddingHorizontal: 10,
  },
  topicText: { fontSize: 11, fontWeight: '600' },

  lessonsContainer: { marginTop: 16, borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 16 },
  lessonsHeader: { fontSize: 15, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 12 },

  lessonItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#0F172A',
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  lessonDone: { borderColor: '#334155', opacity: 0.75 },
  lessonCheck: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: '#334155',
    justifyContent: 'center', alignItems: 'center',
    flexShrink: 0, marginTop: 2,
  },
  checkMark: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' },
  lessonText: { flex: 1 },
  lessonTitle: { fontSize: 14, fontWeight: '600', color: '#F8FAFC', marginBottom: 3 },
  lessonTitleDone: { textDecorationLine: 'line-through', color: '#64748B' },
  lessonDesc: { fontSize: 12, color: '#64748B', lineHeight: 18 },

  startBtn: {
    borderRadius: 10,
    padding: 13,
    alignItems: 'center',
    marginTop: 12,
  },
  startBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
});
