import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  SafeAreaView, Clipboard, Alert,
} from 'react-native';

// ─────────────────────────────────────────────────────────────────────────────
// Course data — mirrors web's CourseDetails.jsx exactly
// ─────────────────────────────────────────────────────────────────────────────
const courseData = {
  python: {
    title: 'Python Programming', difficulty: 'Beginner', estimatedTime: '40 Hours', color: '#3B82F6',
    description: 'Master Python syntax, Object-Oriented Programming, generators, decorators, and scripting libraries.',
    whatYoullLearn: ['Core Python syntax, dynamic typing, and variables', 'Control flow, conditional statements, and loops', 'Reusable code using functions, scopes, and lambdas', 'Lists, tuples, dictionaries, and sets', 'OOP with classes, inheritance, and methods', 'Exception handling and file I/O operations', 'Advanced patterns like decorators and generators'],
    prerequisites: ['Basic computer literacy', 'No prior programming experience required'],
    theory: 'Python is a high-level, interpreted programming language known for its exceptional readability and clean syntax. Created by Guido van Rossum in 1991, Python follows the Zen of Python: "beautiful is better than ugly" and "simple is better than complex."\n\nPython is dynamically typed and garbage-collected, supporting object-oriented, structured, and functional programming paradigms. Its extensive standard library — "batteries included" — provides built-in modules for networking, scripting, and file processing. Today, Python dominates AI, Machine Learning, and Data Science.',
    definitions: [{ term: 'PEP 8', def: 'Official Python style guide defining standards for writing readable code.' }, { term: 'Decorator', def: 'A design pattern wrapping a function to modify or extend its behavior without permanently changing its structure.' }, { term: 'Generator', def: 'A function using the yield keyword to return an iterator, generating values lazily to save memory.' }, { term: 'List Comprehension', def: 'A concise construct to create new lists based on existing iterables in a single line.' }, { term: 'GIL', def: 'Global Interpreter Lock: a mutex restricting Python bytecode execution to one thread at a time.' }],
    syntax: `def greet(name: str) -> str:\n    """Returns a formatted greeting string.\"\"\"\n    return f"Hello, {name}!"\n\nmessage = greet("World")\nprint(message)`,
    codeExamples: [{ title: 'Fibonacci Generator', code: `def fibonacci_generator(n):\n    a, b = 0, 1\n    for _ in range(n):\n        yield a\n        a, b = b, a + b\n\nfib_nums = list(fibonacci_generator(10))\nprint("Fibonacci:", fib_nums)` }, { title: 'Timing Decorator', code: `import time\n\ndef timing_decorator(func):\n    def wrapper(*args, **kwargs):\n        start = time.time()\n        result = func(*args, **kwargs)\n        print(f"{func.__name__} took {time.time()-start:.4f}s")\n        return result\n    return wrapper\n\n@timing_decorator\ndef heavy_calc():\n    return sum(i*i for i in range(1_000_000))\n\nheavy_calc()` }],
    roadmap: [{ step: 'Step 1', title: 'Basics & Setup', description: 'Install Python, learn variables, data types, operators, and basic I/O.' }, { step: 'Step 2', title: 'Control Flow', description: 'Master if-else, match statements, for loops, and while loops.' }, { step: 'Step 3', title: 'Data Structures', description: 'Explore Lists, Tuples, Dictionaries, and Sets.' }, { step: 'Step 4', title: 'Functions & Modules', description: 'Create functions, understand scopes, and import libraries.' }, { step: 'Step 5', title: 'OOP', description: 'Design classes, encapsulate attributes, and inherit behavior.' }, { step: 'Step 6', title: 'Advanced', description: 'Use decorators, generators, context managers, and lambdas.' }],
    qa: [{ q: 'What is the difference between a list and a tuple?', a: 'Lists are mutable (defined with []) and can be changed after creation. Tuples are immutable (defined with ()) and cannot be changed. Tuples are slightly faster and can be used as dict keys.' }, { q: 'How does memory management work in Python?', a: 'CPython uses reference counting to track active objects, automatically deleting objects when their count drops to zero. A cyclic garbage collector detects and resolves reference cycles.' }, { q: 'What is the difference between append() and extend()?', a: 'append() adds its argument as a single element. extend() iterates over its argument and adds each element individually.' }, { q: 'What is the GIL?', a: 'A mutex in CPython preventing multiple native threads from executing Python bytecodes simultaneously, ensuring memory safety but limiting CPU-bound multithreading.' }, { q: 'What are generators and why use them?', a: 'Functions using yield to return iterators, generating values lazily. Saves significant memory when working with large sequences.' }, { q: 'What is the difference between is and ==?', a: '== checks value equality. is checks identity — whether both variables refer to the same object in memory.' }, { q: 'How do decorators work?', a: 'Decorators wrap a function inside another function to modify its behavior, using @decorator_name syntactic sugar.' }, { q: 'What is a lambda function?', a: 'A small, anonymous function defined with the lambda keyword that can only contain a single expression. Example: lambda x, y: x + y.' }],
  },
  java: {
    title: 'Java Programming', difficulty: 'Beginner', estimatedTime: '45 Hours', color: '#F59E0B',
    description: 'Master Java OOP, multi-threading, JVM memory management, and the Collections framework.',
    whatYoullLearn: ['JVM architecture, compilation, and execution', 'OOP principles (abstraction, encapsulation, inheritance)', 'Java Collections (List, Set, Map, Queue)', 'Exception handling with Checked and Unchecked exceptions', 'Multi-threaded applications with Threads and Executors', 'Java 8+ Streams and Lambda expressions', 'Garbage Collection and memory tuning'],
    prerequisites: ['Familiarity with basic programming logic', 'Understanding of files and command line tools'],
    theory: 'Java is a robust, class-based, OOP language designed with "Write Once, Run Anywhere" (WORA) philosophy. Developed by James Gosling at Sun Microsystems in 1995, Java compiles source code to bytecode (.class) executed by the JVM on any platform.\n\nJava enforces static typing, compile-time safety, and automatic memory management via garbage collection. It remains dominant in enterprise backends, Android development, and financial systems.',
    definitions: [{ term: 'JVM', def: 'Java Virtual Machine: abstract computing machine enabling computers to run Java programs.' }, { term: 'Garbage Collection', def: 'Automatic process reclaiming heap memory by destroying objects no longer referenced.' }, { term: 'Interface', def: 'Completely abstract blueprint containing method signatures, used to achieve multiple inheritance.' }, { term: 'JDK vs JRE', def: 'JDK is the full toolset for writing and compiling Java. JRE contains only the JVM and libraries to run compiled Java.' }, { term: 'Thread', def: 'A concurrent unit of execution, supported natively via the Thread class and Runnable interface.' }],
    syntax: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`,
    codeExamples: [{ title: 'Multi-threading via Runnable', code: `class TaskRunner implements Runnable {\n    @Override\n    public void run() {\n        System.out.println("Task in: " + Thread.currentThread().getName());\n    }\n}\n\npublic class Demo {\n    public static void main(String[] args) {\n        Thread thread = new Thread(new TaskRunner());\n        thread.start();\n    }\n}` }, { title: 'Java 8 Stream API', code: `import java.util.*;\nimport java.util.stream.*;\n\nList<String> fruits = Arrays.asList("Apple","Banana","Cherry","Apricot");\nList<String> filtered = fruits.stream()\n    .filter(n -> n.startsWith("A"))\n    .map(String::toUpperCase)\n    .collect(Collectors.toList());\nSystem.out.println(filtered); // [APPLE, APRICOT]` }],
    roadmap: [{ step: 'Step 1', title: 'Java Basics', description: 'Data types, operators, arrays, conditionals, and console I/O.' }, { step: 'Step 2', title: 'OOP Foundations', description: 'Build classes, objects, access modifiers, and constructors.' }, { step: 'Step 3', title: 'Advanced OOP', description: 'Inheritance, method overriding, interfaces, and abstract classes.' }, { step: 'Step 4', title: 'Collections', description: 'ArrayLists, HashSets, HashMaps, and sorting comparators.' }, { step: 'Step 5', title: 'Error Handling', description: 'try-catch, throws, and custom exceptions.' }, { step: 'Step 6', title: 'Concurrency & Streams', description: 'Threads, synchronization, Executors, and functional Streams.' }],
    qa: [{ q: 'Why is Java not purely OOP?', a: 'Java supports primitive data types (int, char, float) directly without wrapping them in objects, prioritizing performance.' }, { q: 'What is the difference between equals() and ==?', a: '== compares memory references. equals() compares the actual values or state of objects.' }, { q: 'Checked vs unchecked exceptions?', a: 'Checked exceptions are verified at compile-time (IOException). Unchecked (RuntimeException) represent programming mistakes checked at runtime.' }, { q: 'final vs finally vs finalize?', a: 'final makes variable/method/class immutable/non-overridable. finally executes regardless of exception. finalize() is called before GC destroys an object (deprecated).' }, { q: 'HashMap collision resolution?', a: 'Uses linked list in the bucket. In Java 8+, if bucket exceeds 8 elements, converts to Red-Black Tree for O(log n) lookup.' }, { q: 'Purpose of volatile?', a: 'Ensures variable is always read/written from main memory instead of CPU cache, guaranteeing thread visibility.' }, { q: 'Why are Strings immutable?', a: 'For security, thread safety, and memory efficiency (Java uses a String Pool to reuse identical literals).' }, { q: 'What is a Functional Interface?', a: 'An interface with exactly one abstract method (@FunctionalInterface), enabling Lambda expressions in Java 8+.' }],
  },
  dsa: {
    title: 'Data Structures & Algorithms', difficulty: 'Intermediate', estimatedTime: '60 Hours', color: '#8B5CF6',
    description: 'Master time/space complexity, linear structures, trees, graphs, sorting, and dynamic programming.',
    whatYoullLearn: ['Algorithm analysis using Big O notation', 'Linear structures: Arrays, Linked Lists, Stacks, Queues', 'Tree structures: BSTs, Heaps, and AVL trees', 'Graph traversal: DFS and BFS', 'Sorting (Quicksort, Mergesort) and Binary Search', 'Dynamic programming and greedy strategies', 'Hash tables and collision resolution'],
    prerequisites: ['Proficiency in at least one programming language', 'Basic mathematics and logical reasoning'],
    theory: 'Data Structures and Algorithms (DSA) are the core building blocks of computer science. A data structure organizes data so it can be accessed and modified efficiently. An algorithm is a step-by-step procedure to solve a computational problem.\n\nEvaluating algorithms relies on complexity analysis. Time complexity measures how execution duration scales with input size. Space complexity measures memory footprint. Big O, Big Theta, and Big Omega notations analyze best, average, and worst-case scenarios.',
    definitions: [{ term: 'Big O Notation', def: 'Mathematical notation describing algorithm behavior as input size approaches infinity, representing worst-case performance.' }, { term: 'BST', def: 'Binary Search Tree: left subtree contains smaller keys, right subtree contains larger keys.' }, { term: 'Dynamic Programming', def: 'Technique solving complex problems by breaking into overlapping subproblems and caching results.' }, { term: 'Min-Heap', def: 'Complete binary tree where parent nodes are smaller than or equal to children, making root the minimum.' }, { term: 'Graph', def: 'Non-linear structure of vertices connected by edges.' }],
    syntax: `// Binary search\nint binarySearch(int arr[], int size, int target) {\n    int left = 0, right = size - 1;\n    while (left <= right) {\n        int mid = left + (right - left) / 2;\n        if (arr[mid] == target) return mid;\n        if (arr[mid] < target) left = mid + 1;\n        else right = mid - 1;\n    }\n    return -1;\n}`,
    codeExamples: [{ title: 'Recursive Quicksort', code: `def quicksort(arr):\n    if len(arr) <= 1: return arr\n    pivot = arr[len(arr) // 2]\n    left = [x for x in arr if x < pivot]\n    mid  = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n    return quicksort(left) + mid + quicksort(right)\n\nprint(quicksort([34, 7, 23, 32, 5, 62]))` }, { title: 'Graph BFS', code: `from collections import deque\n\ndef bfs(graph, start):\n    visited = set()\n    queue = deque([start])\n    visited.add(start)\n    result = []\n    while queue:\n        node = queue.popleft()\n        result.append(node)\n        for n in graph[node]:\n            if n not in visited:\n                visited.add(n)\n                queue.append(n)\n    return result` }],
    roadmap: [{ step: 'Step 1', title: 'Analysis & Basics', description: 'Space-time complexity, arrays, and string manipulation.' }, { step: 'Step 2', title: 'Linear Structures', description: 'Linked Lists, Stacks, Queues, and Hash Tables.' }, { step: 'Step 3', title: 'Searching & Sorting', description: 'Binary search, Mergesort, and Quicksort.' }, { step: 'Step 4', title: 'Non-Linear Structures', description: 'Binary Trees, BSTs, and Heaps.' }, { step: 'Step 5', title: 'Graph Operations', description: 'BFS, DFS, Dijkstra, and MST algorithms.' }, { step: 'Step 6', title: 'Advanced Algorithms', description: 'Recursion, backtracking, Greedy, and Dynamic Programming.' }],
    qa: [{ q: 'Array vs Linked List?', a: 'Arrays have O(1) random access but slow insertions. Linked Lists have O(1) insertions at endpoints but O(n) traversal for access.' }, { q: 'HashMap time complexity?', a: 'Average O(1). Worst case O(n) for lists or O(log n) for trees when all keys hash to the same bucket.' }, { q: 'BFS vs DFS?', a: 'BFS explores level-by-level using a Queue (ideal for shortest paths). DFS explores deep first using a Stack/recursion.' }, { q: 'How does Quicksort work?', a: 'Selects a pivot, partitions array into smaller/larger subarrays, recursively sorts each.' }, { q: 'Mergesort vs Quicksort?', a: 'Mergesort: stable, O(n log n) worst case, O(n) space. Quicksort: in-place, O(log n) space, O(n^2) worst case.' }, { q: 'What is Dynamic Programming?', a: 'Solves problems with overlapping subproblems and optimal substructure by memoizing results.' }, { q: 'What is a balanced binary tree?', a: 'A tree where left/right height difference is bounded, ensuring O(log n) operations (e.g. AVL, Red-Black trees).' }, { q: 'Stack vs Queue?', a: 'Stack: LIFO — elements added and removed from same end. Queue: FIFO — elements added at rear, removed from front.' }],
  },
  ai: {
    title: 'Artificial Intelligence', difficulty: 'Advanced', estimatedTime: '50 Hours', color: '#EC4899',
    description: 'Learn AI foundations, state-space search, heuristics, game playing, logic, and expert systems.',
    whatYoullLearn: ['Agent classifications and environment representations', 'Uninformed search (BFS, DFS, Uniform Cost)', 'Informed search (A*, Greedy Best-First) with heuristics', 'Game-playing AI with Minimax and Alpha-Beta Pruning', 'Propositional and First-Order Logic', 'Expert system architectures', 'Bayesian Belief Networks'],
    prerequisites: ['Basic math, discrete math, and probability', 'Intermediate Python programming'],
    theory: 'Artificial Intelligence is the branch of computer science focused on creating systems capable of tasks that require human intelligence: logical reasoning, decision-making, and language understanding.\n\nState-space search forms the foundation of automated problem solving. An AI agent navigates configurations (states) to find a path from start to goal. Game-playing uses adversarial search to calculate optimal moves. Expert systems codify human knowledge into rules to solve specialized tasks.',
    definitions: [{ term: 'A* Search', def: 'Informed search combining actual cost from start g(n) with heuristic estimate to goal h(n) for optimal pathfinding.' }, { term: 'Heuristic Function', def: 'Domain-specific function estimating remaining cost from a node to the goal, guiding search algorithms.' }, { term: 'Minimax', def: 'Recursive backtracking algorithm for game theory determining optimal moves assuming opponent plays optimally.' }, { term: 'Alpha-Beta Pruning', def: 'Optimization of Minimax cutting off branches that cannot affect the final decision.' }, { term: 'Bayesian Network', def: 'Probabilistic graphical model representing variables and their conditional dependencies.' }],
    syntax: `def heuristic(current, goal):\n    # Manhattan distance in grid space\n    return abs(current.x - goal.x) + abs(current.y - goal.y)`,
    codeExamples: [{ title: 'Minimax Algorithm', code: `def minimax(depth, node_index, is_max, scores, target_depth):\n    if depth == target_depth:\n        return scores[node_index]\n    if is_max:\n        return max(\n            minimax(depth+1, node_index*2, False, scores, target_depth),\n            minimax(depth+1, node_index*2+1, False, scores, target_depth)\n        )\n    else:\n        return min(\n            minimax(depth+1, node_index*2, True, scores, target_depth),\n            minimax(depth+1, node_index*2+1, True, scores, target_depth)\n        )\n\nscores = [3, 5, 2, 9, 12, 5, 23, 20]\nprint("Optimal:", minimax(0, 0, True, scores, 3))` }, { title: 'Greedy Best-First Search', code: `import queue\n\ndef greedy_bfs(graph, start, goal, heuristics):\n    pq = queue.PriorityQueue()\n    pq.put((heuristics[start], start))\n    visited = {start}\n    path = []\n    while not pq.empty():\n        h, current = pq.get()\n        path.append(current)\n        if current == goal: break\n        for neighbor in graph[current]:\n            if neighbor not in visited:\n                visited.add(neighbor)\n                pq.put((heuristics[neighbor], neighbor))\n    return path` }],
    roadmap: [{ step: 'Step 1', title: 'AI Foundations', description: 'Intelligent agents, environment types, and rational agents.' }, { step: 'Step 2', title: 'Uninformed Search', description: 'BFS, DFS, Depth-Limited, Uniform Cost Search.' }, { step: 'Step 3', title: 'Informed Search', description: 'Heuristics, Greedy Best-First, and A* algorithm.' }, { step: 'Step 4', title: 'Adversarial Games', description: 'Minimax, Alpha-Beta pruning, and evaluation functions.' }, { step: 'Step 5', title: 'Logic Systems', description: 'Propositional Logic, resolution, and First-Order Predicate Logic.' }, { step: 'Step 6', title: 'Probabilistic AI', description: 'Conditional probability, Bayes theorem, and Bayesian Networks.' }],
    qa: [{ q: 'What is the Turing Test?', a: 'Tests a machine ability to exhibit intelligent behavior equivalent to a human. Passes if evaluator cannot distinguish it from a human in conversation.' }, { q: 'Strong AI vs Weak AI?', a: 'Weak AI performs specific tasks (chess, translation). Strong AI possesses general cognitive abilities across any domain.' }, { q: 'What makes a heuristic admissible?', a: 'A heuristic is admissible if it never overestimates the actual cost to reach the goal, ensuring A* finds the optimal path.' }, { q: 'How does Alpha-Beta pruning optimize Minimax?', a: 'Maintains Alpha (max player assured score) and Beta (min player assured score). Prunes branches where current player cannot improve their assured score.' }, { q: 'Uninformed vs Informed search?', a: 'Uninformed has no knowledge beyond state transitions. Informed uses heuristic estimates to prioritize promising nodes.' }, { q: 'Propositional vs First-Order Logic?', a: 'Propositional handles boolean propositions. First-Order Logic introduces objects, relations, functions, and quantifiers.' }, { q: 'What is an Expert System?', a: 'AI application emulating human expert decisions using a Knowledge Base (IF-THEN rules) and Inference Engine.' }, { q: 'What is an MDP?', a: 'Markov Decision Process: mathematical framework modeling decision-making in environments with partly random outcomes.' }],
  },
  ml: {
    title: 'Machine Learning', difficulty: 'Advanced', estimatedTime: '55 Hours', color: '#10B981',
    description: 'Master supervised/unsupervised algorithms, regression, classification, clustering, and model evaluation.',
    whatYoullLearn: ['Supervised, Unsupervised, and Reinforcement learning', 'Linear Regression and Logistic Regression from math', 'Decision Trees, Random Forests, and XGBoost', 'SVMs for linear and non-linear classification', 'K-Means and Hierarchical Clustering', 'Cross-validation, ROC/AUC, Precision/Recall', 'L1/L2 regularization to prevent overfitting'],
    prerequisites: ['Basic statistics, probability, and linear algebra', 'Python (NumPy and Pandas)'],
    theory: 'Machine Learning is the subset of AI building algorithms that learn from data without explicit programming. Instead of hardcoded rules, ML models generalize patterns from training datasets using mathematical optimization.\n\nThe training lifecycle: data preprocessing, feature engineering, model fitting, and validation. Models are evaluated on unseen test sets to ensure generalization. Regularization, cross-validation, and hyperparameter tuning balance the bias-variance tradeoff.',
    definitions: [{ term: 'Overfitting vs Underfitting', def: 'Overfitting: model too complex, captures noise. Underfitting: model too simple to capture the underlying trend.' }, { term: 'Gradient Descent', def: 'Iterative optimization algorithm minimizing cost function by adjusting parameters in the negative gradient direction.' }, { term: 'Bias-Variance Tradeoff', def: 'Bias from simple model assumptions vs variance from sensitivity to training data. Minimizing total error requires balancing both.' }, { term: 'SVM', def: 'Support Vector Machine: finds the optimal hyperplane maximizing the margin between classes.' }, { term: 'Confusion Matrix', def: 'Performance table with counts of True Positives, False Positives, True Negatives, False Negatives.' }],
    syntax: `from sklearn.model_selection import train_test_split\nfrom sklearn.ensemble import RandomForestClassifier\n\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)\nclf = RandomForestClassifier(n_estimators=100)\nclf.fit(X_train, y_train)\naccuracy = clf.score(X_test, y_test)`,
    codeExamples: [{ title: 'Linear Regression from Scratch', code: `import numpy as np\n\nclass SimpleLinearRegression:\n    def fit(self, X, y):\n        xm, ym = np.mean(X), np.mean(y)\n        self.m = np.sum((X-xm)*(y-ym)) / np.sum((X-xm)**2)\n        self.c = ym - self.m * xm\n    def predict(self, X): return self.m * X + self.c\n\nX = np.array([1,2,3,4,5])\ny = np.array([2,4,5,4,5])\nmodel = SimpleLinearRegression()\nmodel.fit(X, y)\nprint("Slope:", model.m)` }, { title: 'K-Means Clustering', code: `from sklearn.cluster import KMeans\nimport numpy as np\n\nX = np.array([[1,2],[1,4],[1,0],[10,2],[10,4],[10,0]])\nkmeans = KMeans(n_clusters=2, random_state=42, n_init='auto')\nkmeans.fit(X)\nprint("Centers:", kmeans.cluster_centers_)\nprint("Labels:", kmeans.labels_)` }],
    roadmap: [{ step: 'Step 1', title: 'Data Prep & Math', description: 'Matrix arithmetic, probability, Pandas wrangling, and feature scaling.' }, { step: 'Step 2', title: 'Regression Models', description: 'Linear/Multiple Regression and Gradient Descent.' }, { step: 'Step 3', title: 'Classification', description: 'Logistic Regression, KNN, and Naive Bayes.' }, { step: 'Step 4', title: 'Tree-Based Models', description: 'Decision Trees, Random Forests, and XGBoost.' }, { step: 'Step 5', title: 'Unsupervised Learning', description: 'K-Means, hierarchical clustering, and PCA.' }, { step: 'Step 6', title: 'Evaluation & Tuning', description: 'Cross-validation, grid search, ROC/AUC, and F1 metrics.' }],
    qa: [{ q: 'L1 vs L2 regularization?', a: 'L1 (Lasso): penalty = |weights|, produces sparse models with some weights exactly zero. L2 (Ridge): penalty = weights², shrinks weights close to but not exactly zero.' }, { q: 'Explain the bias-variance tradeoff.', a: 'Bias: error from overly simple models (underfitting). Variance: error from high sensitivity to training data (overfitting). Balance minimizes total error.' }, { q: 'What is a Random Forest?', a: 'Ensemble method building many decision trees on random data and feature subsets (bagging), averaging predictions to reduce overfitting.' }, { q: 'Classification vs regression?', a: 'Classification predicts discrete categories (Spam/Not Spam). Regression predicts continuous numerical values (price).' }, { q: 'How does K-Means work?', a: 'Initialize K centroids, assign each point to nearest centroid, recalculate centroids as mean of assigned points, repeat until convergence.' }, { q: 'Precision vs Recall?', a: 'Precision: TP/(TP+FP) — prioritize when false positives are costly. Recall: TP/(TP+FN) — prioritize when false negatives are costly.' }, { q: 'What is the kernel trick in SVMs?', a: 'Projects non-linearly separable data into higher-dimensional space where it becomes linearly separable.' }, { q: 'What is Cross-Validation?', a: 'Splits data into K folds, trains on K-1 and validates on 1, repeating K times for a robust generalization estimate.' }],
  },
  dl: {
    title: 'Deep Learning', difficulty: 'Advanced', estimatedTime: '60 Hours', color: '#6366F1',
    description: 'Explore neural networks, backpropagation, activation functions, CNNs, and LSTMs.',
    whatYoullLearn: ['Artificial Neural Network architecture', 'Backpropagation using the chain rule', 'Activation functions: ReLU, Sigmoid, Softmax', 'Convolutional Neural Networks (CNNs) for images', 'Recurrent Neural Networks (RNNs) and LSTMs', 'Adam, RMSProp, and SGD optimizers', 'Dropout, Batch Normalization, and Early Stopping'],
    prerequisites: ['Solid ML foundation', 'Calculus (partial derivatives) and matrix multiplications', 'Python with PyTorch/TensorFlow'],
    theory: 'Deep Learning uses multi-layered neural networks to model complex patterns. Inspired by the brain, deep networks learn features hierarchically through hidden layers.\n\nLearning has two phases: the forward pass (computing predictions) and the backward pass (backpropagation using the chain rule). Optimization algorithms like Adam or SGD update weights to minimize error over epochs.',
    definitions: [{ term: 'Backpropagation', def: 'Primary training algorithm calculating the gradient of loss with respect to weights layer-by-layer backwards.' }, { term: 'Activation Function', def: 'Mathematical function introducing non-linearity to a neuron\'s output, enabling complex boundary learning.' }, { term: 'CNN', def: 'Convolutional Neural Network: specialized for grid data like images, using weight-sharing convolutional layers.' }, { term: 'LSTM', def: 'Long Short-Term Memory: RNN with memory cells and gates (input, forget, output) for long-term sequence dependencies.' }, { term: 'Vanishing Gradient', def: 'Issue where gradients shrink exponentially during backpropagation, preventing early layers from learning.' }],
    syntax: `import torch.nn as nn\n\nclass SimpleNet(nn.Module):\n    def __init__(self, input_dim, output_dim):\n        super().__init__()\n        self.linear1 = nn.Linear(input_dim, 64)\n        self.relu = nn.ReLU()\n        self.linear2 = nn.Linear(64, output_dim)\n    def forward(self, x):\n        return self.linear2(self.relu(self.linear1(x)))`,
    codeExamples: [{ title: 'Keras Network with Dropout', code: `import tensorflow as tf\nfrom tensorflow.keras import layers, models\n\nmodel = models.Sequential([\n    layers.Dense(128, activation='relu', input_shape=(784,)),\n    layers.Dropout(0.3),\n    layers.Dense(64, activation='relu'),\n    layers.Dense(10, activation='softmax')\n])\nmodel.compile(optimizer='adam',\n    loss='sparse_categorical_crossentropy',\n    metrics=['accuracy'])\nmodel.summary()` }, { title: 'PyTorch CNN Layer', code: `import torch, torch.nn as nn\n\ninput_image = torch.randn(1, 3, 32, 32)\nconv = nn.Conv2d(3, 16, kernel_size=3, padding=1)\npool = nn.MaxPool2d(2, 2)\n\nout_conv = conv(input_image)\nout_pool = pool(out_conv)\nprint("After Conv:", out_conv.shape)   # [1,16,32,32]\nprint("After Pool:", out_pool.shape)   # [1,16,16,16]` }],
    roadmap: [{ step: 'Step 1', title: 'Calculus & Libraries', description: 'Partial derivatives, PyTorch/TensorFlow, and Tensor ops.' }, { step: 'Step 2', title: 'Single-Layer Perceptrons', description: 'Perceptrons, logical gate solvers, gradient vectors.' }, { step: 'Step 3', title: 'Multi-Layer & Backprop', description: 'MLPs, backpropagation math, and chain rule.' }, { step: 'Step 4', title: 'Regularization & Tuning', description: 'Dropout, Batch Normalization, and optimizers.' }, { step: 'Step 5', title: 'CNN (Vision)', description: 'Kernels, padding, pooling, and Convolutional Networks.' }, { step: 'Step 6', title: 'Sequential Models (RNN)', description: 'Vanishing gradients, RNNs, LSTMs, and GRUs.' }],
    qa: [{ q: 'Why do we need non-linear activations?', a: 'Without them, a deep network collapses into a single linear model regardless of layer count. Non-linearity allows learning complex boundaries.' }, { q: 'Vanishing gradient problem?', a: 'Gradients shrink exponentially during backprop in deep nets, preventing early layers from updating. Fixed with ReLU, ResNets, and Batch Normalization.' }, { q: 'What is Dropout?', a: 'Randomly deactivates neurons during training, forcing independent feature learning and reducing overfitting.' }, { q: 'Sigmoid vs Softmax?', a: 'Sigmoid: binary classification (0-1 for single output). Softmax: multiclass (probability distribution summing to 1).' }, { q: 'Batch Normalization benefits?', a: 'Normalizes layer inputs per batch (mean=0, var=1), allowing higher learning rates and reducing weight initialization sensitivity.' }, { q: 'CNN kernel vs stride vs padding?', a: 'Kernel: sliding filter matrix. Stride: pixels shifted per step. Padding: dummy pixels added to borders to control output size.' }, { q: 'Why LSTMs over RNNs?', a: 'Standard RNNs suffer from vanishing gradients over long sequences. LSTMs use forget/input/output gates to selectively retain long-term dependencies.' }, { q: 'What is Transfer Learning?', a: 'Taking a pre-trained network (e.g. ResNet) and fine-tuning on a new dataset, leveraging pre-learned features with limited data.' }],
  },
  genai: {
    title: 'Generative AI', difficulty: 'Advanced', estimatedTime: '45 Hours', color: '#D946EF',
    description: 'Learn Transformers, self-attention, LLM architectures, prompt engineering, and RAG systems.',
    whatYoullLearn: ['Encoder-Decoder Transformer architecture', 'Self-Attention and Multi-Head Attention mathematics', 'Pre-training, Instruction Tuning, and RLHF', 'Advanced Prompt Engineering (Few-Shot, Chain-of-Thought)', 'Retrieval-Augmented Generation (RAG) pipelines', 'Vector Databases and search embeddings', 'Fine-tuning LLMs with LoRA and QLoRA'],
    prerequisites: ['Deep Learning concepts', 'NLP fundamentals', 'Python programming'],
    theory: 'Generative AI focuses on generating new content: text, images, code. The modern GenAI renaissance is driven by the Transformer architecture (Vaswani et al., 2017), which replaced sequential RNN processing with Self-Attention, enabling parallel processing of sequences.\n\nLLMs like GPT, LLaMA, and Claude are trained on massive text corpora. For enterprise customization, developers use Prompt Engineering, Fine-Tuning (PEFT/LoRA), and Retrieval-Augmented Generation (RAG), which grounds models with real-time external data.',
    definitions: [{ term: 'Self-Attention', def: 'Mechanism calculating how much focus each token should place on every other token in the sequence.' }, { term: 'Transformer', def: 'Architecture based on self-attention that processes sequential data in parallel, forming the foundation of modern LLMs.' }, { term: 'RAG', def: 'Retrieval-Augmented Generation: retrieves relevant documents and adds them to the prompt context for grounded LLM answers.' }, { term: 'LoRA', def: 'Low-Rank Adaptation: parameter-efficient fine-tuning inserting small trainable matrices into attention layers.' }, { term: 'Vector Database', def: 'Database storing high-dimensional embeddings and performing fast similarity searches.' }],
    syntax: `from openai import OpenAI\nclient = OpenAI()\n\nresponse = client.chat.completions.create(\n    model="gpt-4-turbo",\n    messages=[{"role":"user","content":"Write a Python print function."}]\n)\nprint(response.choices[0].message.content)`,
    codeExamples: [{ title: 'Scaled Dot-Product Attention', code: `import numpy as np\n\ndef attention(Q, K, V):\n    d_k = Q.shape[-1]\n    scores = np.dot(Q, K.T) / np.sqrt(d_k)\n    weights = np.exp(scores) / np.sum(np.exp(scores), axis=-1, keepdims=True)\n    return np.dot(weights, V), weights\n\nQ = np.array([[1, 0, 1]])\nK = np.array([[1, 0, 1], [0, 1, 0]])\nV = np.array([[10, 20], [30, 40]])\noutput, w = attention(Q, K, V)\nprint("Output:", output)` }, { title: 'RAG Pipeline Pseudocode', code: `class RAGPipeline:\n    def __init__(self, vector_db, llm_client):\n        self.db = vector_db\n        self.llm = llm_client\n\n    def query(self, user_question):\n        docs = self.db.similarity_search(user_question, top_k=1)\n        context = docs[0].text\n        prompt = f"Context: {context}\\nQuestion: {user_question}\\nAnswer:"\n        return self.llm.generate(prompt)` }],
    roadmap: [{ step: 'Step 1', title: 'NLP & Tokenizers', description: 'Byte-Pair Encoding, word embeddings, and vector similarity.' }, { step: 'Step 2', title: 'Transformer Internals', description: 'Self-Attention, Multi-Head Attention, and positional encodings.' }, { step: 'Step 3', title: 'LLM Foundations', description: 'Pre-training, causal language modeling, instruction tuning, RLHF.' }, { step: 'Step 4', title: 'Prompt & Vector DBs', description: 'Few-shot, CoT prompting, embeddings, and vector search.' }, { step: 'Step 5', title: 'RAG Architectures', description: 'Chunking, ingestion pipelines, Pinecone/Chroma, and prompt contexts.' }, { step: 'Step 6', title: 'Model Adaptation', description: 'PEFT, LoRA, and model deployment.' }],
    qa: [{ q: 'Encoder vs Decoder in Transformers?', a: 'Encoder: processes full input bidirectionally (BERT). Decoder: generates token-by-token with masked self-attention (GPT).' }, { q: 'What is RAG?', a: 'Retrieves relevant documents from external vector database, appends to prompt, providing factual context to reduce hallucinations.' }, { q: 'What is the Temperature parameter?', a: 'Controls generation randomness. Higher temperature = more creative, lower = more deterministic and factual.' }, { q: 'What is PEFT and LoRA?', a: 'PEFT adapts LLMs while freezing base weights. LoRA parameterizes updates into small low-rank matrices, saving memory and training time.' }, { q: 'How do vector databases search?', a: 'Index embeddings and use HNSW structures for Approximate Nearest Neighbor (ANN) search, avoiding expensive exact scans.' }, { q: 'What is Chain-of-Thought prompting?', a: 'Asks model to output intermediate reasoning steps before the final answer ("Let\'s think step by step"), improving multi-step reasoning.' }, { q: 'What is RLHF?', a: 'Trains a reward model on human preference comparisons, then uses reinforcement learning (PPO) to make LLMs helpful, honest, and harmless.' }, { q: 'What are LLM hallucinations?', a: 'Grammatically correct but factually incorrect statements. Mitigated by RAG, system prompts, low temperature, and CoT verification.' }],
  },
  datascience: {
    title: 'Data Science', difficulty: 'Intermediate', estimatedTime: '40 Hours', color: '#0EA5E9',
    description: 'Learn data analysis, Pandas/NumPy, statistics, visualization, and hypothesis testing.',
    whatYoullLearn: ['Descriptive and inferential statistics', 'Data wrangling, cleaning, and missing value handling', 'Pandas and NumPy manipulation', 'Matplotlib and Seaborn visualizations', 'Hypothesis testing and p-value validation', 'Feature scaling, encoding, and selection', 'Exploratory Data Analysis (EDA)'],
    prerequisites: ['Basic Python', 'High-school algebra and statistics'],
    theory: 'Data Science combines statistics, programming, and domain expertise to extract insights from data. The standard lifecycle: ingestion, cleaning, exploratory analysis, modeling, and communication.\n\nData cleaning is critical — scientists normalize features, impute missing values, and remove outliers using Pandas/NumPy. Statistical testing verifies whether observed differences represent actual effects vs random variation.',
    definitions: [{ term: 'EDA', def: 'Exploratory Data Analysis: initial process analyzing datasets visually to summarize characteristics and identify patterns.' }, { term: 'P-Value', def: 'Probability of obtaining results as extreme as observed assuming the null hypothesis is true. p<0.05 leads to rejecting null.' }, { term: 'Data Imputation', def: 'Replacing missing data points with statistical estimates (mean, median, mode).' }, { term: 'Correlation vs Covariance', def: 'Covariance: direction of linear relationship. Correlation: normalized, measures direction AND strength (-1 to 1).' }, { term: 'Z-Score', def: 'Measure of how many standard deviations a data point is from the mean, used to identify outliers.' }],
    syntax: `import pandas as pd\n\ndf = pd.read_csv("data.csv")\nhigh_earners = df[df["income"] > 75000]\nsummary = high_earners.groupby("city")["age"].mean()`,
    codeExamples: [{ title: 'Data Cleaning & Imputation', code: `import pandas as pd, numpy as np\n\nraw_data = {\n    'Name': ['Alice','Bob','Charlie','David'],\n    'Age': [25, np.nan, 30, 22],\n    'Salary': [50000, 60000, np.nan, 45000]\n}\ndf = pd.DataFrame(raw_data)\ndf['Age'] = df['Age'].fillna(df['Age'].median())\ndf['Salary'] = df['Salary'].fillna(df['Salary'].mean())\nprint(df)` }, { title: 'Hypothesis Testing (T-Test)', code: `import numpy as np\nfrom scipy import stats\n\ngroup_A = np.array([88,92,79,85,90,84])\ngroup_B = np.array([72,78,68,75,80,71])\nt_stat, p_value = stats.ttest_ind(group_A, group_B)\nprint(f"T-Stat: {t_stat:.4f}")\nprint(f"P-Value: {p_value:.6f}")\nif p_value < 0.05:\n    print("Reject null hypothesis")` }],
    roadmap: [{ step: 'Step 1', title: 'Python Foundations', description: 'Jupyter notebooks, NumPy arrays, and linear algebra basics.' }, { step: 'Step 2', title: 'Data Wrangling', description: 'Pandas DataFrames, merging, filtering, grouping, and CSV/SQL reading.' }, { step: 'Step 3', title: 'Visualization', description: 'Histograms, heatmaps, and scatter charts with Matplotlib/Seaborn.' }, { step: 'Step 4', title: 'Statistics & Probability', description: 'Distributions, CLT, hypothesis testing, and confidence intervals.' }, { step: 'Step 5', title: 'Data Preprocessing', description: 'One-hot encoding, standardization, and missing value handling.' }, { step: 'Step 6', title: 'EDA Projects', description: 'Analyze real datasets, EDA, clean reports, and data storytelling.' }],
    qa: [{ q: 'What is the Central Limit Theorem?', a: 'Sample means approach normal distribution as sample size grows (n≥30), regardless of population shape, enabling parametric tests.' }, { q: 'How to detect and handle outliers?', a: 'Detect via boxplots, Z-scores (>3), or IQR method. Handle by removing (if errors), log-transforming, or retaining (if genuine anomalies).' }, { q: 'Covariance vs correlation?', a: 'Covariance: directional relationship (scale depends on units). Correlation: normalized -1 to 1, measures direction and strength.' }, { q: 'Type I vs Type II errors?', a: 'Type I (False Positive): rejecting a true null hypothesis. Type II (False Negative): failing to reject a false null hypothesis.' }, { q: 'Standardization vs Min-Max scaling?', a: 'Standardization: mean=0, std=1, less sensitive to outliers. Min-Max: bounds to [0,1], ideal for bounded-input algorithms.' }, { q: 'Long vs Wide data formats?', a: 'Wide: each variable has its own column. Long: variable names in one column, values in another. Long is preferred for analysis libraries.' }, { q: 'What is A/B testing?', a: 'Randomized experiment comparing two versions to determine which performs better based on statistical significance.' }, { q: 'How to handle missing data in Pandas?', a: 'Identify with isnull(). Drop with dropna(). Fill with fillna() using mean/median/mode or interpolate().' }],
  },
  webdev: {
    title: 'Full Stack Web Development', difficulty: 'Beginner', estimatedTime: '50 Hours', color: '#F43F5E',
    description: 'Learn modern HTML5, CSS3, responsive design, JavaScript DOM manipulation, and API integrations.',
    whatYoullLearn: ['Semantic HTML5 markup', 'CSS Flexbox and Grid layouts', 'Responsive designs with Media Queries', 'JavaScript DOM manipulation and events', 'ES6+ features (Destructuring, Promises, modules)', 'Async network requests with Fetch/Async-Await', 'Security: CORS, XSS, and CSRF prevention'],
    prerequisites: ['Basic computer literacy', 'Interest in building web interfaces'],
    theory: 'Full Stack Web Development builds both client-side (frontend) and server-side (backend). Frontend uses HTML for structure, CSS for styling, and JavaScript for interactivity. The browser parses these to build the Document Object Model (DOM).\n\nModern web development prioritizes responsiveness and performance. Flexbox/Grid and media queries ensure pages render correctly across devices. Fast loading is achieved by async loading, optimized assets, and security practices.',
    definitions: [{ term: 'DOM', def: 'Document Object Model: programming interface representing page structure as a tree, allowing JavaScript to read/update elements.' }, { term: 'Semantic HTML', def: 'Tags describing their meaning (<article>, <header>, <nav>) rather than just styling, improving SEO and accessibility.' }, { term: 'Flexbox', def: 'One-dimensional layout model for arranging items in rows or columns, optimizing space distribution.' }, { term: 'Promise', def: 'Object representing the eventual completion or failure of an asynchronous operation.' }, { term: 'CORS', def: 'Cross-Origin Resource Sharing: browser security mechanism restricting cross-domain resource requests.' }],
    syntax: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Responsive Site</title>\n</head>\n<body>\n  <header><h1>Header</h1></header>\n</body>\n</html>`,
    codeExamples: [{ title: 'Async API Fetch & DOM Render', code: `async function loadUser(userId) {\n    const el = document.getElementById('profile');\n    try {\n        const res = await fetch(\`/api/users/\${userId}\`);\n        if (!res.ok) throw new Error("HTTP Error");\n        const data = await res.json();\n        el.innerHTML = \`<h3>\${data.name}</h3>\`;\n    } catch (err) {\n        el.textContent = "Failed: " + err.message;\n    }\n}\ndocument.getElementById('btn')?.addEventListener('click', () => loadUser(1));` }, { title: 'CSS Grid Layout', code: `/* Responsive grid */\n.main-wrapper {\n    display: grid;\n    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));\n    gap: 20px;\n    padding: 20px;\n}\n\n.card-item {\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    height: 150px;\n    background: #1E293B;\n    border-radius: 8px;\n}` }],
    roadmap: [{ step: 'Step 1', title: 'HTML & CSS Basics', description: 'HTML semantics, forms, CSS box model, colors, and fonts.' }, { step: 'Step 2', title: 'Responsive Layouts', description: 'Flexbox, Grid, media queries, and fluid typography.' }, { step: 'Step 3', title: 'JavaScript Core', description: 'Variables, functions, conditions, DOM queries, and events.' }, { step: 'Step 4', title: 'Async JS', description: 'Callbacks, Promises, Async/Await, and Fetch API.' }, { step: 'Step 5', title: 'APIs & Security', description: 'HTTP status codes, REST, CORS, and security headers.' }, { step: 'Step 6', title: 'Tooling & Hosting', description: 'Git, npm, Vite bundling, and Vercel/Netlify deployment.' }],
    qa: [{ q: 'let vs const vs var?', a: 'var: function-scoped, hoisted, redeclarable. let/const: block-scoped, not redeclarable. const cannot be reassigned after init.' }, { q: 'Explain the CSS Box Model.', a: 'Every element is a box: Content (text/image) → Padding (inner space) → Border → Margin (outer space).' }, { q: 'How does event delegation work?', a: 'Attaches one listener to a parent instead of many to children. Works via event bubbling — events travel up the DOM tree.' }, { q: '== vs === in JavaScript?', a: '== compares after type coercion. === compares value AND type (strict equality).' }, { q: 'LocalStorage vs SessionStorage vs Cookies?', a: 'LocalStorage: no expiration, persists until cleared. SessionStorage: cleared when tab closes. Cookies: sent with every HTTP request, have expiry and security flags.' }, { q: 'What is CORS?', a: 'Browser security mechanism preventing cross-domain requests unless the server explicitly authorizes them via headers.' }, { q: 'What is semantic HTML?', a: 'Tags that describe meaning (<nav>, <article>, <header>) — crucial for SEO, accessibility, and readability.' }, { q: 'Async error handling?', a: 'Wrap async/await calls in try-catch blocks. If promise rejects, catch block intercepts the error.' }],
  },
  react: {
    title: 'React.js', difficulty: 'Intermediate', estimatedTime: '35 Hours', color: '#06B6D4',
    description: 'Build interactive UIs with React, state, hooks, router, and context API.',
    whatYoullLearn: ['JSX syntax and compilation', 'State and props management', 'React hooks (useState, useEffect, useMemo, useCallback)', 'Global state with Context API', 'Client-side routing with React Router', 'Virtual DOM and memoization', 'Custom hooks for reusable logic'],
    prerequisites: ['Intermediate JavaScript (ES6+)', 'HTML/CSS familiarity'],
    theory: 'React is an open-source component-based frontend library by Meta. Its declarative style lets developers describe how the UI should look for different states, and React manages updates automatically.\n\nReact\'s speed comes from the Virtual DOM — a lightweight representation of the real DOM. When state changes, React computes the diff between virtual and real DOM, updating only changed elements (reconciliation).',
    definitions: [{ term: 'JSX', def: 'JavaScript XML: extension allowing HTML-like syntax inside JavaScript.' }, { term: 'Virtual DOM', def: 'Lightweight in-memory copy of the real DOM used by React for performance optimization.' }, { term: 'State', def: 'Object managed within a component holding data that can change over time.' }, { term: 'Hook', def: 'Special function letting you hook into React features like state inside functional components.' }, { term: 'Props', def: 'Immutable properties passed from parent to child components.' }],
    syntax: `import React, { useState } from 'react';\n\nexport default function App() {\n  const [count, setCount] = useState(0);\n  return (\n    <button onClick={() => setCount(count + 1)}>\n      Count: {count}\n    </button>\n  );\n}`,
    codeExamples: [{ title: 'Custom Fetch Hook', code: `import { useState, useEffect } from 'react';\n\nfunction useFetch(url) {\n  const [data, setData] = useState(null);\n  const [loading, setLoading] = useState(true);\n\n  useEffect(() => {\n    fetch(url)\n      .then(res => res.json())\n      .then(data => { setData(data); setLoading(false); });\n  }, [url]);\n\n  return { data, loading };\n}` }, { title: 'Context API State Sharing', code: `import React, { createContext, useContext, useState } from 'react';\n\nconst ThemeContext = createContext();\n\nexport function ThemeProvider({ children }) {\n  const [theme, setTheme] = useState('dark');\n  return (\n    <ThemeContext.Provider value={{ theme, setTheme }}>\n      {children}\n    </ThemeContext.Provider>\n  );\n}\n\nexport const useTheme = () => useContext(ThemeContext);` }],
    roadmap: [{ step: 'Step 1', title: 'JSX & Rendering', description: 'JSX syntax, rendering elements, and compiling.' }, { step: 'Step 2', title: 'Components & Props', description: 'Functional and class components, and passing props.' }, { step: 'Step 3', title: 'State & Hooks', description: 'useState and useEffect hook fundamentals.' }, { step: 'Step 4', title: 'Advanced Hooks', description: 'useContext, useReducer, useMemo, and useCallback.' }, { step: 'Step 5', title: 'Routing', description: 'Client-side routing with React Router.' }, { step: 'Step 6', title: 'State Management', description: 'Global state libraries: Zustand or Redux.' }],
    qa: [{ q: 'What is the Virtual DOM?', a: 'Virtual representation of the UI kept in memory and synced with the real DOM via ReactDOM (reconciliation).' }, { q: 'useEffect dependency array?', a: 'Empty [] runs once on mount. Variables in array run effect when those variables change.' }, { q: 'Rules of React Hooks?', a: 'Only call Hooks at the top level (not in loops/conditions) and only from React Function Components or Custom Hooks.' }, { q: 'Why use keys in lists?', a: 'Keys help React identify changed, added, or removed items during Virtual DOM diffing.' }, { q: 'Controlled vs uncontrolled components?', a: 'Controlled: state managed by React via value/onChange. Uncontrolled: component manages its own state via Refs.' }, { q: 'What is React Context?', a: 'Built-in feature sharing global state across component trees without manual prop-drilling.' }, { q: 'useCallback vs useMemo?', a: 'useCallback memoizes a function definition. useMemo memoizes the returned result of a function call.' }, { q: 'What is React.memo?', a: 'Higher-order component wrapping functional components to prevent re-renders if props don\'t change.' }],
  },
  nodejs: {
    title: 'Node.js', difficulty: 'Intermediate', estimatedTime: '35 Hours', color: '#84CC16',
    description: 'Master server-side JavaScript, Express, async I/O, middleware, and backend patterns.',
    whatYoullLearn: ['Node.js Event Loop and Non-blocking I/O', 'Express.js servers and routing', 'REST API design conventions', 'Custom middleware for logging, auth, and validation', 'File and stream processing', 'JWT and bcrypt authentication', 'Database integration with ORMs'],
    prerequisites: ['Solid JavaScript (Promises, Async/Await)', 'HTTP protocol basics'],
    theory: 'Node.js is an open-source JavaScript runtime built on Chrome\'s V8 engine, enabling server-side JavaScript. It uses an asynchronous event-driven, non-blocking I/O model — lightweight and efficient for concurrent operations.\n\nThe Event Loop handles asynchronous callbacks, delegating system tasks to thread pools and resuming execution when ready. Express.js provides a minimalist framework for building HTTP APIs.',
    definitions: [{ term: 'Event Loop', def: 'Single-threaded loop orchestrating execution of callbacks in Node.js.' }, { term: 'Express.js', def: 'Minimalist web framework for Node.js for building robust HTTP APIs.' }, { term: 'Middleware', def: 'Functions executing during the request-response cycle, modifying requests or sending responses.' }, { term: 'Buffer', def: 'Raw memory allocation for handling binary data streams.' }, { term: 'JWT', def: 'JSON Web Token: secure mechanism representing claims between client and server.' }],
    syntax: `const express = require('express');\nconst app = express();\n\napp.get('/', (req, res) => res.send('Hello Node!'));\napp.listen(3000, () => console.log('Running on port 3000'));`,
    codeExamples: [{ title: 'Custom Middleware Logging', code: `const express = require('express');\nconst app = express();\n\nconst logger = (req, res, next) => {\n    console.log(\`\${req.method} \${req.url} - \${new Date().toISOString()}\`);\n    next();\n};\n\napp.use(logger);\napp.get('/api/data', (req, res) => res.json({ success: true }));` }, { title: 'File Stream Read/Write', code: `const fs = require('fs');\n\nconst readStream = fs.createReadStream('input.txt');\nconst writeStream = fs.createWriteStream('output.txt');\n\nreadStream.pipe(writeStream);\nreadStream.on('end', () => console.log('Streaming complete.'));` }],
    roadmap: [{ step: 'Step 1', title: 'Node Architecture', description: 'V8 Engine and the Event Loop.' }, { step: 'Step 2', title: 'Core Modules', description: 'fs, path, and http modules.' }, { step: 'Step 3', title: 'Express.js', description: 'Express routing and setup.' }, { step: 'Step 4', title: 'Middleware & Validation', description: 'Custom middleware and input validation.' }, { step: 'Step 5', title: 'Database Integration', description: 'MongoDB/Mongoose or PostgreSQL.' }, { step: 'Step 6', title: 'Auth & Deployment', description: 'JWT authentication and deployment.' }],
    qa: [{ q: 'Is Node.js single or multi-threaded?', a: 'Single-threaded for JS execution (Event Loop) but uses multi-threaded C++ pools (libuv) for blocking I/O tasks.' }, { q: 'Purpose of middleware in Express?', a: 'Middleware functions have access to req/res, performing validation, logging, auth, and header injection.' }, { q: 'How does the Event Loop handle tasks?', a: 'Cycles through: timers, pending callbacks, idle/prepare, poll (I/O), check, and close callbacks.' }, { q: 'setImmediate() vs process.nextTick()?', a: 'nextTick() executes immediately after current operation before Event Loop moves to next phase. setImmediate() executes in check phase of next loop.' }, { q: 'Global exception handling in Express?', a: 'Register a middleware with 4 parameters (err, req, res, next). Express forwards uncaught errors to it.' }, { q: 'What are Node Streams?', a: 'Objects for reading/writing data chunk-by-chunk, saving memory when processing large files.' }, { q: 'require() vs import?', a: 'require is CommonJS, evaluated dynamically at runtime. import is ES6 modules, evaluated statically at compile-time.' }, { q: 'Why bcrypt for passwords?', a: 'bcrypt incorporates a salt and is intentionally slow (computationally expensive), mitigating brute-force attacks.' }],
  },
  fastapi: {
    title: 'FastAPI', difficulty: 'Intermediate', estimatedTime: '25 Hours', color: '#059669',
    description: 'Build modern, fast, type-safe APIs with Python, Pydantic schemas, and async/await.',
    whatYoullLearn: ['async/await asynchronous Python syntax', 'FastAPI routes and operation mappings', 'Pydantic data model validation', 'Dependency Injection system', 'Auto-generated OpenAPI/Swagger documentation', 'SQLAlchemy/SQLModel ORM integration', 'JWT token security'],
    prerequisites: ['Python type hints and functions', 'Understanding of REST API models'],
    theory: 'FastAPI is a modern, high-performance Python web framework for building APIs, based on standard Python type hints. Built on Starlette (web) and Pydantic (data validation), it provides automatic documentation, high speed, and validation.\n\nFastAPI natively supports async/await, handling multiple concurrent connections. It auto-generates Swagger/OpenAPI documentation, making API testing seamless.',
    definitions: [{ term: 'Pydantic', def: 'Data validation library using Python type annotations.' }, { term: 'ASGI', def: 'Asynchronous Server Gateway Interface: standard for async web server-application communication.' }, { term: 'Dependency Injection', def: 'Design pattern where objects receive dependencies from external sources (Depends in FastAPI).' }, { term: 'Starlette', def: 'Lightweight ASGI toolkit powering FastAPI\'s routing and server behaviors.' }, { term: 'Uvicorn', def: 'Lightning-fast ASGI server used to run FastAPI applications.' }],
    syntax: `from fastapi import FastAPI\napp = FastAPI()\n\n@app.get("/")\nasync def read_root():\n    return {"message": "Hello from FastAPI"}`,
    codeExamples: [{ title: 'Pydantic POST Endpoint', code: `from fastapi import FastAPI\nfrom pydantic import BaseModel, EmailStr\n\napp = FastAPI()\n\nclass UserCreate(BaseModel):\n    username: str\n    email: EmailStr\n    age: int\n\n@app.post("/users/")\ndef create_user(user: UserCreate):\n    return {"status": "User created", "user": user}` }, { title: 'Dependency Injection (Depends)', code: `from fastapi import FastAPI, Depends, Header, HTTPException\n\napp = FastAPI()\n\ndef verify_token(x_token: str = Header(...)):\n    if x_token != "supersecret":\n        raise HTTPException(status_code=400, detail="Invalid token")\n    return x_token\n\n@app.get("/items/")\ndef read_items(token: str = Depends(verify_token)):\n    return {"secure_data": ["item1", "item2"]}` }],
    roadmap: [{ step: 'Step 1', title: 'Python Async & Hints', description: 'Python type hints and async/await model.' }, { step: 'Step 2', title: 'Setup & Routing', description: 'Install FastAPI, Uvicorn, and create endpoints.' }, { step: 'Step 3', title: 'Pydantic Schemas', description: 'Validate query, path, and body parameters.' }, { step: 'Step 4', title: 'Dependencies', description: 'FastAPI\'s dependency injection system.' }, { step: 'Step 5', title: 'Database & ORM', description: 'SQLAlchemy, tables, and CRUD operations.' }, { step: 'Step 6', title: 'Testing & Deploy', description: 'TestClient unit tests and migrations.' }],
    qa: [{ q: 'Why is FastAPI faster than Flask/Django?', a: 'Built on ASGI (Starlette) with native async/await, and uses Pydantic for extremely fast JSON parsing and validation.' }, { q: 'What is Pydantic?', a: 'Validation library defining structure and types of request payloads, automatically validating incoming data.' }, { q: 'How does FastAPI generate docs?', a: 'Reads Python type hints and Pydantic schemas to auto-generate Swagger UI (/docs) and ReDoc (/redoc).' }, { q: 'FastAPI dependency injection?', a: 'Defines reusable utility functions (DB sessions, security tokens) injected into route handlers via Depends().' }, { q: 'ASGI vs WSGI?', a: 'WSGI: synchronous, one request per thread. ASGI: async, handles multiple requests concurrently on a single thread.' }, { q: 'Validation error handling?', a: 'FastAPI catches validation errors and automatically returns structured 422 Unprocessable Entity JSON responses.' }, { q: 'How to read request headers?', a: 'Declare a parameter with type Header from fastapi, matching header name in snake_case.' }, { q: 'What is SQLModel?', a: 'Library by FastAPI creator combining SQLAlchemy and Pydantic, avoiding code duplication for DB models and schemas.' }],
  },
  sql: {
    title: 'SQL & Database Management', difficulty: 'Beginner', estimatedTime: '30 Hours', color: '#3B82F6',
    description: 'Master relational databases, SQL querying, joins, indexes, normalization, and ACID transactions.',
    whatYoullLearn: ['Relational database design and normalization', 'DDL and DML SQL operations', 'Advanced joins (Inner, Left, Right, Full, Self)', 'Subqueries and CTEs', 'Query optimization with Indexes', 'ACID transactions', 'EXPLAIN command analysis'],
    prerequisites: ['Basic analytical reasoning', 'No database experience required'],
    theory: 'SQL is the standard language for interacting with Relational Database Management Systems (RDBMS). Databases store data in structured tables, with relationships maintained via Primary and Foreign Keys.\n\nNormalization eliminates redundancy and improves integrity. Indexes act as lookup maps, avoiding costly full-table scans. ACID properties ensure reliable transaction processing.',
    definitions: [{ term: 'ACID', def: 'Atomicity, Consistency, Isolation, Durability: properties ensuring database transactions are processed reliably.' }, { term: 'Normalization', def: 'Design technique dividing tables to reduce data redundancy and dependency.' }, { term: 'Index', def: 'Data structure (typically B-Tree) that speeds up row retrieval from a table.' }, { term: 'CTE', def: 'Common Table Expression: temporary named result set defined with WITH.' }, { term: 'Foreign Key', def: 'Column(s) in one table uniquely identifying a row in another table.' }],
    syntax: `SELECT columns\nFROM table1\nINNER JOIN table2 ON table1.id = table2.t1_id\nWHERE condition\nGROUP BY column\nHAVING group_condition;`,
    codeExamples: [{ title: 'Advanced Join & Aggregation', code: `SELECT\n    d.department_name,\n    COUNT(e.employee_id) AS total_employees,\n    AVG(e.salary) AS average_salary\nFROM departments d\nLEFT JOIN employees e ON d.department_id = e.department_id\nGROUP BY d.department_name\nHAVING AVG(e.salary) > 50000;` }, { title: 'CTE & Window Function', code: `WITH HighEarners AS (\n    SELECT employee_id, first_name, salary,\n           RANK() OVER (ORDER BY salary DESC) as rank\n    FROM employees\n)\nSELECT employee_id, first_name, salary\nFROM HighEarners\nWHERE rank <= 5;` }],
    roadmap: [{ step: 'Step 1', title: 'SQL Basics', description: 'Databases, tables, DDL (CREATE, ALTER) and basic queries.' }, { step: 'Step 2', title: 'Filtering & Sort', description: 'WHERE, ORDER BY, LIMIT, and logical operators.' }, { step: 'Step 3', title: 'Joins', description: 'INNER, LEFT, RIGHT, and FULL joins.' }, { step: 'Step 4', title: 'Aggregations', description: 'GROUP BY, HAVING, and aggregate functions.' }, { step: 'Step 5', title: 'Advanced Queries', description: 'Subqueries, CTEs, and Window Functions.' }, { step: 'Step 6', title: 'Optimization & ACID', description: 'Indexing, EXPLAIN plans, and transaction control.' }],
    qa: [{ q: 'INNER JOIN vs LEFT JOIN?', a: 'INNER JOIN returns matching records in both tables. LEFT JOIN returns all left table records and matching right table records (NULLs for no match).' }, { q: 'What are ACID properties?', a: 'Atomicity (all or nothing), Consistency (preserves rules), Isolation (concurrent transactions isolated), Durability (persists after crash).' }, { q: 'WHERE vs HAVING?', a: 'WHERE filters individual rows before grouping. HAVING filters aggregated groups after GROUP BY.' }, { q: 'How do indexes improve speed?', a: 'Provides B-Tree lookup to find rows without full-table scan. Avoid on small tables or high-write columns — indexes slow INSERT/UPDATE.' }, { q: 'What is normalization?', a: '1NF: Atomic values. 2NF: No partial dependency. 3NF: No transitive dependency.' }, { q: 'Primary key vs Unique key?', a: 'Primary Key: unique, not null, only one per table. Unique Key: ensures uniqueness, allows NULLs, multiple allowed.' }, { q: 'What is a CTE?', a: 'Temporary named result set within a single query scope, improving readability.' }, { q: 'What are Window Functions?', a: 'Functions (ROW_NUMBER, RANK, SUM OVER) performing calculations across related rows without merging them.' }],
  },
  cloud: {
    title: 'Cloud Computing (AWS)', difficulty: 'Intermediate', estimatedTime: '45 Hours', color: '#F97316',
    description: 'Design and deploy scalable architectures on AWS. Learn EC2, S3, RDS, Lambda, and IAM.',
    whatYoullLearn: ['IaaS, PaaS, SaaS cloud models', 'Virtual Private Clouds (VPC) with subnets', 'EC2 virtual compute instances', 'S3 object storage architectures', 'RDS and DynamoDB databases', 'IAM policies and access management', 'Auto Scaling and Load Balancing'],
    prerequisites: ['Basic networking (IP addresses, subnets)', 'Basic Linux CLI'],
    theory: 'Cloud Computing is on-demand delivery of IT resources over the Internet with pay-as-you-go pricing. Rather than maintaining physical data centers, organizations rent from providers like AWS, Azure, or GCP.\n\nSecure architecture begins with a Virtual Private Cloud (VPC). High availability uses Elastic Load Balancers and Auto Scaling. IAM policies enforce the principle of least privilege.',
    definitions: [{ term: 'VPC', def: 'Virtual Private Cloud: private virtual network partition in the cloud.' }, { term: 'IAM', def: 'Identity and Access Management: system managing access permissions securely.' }, { term: 'EC2', def: 'Elastic Compute Cloud: resizable virtual servers (instances) in the cloud.' }, { term: 'S3', def: 'Simple Storage Service: highly durable object storage.' }, { term: 'Lambda', def: 'Serverless compute service running code in response to events.' }],
    syntax: `# AWS CLI — upload file to S3\naws s3 cp document.pdf s3://my-secure-bucket/docs/`,
    codeExamples: [{ title: 'Terraform AWS EC2', code: `provider "aws" {\n  region = "us-east-1"\n}\n\nresource "aws_instance" "web" {\n  ami           = "ami-0c55b159cbfafe1f0"\n  instance_type = "t2.micro"\n  tags = { Name = "WebServer" }\n}` }, { title: 'AWS Lambda Handler', code: `import json\n\ndef lambda_handler(event, context):\n    name = event.get("name", "World")\n    return {\n        'statusCode': 200,\n        'body': json.dumps(f"Hello, {name} from Lambda!")\n    }` }],
    roadmap: [{ step: 'Step 1', title: 'Cloud Concepts', description: 'Virtual models, cloud architectures, and global networks.' }, { step: 'Step 2', title: 'IAM', description: 'IAM users, groups, roles, and resource policies.' }, { step: 'Step 3', title: 'Networking (VPC)', description: 'VPCs, subnets, route tables, and gateways.' }, { step: 'Step 4', title: 'Compute & Storage', description: 'Deploy EC2 instances and upload to S3 buckets.' }, { step: 'Step 5', title: 'Cloud Databases', description: 'Deploy RDS and DynamoDB tables.' }, { step: 'Step 6', title: 'Scaling & Serverless', description: 'ELB, Auto Scaling, and AWS Lambda.' }],
    qa: [{ q: 'Horizontal vs vertical scaling?', a: 'Vertical: add CPU/RAM to existing server. Horizontal: add more servers to the pool.' }, { q: 'Public vs private subnets?', a: 'Public: route to Internet Gateway, enabling public IP. Private: route outbound via NAT Gateway.' }, { q: 'What is serverless computing?', a: 'Cloud provider manages servers. Developers only upload code, paying only for execution time (e.g. Lambda).' }, { q: 'Shared Responsibility Model?', a: 'AWS: responsible for security OF the cloud (hardware/infrastructure). Customer: responsible for security IN the cloud (data, IAM, configs).' }, { q: 'S3 vs EBS?', a: 'S3: object storage accessed via API. EBS: block storage (virtual hard drive) mounted to EC2 instances.' }, { q: 'Principle of least privilege?', a: 'Users get only the minimum permissions required to perform their jobs.' }, { q: 'How does ELB work?', a: 'Distributes incoming traffic across multiple target instances to ensure high availability and fault tolerance.' }, { q: 'What is CloudWatch?', a: 'AWS monitoring service providing CPU usage metrics, traffic logs, and threshold alerts.' }],
  },
  devops: {
    title: 'DevOps Engineering', difficulty: 'Advanced', estimatedTime: '50 Hours', color: '#6366F1',
    description: 'Automate build/test/deploy cycles using Docker, Kubernetes, Terraform, and CI/CD pipelines.',
    whatYoullLearn: ['Linux terminal navigation and Bash scripting', 'Optimized Docker container images', 'Kubernetes cluster orchestration', 'CI/CD pipelines (GitHub Actions/Jenkins)', 'Terraform infrastructure as code', 'Prometheus and Grafana monitoring', 'Network, firewall, and port configuration'],
    prerequisites: ['Basic Linux commands', 'Standard Git workflows'],
    theory: 'DevOps combines Software Development and IT Operations to shorten the development lifecycle and provide continuous delivery. Key pillars: automation, CI/CD, Infrastructure as Code, and active monitoring.\n\nDocker containerizes apps with their dependencies. Kubernetes orchestrates containers at scale. Terraform automates infrastructure provisioning as repeatable, version-controlled code (IaC).',
    definitions: [{ term: 'CI/CD', def: 'Continuous Integration and Continuous Deployment: pipeline automation for building, testing, and deploying.' }, { term: 'Docker', def: 'Platform containerizing applications into isolated environments.' }, { term: 'Kubernetes', def: 'Open-source container orchestration engine for automated deployment, scaling, and management.' }, { term: 'Terraform', def: 'Infrastructure as Code tool provisioning cloud resources using declarative config files.' }, { term: 'Prometheus', def: 'Open-source monitoring toolkit for collecting system metric data.' }],
    syntax: `# GitHub Actions CI Pipeline\nname: Test Pipeline\non: [push]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v2\n      - name: Run Tests\n        run: npm test`,
    codeExamples: [{ title: 'Optimized Dockerfile', code: `# Build stage\nFROM node:18-alpine AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nRUN npm run build\n\n# Production stage\nFROM nginx:alpine\nCOPY --from=builder /app/dist /usr/share/nginx/html\nEXPOSE 80\nCMD ["nginx","-g","daemon off;"]` }, { title: 'Kubernetes Deployment', code: `apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: web-app\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: web\n  template:\n    metadata:\n      labels:\n        app: web\n    spec:\n      containers:\n      - name: web\n        image: nginx:alpine\n        ports:\n        - containerPort: 80` }],
    roadmap: [{ step: 'Step 1', title: 'Linux & Scripting', description: 'Linux CLI, permissions, SSH, and Bash scripts.' }, { step: 'Step 2', title: 'Git Workflows', description: 'Branching, merging, rebasing, and hook scripts.' }, { step: 'Step 3', title: 'Containers (Docker)', description: 'Dockerfiles, images, and docker-compose setups.' }, { step: 'Step 4', title: 'CI/CD Pipelines', description: 'GitHub Actions to run tests and build images.' }, { step: 'Step 5', title: 'IaC (Terraform)', description: 'Declare resources, manage state files, and apply changes.' }, { step: 'Step 6', title: 'Kubernetes', description: 'Pods, Deployments, Services, Ingress, and cluster management.' }],
    qa: [{ q: 'CI vs CD?', a: 'CI: automatically builds and tests code on every push. CD: automatically deploys tested builds to production.' }, { q: 'Docker image vs container?', a: 'Image: read-only template with instructions. Container: runnable instance of an image.' }, { q: 'What are Kubernetes Pods?', a: 'Smallest deployable unit in Kubernetes, hosting one or more containers sharing storage and network.' }, { q: 'What is IaC?', a: 'Managing and provisioning infrastructure through machine-readable definition files, not manual configurations.' }, { q: 'Docker multi-stage builds?', a: 'Uses multiple FROM statements to build assets in large environments and copy only final files to slim production images.' }, { q: 'git rebase vs merge?', a: 'Merge: combines branches preserving history with merge commit. Rebase: moves commits onto new base, rewriting history linearly.' }, { q: 'Kubernetes self-healing?', a: 'Monitors pods, automatically restarts failed containers, replaces pods on node failure, and terminates unhealthy pods.' }, { q: 'Mutable vs immutable infrastructure?', a: 'Mutable: modify active servers. Immutable: replace servers entirely with new instances when updates needed.' }],
  },
  security: {
    title: 'Cyber Security', difficulty: 'Intermediate', estimatedTime: '40 Hours', color: '#EF4444',
    description: 'Learn cybersecurity fundamentals, OWASP Top 10, cryptography, and network scanning.',
    whatYoullLearn: ['CIA Triad security model', 'Network scanning with nmap', 'OWASP Top 10 web vulnerabilities', 'Symmetric and asymmetric cryptography', 'SQL Injection and XSS prevention', 'Secure code audits and reviews', 'Authentication systems (OAuth, JWT, Cookies)'],
    prerequisites: ['Basic networking (HTTP, TCP/IP)', 'Python familiarity'],
    theory: 'Cybersecurity protects systems, networks, and programs from digital attacks. The CIA Triad (Confidentiality, Integrity, Availability) guides secure architecture design.\n\nThe OWASP Top 10 lists the most critical web vulnerabilities. Symmetric encryption uses a single shared key. Asymmetric encryption uses a key pair (public/private) to protect data in transit and at rest.',
    definitions: [{ term: 'XSS', def: 'Cross-Site Scripting: attacker injects malicious scripts into trusted websites.' }, { term: 'SQL Injection', def: 'Exploit where malicious SQL is inserted into inputs to manipulate a database.' }, { term: 'Asymmetric Cryptography', def: 'System using pairs of keys: Public key (encrypt) and Private key (decrypt).' }, { term: 'Pen Testing', def: 'Penetration testing: simulated cyberattacks to discover security vulnerabilities.' }, { term: 'CIA Triad', def: 'Core security model: Confidentiality, Integrity, Availability.' }],
    syntax: `# Safe SQL parameterization (prevents SQLi)\ncursor.execute("SELECT * FROM users WHERE username = %s", (user_input,))`,
    codeExamples: [{ title: 'Cryptographic Hashing with Salt', code: `import hashlib, os\n\ndef hash_password(password: str):\n    salt = os.urandom(16)\n    key = hashlib.pbkdf2_hmac('sha256', password.encode(), salt, 100000)\n    return salt + key\n\nprint(hash_password("mySecurePassword").hex()[:32])` }, { title: 'HTML Sanitization (prevents XSS)', code: `// Escape HTML special characters\nfunction escapeHTML(str) {\n    return str.replace(/[&<>'"]/g,\n        tag => ({\n            '&': '&amp;', '<': '&lt;', '>': '&gt;',\n            "'": '&#39;', '"': '&quot;'\n        }[tag] || tag)\n    );\n}\n\nconst input = "<script>alert('XSS')</script>";\nconsole.log(escapeHTML(input));` }],
    roadmap: [{ step: 'Step 1', title: 'Security Basics', description: 'CIA triad, security models, and authentication protocols.' }, { step: 'Step 2', title: 'Network Security', description: 'Ports, firewalls, ping, nmap, and Wireshark.' }, { step: 'Step 3', title: 'OWASP Web Flaws', description: 'Injection attacks, broken access controls, and data exposures.' }, { step: 'Step 4', title: 'Cryptography', description: 'AES symmetric, RSA asymmetric, and secure hashing (bcrypt).' }, { step: 'Step 5', title: 'App Assessment', description: 'Penetration scans, exploit payloads, and log reviews.' }, { step: 'Step 6', title: 'Secure Development', description: 'Threat modeling, input validation, and DevSecOps.' }],
    qa: [{ q: 'Symmetric vs asymmetric encryption?', a: 'Symmetric: single shared key for encrypt/decrypt. Asymmetric: public key encrypts, private key decrypts.' }, { q: 'What is SQL Injection?', a: 'User inputs concatenated directly into SQL queries allow manipulation. Prevent with parameterized queries or ORMs.' }, { q: 'What is XSS?', a: 'Attackers inject scripts into trusted pages, potentially leaking session cookies. Prevent by escaping outputs and using CSP headers.' }, { q: 'What is the CIA Triad?', a: 'Confidentiality (authorized access only), Integrity (data unmodified), Availability (systems accessible when needed).' }, { q: 'Hashing vs encryption?', a: 'Hashing: one-way, irreversible. Encryption: two-way, reversible with a key.' }, { q: 'What is a MITM attack?', a: 'Attacker intercepts and relays communications between two parties. Prevented via HTTPS and TLS.' }, { q: 'What is CSRF?', a: 'Forces authenticated browser to send requests to a web app. Prevented with anti-CSRF tokens and SameSite cookies.' }, { q: 'What is CSP?', a: 'Content Security Policy: HTTP header restricting which resources the browser can load, mitigating XSS.' }],
  },
  systemdesign: {
    title: 'System Design', difficulty: 'Advanced', estimatedTime: '40 Hours', color: '#8B5CF6',
    description: 'Design highly available distributed systems — microservices, caching, sharding, and CAP theorem.',
    whatYoullLearn: ['Horizontal vs vertical scaling', 'Optimal load balancing algorithms', 'Server-side caching (Redis/Memcached)', 'Database replication and sharding', 'Microservices architecture', 'CAP Theorem trade-offs', 'Asynchronous workers and message queues'],
    prerequisites: ['Backend web development foundation', 'Database principles (SQL/NoSQL)'],
    theory: 'System Design defines the architecture, modules, interfaces, and data structures satisfying specified requirements. Designing at scale addresses high throughput, low latency, fault tolerance, and cost efficiency.\n\nLoad balancers distribute incoming traffic. Caching layers (Redis) store frequent queries in memory. CAP Theorem guides design trade-offs between consistency, availability, and partition tolerance.',
    definitions: [{ term: 'CAP Theorem', def: 'A distributed system can guarantee at most two of: Consistency, Availability, Partition Tolerance.' }, { term: 'Load Balancer', def: 'Distributes traffic across servers to optimize resource utilization and reliability.' }, { term: 'Database Sharding', def: 'Horizontal partitioning of a database across multiple servers based on a shard key.' }, { term: 'Redis', def: 'In-memory key-value store used as database, cache, and message broker.' }, { term: 'Microservices', def: 'Architectural style decomposing applications into loosely coupled, independently deployable services.' }],
    syntax: `// Cache-aside pattern\nasync function getCachedData(key) {\n    let data = await redis.get(key);\n    if (!data) {\n        data = await db.query(key);\n        await redis.setex(key, 3600, data);\n    }\n    return data;\n}`,
    codeExamples: [{ title: 'Consistent Hashing Ring', code: `import hashlib\n\nclass ConsistentHashing:\n    def __init__(self, nodes=None):\n        self.ring = {}\n        self.sorted_keys = []\n        for node in (nodes or []):\n            h = int(hashlib.md5(node.encode()).hexdigest(), 16)\n            self.ring[h] = node\n            self.sorted_keys.append(h)\n        self.sorted_keys.sort()\n\n    def get_node(self, key):\n        h = int(hashlib.md5(key.encode()).hexdigest(), 16)\n        for val in self.sorted_keys:\n            if h <= val: return self.ring[val]\n        return self.ring[self.sorted_keys[0]]\n\nch = ConsistentHashing(["Server1","Server2","Server3"])\nprint(ch.get_node("user_session_1052"))` }, { title: 'Token Bucket Rate Limiter', code: `import time\n\nclass TokenBucket:\n    def __init__(self, capacity, fill_rate):\n        self.capacity = capacity\n        self.fill_rate = fill_rate\n        self.tokens = capacity\n        self.last_fill = time.time()\n\n    def allow_request(self):\n        now = time.time()\n        elapsed = now - self.last_fill\n        self.tokens = min(self.capacity, self.tokens + elapsed * self.fill_rate)\n        self.last_fill = now\n        if self.tokens >= 1:\n            self.tokens -= 1\n            return True\n        return False` }],
    roadmap: [{ step: 'Step 1', title: 'Scalability Basics', description: 'Latency, throughput, vertical vs horizontal scaling, and SLA goals.' }, { step: 'Step 2', title: 'Load Balancing', description: 'Nginx/HAProxy load balancers and routing logic.' }, { step: 'Step 3', title: 'Caching', description: 'CDNs, read-through caches, and Redis.' }, { step: 'Step 4', title: 'Database Scalability', description: 'Primary-replica replication, vertical partitioning, and sharding.' }, { step: 'Step 5', title: 'Queues & Messaging', description: 'Publish-subscribe flows with Kafka or RabbitMQ.' }, { step: 'Step 6', title: 'Microservice Design', description: 'API gateways, service discovery, and circuit breakers.' }],
    qa: [{ q: 'What is CAP Theorem?', a: 'Distributed system can only guarantee two of: Consistency (all nodes see same data), Availability (every request succeeds), Partition Tolerance (system works despite network losses).' }, { q: 'What is database sharding?', a: 'Horizontally partitions table rows across multiple database engines based on a shard key, preventing storage bottlenecks.' }, { q: 'How does a CDN work?', a: 'Network of edge servers caching static assets (HTML, images) closer to users, reducing latency.' }, { q: 'Cache-aside pattern?', a: 'Query cache first. On miss, query database, write to cache, return result.' }, { q: 'SQL vs NoSQL?', a: 'SQL: relational, structured, ACID-compliant. NoSQL: non-relational, flexible schema, horizontally scalable, BASE.' }, { q: 'What is DNS?', a: 'Domain Name System translating hostnames (example.com) to IP addresses using hierarchical lookups.' }, { q: 'Rate limiting algorithms?', a: 'Token Bucket, Leaky Bucket, Sliding Window Log — all restrict request rates to prevent API abuse.' }, { q: 'When to use a message queue?', a: 'For async task decoupling, smoothing peak traffic loads (e.g. RabbitMQ, Kafka).' }],
  },
  testing: {
    title: 'Software Testing', difficulty: 'Beginner', estimatedTime: '25 Hours', color: '#14B8A6',
    description: 'Learn unit, integration, and E2E testing strategies using Jest, Pytest, and Cypress.',
    whatYoullLearn: ['Testing Pyramid methodology', 'Unit tests with Jest and Pytest', 'Mocking external dependencies', 'Integration tests for component linkages', 'E2E browser tests with Cypress/Playwright', 'Test-Driven Development (TDD)', 'Code coverage metrics'],
    prerequisites: ['Basic programming syntax', 'Terminal commands familiarity'],
    theory: 'Software Testing evaluates code to ensure it meets requirements and behaves as expected. Robust testing mitigates bugs, facilitates refactoring, and ensures deployment stability.\n\nThe Testing Pyramid: Unit Tests (isolated functions) → Integration Tests (component interactions) → E2E Tests (real user journeys in a browser).',
    definitions: [{ term: 'Unit Test', def: 'Testing the smallest testable parts (functions/methods) in isolation.' }, { term: 'TDD', def: 'Test-Driven Development: writing tests before writing production code.' }, { term: 'Mocking', def: 'Replacing actual dependencies (databases, APIs) with controlled test doubles.' }, { term: 'E2E Test', def: 'End-to-End testing: validating entire user journeys from frontend to database.' }, { term: 'Code Coverage', def: 'Metric expressing percentage of source code executed during test runs.' }],
    syntax: `// Basic Jest test\ntest('adds 1 + 2 to equal 3', () => {\n  expect(sum(1, 2)).toBe(3);\n});`,
    codeExamples: [{ title: 'Jest Unit Test with API Mock', code: `const axios = require('axios');\njest.mock('axios');\n\nasync function fetchUserName(id) {\n    const res = await axios.get(\`/api/users/\${id}\`);\n    return res.data.name;\n}\n\ntest('returns user name on success', async () => {\n    axios.get.mockResolvedValue({ data: { id: 1, name: 'Alice' } });\n    const name = await fetchUserName(1);\n    expect(name).toBe('Alice');\n});` }, { title: 'Cypress E2E Test', code: `describe('Login Flow', () => {\n  it('navigates to dashboard after login', () => {\n    cy.visit('/login');\n    cy.get('input[name=email]').type('user@example.com');\n    cy.get('input[name=password]').type('secure123');\n    cy.get('button[type=submit]').click();\n    cy.url().should('include', '/dashboard');\n    cy.get('h1').should('contain', 'Welcome');\n  });\n});` }],
    roadmap: [{ step: 'Step 1', title: 'Testing Principles', description: 'Test benefits, assertions, and the Testing Pyramid.' }, { step: 'Step 2', title: 'Unit Tests', description: 'Jest (JS) or Pytest (Python) unit tests.' }, { step: 'Step 3', title: 'Mocking & Spies', description: 'Mocks, stubs, and spy assertions.' }, { step: 'Step 4', title: 'Integration Tests', description: 'DB connections and API route testing.' }, { step: 'Step 5', title: 'E2E Testing', description: 'Cypress or Playwright script-based user interactions.' }, { step: 'Step 6', title: 'TDD & CI', description: 'Red-Green-Refactor cycle inside GitHub Actions.' }],
    qa: [{ q: 'What is the Testing Pyramid?', a: 'Guide suggesting many unit tests, some integration tests, few E2E tests — optimizing cost, speed, and reliability.' }, { q: 'Unit vs integration testing?', a: 'Unit: single function in isolation. Integration: multiple modules or systems working together.' }, { q: 'What is TDD?', a: 'Red (write failing test), Green (write minimum code to pass), Refactor (clean while keeping green).' }, { q: 'Mock vs Stub?', a: 'Stub: provides canned data. Mock: verifies behavior, asserting specific methods were called.' }, { q: 'What is code coverage?', a: 'Metric showing how much code tests execute: Statement, Branch, Function, and Line coverage types.' }, { q: 'What is regression testing?', a: 'Running existing tests after changes to verify updates did not introduce new bugs.' }, { q: 'Why avoid testing implementation details?', a: 'Tests depending on internal details break during refactoring even if external behavior is unchanged — creating brittle tests.' }, { q: 'Cypress vs Selenium?', a: 'Cypress runs inside the browser run-loop for faster, native DOM access. Selenium controls browsers remotely via drivers.' }],
  },
  git: {
    title: 'Git & GitHub', difficulty: 'Beginner', estimatedTime: '15 Hours', color: '#F43F5E',
    description: 'Master version control, repository structures, branches, rebases, and merge conflict resolution.',
    whatYoullLearn: ['Git three-stage local architecture', 'Core commands (add, commit, status, log)', 'Git branching models (Git Flow vs Trunk-based)', 'Resolving merge conflicts', 'Stashing, resetting, and cherry-picking', 'Remote operations (clone, fetch, push, pull)', 'Filtering project histories'],
    prerequisites: ['Terminal/Command Line basics', 'No version control experience required'],
    theory: 'Git is a distributed version control system tracking changes in source code, allowing multiple developers to work simultaneously without overwriting each other.\n\nGit uses a three-stage system: Working Directory (modified files) → Staging Area (indexed for commit) → Local Repository (committed history). Remotes are hosted on GitHub, GitLab, or Bitbucket.',
    definitions: [{ term: 'Commit', def: 'Snapshot of staged changes saved to repository history.' }, { term: 'Staging Area', def: 'Intermediate index prepping which files go into the next commit.' }, { term: 'Merge Conflict', def: 'When Git cannot automatically resolve code differences between branches.' }, { term: 'Rebase', def: 'Moving or combining commits to a new base commit.' }, { term: 'Remote', def: 'Shared repository hosted on network servers for team collaboration.' }],
    syntax: `# General workflow\ngit status\ngit add .\ngit commit -m "feat: implement user auth"\ngit push origin main`,
    codeExamples: [{ title: 'Resolving a Merge Conflict', code: `# 1. Start merge\ngit merge feature-branch\n\n# 2. Open conflicted file, choose code between:\n<<<<<<< HEAD\ncode in main branch\n=======\ncode in feature branch\n>>>>>>> feature-branch\n\n# 3. Save, stage and commit\ngit add conflict-resolved-file.js\ngit commit -m "merge: resolve conflict"` }, { title: 'Git Stash & Retrieve', code: `# Save uncommitted changes\ngit stash\n\n# Switch branches, do hotfix\ngit checkout main\n# ... fix bug ...\n\n# Return and apply stashed work\ngit checkout dev\ngit stash pop` }],
    roadmap: [{ step: 'Step 1', title: 'Git Configuration', description: 'Install Git, config username/email, initialize repos.' }, { step: 'Step 2', title: 'Basic Operations', description: 'git status, add, commit, diff, and log.' }, { step: 'Step 3', title: 'Branching & Merging', description: 'Create, switch, and merge branches.' }, { step: 'Step 4', title: 'Remote Operations', description: 'Add remote URLs, fetch, pull, and push.' }, { step: 'Step 5', title: 'Rebasing & Conflicts', description: 'git rebase and merge conflict resolution.' }, { step: 'Step 6', title: 'Advanced Commits', description: 'git stash, cherry-pick, reset, and log graphs.' }],
    qa: [{ q: 'Git vs GitHub?', a: 'Git: local CLI version-control tool. GitHub: cloud hosting service for Git repositories.' }, { q: 'git pull vs git fetch?', a: 'git fetch downloads remote commits without changing working directory. git pull fetches AND automatically merges.' }, { q: 'git reset vs git revert?', a: 'git reset removes commits from history (rewrites). git revert creates a new commit applying opposite changes (preserves history).' }, { q: 'What is a merge conflict?', a: 'Edits to the same lines on different branches. Resolve by opening files, choosing code within conflict markers, staging, and committing.' }, { q: 'What is the staging area?', a: 'Intermediate index allowing you to select exactly which changes to include in the next commit.' }, { q: 'What is git stash?', a: 'Temporarily shelves uncommitted changes, leaving the working directory clean to switch branches.' }, { q: 'What does git cherry-pick do?', a: 'Applies changes from a specific commit from another branch onto the current active branch.' }, { q: 'Undo the last commit before pushing?', a: 'git reset --soft HEAD~1 removes commit but keeps changes staged in the working directory.' }],
  },
  aptitude: {
    title: 'Aptitude & Interview Prep', difficulty: 'Beginner', estimatedTime: '30 Hours', color: '#EAB308',
    description: 'Master core mathematics, ratios, probability, clock puzzles, and deductive reasoning skills.',
    whatYoullLearn: ['Percentages, profits, losses, and discounts', 'Ratio, proportion, and average speed problems', 'Time, speed, and relative distance puzzles', 'Permutations, combinations, and probabilities', 'Data charts, tables, and logical Venn diagrams', 'Clock and calendar reasoning shortcuts', 'Work rate simultaneous formulations'],
    prerequisites: ['Basic arithmetic operations', 'Elementary school math'],
    theory: 'Quantitative and Logical Aptitude measures analytical thinking, numerical ability, and problem-solving skills. Aptitude rounds are standard screening barriers in software engineering recruitment.\n\nTopics span algebra, probability, spatial patterns, and data analysis. Improving speed requires understanding core formulas (speed-distance, profit-loss) and practicing mental shortcuts.',
    definitions: [{ term: 'Relative Speed', def: 'Speed of an object with respect to another moving object (add or subtract speeds).' }, { term: 'Probability', def: 'Mathematical calculation of the likelihood that a specific event will occur.' }, { term: 'Simple Interest', def: 'Interest calculated only on the principal amount.' }, { term: 'Compound Interest', def: 'Interest calculated on both initial principal and accumulated interest of prior periods.' }, { term: 'Venn Diagram', def: 'Diagram showing logical relations between sets.' }],
    syntax: `# Work rate formula\ndef work_together(time_A, time_B):\n    return (time_A * time_B) / (time_A + time_B)\n\nprint(work_together(10, 15))  # 6.0 days`,
    codeExamples: [{ title: 'Union Set Probability', code: `total = 52\nred = 26\nface = 12\nred_face = 6  # Intersection\n\n# P(Red OR Face) = P(Red) + P(Face) - P(Red AND Face)\nprob = (red + face - red_face) / total\nprint(f"Probability: {prob:.4f} ({prob*100:.1f}%)")  # 61.5%` }, { title: 'Work Rate Solver', code: `# A completes in 10 days, B in 15 days\na_days = 10\nb_days = 15\n\ncombined_rate = (1/a_days) + (1/b_days)\ndays_together = 1 / combined_rate\nprint(f"Together: {days_together} days")  # 6.0 days` }],
    roadmap: [{ step: 'Step 1', title: 'Number Operations', description: 'Factors, HCF/LCM, decimals, and percentage conversions.' }, { step: 'Step 2', title: 'Ratios & Averages', description: 'Mixture allocations, averages, and age calculations.' }, { step: 'Step 3', title: 'Commerce Math', description: 'Profit-loss, discounts, simple and compound interests.' }, { step: 'Step 4', title: 'Motion & Work', description: 'Work rates, pipes, trains, and relative speeds.' }, { step: 'Step 5', title: 'Permutations & Probability', description: 'Counting rules, coin/card probabilities, and distributions.' }, { step: 'Step 6', title: 'Logical Deduction', description: 'Clock angles, calendars, and data chart interpretation.' }],
    qa: [{ q: '72 km/hr in m/s?', a: 'Multiply by 5/18: 72 × (5/18) = 20 m/s.' }, { q: 'Compound interest formula?', a: 'A = P(1 + r/n)^(nt), where P=principal, r=annual rate, n=compounding frequency, t=time.' }, { q: 'Relative speed in opposite directions?', a: 'Add speeds: S_relative = S_A + S_B.' }, { q: 'P(at least one head in two coin tosses)?', a: 'Sample space: {HH, HT, TH, TT}. Favorable: {HH, HT, TH}. P = 3/4 (75%).' }, { q: 'A is 20% taller than B — B is what % shorter than A?', a: '[R/(100+R)] × 100 = [20/120] × 100 = 16.67%.' }, { q: 'Clock angle at 3:40?', a: '|30H - (11/2)M| = |30×3 - (11/2)×40| = |90 - 220| = 130 degrees.' }, { q: '5 men or 9 women do job in 19 days — 3 men + 6 women take how long?', a: '1 man = 1.8 women. 3 men + 6 women = 5.4+6 = 11.4 women. (9×19)/11.4 = 15 days.' }, { q: 'Bag with 5 red, 7 blue balls — P(different colors) for 2 drawn?', a: '(5C1 × 7C1) / 12C2 = (35/66) ≈ 0.53.' }],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Screen Component
// ─────────────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview', label: '📋 Overview' },
  { id: 'theory', label: '📖 Theory' },
  { id: 'code', label: '💻 Code' },
  { id: 'roadmap', label: '🗺️ Roadmap' },
  { id: 'qa', label: '❓ Q&A' },
];

const difficultyColor = (d) => d === 'Beginner' ? '#10B981' : d === 'Intermediate' ? '#F59E0B' : '#EF4444';

export default function CourseDetailScreen({ route, navigation }) {
  const { courseId } = route.params;
  const data = courseData[courseId];
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedQA, setExpandedQA] = useState({});
  const [activeExIdx, setActiveExIdx] = useState(0);

  if (!data) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundTitle}>Course Not Found</Text>
          <Text style={styles.notFoundSub}>ID "{courseId}" does not exist.</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const toggleQA = (idx) => setExpandedQA(prev => ({ ...prev, [idx]: !prev[idx] }));

  const copyToClipboard = (text) => {
    Clipboard.setString(text);
    Alert.alert('Copied!', 'Code copied to clipboard.');
  };

  const dColor = difficultyColor(data.difficulty);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: data.color + '44' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backRow}>
          <Text style={styles.backArrow}>← </Text>
          <Text style={styles.backLabel}>Back to Courses</Text>
        </TouchableOpacity>
        <View style={styles.badges}>
          <View style={[styles.badge, { borderColor: dColor, backgroundColor: dColor + '15' }]}>
            <Text style={[styles.badgeText, { color: dColor }]}>⭐ {data.difficulty}</Text>
          </View>
          <View style={[styles.badge, { borderColor: '#475569' }]}>
            <Text style={styles.badgeText}>⏱ {data.estimatedTime}</Text>
          </View>
        </View>
        <Text style={[styles.courseTitle, { color: data.color }]}>{data.title}</Text>
        <Text style={styles.courseDesc}>{data.description}</Text>
      </View>

      {/* Tab bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar} contentContainerStyle={styles.tabBarContent}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && { backgroundColor: data.color + '22', borderColor: data.color }]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={[styles.tabText, activeTab === tab.id && { color: data.color, fontWeight: 'bold' }]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tab content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentPadding}>

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <View>
            <Text style={styles.sectionTitle}>✅ What You'll Learn</Text>
            {data.whatYoullLearn.map((item, i) => (
              <View key={i} style={styles.learnRow}>
                <Text style={[styles.checkIcon, { color: '#10B981' }]}>✓</Text>
                <Text style={styles.learnText}>{item}</Text>
              </View>
            ))}
            <View style={styles.prereqBox}>
              <Text style={styles.prereqTitle}>Prerequisites</Text>
              {data.prerequisites.map((p, i) => (
                <Text key={i} style={styles.prereqItem}>• {p}</Text>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.practiceBtn, { backgroundColor: data.color }]}
              onPress={() => navigation.navigate('Interviews')}
            >
              <Text style={styles.practiceBtnText}>🎙️ Start Practice Interview</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* THEORY */}
        {activeTab === 'theory' && (
          <View>
            <Text style={styles.sectionTitle}>📖 Theory & Concepts</Text>
            {data.theory.split('\n\n').map((para, i) => (
              <Text key={i} style={styles.theoryText}>{para}</Text>
            ))}
            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>🔑 Key Definitions</Text>
            {data.definitions.map((def, i) => (
              <View key={i} style={[styles.defCard, { borderLeftColor: data.color }]}>
                <Text style={styles.defTerm}>{def.term}</Text>
                <Text style={styles.defDef}>{def.def}</Text>
              </View>
            ))}
          </View>
        )}

        {/* CODE */}
        {activeTab === 'code' && (
          <View>
            <Text style={styles.sectionTitle}>💻 Syntax & Examples</Text>
            <Text style={styles.codeSubLabel}>Basic Syntax Structure</Text>
            <View style={styles.codeBlock}>
              <TouchableOpacity style={styles.copyBtn} onPress={() => copyToClipboard(data.syntax)}>
                <Text style={styles.copyBtnText}>📋 Copy</Text>
              </TouchableOpacity>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Text style={styles.codeText}>{data.syntax}</Text>
              </ScrollView>
            </View>

            <Text style={[styles.codeSubLabel, { marginTop: 24 }]}>Practical Implementations</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.exTabRow} contentContainerStyle={{ gap: 10 }}>
              {data.codeExamples.map((ex, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.exTab, activeExIdx === i && { backgroundColor: data.color + '22', borderColor: data.color }]}
                  onPress={() => setActiveExIdx(i)}
                >
                  <Text style={[styles.exTabText, activeExIdx === i && { color: data.color }]}>{ex.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.codeBlock}>
              <TouchableOpacity style={styles.copyBtn} onPress={() => copyToClipboard(data.codeExamples[activeExIdx].code)}>
                <Text style={styles.copyBtnText}>📋 Copy Code</Text>
              </TouchableOpacity>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Text style={styles.codeText}>{data.codeExamples[activeExIdx].code}</Text>
              </ScrollView>
            </View>
          </View>
        )}

        {/* ROADMAP */}
        {activeTab === 'roadmap' && (
          <View>
            <Text style={styles.sectionTitle}>🗺️ Learning Roadmap</Text>
            {data.roadmap.map((step, i) => (
              <View key={i} style={styles.roadmapRow}>
                <View style={[styles.roadmapDot, { borderColor: data.color }]} />
                {i < data.roadmap.length - 1 && <View style={[styles.roadmapLine, { backgroundColor: data.color + '44' }]} />}
                <View style={styles.roadmapContent}>
                  <Text style={[styles.roadmapStep, { color: data.color }]}>{step.step}</Text>
                  <Text style={styles.roadmapTitle}>{step.title}</Text>
                  <Text style={styles.roadmapDesc}>{step.description}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Q&A */}
        {activeTab === 'qa' && (
          <View>
            <Text style={styles.sectionTitle}>❓ Interview Q&A</Text>
            <Text style={styles.qaHint}>Tap a question to expand the answer.</Text>
            {data.qa.map((item, i) => {
              const open = !!expandedQA[i];
              return (
                <View key={i} style={styles.qaCard}>
                  <TouchableOpacity style={styles.qaQuestion} onPress={() => toggleQA(i)}>
                    <Text style={[styles.qaQuestionText, open && { color: data.color }]}>
                      {i + 1}. {item.q}
                    </Text>
                    <Text style={[styles.qaChevron, open && { color: data.color }]}>{open ? '▲' : '▼'}</Text>
                  </TouchableOpacity>
                  {open && (
                    <View style={styles.qaAnswer}>
                      <Text style={styles.qaAnswerText}>{item.a}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  notFound: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  notFoundTitle: { fontSize: 22, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 8 },
  notFoundSub: { fontSize: 14, color: '#94A3B8', marginBottom: 24 },
  backBtn: { backgroundColor: '#6366F1', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 24 },
  backBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },

  // Header
  header: { padding: 20, paddingTop: 16, borderBottomWidth: 1 },
  backRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  backArrow: { color: '#94A3B8', fontSize: 16 },
  backLabel: { color: '#94A3B8', fontSize: 14 },
  badges: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  badge: { borderWidth: 1, borderRadius: 20, paddingVertical: 4, paddingHorizontal: 12 },
  badgeText: { fontSize: 13, fontWeight: '600', color: '#94A3B8' },
  courseTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 10, lineHeight: 34, color: '#F8FAFC' },
  courseDesc: { fontSize: 16, color: '#94A3B8', lineHeight: 24 },

  // Tabs
  tabBar: { flexGrow: 0 },
  tabBarContent: { paddingHorizontal: 20, paddingVertical: 12, gap: 10 },
  tab: { borderRadius: 24, paddingVertical: 8, paddingHorizontal: 18, borderWidth: 1, borderColor: '#334155' },
  tabText: { fontSize: 15, color: '#64748B', fontWeight: '500' },

  // Content
  content: { flex: 1 },
  contentPadding: { padding: 20, paddingBottom: 50 },

  // Overview
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 20 },
  learnRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, gap: 12 },
  checkIcon: { fontSize: 18, fontWeight: 'bold', marginTop: 2 },
  learnText: { fontSize: 16, color: '#CBD5E1', lineHeight: 24, flex: 1 },
  prereqBox: { backgroundColor: '#1E293B', borderRadius: 16, padding: 20, marginTop: 24, marginBottom: 24, borderWidth: 1, borderColor: '#334155' },
  prereqTitle: { fontSize: 18, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#334155' },
  prereqItem: { fontSize: 15, color: '#94A3B8', marginBottom: 8 },
  practiceBtn: { borderRadius: 16, padding: 16, alignItems: 'center', marginTop: 8 },
  practiceBtnText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },

  // Theory
  theoryText: { fontSize: 16, color: '#CBD5E1', lineHeight: 26, marginBottom: 16 },
  defCard: { backgroundColor: '#1E293B', borderRadius: 12, padding: 16, marginBottom: 16, borderLeftWidth: 5, borderWidth: 1, borderColor: '#334155' },
  defTerm: { fontSize: 16, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 6 },
  defDef: { fontSize: 15, color: '#94A3B8', lineHeight: 22 },

  // Code
  codeSubLabel: { fontSize: 15, color: '#94A3B8', marginBottom: 12, fontWeight: '500' },
  codeBlock: { backgroundColor: '#070A13', borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#1E293B', marginBottom: 12 },
  copyBtn: { alignSelf: 'flex-end', marginBottom: 12, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#1E293B', borderRadius: 8, borderWidth: 1, borderColor: '#334155' },
  copyBtnText: { color: '#E2E8F0', fontSize: 14, fontWeight: '500' },
  codeText: { color: '#38BDF8', fontFamily: 'monospace', fontSize: 15, lineHeight: 24 },
  exTabRow: { marginBottom: 12 },
  exTab: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: '#334155' },
  exTabText: { fontSize: 12, color: '#64748B' },

  // Roadmap
  roadmapRow: { flexDirection: 'row', marginBottom: 32, position: 'relative' },
  roadmapDot: { width: 20, height: 20, borderRadius: 10, borderWidth: 4, backgroundColor: '#0F172A', marginTop: 2, marginRight: 18, flexShrink: 0 },
  roadmapLine: { position: 'absolute', left: 9, top: 24, width: 2, bottom: -32 },
  roadmapContent: { flex: 1 },
  roadmapStep: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  roadmapTitle: { fontSize: 18, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 6 },
  roadmapDesc: { fontSize: 15, color: '#94A3B8', lineHeight: 22 },

  // Q&A
  qaHint: { fontSize: 15, color: '#64748B', marginBottom: 20 },
  qaCard: { backgroundColor: '#1E293B', borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#334155', overflow: 'hidden' },
  qaQuestion: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, gap: 16 },
  qaQuestionText: { fontSize: 16, fontWeight: '600', color: '#F8FAFC', flex: 1, lineHeight: 24 },
  qaChevron: { fontSize: 14, color: '#475569', flexShrink: 0 },
  qaAnswer: { padding: 18, paddingTop: 0, borderTopWidth: 1, borderTopColor: '#334155', backgroundColor: 'rgba(0,0,0,0.15)' },
  qaAnswerText: { fontSize: 15, color: '#94A3B8', lineHeight: 24, paddingTop: 16 },
});
