import { useState } from 'react';
import { StartScreen } from './components/StartScreen';
import { QuestionSection } from './components/QuestionSection';
import { CommunicationTest } from './components/CommunicationTest';
import { CodingAssessment } from './components/CodingAssessment';
import { ResultsScreen } from './components/ResultsScreen';
import { geminiService } from './services/geminiService';
import { ScoringService } from './services/scoringService';
import { Question, TestResult, CommunicationTest as CommunicationTestType, CodingQuestion } from './types';

type TestPhase = 'start' | 'quantitative' | 'verbal' | 'reasoning' | 'communication' | 'coding' | 'results';

function App() {
  const [currentPhase, setCurrentPhase] = useState<TestPhase>('start');
  const [quantitativeQuestions, setQuantitativeQuestions] = useState<Question[]>([]);
  const [verbalQuestions, setVerbalQuestions] = useState<Question[]>([]);
  const [reasoningQuestions, setReasoningQuestions] = useState<Question[]>([]);
  const [communicationPrompts, setCommunicationPrompts] = useState<any>({});
  const [codingQuestions, setCodingQuestions] = useState<CodingQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Results
  const [quantitativeResult, setQuantitativeResult] = useState<TestResult | null>(null);
  const [verbalResult, setVerbalResult] = useState<TestResult | null>(null);
  const [reasoningResult, setReasoningResult] = useState<TestResult | null>(null);
  const [communicationResult, setCommunicationResult] = useState<CommunicationTestType | null>(null);
  const [codingResults, setCodingResults] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  const handleStartTest = async () => {
    setLoading(true);
    try {
      // Generate all questions at the start
      const [quantQuestions, verbalQuestions, reasoningQuestions, commPrompts, codingQuestions] = await Promise.all([
        geminiService.generateQuantitativeQuestions(15),
        geminiService.generateVerbalQuestions(15),
        geminiService.generateReasoningQuestions(15),
        geminiService.generateCommunicationPrompts(),
        geminiService.generateCodingQuestions()
      ]);

      // Add IDs to questions
      const quantWithIds = quantQuestions.map((q: any, i: number) => ({ ...q, id: `quant_${i}`, type: 'mcq' as const }));
      const verbalWithIds = verbalQuestions.map((q: any, i: number) => ({ ...q, id: `verbal_${i}`, type: 'mcq' as const }));
      const reasoningWithIds = reasoningQuestions.map((q: any, i: number) => ({ ...q, id: `reasoning_${i}`, type: 'mcq' as const }));

      setQuantitativeQuestions(quantWithIds);
      setVerbalQuestions(verbalWithIds);
      setReasoningQuestions(reasoningWithIds);
      setCommunicationPrompts(commPrompts);
      setCodingQuestions(codingQuestions);
      
      setCurrentPhase('quantitative');
      setCurrentQuestionIndex(0);
    } catch (error) {
      console.error('Error generating questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantitativeComplete = (answers: any[]) => {
    const score = ScoringService.scoreAptitudeSection(answers, quantitativeQuestions);
    const totalTime = answers.reduce((sum, answer) => sum + answer.timeSpent, 0);
    
    setQuantitativeResult({
      sectionId: 'quantitative',
      score,
      totalQuestions: 15,
      timeSpent: totalTime,
      answers
    });
    
    setCurrentPhase('verbal');
    setCurrentQuestionIndex(0);
  };

  const handleVerbalComplete = (answers: any[]) => {
    const score = ScoringService.scoreAptitudeSection(answers, verbalQuestions);
    const totalTime = answers.reduce((sum, answer) => sum + answer.timeSpent, 0);
    
    setVerbalResult({
      sectionId: 'verbal',
      score,
      totalQuestions: 15,
      timeSpent: totalTime,
      answers
    });
    
    setCurrentPhase('reasoning');
    setCurrentQuestionIndex(0);
  };

  const handleReasoningComplete = (answers: any[]) => {
    const score = ScoringService.scoreAptitudeSection(answers, reasoningQuestions);
    const totalTime = answers.reduce((sum, answer) => sum + answer.timeSpent, 0);
    
    setReasoningResult({
      sectionId: 'reasoning',
      score,
      totalQuestions: 15,
      timeSpent: totalTime,
      answers
    });
    
    setCurrentPhase('communication');
  };

  const handleCommunicationComplete = (result: CommunicationTestType) => {
    setCommunicationResult(result);
    setCurrentPhase('coding');
  };

  const handleCodingComplete = (results: any[]) => {
    setCodingResults(results);
    setCurrentPhase('results');
  };

  const handleRestart = () => {
    setCurrentPhase('start');
    setCurrentQuestionIndex(0);
    setQuantitativeResult(null);
    setVerbalResult(null);
    setReasoningResult(null);
    setCommunicationResult(null);
    setCodingResults([]);
    setQuantitativeQuestions([]);
    setVerbalQuestions([]);
    setReasoningQuestions([]);
    setCommunicationPrompts({});
    setCodingQuestions([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-yellow-400 text-xl">Generating personalized questions...</p>
          <p className="text-yellow-300 text-sm mt-2">This may take a few moments</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {currentPhase === 'start' && (
        <StartScreen onStart={handleStartTest} />
      )}
      
      {currentPhase === 'quantitative' && quantitativeQuestions.length > 0 && (
        <QuestionSection
          sectionName="Quantitative Aptitude"
          questions={quantitativeQuestions}
          duration={15}
          onComplete={handleQuantitativeComplete}
          currentQuestionIndex={currentQuestionIndex}
        />
      )}
      
      {currentPhase === 'verbal' && verbalQuestions.length > 0 && (
        <QuestionSection
          sectionName="Verbal Ability"
          questions={verbalQuestions}
          duration={15}
          onComplete={handleVerbalComplete}
          currentQuestionIndex={currentQuestionIndex}
        />
      )}
      
      {currentPhase === 'reasoning' && reasoningQuestions.length > 0 && (
        <QuestionSection
          sectionName="Logical Reasoning"
          questions={reasoningQuestions}
          duration={15}
          onComplete={handleReasoningComplete}
          currentQuestionIndex={currentQuestionIndex}
        />
      )}
      
      {currentPhase === 'communication' && (
        <CommunicationTest
          prompts={communicationPrompts}
          onComplete={handleCommunicationComplete}
        />
      )}
      
      {currentPhase === 'coding' && codingQuestions.length > 0 && (
        <CodingAssessment
          questions={codingQuestions}
          onComplete={handleCodingComplete}
        />
      )}
      
      {currentPhase === 'results' && quantitativeResult && verbalResult && reasoningResult && communicationResult && (
        <ResultsScreen
          quantitativeResult={quantitativeResult}
          verbalResult={verbalResult}
          reasoningResult={reasoningResult}
          communicationResult={communicationResult}
          codingResults={codingResults}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}

export default App;