import { UserAnswer, CommunicationTest, Question } from '../types';

export class ScoringService {
  // Score quantitative/verbal/reasoning questions
  static scoreAptitudeSection(answers: UserAnswer[], questions: Question[]): number {
    let score = 0;

    // Match answers to questions by questionId instead of relying on index order.
    answers.forEach((answer) => {
      const question = questions.find((q) => q.id === answer.questionId);
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
      const hyp = (transcript || '').trim();
      const ref = (expectedTexts[index] || '').trim();
      if (hyp && ref) {
        const acc = this.wordAccuracy(ref, hyp); // 0..1
        if (acc >= 0.9) totalScore += 1; // near perfect
        else if (acc >= 0.8) totalScore += 0.8;
        else if (acc >= 0.65) totalScore += 0.5;
        else if (hyp.length > 10) totalScore += 0.2; // attempt
      }
    });
    
    return Math.min(Math.round(totalScore), 5);
  }

  private static scoreListening(transcripts: string[], expectedTexts: string[]): number {
    let score = 0;
    
    transcripts.forEach((transcript, index) => {
      const hyp = (transcript || '').trim();
      const ref = (expectedTexts[index] || '').trim();
      if (hyp && ref) {
        const acc = this.wordAccuracy(ref, hyp);
        if (acc >= 0.9) score += 1;
        else if (acc >= 0.8) score += 0.8;
        else if (acc >= 0.65) score += 0.5;
        else if (hyp.length > 5) score += 0.2;
      }
    });
    
    return Math.min(Math.round(score), 5);
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

  // Removed old similarity helpers; replaced by WER-based accuracy

  // Compute Word Error Rate based on Levenshtein distance over tokens
  private static wordErrorRate(reference: string, hypothesis: string): number {
    const refTokens = this.normalizeForWER(reference).split(' ').filter(Boolean);
    const hypTokens = this.normalizeForWER(hypothesis).split(' ').filter(Boolean);
    if (refTokens.length === 0) return hypTokens.length === 0 ? 0 : 1;

    // DP edit distance at token level
    const dp: number[][] = Array(refTokens.length + 1).fill(0).map(() => Array(hypTokens.length + 1).fill(0));
    for (let i = 0; i <= refTokens.length; i++) dp[i][0] = i;
    for (let j = 0; j <= hypTokens.length; j++) dp[0][j] = j;
    for (let i = 1; i <= refTokens.length; i++) {
      for (let j = 1; j <= hypTokens.length; j++) {
        const cost = refTokens[i - 1] === hypTokens[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,        // deletion
          dp[i][j - 1] + 1,        // insertion
          dp[i - 1][j - 1] + cost  // substitution
        );
      }
    }
    const wer = dp[refTokens.length][hypTokens.length] / refTokens.length;
    return Math.min(1, Math.max(0, wer));
  }

  // Convert WER to accuracy (1 - WER)
  private static wordAccuracy(reference: string, hypothesis: string): number {
    return 1 - this.wordErrorRate(reference, hypothesis);
  }

  // Basic normalization: lowercase, remove punctuation, collapse spaces
  private static normalizeForWER(text: string): string {
    return text
      .toLowerCase()
      .replace(/[.,!?;:\-–—\(\)\[\]"'`]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Score coding questions
  static scoreCoding(solutions: any[]): any[] {
    return solutions.map((solution) => {
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