import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyBrJj5wCHb8E-iP5IUlm4zVTDaqpGzK1oc';
const genAI = new GoogleGenerativeAI(API_KEY);

export class GeminiService {
  private model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  async generateQuantitativeQuestions(count: number = 15) {
    const topics = [
      "Number System & Arithmetic", "Divisibility rules", "LCM & HCF", "Factors & Multiples",
      "Percentages", "Averages", "Linear equations", "Quadratic equations", "Profit & Loss",
      "Simple Interest & Compound Interest", "Time, Speed & Distance", "Time & Work",
      "Mensuration", "Permutations & Combinations", "Probability", "Data Interpretation"
    ];

    const prompt = `Generate ${count} quantitative aptitude multiple choice questions for engineering graduate interviews. 
    Cover these topics: ${topics.join(', ')}.
    
    Format each question as JSON with this structure:
    {
      "question": "question text",
      "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
      "correctAnswer": "A",
      "topic": "topic name",
      "difficulty": "easy|medium|hard"
    }
    
    Make questions practical and relevant for engineering graduates. Return only valid JSON array.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      return JSON.parse(response.replace(/```json\n?|\n?```/g, ''));
    } catch (error) {
      console.error('Error generating quantitative questions:', error);
      return this.getFallbackQuantitativeQuestions(count);
    }
  }

  async generateVerbalQuestions(count: number = 15) {
    const topics = [
      "Grammar & Vocabulary", "Reading Comprehension", "Error Spotting", "Sentence Correction",
      "Synonyms & Antonyms", "Idioms & Phrases", "Para Jumbles", "Cloze Test"
    ];

    const prompt = `Generate ${count} verbal ability multiple choice questions for engineering graduate interviews.
    Cover these topics: ${topics.join(', ')}.
    
    Format each question as JSON with this structure:
    {
      "question": "question text",
      "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
      "correctAnswer": "A",
      "topic": "topic name",
      "difficulty": "easy|medium|hard"
    }
    
    Include reading comprehension, grammar, and vocabulary questions. Return only valid JSON array.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      return JSON.parse(response.replace(/```json\n?|\n?```/g, ''));
    } catch (error) {
      console.error('Error generating verbal questions:', error);
      return this.getFallbackVerbalQuestions(count);
    }
  }

  async generateReasoningQuestions(count: number = 15) {
    const topics = [
      "Analytical Reasoning", "Coding-Decoding", "Blood Relations", "Direction Sense",
      "Inequalities", "Syllogisms", "Puzzles", "Series", "Statement & Assumptions",
      "Logical Puzzles", "Pattern Completion"
    ];

    const prompt = `Generate ${count} logical reasoning multiple choice questions for engineering graduate interviews.
    Cover these topics: ${topics.join(', ')}.
    
    Format each question as JSON with this structure:
    {
      "question": "question text",
      "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
      "correctAnswer": "A",
      "topic": "topic name",
      "difficulty": "easy|medium|hard"
    }
    
    Include puzzles, logical sequences, and analytical problems. Return only valid JSON array.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      return JSON.parse(response.replace(/```json\n?|\n?```/g, ''));
    } catch (error) {
      console.error('Error generating reasoning questions:', error);
      return this.getFallbackReasoningQuestions(count);
    }
  }

  async generateCommunicationPrompts() {
    const prompt = `Generate communication test prompts for an engineering graduate interview.
    
    STRICT RULES FOR speakingSentences:
    - Provide 5 simple, declarative English sentences.
    - 6 to 10 words each.
    - Present simple tense preferred; no commands, no questions.
    - Do NOT use words like: describe, tell, explain, discuss, talk, why, how, what, should, could, would.
    - No quotes, no punctuation-heavy constructs, no complex clauses.
    - Examples of acceptable style: "The server handles requests reliably." "Data travels through secure channels." (Do not reuse these exact sentences.)
    
    RULES FOR listeningAudio:
    - Provide 5 short, clear sentences (6-10 words), simple vocabulary.
    
    Format as JSON only:
    {
      "speakingSentences": ["..."],
      "listeningAudio": ["..."],
      "writingTopic": "..."
    }
    
    Make content professional and relevant to engineering careers. Return ONLY valid JSON.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      return JSON.parse(response.replace(/```json\n?|\n?```/g, ''));
    } catch (error) {
      return {
        speakingSentences: [
          "The system processes data in real time",
          "Our backend service scales under heavy load",
          "Clean code improves team productivity",
          "Engineers document features for future updates",
          "Automation reduces manual testing effort"
        ],
        listeningAudio: [
          "Engineers work together on complex problems",
          "Technology creates better solutions each day",
          "Clear writing helps the whole team",
          "Data guides important business decisions",
          "Innovation drives engineering progress forward"
        ],
        writingTopic: "Discuss the role of emerging technologies in solving environmental challenges. How can engineers contribute to sustainable development?"
      };
    }
  }

  async generateCodingQuestions() {
    const dsaProblems = {
      medium: [
        { "title": "3Sum", "pattern": "Sorting + Two Pointers", "category": "Arrays", "expectedComplexity": "O(n^2)", "constraints": "3 ≤ n ≤ 3000" },
        { "title": "Group Anagrams", "pattern": "Hash Map + Sorting", "category": "Strings", "expectedComplexity": "O(n * k log k)", "constraints": "1 ≤ n ≤ 10^4, 1 ≤ |s| ≤ 100" },
        { "title": "Top K Frequent Elements", "pattern": "Heap / Hash Map", "category": "Heap", "expectedComplexity": "O(n log k)", "constraints": "1 ≤ n ≤ 10^5" },
        { "title": "Longest Substring Without Repeating Characters", "pattern": "Sliding Window", "category": "Strings", "expectedComplexity": "O(n)", "constraints": "1 ≤ |s| ≤ 5*10^4" },
        { "title": "Binary Tree Level Order Traversal", "pattern": "BFS", "category": "Trees", "expectedComplexity": "O(n)", "constraints": "1 ≤ nodes ≤ 10^4" },
        { "title": "Number of Islands", "pattern": "DFS / BFS", "category": "Graphs", "expectedComplexity": "O(n*m)", "constraints": "1 ≤ n,m ≤ 300" },
        { "title": "House Robber", "pattern": "Dynamic Programming", "category": "DP", "expectedComplexity": "O(n)", "constraints": "1 ≤ n ≤ 100" },
        { "title": "Kth Largest Element in Array", "pattern": "Heap / Quickselect", "category": "Heap / Arrays", "expectedComplexity": "O(n log k) or O(n) avg", "constraints": "1 ≤ n ≤ 10^5" },
        { "title": "Coin Change", "pattern": "Dynamic Programming", "category": "DP", "expectedComplexity": "O(n * amount)", "constraints": "1 ≤ coins.length ≤ 12, 1 ≤ amount ≤ 10^4" },
        { "title": "Course Schedule", "pattern": "Graph + Topological Sort", "category": "Graphs", "expectedComplexity": "O(V+E)", "constraints": "1 ≤ numCourses ≤ 2000" }
      ],
      hard: [
        { "title": "Trapping Rain Water", "pattern": "Two Pointers / Stack", "category": "Arrays", "expectedComplexity": "O(n)", "constraints": "1 ≤ n ≤ 2*10^4" },
        { "title": "Median of Two Sorted Arrays", "pattern": "Binary Search", "category": "Binary Search", "expectedComplexity": "O(log(min(n,m)))", "constraints": "1 ≤ n,m ≤ 10^5" },
        { "title": "Serialize and Deserialize Binary Tree", "pattern": "BFS / DFS", "category": "Trees", "expectedComplexity": "O(n)", "constraints": "1 ≤ nodes ≤ 10^5" },
        { "title": "Word Ladder", "pattern": "Graph + BFS", "category": "Graphs", "expectedComplexity": "O(n * wordLen * 26)", "constraints": "1 ≤ words ≤ 5000, 1 ≤ wordLen ≤ 10" },
        { "title": "Edit Distance", "pattern": "Dynamic Programming", "category": "DP", "expectedComplexity": "O(n*m)", "constraints": "1 ≤ n,m ≤ 500" },
        { "title": "N-Queens", "pattern": "Backtracking", "category": "Backtracking", "expectedComplexity": "O(n!)", "constraints": "1 ≤ n ≤ 9" },
        { "title": "Binary Tree Maximum Path Sum", "pattern": "DFS", "category": "Trees", "expectedComplexity": "O(n)", "constraints": "1 ≤ nodes ≤ 10^5" },
        { "title": "Longest Consecutive Sequence", "pattern": "Hash Set", "category": "Arrays", "expectedComplexity": "O(n)", "constraints": "1 ≤ n ≤ 10^5" }
      ]
    };

    // Randomly select one medium and one hard problem
    const mediumProblem = dsaProblems.medium[Math.floor(Math.random() * dsaProblems.medium.length)];
    const hardProblem = dsaProblems.hard[Math.floor(Math.random() * dsaProblems.hard.length)];

    const prompt = `Generate 2 detailed DSA coding questions for software engineering interview:

    Q1: ${mediumProblem.title} (Medium - ${mediumProblem.category})
    - Pattern: ${mediumProblem.pattern}
    - Expected Complexity: ${mediumProblem.expectedComplexity}
    - Constraints: ${mediumProblem.constraints}

    Q2: ${hardProblem.title} (Hard - ${hardProblem.category})
    - Pattern: ${hardProblem.pattern}
    - Expected Complexity: ${hardProblem.expectedComplexity}
    - Constraints: ${hardProblem.constraints}

    For each question, provide:
    1. Clear problem description with examples
    2. Input/Output format specification
    3. At least 3-4 comprehensive test cases including edge cases
    4. Proper constraints

    Format as JSON array:
    [
      {
        "title": "Problem Title",
        "description": "Detailed problem description with context",
        "inputFormat": "Clear input format with data types",
        "outputFormat": "Clear output format specification",
        "constraints": "All constraints including time/space complexity expectations",
        "examples": [
          {
            "input": "sample input with proper formatting",
            "output": "expected output with proper formatting",
            "explanation": "step-by-step explanation of the solution approach"
          }
        ],
        "testCases": [
          {"input": "test case 1 input", "expectedOutput": "exact expected output"},
          {"input": "test case 2 input", "expectedOutput": "exact expected output"},
          {"input": "edge case input", "expectedOutput": "exact expected output"},
          {"input": "large case input", "expectedOutput": "exact expected output"}
        ],
        "difficulty": "medium|hard",
        "category": "${mediumProblem.category}|${hardProblem.category}",
        "pattern": "${mediumProblem.pattern}|${hardProblem.pattern}",
        "functionSpec": {
          "name": "lower_snake_case function name capturing the main task (e.g., two_sum, group_anagrams)",
          "args": [
            {"name": "arg1", "type": "number|number[]|string|string[]|any"}
          ],
          "returnType": "number|number[]|string|string[]|boolean|void"
        }
      }
    ]

    IMPORTANT: 
    - Ensure test cases have EXACT expected outputs (no trailing spaces, proper formatting)
    - Include edge cases (empty arrays, single elements, maximum constraints)
    - Make input/output formats crystal clear
    - Test cases should be comprehensive and cover different scenarios
    - The functionSpec should reflect a clean API a candidate would implement (avoid IO in the function).`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      return JSON.parse(response.replace(/```json\n?|\n?```/g, ''));
    } catch (error) {
      return this.getFallbackCodingQuestions();
    }
  }

  private getFallbackQuantitativeQuestions(count: number) {
    const fallbackQuestions = [
      {
        question: "If a train travels 240 km in 3 hours, what is its average speed?",
        options: ["A) 60 km/h", "B) 70 km/h", "C) 80 km/h", "D) 90 km/h"],
        correctAnswer: "C",
        topic: "Time, Speed & Distance",
        difficulty: "easy"
      },
      {
        question: "What is 15% of 80?",
        options: ["A) 10", "B) 12", "C) 15", "D) 20"],
        correctAnswer: "B",
        topic: "Percentages",
        difficulty: "easy"
      }
    ];
    return Array(count).fill(null).map((_, i) => ({
      ...fallbackQuestions[i % fallbackQuestions.length],
      id: `quant_${i}`
    }));
  }

  private getFallbackVerbalQuestions(count: number) {
    const fallbackQuestions = [
      {
        question: "Choose the correct synonym for 'Meticulous':",
        options: ["A) Careless", "B) Detailed", "C) Quick", "D) Simple"],
        correctAnswer: "B",
        topic: "Synonyms & Antonyms",
        difficulty: "medium"
      }
    ];
    return Array(count).fill(null).map((_, i) => ({
      ...fallbackQuestions[i % fallbackQuestions.length],
      id: `verbal_${i}`
    }));
  }

  private getFallbackReasoningQuestions(count: number) {
    const fallbackQuestions = [
      {
        question: "If CODING is written as DPEJOH, how is PYTHON written?",
        options: ["A) QZUIPO", "B) QZUION", "C) QZUJPO", "D) QZVIPO"],
        correctAnswer: "C",
        topic: "Coding-Decoding",
        difficulty: "medium"
      }
    ];
    return Array(count).fill(null).map((_, i) => ({
      ...fallbackQuestions[i % fallbackQuestions.length],
      id: `reasoning_${i}`
    }));
  }

  private getFallbackCodingQuestions() {
    return [
      {
        title: "Two Sum",
        description: "Given an array of integers and a target sum, return indices of two numbers that add up to the target.",
        inputFormat: "First line: array size n\nSecond line: n integers\nThird line: target sum",
        outputFormat: "Two space-separated indices",
        constraints: "2 ≤ n ≤ 10^4, -10^9 ≤ nums[i] ≤ 10^9",
        examples: [
          {
            input: "4\n2 7 11 15\n9",
            output: "0 1",
            explanation: "nums[0] + nums[1] = 2 + 7 = 9"
          }
        ],
        testCases: [
          { input: "4\n2 7 11 15\n9", expectedOutput: "0 1" },
          { input: "3\n3 2 4\n6", expectedOutput: "1 2" }
        ],
        difficulty: "easy",
        functionSpec: {
          name: "two_sum",
          args: [
            { name: "nums", type: "number[]" },
            { name: "target", type: "number" }
          ],
          returnType: "number[]"
        }
      },
      {
        title: "Longest Common Subsequence",
        description: "Find the length of the longest common subsequence between two strings.",
        inputFormat: "First line: string s1\nSecond line: string s2",
        outputFormat: "Length of LCS",
        constraints: "1 ≤ len(s1), len(s2) ≤ 1000",
        examples: [
          {
            input: "abcde\nace",
            output: "3",
            explanation: "LCS is 'ace' with length 3"
          }
        ],
        testCases: [
          { input: "abcde\nace", expectedOutput: "3" },
          { input: "abc\ndef", expectedOutput: "0" }
        ],
        difficulty: "hard",
        functionSpec: {
          name: "longest_common_subsequence",
          args: [
            { name: "s1", type: "string" },
            { name: "s2", type: "string" }
          ],
          returnType: "number"
        }
      }
    ];
  }
}

export const geminiService = new GeminiService();