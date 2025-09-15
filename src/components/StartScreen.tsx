import React from 'react';
import { motion } from 'framer-motion';
import { Play, Clock, BookOpen, Brain, MessageSquare, Code } from 'lucide-react';

interface StartScreenProps {
  onStart: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  const sections = [
    { icon: Brain, name: 'Quantitative Aptitude', questions: 15, duration: '15 mins' },
    { icon: BookOpen, name: 'Verbal Ability', questions: 15, duration: '15 mins' },
    { icon: Brain, name: 'Logical Reasoning', questions: 15, duration: '15 mins' },
    { icon: MessageSquare, name: 'Communication Test', questions: 4, duration: '15 mins' },
    { icon: Code, name: 'Coding Assessment', questions: 2, duration: '75 mins' }
  ];

  const instructions = [
    "Complete all sections sequentially - you cannot return to previous sections",
    "Each section is timed - manage your time effectively",
    "Questions are dynamically generated and unique for each attempt",
    "Ensure stable internet connection and a quiet environment",
    "During the communication round, make sure your microphone is connected and working properly",
    "Copy-paste is disabled in coding and written sections – write answers on your own",
    "AI monitoring is active throughout the test – avoid mobile phones or unfair practices",
    "If cheating is detected, your test will end immediately without warning"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl w-full"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-6xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent mb-4"
          >
            Assessment 1
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl text-yellow-200 max-w-2xl mx-auto"
          >
            Dynamic Aptitude Realms
          </motion.p>
        </div>

        {/* Test Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-yellow-500/30 rounded-2xl p-8 mb-12"
        >
          <h2 className="text-2xl font-semibold text-yellow-400 mb-6 text-center">Assessment Overview</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((section, index) => (
              <motion.div
                key={section.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                className="bg-gray-900/50 rounded-xl p-4 border border-yellow-400/20 hover:border-yellow-400/40 transition-all duration-300"
              >
                <section.icon className="text-yellow-400 w-8 h-8 mb-3" />
                <h3 className="text-yellow-300 font-semibold mb-2">{section.name}</h3>
                <div className="space-y-1">
                  <p className="text-gray-300 text-sm flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    {section.questions} Questions
                  </p>
                  <p className="text-gray-300 text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {section.duration}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Instructions */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-yellow-500/30 rounded-2xl p-8 mb-12"
        >
          <h2 className="text-2xl font-semibold text-yellow-400 mb-6">
            Important Instructions
          </h2>
          <ul className="text-yellow-200 space-y-3">
            {instructions.map((text, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-black text-sm font-bold mt-0.5">
                  {index + 1}
                </div>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Start Button */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 50px rgba(255, 215, 0, 0.4)' }}
            whileTap={{ scale: 0.95 }}
            onClick={onStart}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold text-2xl px-16 py-6 rounded-2xl shadow-2xl transition-all duration-300 flex items-center gap-4 mx-auto"
          >
            <Play className="w-8 h-8" />
            Start Assessment
          </motion.button>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            className="text-yellow-300 mt-6 text-sm"
          >
            Total Duration: Approximately 2.5 hours
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
};
