import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Brain, 
  Code, 
  CheckCircle, 
  Lightbulb, 
  ArrowRight, 
  ArrowLeft,
  Star,
  TrendingUp,
  Target,
  BookOpen
} from 'lucide-react';
import { RoundFeedback } from '../services/feedbackService';

interface FeedbackScreenProps {
  aptitudeFeedback: RoundFeedback;
  communicationFeedback: RoundFeedback;
  codingFeedback: RoundFeedback;
  onClose: () => void;
}

export const FeedbackScreen: React.FC<FeedbackScreenProps> = ({
  aptitudeFeedback,
  communicationFeedback,
  codingFeedback,
  onClose
}) => {
  const [currentRound, setCurrentRound] = useState(0);
  
  const rounds = [
    { 
      feedback: aptitudeFeedback, 
      icon: Brain, 
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30'
    },
    { 
      feedback: communicationFeedback, 
      icon: MessageSquare, 
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30'
    },
    { 
      feedback: codingFeedback, 
      icon: Code, 
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30'
    }
  ];

  const currentRoundData = rounds[currentRound];

  const nextRound = () => {
    if (currentRound < rounds.length - 1) {
      setCurrentRound(currentRound + 1);
    }
  };

  const prevRound = () => {
    if (currentRound > 0) {
      setCurrentRound(currentRound - 1);
    }
  };

  const FeedbackCard = ({ title, items, icon: Icon, color }: { 
    title: string; 
    items: string[]; 
    icon: React.ComponentType<any>; 
    color: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${currentRoundData.bgColor} ${currentRoundData.borderColor} border rounded-xl p-6`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${color} flex items-center justify-center`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-yellow-300">{title}</h3>
      </div>
      
      <div className="space-y-3">
        {items.length > 0 ? (
          items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3"
            >
              <div className="w-2 h-2 rounded-full bg-yellow-400 mt-2 flex-shrink-0" />
              <p className="text-yellow-100 leading-relaxed">{item}</p>
            </motion.div>
          ))
        ) : (
          <p className="text-yellow-200 italic">No specific items identified for this category.</p>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent mb-2">
            Personalized Feedback
          </h1>
          <p className="text-yellow-300">
            Detailed analysis and improvement suggestions for your performance
          </p>
        </motion.div>

        {/* Round Navigation */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <div className="bg-gray-800/50 backdrop-blur-sm border border-yellow-500/30 rounded-2xl p-2">
            <div className="flex gap-2">
              {rounds.map((round, index) => {
                const Icon = round.icon;
                return (
                  <button
                    key={index}
                    onClick={() => setCurrentRound(index)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                      currentRound === index
                        ? `bg-gradient-to-r ${round.color} text-white shadow-lg`
                        : 'text-yellow-300 hover:text-yellow-200 hover:bg-gray-700/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{round.feedback.roundName}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Feedback Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentRound}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Round Header */}
            <div className={`${currentRoundData.bgColor} ${currentRoundData.borderColor} border rounded-2xl p-8`}>
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${currentRoundData.color} flex items-center justify-center`}>
                  <currentRoundData.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-yellow-400">
                    {currentRoundData.feedback.roundName}
                  </h2>
                  <p className="text-yellow-300">Performance Analysis & Recommendations</p>
                </div>
              </div>

              {/* Overall Performance */}
              <div className="bg-gray-800/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-yellow-300 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Overall Performance
                </h3>
                <p className="text-yellow-100 leading-relaxed text-lg">
                  {currentRoundData.feedback.overallPerformance}
                </p>
              </div>
            </div>

            {/* Feedback Cards Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeedbackCard
                title="Strengths"
                items={currentRoundData.feedback.strengths}
                icon={Star}
                color="from-green-500 to-green-600"
              />
              
              <FeedbackCard
                title="Areas for Improvement"
                items={currentRoundData.feedback.weaknesses}
                icon={Target}
                color="from-orange-500 to-orange-600"
              />
              
              <FeedbackCard
                title="Actionable Suggestions"
                items={currentRoundData.feedback.suggestions}
                icon={Lightbulb}
                color="from-blue-500 to-blue-600"
              />
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-6">
              <button
                onClick={prevRound}
                disabled={currentRound === 0}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  currentRound === 0
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-700 hover:bg-gray-600 text-yellow-300 hover:text-yellow-200'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                Previous Round
              </button>

              <div className="flex gap-2">
                {rounds.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentRound ? 'bg-yellow-400' : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>

              {currentRound < rounds.length - 1 ? (
                <button
                  onClick={nextRound}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black transition-all duration-300"
                >
                  Next Round
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white transition-all duration-300"
                >
                  <CheckCircle className="w-4 h-4" />
                  Complete Review
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Progress Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-gray-800/50 backdrop-blur-sm border border-yellow-500/30 rounded-2xl p-6"
        >
          <h3 className="text-xl font-semibold text-yellow-400 mb-4 text-center">
            Your Learning Journey
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            {rounds.map((round, index) => {
              const Icon = round.icon;
              const isCompleted = index <= currentRound;
              return (
                <div
                  key={index}
                  className={`p-4 rounded-xl transition-all duration-300 ${
                    isCompleted ? round.bgColor : 'bg-gray-700/30'
                  } ${isCompleted ? round.borderColor : 'border-gray-600'} border`}
                >
                  <div className={`w-8 h-8 mx-auto mb-2 rounded-lg flex items-center justify-center ${
                    isCompleted ? `bg-gradient-to-r ${round.color}` : 'bg-gray-600'
                  }`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <p className={`text-sm font-medium ${
                    isCompleted ? 'text-yellow-300' : 'text-gray-400'
                  }`}>
                    {round.feedback.roundName}
                  </p>
                  <p className={`text-xs mt-1 ${
                    isCompleted ? 'text-yellow-200' : 'text-gray-500'
                  }`}>
                    {isCompleted ? 'Reviewed' : 'Pending'}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
