import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, FlatList } from 'react-native';

const interviewCategories = [
  {
    id: 'hr',
    title: 'HR & Behavioral',
    icon: '👥',
    description: 'Master behavioral questions, culture fit, and communication skills.',
    difficulty: 'Beginner to Intermediate',
    duration: '30 mins',
    color: '#3B82F6',
    questions: [
      'Tell me about yourself and your professional background.',
      'Why are you interested in this specific role?',
      'Describe a challenging situation at work and how you handled it.',
      'Where do you see yourself in 5 years?',
      'How do you handle working under pressure or tight deadlines?'
    ]
  },
  {
    id: 'frontend',
    title: 'Frontend Developer',
    icon: '💻',
    description: 'React, Vue, HTML/CSS, and browser rendering optimization questions.',
    difficulty: 'Intermediate',
    duration: '45 mins',
    color: '#EC4899',
    questions: [
      'Explain the Virtual DOM and how React uses it to optimize rendering.',
      'What are React Hooks and why were they introduced in React 16.8?',
      'How do you optimize the performance of a React application?',
      'Explain the CSS box model in detail.',
      'Explain closures in JavaScript with an example.'
    ]
  },
  {
    id: 'backend',
    title: 'Backend Developer',
    icon: '🗄️',
    description: 'API design, databases, system architecture, and server logic.',
    difficulty: 'Advanced',
    duration: '60 mins',
    color: '#10B981',
    questions: [
      'What is the difference between REST and GraphQL?',
      'Explain database normalization (1NF, 2NF, 3NF) and why it matters.',
      'How would you design a URL shortener service at scale?',
      'What is database indexing and how does it improve performance?',
      'Explain the CAP theorem in distributed systems.'
    ]
  },
  {
    id: 'data-science',
    title: 'Data Scientist',
    icon: '🧠',
    description: 'Machine Learning models, statistics, Python, and data manipulation.',
    difficulty: 'Advanced',
    duration: '60 mins',
    color: '#8B5CF6',
    questions: [
      'What is overfitting and how do you prevent it?',
      'Explain how a Random Forest algorithm works.',
      'What is the p-value and how do you interpret it in hypothesis testing?',
      'Explain the bias-variance tradeoff.',
      'How do you handle missing data in a dataset?'
    ]
  },
  {
    id: 'product-manager',
    title: 'Product Manager',
    icon: '💼',
    description: 'Product strategy, agile methodologies, and user prioritization.',
    difficulty: 'Intermediate to Advanced',
    duration: '45 mins',
    color: '#F97316',
    questions: [
      'How do you prioritize features in a product backlog?',
      'Describe a product you think is poorly designed and why.',
      'How do you measure the success of a product launch?',
      'Explain the concept of MVP (Minimum Viable Product).',
      'How do you define user personas and use them in product decisions?'
    ]
  },
  {
    id: 'ui-ux',
    title: 'UI/UX Designer',
    icon: '🎨',
    description: 'User research, wireframing, design systems, and usability testing.',
    difficulty: 'Intermediate',
    duration: '45 mins',
    color: '#14B8A6',
    questions: [
      'Walk me through your design process for a new feature.',
      'How do you handle negative feedback on your designs?',
      'Explain the difference between responsive and adaptive design.',
      'How do you conduct user research effectively?',
      'What is a design system and why is it important?'
    ]
  }
];

export default function InterviewsScreen({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleStartInterview = (category) => {
    navigation.navigate('LiveInterview', { domain: category.title });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Interview Prep Hub</Text>
          <Text style={styles.subtitle}>
            Select a domain below to start your AI-powered live video interview. Practice answering questions and get immediate feedback.
          </Text>
        </View>

        <View style={styles.grid}>
          {interviewCategories.map((category) => {
            const isSelected = selectedCategory?.id === category.id;
            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.card,
                  { borderColor: isSelected ? category.color : '#334155', borderWidth: isSelected ? 2 : 1 }
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.iconBox, { backgroundColor: category.color + '15' }]}>
                    <Text style={[styles.icon, { color: category.color }]}>{category.icon}</Text>
                  </View>
                  <Text style={styles.cardTitle}>{category.title}</Text>
                </View>

                <Text style={styles.description}>{category.description}</Text>

                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>📶 {category.difficulty}</Text>
                  <Text style={styles.metaText}>⏱️ {category.duration}</Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.startButton,
                    { backgroundColor: isSelected ? category.color : '#1E293B' }
                  ]}
                  onPress={() => handleStartInterview(category)}
                >
                  <Text style={[styles.startButtonText, { color: isSelected ? '#FFFFFF' : '#94A3B8' }]}>
                    ▶ Start Live Interview
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
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
  header: {
    marginBottom: 28,
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
  grid: {
    flexDirection: 'column',
    gap: 20,
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    borderColor: '#334155',
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  description: {
    color: '#94A3B8',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metaText: {
    fontSize: 13,
    color: '#64748B',
  },
  startButton: {
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  startButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  sampleBox: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sampleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  questionItem: {
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    marginBottom: 12,
  },
  questionText: {
    color: '#F8FAFC',
    fontSize: 14,
    lineHeight: 20,
  },
});
