import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Clock, CheckCircle, Brain, BookOpen, MessageSquare, Code, Award, FileText, Download } from 'lucide-react';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, HeaderFooterType, PageOrientation } from 'docx';
import { TestResult, CommunicationTest, Question } from '../types';
import { FeedbackService } from '../services/feedbackService';
import { FeedbackScreen } from './FeedbackScreen';

interface ResultsScreenProps {
  quantitativeResult: TestResult;
  verbalResult: TestResult;
  reasoningResult: TestResult;
  communicationResult: CommunicationTest;
  codingResults: any[];
  questions?: {
    quantitative: Question[];
    verbal: Question[];
    reasoning: Question[];
  };
  onRestart: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  quantitativeResult,
  verbalResult,
  reasoningResult,
  communicationResult,
  codingResults,
  questions,
}) => {
  const [showFeedback, setShowFeedback] = useState(false);

  const totalScore = 
    quantitativeResult.score + 
    verbalResult.score + 
    reasoningResult.score + 
    communicationResult.selfIntroduction.score +
    communicationResult.speaking.score +
    communicationResult.listening.score +
    communicationResult.writing.score +
    codingResults.reduce((sum, result) => sum + (result.score || 0), 0);

  const maxScore = 60 + 30 + 100; // 60 MCQs + 30 Communication + 100 Coding
  const percentage = Math.round((totalScore / maxScore) * 100);

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: 'A+', color: 'text-green-400' };
    if (percentage >= 80) return { grade: 'A', color: 'text-green-400' };
    if (percentage >= 70) return { grade: 'B+', color: 'text-yellow-400' };
    if (percentage >= 60) return { grade: 'B', color: 'text-yellow-400' };
    if (percentage >= 50) return { grade: 'C', color: 'text-orange-400' };
    return { grade: 'D', color: 'text-red-400' };
  };

  const gradeInfo = getGrade(percentage);

  // Generate feedback using FeedbackService
  const aptitudeFeedback = questions ? FeedbackService.generateAptitudeFeedback(
    quantitativeResult,
    verbalResult,
    reasoningResult,
    questions
  ) : {
    roundName: 'Aptitude Round',
    overallPerformance: 'Feedback not available - question data missing.',
    strengths: ['Completed all sections'],
    weaknesses: ['Unable to generate detailed analysis'],
    suggestions: ['Review your performance and practice regularly']
  };

  const communicationFeedback = FeedbackService.generateCommunicationFeedback(communicationResult);
  const codingFeedback = FeedbackService.generateCodingFeedback(codingResults);

  if (showFeedback) {
    return (
      <FeedbackScreen
        aptitudeFeedback={aptitudeFeedback}
        communicationFeedback={communicationFeedback}
        codingFeedback={codingFeedback}
        onClose={() => setShowFeedback(false)}
      />
    );
  }

  const sections = [
    {
      name: 'Quantitative Aptitude',
      icon: Brain,
      score: quantitativeResult.score,
      total: 15,
      timeSpent: Math.floor(quantitativeResult.timeSpent / 60000),
      color: 'text-blue-400'
    },
    {
      name: 'Verbal Ability',
      icon: BookOpen,
      score: verbalResult.score,
      total: 15,
      timeSpent: Math.floor(verbalResult.timeSpent / 60000),
      color: 'text-green-400'
    },
    {
      name: 'Logical Reasoning',
      icon: Brain,
      score: reasoningResult.score,
      total: 15,
      timeSpent: Math.floor(reasoningResult.timeSpent / 60000),
      color: 'text-purple-400'
    }
  ];

  const communicationScores = [
    { name: 'Self Introduction', score: communicationResult.selfIntroduction.score, total: 10 },
    { name: 'Speaking Test', score: communicationResult.speaking.score, total: 5 },
    { name: 'Listening Test', score: communicationResult.listening.score, total: 5 },
    { name: 'Writing Test', score: communicationResult.writing.score, total: 10 }
  ];

  const resultsRef = useRef<HTMLDivElement>(null);

  const handleDownloadDocx = async () => {
    try {
      // Sanitize text for DOCX (remove emojis)
      const sanitize = (text: string) =>
        text
          .replace(/[✅]/g, '')
          .replace(/[⚠️]/g, '');

      // Helper to create a paragraph
      const createParagraph = (text: string, bold = false, size = 24, color = '000000', alignment: any = AlignmentType.LEFT) => {
        return new Paragraph({
          children: [
            new TextRun({
              text: sanitize(text || ''),
              bold,
              size,
              color,
            }),
          ],
          alignment,
        });
      };

      // Helper to create a list item paragraph
      const createListItem = (text: string, color: string = '000000') => {
        return new Paragraph({
          children: [
            new TextRun({
              text: sanitize(text),
              size: 24,
              color: '000000',
            }),
          ],
          bullet: {
            level: 0,
          },
        });
      };

      // Helper to create a table
      const createTable = (headers: string[], rows: Array<Array<string | number>>) => {
        const table = new Table({
          width: {
            size: 100,
            type: WidthType.PERCENTAGE,
          },
          rows: [
            new TableRow({
              children: headers.map(header => 
                new TableCell({
                  children: [createParagraph(header, true, 22, '000000')],
                  borders: {
                    top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
                    bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
                    left: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
                    right: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
                  },
                })
              ),
            }),
            ...rows.map(row =>
              new TableRow({
                children: row.map(cell =>
                  new TableCell({
                    children: [createParagraph(String(cell), false, 22, '000000')],
                    borders: {
                      top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
                      bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
                      left: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
                      right: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
                    },
                  })
                ),
              })
            ),
          ],
        });
        return table;
      };

      // Overall Scoring Summary Table
      const overallMax = 60 + 30 + 100;
      const overallPercent = Math.round((totalScore / overallMax) * 100);
      const overallTableRows = [['Category', 'Score', 'Max', '%'], ['Overall', totalScore, overallMax, `${overallPercent}%`]];
      const overallTable = createTable(overallTableRows[0], overallTableRows.slice(1));

      // Section-wise Scores Table
      const sectionRows: Array<Array<string | number>> = [
        ['Quantitative', sections[0].score, sections[0].total, `${Math.round((sections[0].score/sections[0].total)*1000)/10}%`],
        ['Verbal', sections[1].score, sections[1].total, `${Math.round((sections[1].score/sections[1].total)*1000)/10}%`],
        ['Logical Reasoning', sections[2].score, sections[2].total, `${Math.round((sections[2].score/sections[2].total)*1000)/10}%`],
        ...communicationScores.map(s => [s.name, s.score, s.total, `${Math.round((s.score/s.total)*1000)/10}%`]),
        ['Coding', codingResults.reduce((s, r) => s + (r.score || 0), 0), 100, `${Math.round((codingResults.reduce((s, r) => s + (r.score || 0), 0)/100)*100)}%`],
      ];
      const sectionTable = createTable(['Section', 'Score', 'Max', '%'], sectionRows);

      const roundFeedbacks = [
        aptitudeFeedback,
        communicationFeedback,
        codingFeedback,
      ];

      const children: any[] = [];

      // Cover Section
      children.push(createParagraph('Assessment Feedback Report', true, 44, '000000'));
      children.push(createParagraph(`Date: ${new Date().toLocaleDateString()}`, false, 24, '000000'));
      const candidateName = 'Candidate Name'; // TODO: replace with actual candidate name if available
      children.push(createParagraph(`Candidate Name: ${candidateName}`, false, 24, '000000'));

      // Divider (simulated with empty paragraph)
      children.push(new Paragraph({})); // spacing
      children.push(overallTable);

      // Section-wise Scores
      children.push(createParagraph('Section-wise Scores', true, 28, '000000'));
      children.push(new Paragraph({})); // spacing
      children.push(sectionTable);

      // Personalized Feedback by Round
      children.push(createParagraph('Personalized Feedback by Round', true, 28, '000000'));
      children.push(new Paragraph({})); // spacing

      roundFeedbacks.forEach((rf) => {
        const safeStrengths = (rf.strengths && rf.strengths.length > 0) ? rf.strengths : ['Completed the round; continue refining skills.'];
        const safeWeaknesses = (rf.weaknesses && rf.weaknesses.length > 0) ? rf.weaknesses : ['Identify one area to focus on next week.'];
        const safeSuggestions = (rf.suggestions && rf.suggestions.length > 0) ? rf.suggestions : [
          'Allocate 30 minutes daily to practice targeted weaknesses.',
          'Review mistakes and retry similar questions to reinforce learning.'
        ];
        const tips = (rf.suggestions && rf.suggestions.length > 0 ? rf.suggestions : safeSuggestions).slice(0, 5);
        // Round header
        children.push(createParagraph(rf.roundName, true, 26, '000000'));
        children.push(new Paragraph({})); // spacing

        // Overall performance paragraph
        children.push(createParagraph(rf.overallPerformance, false, 24, '000000'));

        // Strengths
        children.push(createParagraph('Strengths', true, 24, '000000'));
        safeStrengths.forEach((strength: string) => {
          children.push(createListItem(strength, '000000'));
        });

        // Weaknesses / Areas for Improvement
        children.push(createParagraph('Areas for Improvement', true, 24, '000000'));
        safeWeaknesses.forEach((weakness: string) => {
          children.push(createListItem(weakness, '000000'));
        });

        // Actionable Suggestions
        children.push(createParagraph('Actionable Suggestions', true, 24, '000000'));
        safeSuggestions.forEach((suggestion: string) => {
          children.push(createListItem(suggestion, '000000'));
        });

        // Tips to enhance knowledge (derived alias of suggestions for DOCX clarity)
        children.push(createParagraph('Tips to Enhance Knowledge', true, 24, '000000'));
        tips.forEach((tip: string) => {
          children.push(createListItem(tip, '000000'));
        });

        // Divider (spacing)
        children.push(new Paragraph({})); // spacing
      });

      const doc = new Document({
        sections: [{
          properties: {
            page: {
              margin: {
                top: 720,
                bottom: 720,
                left: 720,
                right: 720,
              },
            },
          },
          children,
        }],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const filename = `Assessment_Feedback_${new Date().toISOString().split('T')[0]}.docx`;
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating feedback DOCX:', error);
      alert('Failed to generate feedback DOCX. Check console for details.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4">
      <div className="max-w-6xl mx-auto">
        {/* Download Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={handleDownloadDocx}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg transition-colors"
          >
            <Download className="w-5 h-5" />
            Download Feedback (DOCX)
          </button>
        </div>
        
        {/* Results Container with ref */}
        <div ref={resultsRef}>
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full mb-6"
          >
            <Trophy className="w-12 h-12 text-black" />
          </motion.div>
          
          <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent mb-4">
            Assessment Complete!
          </h1>
          
          <div className="flex items-center justify-center gap-8 mb-6">
            <div className="text-center">
              <div className={`text-6xl font-bold ${gradeInfo.color} mb-2`}>
                {gradeInfo.grade}
              </div>
              <div className="text-yellow-300">Final Grade</div>
            </div>
            
            <div className="text-center">
              <div className="text-6xl font-bold text-yellow-400 mb-2">
                {percentage}%
              </div>
              <div className="text-yellow-300">Overall Score</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">
                {totalScore}/{maxScore}
              </div>
              <div className="text-yellow-300">Total Points</div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Aptitude Tests Results */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-800/50 backdrop-blur-sm border border-yellow-500/30 rounded-2xl p-8"
          >
            <h2 className="text-2xl font-semibold text-yellow-400 mb-6 flex items-center gap-3">
              <Brain className="w-6 h-6" />
              Aptitude Tests
            </h2>
            
            <div className="space-y-6">
              {sections.map((section, index) => (
                <motion.div
                  key={section.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="bg-gray-700/50 rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <section.icon className={`w-5 h-5 ${section.color}`} />
                      <span className="text-yellow-200 font-semibold">{section.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-yellow-400">
                        {section.score}/{section.total}
                      </div>
                      <div className="text-sm text-yellow-300">
                        {Math.round((section.score / section.total) * 100)}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-yellow-300">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>Time: {section.timeSpent} min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Accuracy: {Math.round((section.score / section.total) * 100)}%</span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-600 rounded-full h-2 mt-3">
                    <motion.div 
                      className={`h-2 rounded-full bg-gradient-to-r ${
                        section.color === 'text-blue-400' ? 'from-blue-500 to-blue-400' :
                        section.color === 'text-green-400' ? 'from-green-500 to-green-400' :
                        'from-purple-500 to-purple-400'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(section.score / section.total) * 100}%` }}
                      transition={{ delay: 0.8 + index * 0.1, duration: 1 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Communication Test Results */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-8"
          >
            {/* Communication Results */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-yellow-500/30 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold text-yellow-400 mb-6 flex items-center gap-3">
                <MessageSquare className="w-6 h-6" />
                Communication Assessment
              </h2>
              
              <div className="space-y-4">
                {communicationScores.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex items-center justify-between py-3 border-b border-gray-600 last:border-b-0"
                  >
                    <span className="text-yellow-200">{item.name}</span>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-yellow-400">
                        {item.score}/{item.total}
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                <div className="pt-4 border-t border-yellow-500/30">
                  <div className="flex items-center justify-between">
                    <span className="text-yellow-300 font-semibold">Total Communication Score</span>
                    <div className="text-xl font-bold text-yellow-400">
                      {communicationScores.reduce((sum, item) => sum + item.score, 0)}/30
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Coding Results */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-yellow-500/30 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold text-yellow-400 mb-6 flex items-center gap-3">
                <Code className="w-6 h-6" />
                Coding Assessment
              </h2>
              
              <div className="space-y-4">
                {codingResults.map((result, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="bg-gray-700/50 rounded-xl p-6"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-yellow-200 font-semibold">Problem {index + 1}</span>
                      <div className="text-lg font-bold text-yellow-400">
                        {result.score || 0}/50
                      </div>
                    </div>
                    
                    <div className="text-sm text-yellow-300 space-y-1">
                      <div>Language: {result.language?.charAt(0).toUpperCase() + result.language?.slice(1)}</div>
                      <div>Test Cases: {result.passedTests || 0}/{result.totalTests || 0} passed</div>
                    </div>
                  </motion.div>
                ))}
                
                <div className="pt-4 border-t border-yellow-500/30">
                  <div className="flex items-center justify-between">
                    <span className="text-yellow-300 font-semibold">Total Coding Score</span>
                    <div className="text-xl font-bold text-yellow-400">
                      {codingResults.reduce((sum, result) => sum + (result.score || 0), 0)}/100
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Performance Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-yellow-500/30 rounded-2xl p-8 mb-8"
        >
          <h2 className="text-2xl font-semibold text-yellow-400 mb-6 flex items-center gap-3">
            <Award className="w-6 h-6" />
            Performance Summary
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="bg-gray-700/50 rounded-xl p-6">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {sections.reduce((sum, section) => sum + section.score, 0)}
              </div>
              <div className="text-yellow-300">Aptitude Score</div>
              <div className="text-sm text-gray-400">out of 60</div>
            </div>
            
            <div className="bg-gray-700/50 rounded-xl p-6">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {communicationScores.reduce((sum, item) => sum + item.score, 0)}
              </div>
              <div className="text-yellow-300">Communication Score</div>
              <div className="text-sm text-gray-400">out of 30</div>
            </div>
            
            <div className="bg-gray-700/50 rounded-xl p-6">
              <div className="text-3xl font-bold text-purple-400 mb-2">
               {codingResults.reduce((sum, result) => sum + (result.score || 0), 0)}
              </div>
              <div className="text-yellow-300">Coding Score</div>
              <div className="text-sm text-gray-400">out of 100</div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center space-y-6"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">        
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFeedback(true)}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold text-lg px-12 py-4 rounded-2xl transition-all duration-300 border border-yellow-400/30 flex items-center gap-3"
            >
              <FileText className="w-5 h-5" />
              View Detailed Feedback
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                // Future enhancement: Navigate to next step (e.g., interview scheduling, certificate generation, etc.)
                console.log('Next button clicked - Future enhancement placeholder');
                alert('This feature will be available soon! Future enhancements may include:\n• Interview scheduling\n• Certificate generation\n• Learning path recommendations\n• Progress tracking');
              }}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold text-lg px-12 py-4 rounded-2xl transition-all duration-300 border border-blue-400/30"
            >
              Next Steps
            </motion.button>
          </div>
          
          <p className="text-yellow-300 text-sm">
            Thank you for completing Assessment 1 • Click "View Detailed Feedback" for personalized improvement suggestions
          </p>
        </motion.div>
      </div>
    </div>
  </div>
  );
};
