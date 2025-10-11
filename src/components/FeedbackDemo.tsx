import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, FileText, Users, Code } from 'lucide-react';
import { FeedbackService } from '../services/feedbackService';
import { FeedbackScreen } from './FeedbackScreen';
import { TestResult, CommunicationTest, Question } from '../types';

/**
 * Demo component showing how the Interview Evaluator works
 * This demonstrates the feedback system with sample data
 */
export const FeedbackDemo: React.FC = () => {
  const [showDemo, setShowDemo] = useState(false);

  // Sample data for demonstration
  const sampleQuestions = {
    quantitative: [
      { id: '1', question: 'Sample Math Question 1', type: 'mcq' as const, topic: 'Arithmetic', difficulty: 'medium' as const },
      { id: '2', question: 'Sample Math Question 2', type: 'mcq' as const, topic: 'Algebra', difficulty: 'hard' as const },
      { id: '3', question: 'Sample Math Question 3', type: 'mcq' as const, topic: 'Geometry', difficulty: 'easy' as const },
    ],
    verbal: [
      { id: '4', question: 'Sample Verbal Question 1', type: 'mcq' as const, topic: 'Grammar', difficulty: 'medium' as const },
      { id: '5', question: 'Sample Verbal Question 2', type: 'mcq' as const, topic: 'Vocabulary', difficulty: 'easy' as const },
    ],
    reasoning: [
      { id: '6', question: 'Sample Logic Question 1', type: 'mcq' as const, topic: 'Pattern Recognition', difficulty: 'hard' as const },
      { id: '7', question: 'Sample Logic Question 2', type: 'mcq' as const, topic: 'Analytical Reasoning', difficulty: 'medium' as const },
    ]
  };

  const sampleQuantitativeResult: TestResult = {
    sectionId: 'quantitative',
    score: 2, // 2 out of 3 correct
    totalQuestions: 3,
    timeSpent: 300000, // 5 minutes
    answers: [
      { questionId: '1', answer: 'A', timeSpent: 120000 },
      { questionId: '2', answer: 'B', timeSpent: 90000 },
      { questionId: '3', answer: 'C', timeSpent: 90000 }
    ]
  };

  const sampleVerbalResult: TestResult = {
    sectionId: 'verbal',
    score: 1, // 1 out of 2 correct
    totalQuestions: 2,
    timeSpent: 180000, // 3 minutes
    answers: [
      { questionId: '4', answer: 'A', timeSpent: 90000 },
      { questionId: '5', answer: 'B', timeSpent: 90000 }
    ]
  };

  const sampleReasoningResult: TestResult = {
    sectionId: 'reasoning',
    score: 1, // 1 out of 2 correct
    totalQuestions: 2,
    timeSpent: 240000, // 4 minutes
    answers: [
      { questionId: '6', answer: 'A', timeSpent: 150000 },
      { questionId: '7', answer: 'B', timeSpent: 90000 }
    ]
  };

  const sampleCommunicationResult: CommunicationTest = {
    selfIntroduction: {
      transcript: "Hello, my name is John Doe. I am a software engineer with 3 years of experience in web development. I have worked with React, Node.js, and Python. I am passionate about creating user-friendly applications and solving complex problems. My goal is to become a full-stack developer and contribute to innovative projects that make a positive impact.",
      score: 8
    },
    speaking: {
      sentences: ["The quick brown fox jumps over the lazy dog", "Technology is advancing rapidly in today's world"],
      recordings: ["The quick brown fox jumps over the lazy dog", "Technology is advancing rapidly in today's world"],
      score: 4
    },
    listening: {
      audioFiles: ["Good morning everyone", "Please take your seats"],
      userResponses: ["Good morning everyone", "Please take your seats"],
      score: 5
    },
    writing: {
      topic: "Describe your favorite hobby and why you enjoy it",
      essay: "My favorite hobby is reading books because it allows me to explore different worlds and gain new perspectives. Reading has helped me improve my vocabulary and critical thinking skills. I particularly enjoy science fiction and mystery novels as they challenge my imagination and keep me engaged. Through reading, I have learned about various cultures, historical events, and scientific concepts. It is a hobby that I can enjoy anywhere and anytime, making it perfect for relaxation and personal growth.",
      score: 9
    }
  };

  const sampleCodingResults = [
    {
      score: 40,
      passedTests: 8,
      totalTests: 10,
      language: 'javascript'
    },
    {
      score: 25,
      passedTests: 5,
      totalTests: 10,
      language: 'python'
    }
  ];

  // Generate feedback
  const aptitudeFeedback = FeedbackService.generateAptitudeFeedback(
    sampleQuantitativeResult,
    sampleVerbalResult,
    sampleReasoningResult,
    sampleQuestions
  );

  const communicationFeedback = FeedbackService.generateCommunicationFeedback(sampleCommunicationResult);
  const codingFeedback = FeedbackService.generateCodingFeedback(sampleCodingResults);

  if (showDemo) {
    return (
      <FeedbackScreen
        aptitudeFeedback={aptitudeFeedback}
        communicationFeedback={communicationFeedback}
        codingFeedback={codingFeedback}
        onClose={() => setShowDemo(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full mb-6">
            <Users className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent mb-4">
            Interview Evaluator
          </h1>
          <p className="text-yellow-300 text-xl mb-8">
            AI-Powered Performance Analysis & Personalized Feedback System
          </p>
        </motion.div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-blue-400 mb-3">Aptitude Round</h3>
            <ul className="text-yellow-200 space-y-2 text-sm">
              <li>• Topic-wise performance breakdown</li>
              <li>• Accuracy and speed analysis</li>
              <li>• Targeted improvement suggestions</li>
              <li>• Quantitative, Verbal, Logical Reasoning</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-800/50 backdrop-blur-sm border border-green-500/30 rounded-2xl p-6"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-green-400 mb-3">Communication Round</h3>
            <ul className="text-yellow-200 space-y-2 text-sm">
              <li>• Speaking clarity and fluency</li>
              <li>• Listening comprehension</li>
              <li>• Writing organization and grammar</li>
              <li>• Self-introduction evaluation</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
              <Code className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-purple-400 mb-3">Coding Round</h3>
            <ul className="text-yellow-200 space-y-2 text-sm">
              <li>• Problem-solving approach</li>
              <li>• Code efficiency and logic</li>
              <li>• Test case pass rates</li>
              <li>• Algorithm optimization tips</li>
            </ul>
          </motion.div>
        </div>

        {/* Sample Feedback Format */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-yellow-500/30 rounded-2xl p-8 mb-8"
        >
          <h2 className="text-2xl font-semibold text-yellow-400 mb-6">Feedback Format</h2>
          <div className="bg-gray-900/50 rounded-xl p-6 font-mono text-sm">
            <div className="text-yellow-300 mb-2">[Round Name: Aptitude/Communication/Coding]</div>
            <div className="text-green-400 mb-1">**Overall Performance:**</div>
            <div className="text-yellow-200 mb-3 ml-2">(Brief personalized summary)</div>
            
            <div className="text-blue-400 mb-1">**Strengths:**</div>
            <div className="text-yellow-200 mb-1 ml-2">- Point 1</div>
            <div className="text-yellow-200 mb-3 ml-2">- Point 2</div>
            
            <div className="text-orange-400 mb-1">**Weaknesses:**</div>
            <div className="text-yellow-200 mb-1 ml-2">- Point 1</div>
            <div className="text-yellow-200 mb-3 ml-2">- Point 2</div>
            
            <div className="text-purple-400 mb-1">**Suggestions for Improvement:**</div>
            <div className="text-yellow-200 mb-1 ml-2">- Point 1</div>
            <div className="text-yellow-200 ml-2">- Point 2</div>
          </div>
        </motion.div>

        {/* Demo Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowDemo(true)}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold text-xl px-12 py-4 rounded-2xl transition-all duration-300 border border-yellow-400/30 flex items-center gap-3 mx-auto"
          >
            <Play className="w-6 h-6" />
            View Sample Feedback
          </motion.button>
          <p className="text-yellow-300 text-sm mt-4">
            Experience the detailed feedback system with sample interview data
          </p>
        </motion.div>
      </div>
    </div>
  );
};
