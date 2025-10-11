import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Play, CheckCircle, Code, Terminal, ArrowRight, AlertCircle, ArrowLeft } from 'lucide-react';
import { CodingQuestion } from '../types';
import { ScoringService } from '../services/scoringService';
import { geminiService } from '../services/geminiService';
import { pistonService } from '../services/pistonService';

interface CodingAssessmentProps {
  questions?: CodingQuestion[];
  onComplete: (results: any[]) => void;
}

export const CodingAssessment: React.FC<CodingAssessmentProps> = ({ questions: propQuestions, onComplete }) => {
  const [questions, setQuestions] = useState<CodingQuestion[]>(propQuestions || []);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(!propQuestions);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [code, setCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [timeLeft, setTimeLeft] = useState(30 * 60); // Dynamic timer based on question
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [allSolutions, setAllSolutions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const languages = pistonService.getAvailableLanguages();

  // Load questions if not provided
  useEffect(() => {
    if (!propQuestions) {
      loadCodingQuestions();
    }
  }, [propQuestions]);

  const loadCodingQuestions = async () => {
    try {
      setIsLoadingQuestions(true);
      setError(null);
      const generatedQuestions = await geminiService.generateCodingQuestions();
      const questionsWithIds = generatedQuestions.map((q: any, index: number) => ({
        ...q,
        id: `coding_${index}`
      }));
      setQuestions(questionsWithIds);
    } catch (error) {
      console.error('Error loading coding questions:', error);
      setError('Failed to load coding questions. Please try again.');
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  // Set timer based on current question
  useEffect(() => {
    if (questions.length === 0) return;
    
    // Set timer: 30 mins for first question, 45 mins for second
    const questionTime = currentQuestionIndex === 0 ? 30 * 60 : 45 * 60;
    setTimeLeft(questionTime);
  }, [currentQuestionIndex, questions.length]);

  // Timer countdown
  useEffect(() => {
    if (questions.length === 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleNext();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestionIndex, questions.length]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getLanguageTemplate = (language: string, question?: CodingQuestion) => {
    const spec = question?.functionSpec;
    const argList = (spec?.args || []).map(a => a.name).join(', ');
    const pythonFunc = spec
      ? `def ${spec.name}(${(spec?.args || []).map(a => a.name).join(', ')}):\n    # TODO: implement using ${(spec?.args || []).map(a => a.name).join(', ')}\n    pass\n\n`
      : '';

    const mapJavaType = (t: string) => {
      switch (t) {
        case 'number': return 'int';
        case 'number[]': return 'int[]';
        case 'string': return 'String';
        case 'string[]': return 'String[]';
        case 'boolean': return 'boolean';
        case 'boolean[]': return 'boolean[]';
        case 'void': return 'void';
        default: return 'Object';
      }
    };
    const getJavaDefaultReturn = (t: string) => {
      const jt = mapJavaType(t);
      if (jt === 'void') return '';
      if (jt === 'int') return '0';
      if (jt === 'boolean') return 'false';
      if (jt === 'String') return '""';
      if (jt === 'int[]') return 'new int[0]';
      if (jt === 'String[]') return 'new String[0]';
      if (jt === 'boolean[]') return 'new boolean[0]';
      return 'null';
    };
    const mapCppType = (t: string) => {
      switch (t) {
        case 'number': return 'int';
        case 'number[]': return 'vector<int>';
        case 'string': return 'string';
        case 'string[]': return 'vector<string>';
        case 'boolean': return 'bool';
        case 'boolean[]': return 'vector<bool>';
        case 'void': return 'void';
        default: return 'auto';
      }
    };
    const getCppDefaultReturn = (t: string) => {
      const ct = mapCppType(t);
      if (ct === 'int') return '0';
      if (ct === 'bool') return 'false';
      if (ct === 'string') return 'string()';
      if (ct === 'vector<int>') return 'vector<int>()';
      if (ct === 'vector<string>') return 'vector<string>()';
      if (ct === 'vector<bool>') return 'vector<bool>()';
      return '{}';
    };

    switch (language) {
      case 'python':
        return `# Write your solution here\n\n${pythonFunc}def solve():\n    # Parse input as per the problem's Input Format\n    # args: ${argList || '(define based on input)'}\n    # TODO: parse input and call ${spec ? spec.name : 'your_function'}(...)\n    # Example:\n    # result = ${spec ? `${spec.name}(${argList})` : '...'}\n    # print(result)\n    pass\n\n# Main execution\nif __name__ == "__main__":\n    solve()`;
      case 'java':
        {
          const fn = spec ? `static ${mapJavaType(spec.returnType)} ${spec.name}(${(spec.args || []).map(a => `${mapJavaType(a.type)} ${a.name}`).join(', ')}) {\n        // TODO: implement\n        ${mapJavaType(spec.returnType) === 'void' ? '' : `return ${getJavaDefaultReturn(spec.returnType)};`}\n    }\n\n` : '';
          return `import java.util.*;\n\npublic class Solution {\n    ${fn}    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Parse input as per the problem's Input Format\n        // Then call ${spec ? spec.name : "yourFunction"} and print the result\n    }\n}`;
        }
      case 'cpp':
        {
          const fn = spec ? `${mapCppType(spec.returnType)} ${spec.name}(${(spec.args || []).map(a => `${mapCppType(a.type)} ${a.name}`).join(', ')}) {\n    // TODO: implement\n    ${mapCppType(spec.returnType) === 'void' ? 'return;' : `return ${getCppDefaultReturn(spec.returnType)};`}\n}\n\n` : '';
          return `#include <bits/stdc++.h>\nusing namespace std;\n\n${fn}int main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n    // Parse input as per the problem's Input Format\n    // Then call ${spec ? spec.name : "your_function"} and output the result\n    return 0;\n}`;
        }
      case 'c':
        return '#include <stdio.h>\n#include <stdlib.h>\n\n// TODO: Define function based on the problem (signature depends on your parsing)\n\nint main() {\n    // Parse input as per the problem"s Input Format\n    // Call your function and print the result\n    return 0;\n}';
      default:
        return '';
    }
  };

  useEffect(() => {
    setCode(getLanguageTemplate(selectedLanguage, currentQuestion));
  }, [selectedLanguage, currentQuestionIndex, questions.length]);

  const runCode = async () => {
    if (!currentQuestion) {
      setError('No question available to test against.');
      return;
    }

    if (!code.trim()) {
      setError('Please write some code before running tests.');
      return;
    }

    setIsRunning(true);
    setError(null);
    
    try {
      // Run code against test cases using Piston API (validation is done inside)
      const results = await pistonService.runTestCases(
        selectedLanguage,
        code,
        currentQuestion.testCases
      );
      
      setTestResults(results);
      
      // Show additional feedback for common issues
      const failedResults = results.filter(r => !r.passed);
      if (failedResults.length === results.length) {
        const commonErrors = failedResults.map(r => r.error).filter(Boolean);
        const uniqueErrors = [...new Set(commonErrors)];
        
        if (uniqueErrors.includes('Empty Solution')) {
          setError('Please provide a complete solution. Template code or empty functions won\'t pass the tests.');
        } else if (uniqueErrors.includes('No Output')) {
          setError('Your code is not producing any output. Make sure to print/return the expected result.');
        } else if (uniqueErrors.includes('Compilation Error')) {
          setError('Your code has compilation errors. Please check the syntax and fix any issues.');
        } else if (uniqueErrors.includes('Runtime Error')) {
          setError('Your code encounters runtime errors. Check for issues like array bounds, null pointers, etc.');
        }
      }
      
    } catch (error) {
      console.error('Error running code:', error);
      setError(`Execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTestResults([]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleNext = () => {
    const currentSolution = {
      questionIndex: currentQuestionIndex,
      code,
      testResults,
      language: selectedLanguage
    };

    const updatedSolutions = [...allSolutions];
    updatedSolutions[currentQuestionIndex] = currentSolution;
    setAllSolutions(updatedSolutions);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => {
        const next = prev + 1;
        const nextQ = questions[next];
        setCode(getLanguageTemplate(selectedLanguage, nextQ));
        return next;
      });
      setTestResults([]);
      setError(null);
    } else {
      const scoredResults = ScoringService.scoreCoding(updatedSolutions);
      onComplete(scoredResults);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      // Save current solution before going back
      const currentSolution = {
        questionIndex: currentQuestionIndex,
        code,
        testResults,
        language: selectedLanguage
      };
      
      const updatedSolutions = [...allSolutions];
      updatedSolutions[currentQuestionIndex] = currentSolution;
      setAllSolutions(updatedSolutions);
      
      // Go to previous question
      setCurrentQuestionIndex(prev => {
        const prevIndex = prev - 1;
        // Load previous solution if it exists
        const previousSolution = updatedSolutions[prevIndex];
        if (previousSolution) {
          setCode(previousSolution.code);
          setTestResults(previousSolution.testResults || []);
          setSelectedLanguage(previousSolution.language);
        } else {
          const prevQ = questions[prevIndex];
          setCode(getLanguageTemplate(selectedLanguage, prevQ));
          setTestResults([]);
        }
        return prevIndex;
      });
      
      setError(null);
    }
  };

  // Loading state
  if (isLoadingQuestions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-yellow-400 mb-2">Generating Coding Problems</h2>
          <p className="text-yellow-200">Please wait while we create your coding assessment...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-400 mb-2">Error Loading Questions</h2>
          <p className="text-red-200 mb-4">{error}</p>
          <button
            onClick={loadCodingQuestions}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-yellow-400">No coding questions available</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-yellow-500/30 rounded-2xl p-6 mb-6"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {/* Back Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all duration-200 ${
                  currentQuestionIndex > 0
                    ? 'bg-gray-600 hover:bg-gray-500 text-white'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </motion.button>
              <div>
                <h1 className="text-2xl font-bold text-yellow-400">Coding Assessment</h1>
                <p className="text-yellow-200">Problem {currentQuestionIndex + 1} of {questions.length} • {currentQuestionIndex === 0 ? '30' : '45'} minutes</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-yellow-300">
                <Clock className="w-5 h-5" />
                <span className="font-mono text-xl">{formatTime(timeLeft)}</span>
              </div>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-gray-700 text-yellow-200 border border-yellow-500/30 rounded-lg px-4 py-2 focus:border-yellow-500 focus:outline-none"
              >
                {languages.map(lang => (
                  <option key={lang.id} value={lang.id}>{lang.name} ({lang.version})</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Problem Statement */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800/50 backdrop-blur-sm border border-yellow-500/30 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Code className="w-6 h-6 text-yellow-400" />
              <h2 className="text-xl font-semibold text-yellow-400">{currentQuestion?.title}</h2>
              <span className={`px-3 py-1 rounded-lg font-semibold text-sm ${
                currentQuestion?.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                currentQuestion?.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {currentQuestion?.difficulty?.toUpperCase()}
              </span>
            </div>

            <div className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-yellow-300 mb-3">Problem Description</h3>
                <p className="text-yellow-200 leading-relaxed">{currentQuestion?.description}</p>
              </div>

              {/* Input/Output Format */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-md font-semibold text-yellow-300 mb-2">Input Format</h4>
                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <pre className="text-yellow-100 text-sm whitespace-pre-wrap">{currentQuestion?.inputFormat}</pre>
                  </div>
                </div>
                <div>
                  <h4 className="text-md font-semibold text-yellow-300 mb-2">Output Format</h4>
                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <pre className="text-yellow-100 text-sm whitespace-pre-wrap">{currentQuestion?.outputFormat}</pre>
                  </div>
                </div>
              </div>

              {/* Constraints */}
              <div>
                <h4 className="text-md font-semibold text-yellow-300 mb-2">Constraints</h4>
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <pre className="text-yellow-100 text-sm whitespace-pre-wrap">{currentQuestion?.constraints}</pre>
                </div>
              </div>

              {/* Examples */}
              <div>
                <h4 className="text-md font-semibold text-yellow-300 mb-2">Examples</h4>
                <div className="space-y-4">
                  {currentQuestion?.examples?.map((example, index) => (
                    <div key={index} className="bg-gray-900/50 rounded-lg p-4">
                      <div className="mb-3">
                        <span className="text-yellow-400 font-semibold text-sm block mb-2">
                          Example {index + 1}:
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <span className="text-yellow-400 font-semibold text-sm">Input:</span>
                          <pre className="text-yellow-100 text-sm mt-1 bg-gray-800 p-2 rounded border-l-2 border-yellow-500 overflow-x-auto">{example.input}</pre>
                        </div>
                        
                        <div>
                          <span className="text-yellow-400 font-semibold text-sm">Output:</span>
                          <pre className="text-yellow-100 text-sm mt-1 bg-gray-800 p-2 rounded border-l-2 border-green-500 overflow-x-auto">{example.output}</pre>
                        </div>
                        
                        <div>
                          <span className="text-yellow-400 font-semibold text-sm">Explanation:</span>
                          <p className="text-yellow-200 text-sm mt-1 leading-relaxed">{example.explanation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Code Editor */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Code Editor */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-yellow-500/30 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-yellow-300">Code Editor</h3>
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={runCode}
                    disabled={isRunning}
                    className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all duration-200 ${
                      isRunning
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {isRunning ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Run Code
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
              
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onPaste={(e) => e.preventDefault()}
                onCopy={(e) => e.preventDefault()}
                onCut={(e) => e.preventDefault()}
                onDrop={(e) => e.preventDefault()}
                onDragOver={(e) => e.preventDefault()}
                className="w-full h-96 bg-gray-900 text-yellow-100 font-mono text-sm rounded-lg p-4 border border-yellow-500/30 focus:border-yellow-500 focus:outline-none resize-none"
                placeholder="Write your solution here... (Copy/Paste disabled)"
              />
            </div>

            {/* Error Display */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 backdrop-blur-sm border border-red-500/30 rounded-2xl p-4"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <span className="text-red-400 font-semibold">Error</span>
                </div>
                <p className="text-red-200 mt-2">{error}</p>
              </motion.div>
            )}

            {/* Test Results */}
            {testResults.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800/50 backdrop-blur-sm border border-yellow-500/30 rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Terminal className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-lg font-semibold text-yellow-300">Test Results</h3>
                </div>
                
                <div className="space-y-3">
                  {testResults.map((result, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        result.passed
                          ? 'bg-green-500/10 border-green-500/30'
                          : 'bg-red-500/10 border-red-500/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-yellow-200">Test Case {index + 1}</span>
                        <div className="flex items-center gap-2">
                          {result.passed ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <div className="w-4 h-4 rounded-full bg-red-500" />
                          )}
                          <span className={result.passed ? 'text-green-400' : 'text-red-400'}>
                            {result.passed ? 'PASSED' : result.error || 'FAILED'}
                          </span>
                          <span className="text-yellow-300 text-sm">
                            ({result.executionTime}ms)
                          </span>
                        </div>
                      </div>
                      
                      {!result.passed && (
                        <div className="mt-2 space-y-2 text-sm">
                          <div>
                            <span className="text-yellow-400 font-semibold">Input:</span>
                            <pre className="text-yellow-200 bg-gray-800 p-2 rounded mt-1 overflow-x-auto">{result.input || '(no input)'}</pre>
                          </div>
                          <div>
                            <span className="text-green-400 font-semibold">Expected:</span>
                            <pre className="text-green-200 bg-gray-800 p-2 rounded mt-1 overflow-x-auto">{result.expectedOutput}</pre>
                          </div>
                          <div>
                            <span className="text-red-400 font-semibold">Got:</span>
                            <pre className="text-red-200 bg-gray-800 p-2 rounded mt-1 overflow-x-auto">{result.actualOutput || '(no output)'}</pre>
                          </div>
                          {result.error && (
                            <div className="mt-2 p-2 bg-red-900/20 rounded border border-red-500/30">
                              <span className="text-red-400 font-semibold text-xs">Error Type: </span>
                              <span className="text-red-300 text-xs">{result.error}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 text-center space-y-2">
                  <div className="flex justify-center items-center gap-4">
                    <span className="text-green-400">
                      ✅ Passed: {testResults.filter(r => r.passed).length}
                    </span>
                    <span className="text-red-400">
                      ❌ Failed: {testResults.filter(r => !r.passed).length}
                    </span>
                    <span className="text-yellow-300">
                      Total: {testResults.length}
                    </span>
                  </div>
                  
                  {testResults.length > 0 && (
                    <div className="text-sm text-yellow-200">
                      Success Rate: {Math.round((testResults.filter(r => r.passed).length / testResults.length) * 100)}%
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Navigation */}
            <div className="flex justify-between">
              {/* Previous Button (duplicate for consistency) */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-3 transition-all duration-200 ${
                  currentQuestionIndex > 0
                    ? 'bg-gray-600 hover:bg-gray-500 text-white'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
                Previous
              </motion.button>
              
              {/* Next Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-semibold px-8 py-3 rounded-xl flex items-center gap-3 hover:from-yellow-400 hover:to-yellow-500 transition-all duration-200"
              >
                {currentQuestionIndex === questions.length - 1 ? 'Complete Assessment' : 'Next Problem'}
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
