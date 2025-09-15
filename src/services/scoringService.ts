import { UserAnswer, CommunicationTest } from '../types';

export class ScoringService {
  // Score quantitative/verbal/reasoning questions
  static scoreAptitudeSection(answers: UserAnswer[], questions: any[]): number {
    let score = 0;
    
    answers.forEach((answer, index) => {
      const question = questions[index];
      if (question && answer.answer === question.correctAnswer) {
        score++;
      }
    });
    
    return score;
  }

  // Score communication test components
  static scoreCommunication(
    selfIntroTranscript: string,
    speakingTranscripts: string[],
    listeningTranscripts: string[],
    essay: string,
    expectedListeningTexts: string[],
    expectedSpeakingTexts: string[]
  ): CommunicationTest {
    return {
      selfIntroduction: {
        transcript: selfIntroTranscript,
        score: this.scoreSelfIntroduction(selfIntroTranscript)
      },
      speaking: {
        sentences: expectedSpeakingTexts,
        recordings: speakingTranscripts,
        score: this.scoreSpeaking(speakingTranscripts, expectedSpeakingTexts)
      },
      listening: {
        audioFiles: expectedListeningTexts,
        userResponses: listeningTranscripts,
        score: this.scoreListening(listeningTranscripts, expectedListeningTexts)
      },
      writing: {
        topic: '',
        essay: essay,
        score: this.scoreWriting(essay)
      }
    };
  }

  private static scoreSelfIntroduction(transcript: string): number {
    if (!transcript || transcript.trim().length === 0) return 0;
    
    const wordCount = transcript.trim().split(/\s+/).length;
    const hasPersonalInfo = /\b(name|background|experience|skills|education|qualification|degree)\b/i.test(transcript);
    const hasCareerGoals = /\b(goal|aspiration|future|career|want|hope|aim|objective)\b/i.test(transcript);
    const hasGreeting = /\b(hello|hi|good|morning|afternoon|evening|myself|introduction)\b/i.test(transcript);
    
    let score = 0;
    
    // Word count scoring (0-3 points)
    if (wordCount >= 80) score += 3;
    else if (wordCount >= 50) score += 2;
    else if (wordCount >= 30) score += 1;
    
    // Content quality (0-7 points)
    if (hasGreeting) score += 2;
    if (hasPersonalInfo) score += 3;
    if (hasCareerGoals) score += 2;
    
    return Math.min(score, 10);
  }

  private static scoreSpeaking(transcripts: string[], expectedTexts: string[]): number {
    let totalScore = 0;
    
    transcripts.forEach((transcript, index) => {
      if (transcript && expectedTexts[index]) {
        const similarity = this.calculateTextSimilarity(
          transcript.toLowerCase().trim(),
          expectedTexts[index].toLowerCase().trim()
        );
        
        if (similarity > 0.8) totalScore += 1;
        else if (similarity > 0.6) totalScore += 0.8;
        else if (similarity > 0.4) totalScore += 0.5;
        else if (transcript.length > 10) totalScore += 0.2; // At least attempted
      }
    });
    
    return Math.min(Math.round(totalScore * 10) / 10, 5);
  }

  private static scoreListening(transcripts: string[], expectedTexts: string[]): number {
    let score = 0;
    
    transcripts.forEach((transcript, index) => {
      if (transcript && expectedTexts[index]) {
        const similarity = this.calculateTextSimilarity(
          transcript.toLowerCase().trim(),
          expectedTexts[index].toLowerCase().trim()
        );
        
        if (similarity > 0.8) score += 1;
        else if (similarity > 0.6) score += 0.8;
        else if (similarity > 0.4) score += 0.5;
        else if (transcript.length > 5) score += 0.2;
      }
    });
    
    return Math.min(Math.round(score * 10) / 10, 5);
  }

  private static scoreWriting(essay: string): number {
    if (!essay || essay.trim().length === 0) return 0;
    
    const wordCount = essay.trim().split(/\s+/).length;
    const sentences = essay.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const hasGoodStructure = sentences >= 5;
    const isWithinRange = wordCount >= 150 && wordCount <= 250;
    
    let score = 0;
    
    // Word count (0-4 points)
    if (isWithinRange) score += 4;
    else if (wordCount >= 100) score += 2;
    else if (wordCount >= 50) score += 1;
    
    // Structure and content (0-6 points)
    if (hasGoodStructure) score += 3;
    if (wordCount >= 150) score += 3;
    
    return Math.min(score, 10);
  }

  private static calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = text1.split(/\s+/).filter(w => w.length > 2);
    const words2 = text2.split(/\s+/).filter(w => w.length > 2);
    
    if (words1.length === 0 || words2.length === 0) return 0;
    
    let commonWords = 0;
    words1.forEach(word1 => {
      words2.forEach(word2 => {
        if (word1 === word2) commonWords += 1;
        else if (word1.includes(word2) || word2.includes(word1)) commonWords += 0.5;
        else if (this.levenshteinDistance(word1, word2) <= 2) commonWords += 0.3;
      });
    });
    
    return commonWords / Math.max(words1.length, words2.length);
  }
  
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  // Score coding questions
  static scoreCoding(solutions: any[]): any[] {
    return solutions.map((solution, index) => {
      const testResults = solution.testResults || [];
      const passedTests = testResults.filter((result: any) => result.passed).length;
      const totalTests = testResults.length;
      
      let score = 0;
      if (totalTests > 0) {
        const passRate = passedTests / totalTests;
        if (passRate === 1) score = 50; // Perfect score
        else if (passRate >= 0.8) score = 40;
        else if (passRate >= 0.6) score = 30;
        else if (passRate >= 0.4) score = 20;
        else if (passRate >= 0.2) score = 10;
      }
      
      return {
        ...solution,
        score,
        passedTests,
        totalTests
      };
    });
  }
}