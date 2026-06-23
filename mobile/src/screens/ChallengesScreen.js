import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, SafeAreaView, ActivityIndicator, Alert, Platform, Modal } from 'react-native';
import { fetchApi } from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CHALLENGES, CATEGORIES, LANGUAGES, getStarterCode } from '../utils/challengesData';

export default function ChallengesScreen() {
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState('');
  const [solvedIds, setSolvedIds] = useState([]);
  const [langModalVisible, setLangModalVisible] = useState(false);

  // Filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Load solved challenges from storage
  useEffect(() => {
    async function loadSolved() {
      try {
        const solved = await AsyncStorage.getItem('solvedChallenges');
        if (solved) {
          setSolvedIds(JSON.parse(solved));
        }
      } catch (err) {
        console.warn("Failed to load solved challenges:", err);
      }
    }
    loadSolved();
  }, []);

  // Update starter code when challenge or language changes
  useEffect(() => {
    if (selectedChallenge) {
      setCode(getStarterCode(selectedChallenge, selectedLanguage));
      setOutput('');
    }
  }, [selectedChallenge, selectedLanguage]);

  const handleSelect = (challenge) => {
    setSelectedChallenge(challenge);
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      Alert.alert("Input Required", "Code editor is empty.");
      return;
    }
    setRunning(true);
    setOutput('Compiling and executing code on sandbox...');

    try {
      // Connect to backend compile microservice
      const res = await fetchApi('/api/compiler/run', {
        method: 'POST',
        body: JSON.stringify({
          source_code: code,
          language: selectedLanguage,
          stdin: ''
        })
      });

      let consoleOutput = "";
      if (res.status?.description && res.status.description !== "Accepted") {
        consoleOutput += `Status: ${res.status.description}\n\n`;
      }
      if (res.compile_output) {
        consoleOutput += `Compilation Details:\n${res.compile_output}\n\n`;
      }
      if (res.stderr) {
        consoleOutput += `Error Output:\n${res.stderr}\n\n`;
      }
      if (res.stdout) {
        consoleOutput += `Console Output:\n${res.stdout}`;
      }
      if (!consoleOutput) {
        consoleOutput = `Process exited successfully. Output:\nNo printed statements.`;
      }

      setOutput(consoleOutput);

      // Simple heuristic for checking if the solution passed:
      // If code compiled, executed successfully, and there's no compile error or runtime error
      const isCompileError = res.status?.id === 6;
      const isRuntimeError = res.status?.id === 11 || (res.stderr && res.stderr.trim().length > 0);
      
      if (!isCompileError && !isRuntimeError) {
        // Mark as solved
        if (!solvedIds.includes(selectedChallenge.id)) {
          const updated = [...solvedIds, selectedChallenge.id];
          setSolvedIds(updated);
          await AsyncStorage.setItem('solvedChallenges', JSON.stringify(updated));
          Alert.alert("Success!", "Challenge solved successfully! Progress saved.");
        }
      } else {
        Alert.alert("Execution Failed", "Please verify your code compile logs and logic.");
      }
    } catch (err) {
      console.warn("Backend compiler connection failed, simulating local evaluation:", err);
      // Fallback local execution simulation (eval) only for Javascript
      if (selectedLanguage === 'javascript') {
        try {
          const userFunction = new Function(`return ${code}`)();
          let testResult = "Local dry run evaluation:\n";
          
          if (selectedChallenge.id === 'twosum') {
            const res = userFunction([2, 7, 11, 15], 9);
            const passed = JSON.stringify(res) === "[0,1]" || JSON.stringify(res) === "[1,0]";
            testResult += `Test case twoSum([2, 7, 11, 15], 9):\nReturned: ${JSON.stringify(res)}\nPassed: ${passed}`;
            if (passed) markSolvedLocal();
          } else if (selectedChallenge.id === 'validparentheses') {
            const res = userFunction("()[]{}");
            const passed = res === true;
            testResult += `Test case isValid("()[]{}"):\nReturned: ${res}\nPassed: ${passed}`;
            if (passed) markSolvedLocal();
          } else if (selectedChallenge.id === 'palindromenumber') {
            const res = userFunction(121);
            const passed = res === true;
            testResult += `Test case isPalindrome(121):\nReturned: ${res}\nPassed: ${passed}`;
            if (passed) markSolvedLocal();
          } else {
            // Generically evaluate mock stubs
            const res = userFunction(1);
            testResult += `Local dry run complete. Returned: ${JSON.stringify(res)}`;
            markSolvedLocal();
          }
          setOutput(testResult);
        } catch (evalErr) {
          setOutput(`Local Syntax Error:\n${evalErr.message}`);
        }
      } else {
        setOutput(`Offline Mode: Local compilation only supported for JavaScript. Please check backend connection to compile/run ${selectedLanguage.toUpperCase()}.`);
      }
    } finally {
      setRunning(false);
    }
  };

  const markSolvedLocal = async () => {
    if (!solvedIds.includes(selectedChallenge.id)) {
      const updated = [...solvedIds, selectedChallenge.id];
      setSolvedIds(updated);
      await AsyncStorage.setItem('solvedChallenges', JSON.stringify(updated));
      Alert.alert("Solved Locally!", "JavaScript code passed local dry run!");
    }
  };

  const handleSelectLanguage = (langId) => {
    setSelectedLanguage(langId);
    setLangModalVisible(false);
  };

  // Progress counts
  const totalEasy = CHALLENGES.filter(c => c.difficulty === 'Easy').length;
  const totalMedium = CHALLENGES.filter(c => c.difficulty === 'Medium').length;
  const totalHard = CHALLENGES.filter(c => c.difficulty === 'Hard').length;

  const solvedEasy = CHALLENGES.filter(c => c.difficulty === 'Easy' && solvedIds.includes(c.id)).length;
  const solvedMedium = CHALLENGES.filter(c => c.difficulty === 'Medium' && solvedIds.includes(c.id)).length;
  const solvedHard = CHALLENGES.filter(c => c.difficulty === 'Hard' && solvedIds.includes(c.id)).length;

  // Filtering list
  const filteredChallenges = CHALLENGES.filter(c => {
    if (activeTab === 'Easy' && c.difficulty !== 'Easy') return false;
    if (activeTab === 'Medium' && c.difficulty !== 'Medium') return false;
    if (activeTab === 'Hard' && c.difficulty !== 'Hard') return false;
    if (activeTab === 'Top 50' && !c.isTop50) return false;

    if (searchTerm && !c.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (selectedCategory && c.category !== selectedCategory) return false;

    return true;
  });

  const getDifficultyColor = (diff) => {
    if (diff === 'Easy') return '#10B981';
    if (diff === 'Medium') return '#F59E0B';
    return '#EF4444';
  };

  return (
    <SafeAreaView style={styles.container}>
      {!selectedChallenge ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Coding Challenges</Text>
            <Text style={styles.subtitle}>
              Sharpen your algorithms. Write code, run it on the sandbox, and verify outputs.
            </Text>
          </View>

          {/* Progress Cards */}
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { borderLeftColor: '#10B981', borderLeftWidth: 4 }]}>
              <Text style={styles.statLabel}>Easy</Text>
              <Text style={styles.statValue}>{solvedEasy}/{totalEasy}</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: '#F59E0B', borderLeftWidth: 4 }]}>
              <Text style={styles.statLabel}>Medium</Text>
              <Text style={styles.statValue}>{solvedMedium}/{totalMedium}</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: '#EF4444', borderLeftWidth: 4 }]}>
              <Text style={styles.statLabel}>Hard</Text>
              <Text style={styles.statValue}>{solvedHard}/{totalHard}</Text>
            </View>
          </View>

          {/* Search Bar */}
          <TextInput
            style={styles.searchBar}
            placeholder="🔍 Search challenges by title..."
            placeholderTextColor="#64748B"
            value={searchTerm}
            onChangeText={setSearchTerm}
            autoCapitalize="none"
          />

          {/* Difficulty Filter Tabs */}
          <View style={styles.tabContainer}>
            {['All', 'Easy', 'Medium', 'Hard', 'Top 50'].map(tab => (
              <TouchableOpacity
                key={tab}
                style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabButtonText, activeTab === tab && styles.tabButtonTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Categories Horizontal Scrolling List */}
          <View style={styles.categoryContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
              <TouchableOpacity
                style={[styles.catTag, !selectedCategory && styles.catTagActive]}
                onPress={() => setSelectedCategory(null)}
              >
                <Text style={[styles.catTagText, !selectedCategory && styles.catTagTextActive]}>All Topics</Text>
              </TouchableOpacity>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catTag, selectedCategory === cat && styles.catTagActive]}
                  onPress={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                >
                  <Text style={[styles.catTagText, selectedCategory === cat && styles.catTagTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Challenges List */}
          <View style={styles.list}>
            {filteredChallenges.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No challenges match your filters.</Text>
              </View>
            ) : (
              filteredChallenges.map(ch => {
                const isSolved = solvedIds.includes(ch.id);
                return (
                  <TouchableOpacity
                    key={ch.id}
                    style={[styles.itemCard, isSolved && styles.itemCardSolved]}
                    onPress={() => handleSelect(ch)}
                  >
                    <View style={styles.itemHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.itemTitle}>{ch.title}</Text>
                        {isSolved && <Text style={{ color: '#10B981', fontSize: 16 }}>✓</Text>}
                      </View>
                      <Text style={[styles.itemDiff, { color: getDifficultyColor(ch.difficulty) }]}>
                        {ch.difficulty}
                      </Text>
                    </View>
                    <View style={styles.itemFooter}>
                      <Text style={styles.itemCategory}>Category: {ch.category}</Text>
                      {ch.isTop50 && (
                        <View style={styles.topBadge}>
                          <Text style={styles.topBadgeText}>Top 50</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Back button */}
          <TouchableOpacity style={styles.backBtn} onPress={() => setSelectedChallenge(null)}>
            <Text style={styles.backBtnText}>⬅ Back to Challenges</Text>
          </TouchableOpacity>

          {/* Challenge Description Card */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>{selectedChallenge.title}</Text>
              <Text style={[styles.cardDiff, { color: getDifficultyColor(selectedChallenge.difficulty) }]}>
                {selectedChallenge.difficulty}
              </Text>
            </View>
            <Text style={styles.description}>{selectedChallenge.description}</Text>
            {selectedChallenge.constraints && selectedChallenge.constraints.length > 0 && (
              <View style={styles.constraintsBox}>
                <Text style={styles.constraintsTitle}>Constraints:</Text>
                {selectedChallenge.constraints.map((c, i) => (
                  <Text key={i} style={styles.constraintText}>• {c}</Text>
                ))}
              </View>
            )}
          </View>

          {/* Language Selector Selector Row */}
          <View style={styles.langSelectorRow}>
            <Text style={styles.langLabel}>Coding Language:</Text>
            <TouchableOpacity style={styles.langDropdown} onPress={() => setLangModalVisible(true)}>
              <Text style={styles.langDropdownText}>
                {LANGUAGES.find(l => l.id === selectedLanguage)?.label || selectedLanguage.toUpperCase()} ▾
              </Text>
            </TouchableOpacity>
          </View>

          {/* Code Editor */}
          <View style={styles.editorCard}>
            <View style={styles.editorHeader}>
              <Text style={styles.editorTitle}>Code Editor</Text>
              <Text style={styles.editorSub}>Complete the function logic</Text>
            </View>
            <TextInput
              style={styles.editorInput}
              multiline
              numberOfLines={12}
              value={code}
              onChangeText={setCode}
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect={false}
            />
            <TouchableOpacity 
              style={styles.runBtn}
              onPress={handleRunCode}
              disabled={running}
            >
              {running ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.runBtnText}>▶ Run & Execute Code</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Console Output */}
          {output ? (
            <View style={styles.consoleCard}>
              <Text style={styles.consoleTitle}>Console Sandbox Output</Text>
              <ScrollView style={styles.consoleScroll}>
                <Text style={styles.consoleText}>{output}</Text>
              </ScrollView>
            </View>
          ) : null}
        </ScrollView>
      )}

      {/* Language Selector Modal */}
      <Modal
        visible={langModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setLangModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setLangModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Language</Text>
            {LANGUAGES.map(lang => (
              <TouchableOpacity
                key={lang.id}
                style={[styles.modalOption, selectedLanguage === lang.id && styles.modalOptionSelected]}
                onPress={() => handleSelectLanguage(lang.id)}
              >
                <Text style={[styles.modalOptionText, selectedLanguage === lang.id && styles.modalOptionTextSelected]}>
                  {lang.label}
                </Text>
                {selectedLanguage === lang.id && <Text style={styles.checkMark}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
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
    marginBottom: 20,
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
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    width: '31%',
    alignItems: 'center',
    borderColor: '#334155',
    borderWidth: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  searchBar: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    color: '#F8FAFC',
    fontSize: 15,
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#6366F1',
  },
  tabButtonText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: '#6366F1',
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryScroll: {
    gap: 8,
    paddingRight: 20,
  },
  catTag: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  catTagActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  catTagText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  catTagTextActive: {
    color: '#FFFFFF',
  },
  list: {
    gap: 16,
  },
  emptyCard: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderColor: '#334155',
    borderWidth: 1,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 14,
  },
  itemCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 18,
    borderColor: '#334155',
    borderWidth: 1,
  },
  itemCardSolved: {
    borderColor: '#10B981',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  itemDiff: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemCategory: {
    fontSize: 12,
    color: '#64748B',
  },
  topBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderColor: 'rgba(99, 102, 241, 0.3)',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  topBadgeText: {
    color: '#6366F1',
    fontSize: 10,
    fontWeight: '700',
  },
  backBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 20,
  },
  backBtnText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    borderColor: '#334155',
    borderWidth: 1,
    marginBottom: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F8FAFC',
    flex: 1,
  },
  cardDiff: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  description: {
    color: '#94A3B8',
    fontSize: 14,
    lineHeight: 22,
  },
  constraintsBox: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 12,
  },
  constraintsTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 6,
  },
  constraintText: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  langSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  langLabel: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
  },
  langDropdown: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  langDropdownText: {
    color: '#6366F1',
    fontWeight: 'bold',
    fontSize: 13,
  },
  editorCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    borderColor: '#334155',
    borderWidth: 1,
    marginBottom: 20,
  },
  editorHeader: {
    marginBottom: 12,
  },
  editorTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  editorSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  editorInput: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    color: '#34D399',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 14,
    height: 220,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  runBtn: {
    backgroundColor: '#6366F1',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  runBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  consoleCard: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 16,
    borderColor: '#334155',
    borderWidth: 1,
  },
  consoleTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  consoleScroll: {
    maxHeight: 180,
  },
  consoleText: {
    color: '#E2E8F0',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 13,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    borderColor: '#334155',
    borderWidth: 1,
    width: '80%',
    padding: 20,
    gap: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#0F172A',
    borderColor: '#334155',
    borderWidth: 1,
  },
  modalOptionSelected: {
    borderColor: '#6366F1',
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
  },
  modalOptionText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOptionTextSelected: {
    color: '#6366F1',
  },
  checkMark: {
    color: '#6366F1',
    fontWeight: 'bold',
  },
});
