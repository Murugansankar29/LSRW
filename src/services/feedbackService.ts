import { TestResult, CommunicationTest, UserAnswer, Question } from '../types';

export interface RoundFeedback {
  roundName: string;
  overallPerformance: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

export interface TopicAnalysis {
  topic: string;
  score: number;
  totalQuestions: number;
  accuracy: number;
  averageTime: number;
  isStrong: boolean;
}

export class FeedbackService {
  
  /**
   * Generate feedback for Aptitude Round (Quantitative, Verbal, Logical Reasoning)
   */
  static generateAptitudeFeedback(
    quantitativeResult: TestResult,
    verbalResult: TestResult,
    reasoningResult: TestResult,
    questions: { quantitative: Question[], verbal: Question[], reasoning: Question[] }
  ): RoundFeedback {
    const totalScore = quantitativeResult.score + verbalResult.score + reasoningResult.score;
    const totalQuestions = quantitativeResult.totalQuestions + verbalResult.totalQuestions + reasoningResult.totalQuestions;
    const overallAccuracy = (totalScore / totalQuestions) * 100;
    
    // Analyze performance by topic
    const quantAnalysis = this.analyzeTopicPerformance(quantitativeResult, questions.quantitative, 'Quantitative Aptitude');
    const verbalAnalysis = this.analyzeTopicPerformance(verbalResult, questions.verbal, 'Verbal Ability');
    const reasoningAnalysis = this.analyzeTopicPerformance(reasoningResult, questions.reasoning, 'Logical Reasoning');
    
    const allAnalyses = [quantAnalysis, verbalAnalysis, reasoningAnalysis];
    
    // Determine overall performance
    let overallPerformance = '';
    if (overallAccuracy >= 80) {
      overallPerformance = `Excellent performance in the Aptitude Round! You scored ${totalScore}/${totalQuestions} (${overallAccuracy.toFixed(1)}%). Your strong analytical and problem-solving skills are evident across multiple areas.`;
    } else if (overallAccuracy >= 65) {
      overallPerformance = `Good performance in the Aptitude Round. You scored ${totalScore}/${totalQuestions} (${overallAccuracy.toFixed(1)}%). You demonstrate solid foundational skills with room for targeted improvement.`;
    } else if (overallAccuracy >= 50) {
      overallPerformance = `Average performance in the Aptitude Round. You scored ${totalScore}/${totalQuestions} (${overallAccuracy.toFixed(1)}%). There are clear areas where focused practice can significantly improve your results.`;
    } else {
      overallPerformance = `The Aptitude Round shows significant room for improvement. You scored ${totalScore}/${totalQuestions} (${overallAccuracy.toFixed(1)}%). With dedicated practice on fundamental concepts, you can achieve much better results.`;
    }
    
    // Identify strengths
    const strengths: string[] = [];
    allAnalyses.forEach(analysis => {
      if (analysis.accuracy >= 70) {
        strengths.push(`Strong performance in ${analysis.topic} (${analysis.accuracy.toFixed(1)}% accuracy)`);
      }
    });
    
    // Add time management strengths
    const fastSections = allAnalyses.filter(a => a.averageTime < 90); // Less than 1.5 minutes per question
    if (fastSections.length > 0) {
      strengths.push(`Good time management in ${fastSections.map(s => s.topic).join(', ')}`);
    }
    
    if (strengths.length === 0) {
      strengths.push('Completed all sections within the time limit');
    }
    
    // Identify weaknesses
    const weaknesses: string[] = [];
    allAnalyses.forEach(analysis => {
      if (analysis.accuracy < 50) {
        weaknesses.push(`${analysis.topic} needs significant improvement (${analysis.accuracy.toFixed(1)}% accuracy)`);
      } else if (analysis.accuracy < 65) {
        weaknesses.push(`${analysis.topic} requires focused practice (${analysis.accuracy.toFixed(1)}% accuracy)`);
      }
    });
    
    // Add time management weaknesses
    const slowSections = allAnalyses.filter(a => a.averageTime > 150); // More than 2.5 minutes per question
    if (slowSections.length > 0) {
      weaknesses.push(`Time management in ${slowSections.map(s => s.topic).join(', ')} - taking too long per question`);
    }
    
    // Generate targeted suggestions
    const suggestions: string[] = [];
    
    // Topic-specific suggestions
    if (quantAnalysis.accuracy < 65) {
      suggestions.push('Practice quantitative problems daily - focus on arithmetic, algebra, and data interpretation');
      suggestions.push('Use online platforms like Khan Academy or Brilliant for structured math practice');
    }
    
    if (verbalAnalysis.accuracy < 65) {
      suggestions.push('Improve vocabulary through daily reading of newspapers and magazines');
      suggestions.push('Practice grammar rules and sentence correction exercises regularly');
    }
    
    if (reasoningAnalysis.accuracy < 65) {
      suggestions.push('Solve logical reasoning puzzles and pattern recognition problems daily');
      suggestions.push('Practice analytical reasoning through brain training apps and books');
    }
    
    // Time management suggestions
    if (slowSections.length > 0) {
      suggestions.push('Practice timed mock tests to improve speed and accuracy balance');
      suggestions.push('Learn quick calculation techniques and shortcut methods');
    }
    
    // General suggestions
    if (overallAccuracy < 70) {
      suggestions.push('Take regular mock tests to identify and work on weak areas');
      suggestions.push('Create a study schedule focusing 60% time on weakest topics');
    }
    
    // Ensure non-empty arrays with grounded fallbacks
    if (weaknesses.length === 0) {
      const weakest = allAnalyses.sort((a, b) => a.accuracy - b.accuracy)[0];
      weaknesses.push(`Focus on ${weakest.topic} to improve accuracy (currently ${weakest.accuracy.toFixed(1)}%)`);
    }
    if (suggestions.length === 0) {
      suggestions.push('Allocate daily 30-minute focused practice on weakest topics');
      suggestions.push('Attempt timed sectional mocks to improve accuracy under time pressure');
    }

    return {
      roundName: 'Aptitude Round',
      overallPerformance,
      strengths,
      weaknesses,
      suggestions
    };
  }
  
  /**
   * Generate feedback for Communication Round
   */
  static generateCommunicationFeedback(communicationResult: CommunicationTest): RoundFeedback {
    const totalScore = communicationResult.selfIntroduction.score + 
                     communicationResult.speaking.score + 
                     communicationResult.listening.score + 
                     communicationResult.writing.score;
    const maxScore = 30; // 10 + 5 + 5 + 10
    const overallPercentage = (totalScore / maxScore) * 100;
    
    // Analyze each component
    const introAnalysis = this.analyzeSelfIntroduction(communicationResult.selfIntroduction);
    const speakingAnalysis = this.analyzeSpeaking(communicationResult.speaking);
    const listeningAnalysis = this.analyzeListening(communicationResult.listening);
    const writingAnalysis = this.analyzeWriting(communicationResult.writing);
    
    // Overall performance
    let overallPerformance = '';
    if (overallPercentage >= 85) {
      overallPerformance = `Outstanding communication skills! You scored ${totalScore}/${maxScore} (${overallPercentage.toFixed(1)}%). Your clarity, fluency, and expression demonstrate excellent communication abilities.`;
    } else if (overallPercentage >= 70) {
      overallPerformance = `Good communication skills with room for refinement. You scored ${totalScore}/${maxScore} (${overallPercentage.toFixed(1)}%). Your basic communication is solid with some areas for enhancement.`;
    } else if (overallPercentage >= 55) {
      overallPerformance = `Average communication performance. You scored ${totalScore}/${maxScore} (${overallPercentage.toFixed(1)}%). With focused practice, you can significantly improve your communication effectiveness.`;
    } else {
      overallPerformance = `Communication skills need substantial development. You scored ${totalScore}/${maxScore} (${overallPercentage.toFixed(1)}%). Regular practice and structured learning will help build stronger communication abilities.`;
    }
    
    // Identify strengths
    const strengths: string[] = [];
    if (introAnalysis.isStrong) strengths.push('Clear and well-structured self-introduction');
    if (speakingAnalysis.isStrong) strengths.push('Good pronunciation and speaking clarity');
    if (listeningAnalysis.isStrong) strengths.push('Strong listening comprehension and repetition accuracy');
    if (writingAnalysis.isStrong) strengths.push('Well-organized writing with good vocabulary');
    
    // Add specific positive observations
    if (communicationResult.selfIntroduction.transcript.length > 200) {
      strengths.push('Comprehensive self-introduction with good detail');
    }
    if (communicationResult.writing.essay.split(' ').length >= 150) {
      strengths.push('Met word count requirements in writing task');
    }
    
    if (strengths.length === 0) {
      strengths.push('Completed all communication tasks within the time limit');
    }
    
    // Identify weaknesses
    const weaknesses: string[] = [];
    if (!introAnalysis.isStrong) {
      if (communicationResult.selfIntroduction.transcript.length < 100) {
        weaknesses.push('Self-introduction was too brief - needs more detail about background and goals');
      } else {
        weaknesses.push('Self-introduction lacked structure or key personal/professional information');
      }
    }
    
    if (!speakingAnalysis.isStrong) {
      weaknesses.push('Speaking clarity and pronunciation need improvement');
    }
    
    if (!listeningAnalysis.isStrong) {
      weaknesses.push('Listening comprehension and accurate repetition need practice');
    }
    
    if (!writingAnalysis.isStrong) {
      if (communicationResult.writing.essay.split(' ').length < 100) {
        weaknesses.push('Writing task was incomplete - did not meet minimum word requirements');
      } else {
        weaknesses.push('Writing organization and grammar need improvement');
      }
    }
    
    // Generate suggestions
    const suggestions: string[] = [];
    
    if (!introAnalysis.isStrong) {
      suggestions.push('Practice structured self-introductions: name → background → skills → career goals');
      suggestions.push('Record yourself speaking and analyze clarity, pace, and content organization');
    }
    
    if (!speakingAnalysis.isStrong) {
      suggestions.push('Practice reading aloud daily to improve pronunciation and fluency');
      suggestions.push('Use speech recognition apps to get feedback on pronunciation accuracy');
    }
    
    if (!listeningAnalysis.isStrong) {
      suggestions.push('Practice active listening with audio materials and repeat-after-me exercises');
      suggestions.push('Watch English content with subtitles and gradually remove them');
    }
    
    if (!writingAnalysis.isStrong) {
      suggestions.push('Practice structured writing: introduction → body → conclusion format');
      suggestions.push('Focus on grammar fundamentals and expand vocabulary through reading');
    }
    
    // General communication suggestions
    if (overallPercentage < 70) {
      suggestions.push('Join speaking clubs or practice groups to build confidence');
      suggestions.push('Set aside 30 minutes daily for communication practice across all skills');
    }
    
    // Ensure non-empty arrays with grounded fallbacks
    if (weaknesses.length === 0) {
      const weakestArea = [
        { name: 'Self Introduction', score: communicationResult.selfIntroduction.score },
        { name: 'Speaking', score: communicationResult.speaking.score },
        { name: 'Listening', score: communicationResult.listening.score },
        { name: 'Writing', score: communicationResult.writing.score },
      ].sort((a, b) => a.score - b.score)[0];
      weaknesses.push(`${weakestArea.name} can be improved with targeted practice`);
    }
    if (suggestions.length === 0) {
      suggestions.push('Practice 10–15 minutes daily across speaking, listening, and writing');
      suggestions.push('Review your responses to identify clarity and structure improvements');
    }

    return {
      roundName: 'Communication Round',
      overallPerformance,
      strengths,
      weaknesses,
      suggestions
    };
  }
  
  /**
   * Generate feedback for Coding Round
   */
  static generateCodingFeedback(codingResults: any[]): RoundFeedback {
    const totalScore = codingResults.reduce((sum, result) => sum + (result.score || 0), 0);
    const maxScore = codingResults.length * 50; // Assuming 50 points per problem
    const overallPercentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    
    // Analyze each problem
    const problemAnalyses = codingResults.map((result, index) => ({
      problemNumber: index + 1,
      score: result.score || 0,
      passedTests: result.passedTests || 0,
      totalTests: result.totalTests || 0,
      language: result.language || 'Unknown',
      passRate: result.totalTests > 0 ? (result.passedTests / result.totalTests) * 100 : 0
    }));
    
    // Overall performance
    let overallPerformance = '';
    if (overallPercentage >= 80) {
      overallPerformance = `Excellent coding performance! You scored ${totalScore}/${maxScore} (${overallPercentage.toFixed(1)}%). Your problem-solving approach and implementation skills are strong.`;
    } else if (overallPercentage >= 60) {
      overallPerformance = `Good coding skills with solid problem-solving ability. You scored ${totalScore}/${maxScore} (${overallPercentage.toFixed(1)}%). Your logical thinking is sound with room for optimization.`;
    } else if (overallPercentage >= 40) {
      overallPerformance = `Average coding performance showing basic programming understanding. You scored ${totalScore}/${maxScore} (${overallPercentage.toFixed(1)}%). Focus on strengthening core concepts and practice.`;
    } else {
      overallPerformance = `Coding skills need significant development. You scored ${totalScore}/${maxScore} (${overallPercentage.toFixed(1)}%). Building strong programming fundamentals should be the priority.`;
    }
    
    // Identify strengths
    const strengths: string[] = [];
    const strongProblems = problemAnalyses.filter(p => p.passRate >= 80);
    if (strongProblems.length > 0) {
      strengths.push(`Successfully solved ${strongProblems.length} problem(s) with high accuracy`);
    }
    
    const partialSolutions = problemAnalyses.filter(p => p.passRate >= 40 && p.passRate < 80);
    if (partialSolutions.length > 0) {
      strengths.push(`Demonstrated good logical approach in ${partialSolutions.length} problem(s) with partial solutions`);
    }
    
    // Check for consistent language usage
    const languages = [...new Set(problemAnalyses.map(p => p.language))];
    if (languages.length === 1 && languages[0] !== 'Unknown') {
      strengths.push(`Consistent use of ${languages[0]} showing language proficiency`);
    }
    
    if (strengths.length === 0) {
      strengths.push('Attempted all coding problems within the time limit');
    }
    
    // Identify weaknesses
    const weaknesses: string[] = [];
    const failedProblems = problemAnalyses.filter(p => p.passRate < 40);
    if (failedProblems.length > 0) {
      weaknesses.push(`Struggled with ${failedProblems.length} problem(s) - low test case pass rate`);
    }
    
    const zeroScoreProblems = problemAnalyses.filter(p => p.score === 0);
    if (zeroScoreProblems.length > 0) {
      weaknesses.push(`Unable to solve ${zeroScoreProblems.length} problem(s) completely`);
    }
    
    // Analyze common issues
    const lowPassRates = problemAnalyses.filter(p => p.passRate > 0 && p.passRate < 60);
    if (lowPassRates.length > 0) {
      weaknesses.push('Logic implementation issues - solutions partially correct but missing edge cases');
    }
    
    // Generate suggestions
    const suggestions: string[] = [];
    
    if (failedProblems.length > 0) {
      suggestions.push('Practice fundamental data structures and algorithms (arrays, strings, loops)');
      suggestions.push('Start with easier problems and gradually increase difficulty level');
    }
    
    if (lowPassRates.length > 0) {
      suggestions.push('Focus on edge case handling and input validation in your solutions');
      suggestions.push('Practice debugging techniques to identify and fix logical errors');
    }
    
    if (overallPercentage < 60) {
      suggestions.push('Solve at least 2-3 coding problems daily on platforms like LeetCode or HackerRank');
      suggestions.push('Study time and space complexity optimization techniques');
    }
    
    // Language-specific suggestions
    if (languages.includes('Unknown') || languages.length > 2) {
      suggestions.push('Focus on mastering one programming language thoroughly before exploring others');
    }
    
    // General suggestions
    if (totalScore < maxScore * 0.5) {
      suggestions.push('Review basic programming concepts: loops, conditionals, functions, and data types');
      suggestions.push('Practice reading and understanding problem statements carefully');
    }
    
    // Ensure non-empty arrays with grounded fallbacks
    if (weaknesses.length === 0) {
      weaknesses.push('Work on problem decomposition and test-driven verification');
    }
    if (suggestions.length === 0) {
      suggestions.push('Practice implementing solutions with incremental tests to cover edge cases');
      suggestions.push('Revise core DS&A topics and analyze time/space complexity');
    }

    return {
      roundName: 'Coding Round',
      overallPerformance,
      strengths,
      weaknesses,
      suggestions
    };
  }
  
  // Helper methods for detailed analysis
  private static analyzeTopicPerformance(result: TestResult, questions: Question[], topicName: string): TopicAnalysis {
    const accuracy = (result.score / result.totalQuestions) * 100;
    const averageTime = result.timeSpent / result.totalQuestions / 1000; // Convert to seconds
    
    return {
      topic: topicName,
      score: result.score,
      totalQuestions: result.totalQuestions,
      accuracy,
      averageTime,
      isStrong: accuracy >= 70
    };
  }
  
  private static analyzeSelfIntroduction(selfIntro: { transcript: string; score: number }) {
    const wordCount = selfIntro.transcript.split(' ').filter(w => w.length > 0).length;
    const hasStructure = /\b(name|background|experience|skills|education|goal)\b/i.test(selfIntro.transcript);
    
    return {
      isStrong: selfIntro.score >= 7 && wordCount >= 50 && hasStructure,
      wordCount,
      hasStructure
    };
  }
  
  private static analyzeSpeaking(speaking: { sentences: string[]; recordings: string[]; score: number }) {
    const completionRate = speaking.recordings.filter(r => r && r.length > 10).length / speaking.sentences.length;
    
    return {
      isStrong: speaking.score >= 4 && completionRate >= 0.8,
      completionRate
    };
  }
  
  private static analyzeListening(listening: { audioFiles: string[]; userResponses: string[]; score: number }) {
    const responseRate = listening.userResponses.filter(r => r && r.length > 5).length / listening.audioFiles.length;
    
    return {
      isStrong: listening.score >= 4 && responseRate >= 0.8,
      responseRate
    };
  }
  
  private static analyzeWriting(writing: { topic: string; essay: string; score: number }) {
    const wordCount = writing.essay.split(' ').filter(w => w.length > 0).length;
    const hasStructure = writing.essay.includes('.') && wordCount >= 100;
    
    return {
      isStrong: writing.score >= 7 && wordCount >= 150 && hasStructure,
      wordCount,
      hasStructure
    };
  }
}
