import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  SafeAreaView,
} from 'react-native';

const COURSES = [
  { id: 'python', icon: '🐍', category: 'Programming', color: '#3B82F6', title: 'Python Programming', description: 'Master Python from basics to advanced concepts like decorators and generators.', level: 'Beginner', duration: '40 hrs' },
  { id: 'java', icon: '☕', category: 'Programming', color: '#F59E0B', title: 'Java Programming', description: 'Learn object-oriented programming with Java and build robust applications.', level: 'Beginner', duration: '45 hrs' },
  { id: 'dsa', icon: '🧮', category: 'Computer Science', color: '#8B5CF6', title: 'Data Structures & Algorithms', description: 'Ace your coding interviews by mastering core DSA concepts.', level: 'Intermediate', duration: '60 hrs' },
  { id: 'ai', icon: '🤖', category: 'AI / ML', color: '#EC4899', title: 'Artificial Intelligence', description: 'Dive into the world of AI, search algorithms, and intelligent systems.', level: 'Advanced', duration: '50 hrs' },
  { id: 'ml', icon: '📊', category: 'AI / ML', color: '#10B981', title: 'Machine Learning', description: 'Understand supervised, unsupervised, and reinforcement learning.', level: 'Advanced', duration: '55 hrs' },
  { id: 'dl', icon: '🧠', category: 'AI / ML', color: '#6366F1', title: 'Deep Learning', description: 'Build neural networks using TensorFlow and PyTorch.', level: 'Advanced', duration: '60 hrs' },
  { id: 'genai', icon: '✨', category: 'AI / ML', color: '#D946EF', title: 'Generative AI', description: 'Learn about LLMs, transformers, and prompt engineering.', level: 'Advanced', duration: '45 hrs' },
  { id: 'datascience', icon: '🔬', category: 'Data', color: '#0EA5E9', title: 'Data Science', description: 'Extract insights from data using Pandas, NumPy, and visualization tools.', level: 'Intermediate', duration: '50 hrs' },
  { id: 'webdev', icon: '🌐', category: 'Web', color: '#F43F5E', title: 'Web Development', description: 'Master HTML, CSS, and vanilla JavaScript for modern web building.', level: 'Beginner', duration: '40 hrs' },
  { id: 'react', icon: '⚛️', category: 'Web', color: '#06B6D4', title: 'React.js', description: 'Build interactive user interfaces with React and hooks.', level: 'Intermediate', duration: '35 hrs' },
  { id: 'nodejs', icon: '🟢', category: 'Backend', color: '#84CC16', title: 'Node.js', description: 'Develop scalable backend applications using JavaScript.', level: 'Intermediate', duration: '35 hrs' },
  { id: 'fastapi', icon: '⚡', category: 'Backend', color: '#059669', title: 'FastAPI', description: 'Create high-performance APIs with Python and FastAPI.', level: 'Intermediate', duration: '25 hrs' },
  { id: 'sql', icon: '🗄️', category: 'Databases', color: '#3B82F6', title: 'SQL & Database Management', description: 'Learn database design, querying, and optimization.', level: 'Beginner', duration: '30 hrs' },
  { id: 'cloud', icon: '☁️', category: 'Cloud', color: '#F97316', title: 'Cloud Computing (AWS)', description: 'Deploy and manage applications on Amazon Web Services.', level: 'Intermediate', duration: '45 hrs' },
  { id: 'devops', icon: '🔧', category: 'DevOps', color: '#6366F1', title: 'DevOps', description: 'Automate workflows with CI/CD, Docker, and Kubernetes.', level: 'Advanced', duration: '50 hrs' },
  { id: 'security', icon: '🔒', category: 'Security', color: '#EF4444', title: 'Cyber Security', description: 'Learn ethical hacking, network security, and cryptography.', level: 'Intermediate', duration: '40 hrs' },
  { id: 'systemdesign', icon: '🏗️', category: 'Architecture', color: '#8B5CF6', title: 'System Design', description: 'Design scalable, highly available software architectures.', level: 'Advanced', duration: '40 hrs' },
  { id: 'testing', icon: '🧪', category: 'Quality', color: '#14B8A6', title: 'Software Testing', description: 'Master unit, integration, and end-to-end testing methodologies.', level: 'Beginner', duration: '25 hrs' },
  { id: 'git', icon: '🌿', category: 'Tools', color: '#F43F5E', title: 'Git & GitHub', description: 'Version control your code and collaborate with teams effectively.', level: 'Beginner', duration: '15 hrs' },
  { id: 'aptitude', icon: '🎯', category: 'Aptitude', color: '#EAB308', title: 'Aptitude & Interview Prep', description: 'Crack quantitative, logical, and verbal aptitude tests.', level: 'Beginner', duration: '30 hrs' },
];

const levelColor = (level) => {
  if (level === 'Beginner') return '#10B981';
  if (level === 'Intermediate') return '#F59E0B';
  return '#EF4444';
};

export default function CoursesScreen({ navigation }) {
  const [searchQuery] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>🎓 Learning Path</Text>
          <Text style={styles.subtitle}>
            Explore trending technology courses. Master new skills with theory, code examples, and interview prep guides.
          </Text>
        </View>

        {COURSES.map(course => (
          <View key={course.id} style={[styles.card, { borderLeftColor: course.color }]}>
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
            </View>

            <Text style={styles.cardDesc}>{course.description}</Text>

            <TouchableOpacity
              style={[styles.viewBtn, { backgroundColor: course.color + '18', borderColor: course.color + '55' }]}
              onPress={() => navigation.navigate('CourseDetail', { courseId: course.id })}
              activeOpacity={0.75}
            >
              <Text style={[styles.viewBtnText, { color: course.color }]}>📖 View Course</Text>
            </TouchableOpacity>
          </View>
        ))}
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
    marginBottom: 14,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 10 },
  iconBox: {
    width: 50, height: 50, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    flexShrink: 0,
  },
  cardIcon: { fontSize: 24 },
  cardMeta: { flex: 1 },
  cardCategory: { fontSize: 10, color: '#64748B', fontWeight: '600', textTransform: 'uppercase', marginBottom: 2 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 6, lineHeight: 20 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  levelBadge: { borderWidth: 1, borderRadius: 10, paddingVertical: 2, paddingHorizontal: 8 },
  levelText: { fontSize: 10, fontWeight: '700' },
  durationText: { fontSize: 11, color: '#64748B' },

  cardDesc: { fontSize: 13, color: '#94A3B8', lineHeight: 20, marginBottom: 14 },

  viewBtn: {
    borderRadius: 10,
    padding: 11,
    alignItems: 'center',
    borderWidth: 1,
  },
  viewBtnText: { fontSize: 14, fontWeight: 'bold' },
});
