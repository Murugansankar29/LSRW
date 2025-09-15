import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { Question, UserAnswer } from '../types';

interface QuestionSectionProps {
  sectionName: string;
  questions: Question[];
  duration: number; // in minutes
  onComplete: (answers: UserAnswer[]) => void;
  currentQuestionIndex: number;
}

export const QuestionSection: React.FC<QuestionSectionProps> = ({
  sectionName,
  questions,
  duration,
  onComplete,
  currentQuestionIndex: externalIndex
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(externalIndex);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setQuestionStartTime(Date.now());
    setSelectedAnswer('');
  }, [currentQuestionIndex]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNext = () => {
    const timeSpent = Date.now() - questionStartTime;
    const newAnswer: UserAnswer = {
      questionId: currentQuestion.id,
      answer: selectedAnswer,
      isCorrect: selectedAnswer === currentQuestion.correctAnswer,
      timeSpent
    };

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    if (currentQuestionIndex === questions.length - 1) {
      handleComplete(updatedAnswers);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleComplete = (finalAnswers = answers) => {
    onComplete(finalAnswers);
  };

  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-yellow-500/30 rounded-2xl p-6 mb-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-yellow-400">{sectionName}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-yellow-300">
                <Clock className="w-5 h-5" />
                <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
              </div>
              <div className="text-yellow-300">
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div 
              className="bg-gradient-to-r from-yellow-500 to-yellow-400 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-800/50 backdrop-blur-sm border border-yellow-500/30 rounded-2xl p-8"
          >
            {/* Question */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-yellow-500 text-black px-3 py-1 rounded-lg font-semibold text-sm">
                  {currentQuestion?.topic}
                </span>
                <span className={`px-3 py-1 rounded-lg font-semibold text-sm ${
                  currentQuestion?.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                  currentQuestion?.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {currentQuestion?.difficulty?.toUpperCase()}
                </span>
              </div>
              <h2 className="text-xl font-semibold text-yellow-200 leading-relaxed">
                {currentQuestion?.question}
              </h2>
            </div>

            {/* Options */}
            <div className="space-y-4 mb-8">
              {currentQuestion?.options?.map((option, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnswerSelect(option.split(')')[0])}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                    selectedAnswer === option.split(')')[0]
                      ? 'border-yellow-500 bg-yellow-500/10 text-yellow-300'
                      : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-yellow-400/50 hover:bg-gray-600/50'
                  }`}
                >
                  <span className="font-medium">{option}</span>
                </motion.button>
              ))}
            </div>

            {/* Next Button */}
            <div className="flex justify-end">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                disabled={!selectedAnswer}
                className={`px-8 py-3 rounded-xl font-semibold flex items-center gap-3 transition-all duration-200 ${
                  selectedAnswer
                    ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black hover:from-yellow-400 hover:to-yellow-500'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {currentQuestionIndex === questions.length - 1 ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Complete Section
                  </>
                ) : (
                  <>
                    Next Question
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};