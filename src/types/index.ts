export interface Question {
  id: string;
  question: string;
  options?: string[];
  correctAnswer?: string | number;
  type: 'mcq' | 'text' | 'code';
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface TestSection {
  id: string;
  name: string;
  duration: number; // in minutes
  questions: Question[];
  completed: boolean;
}

export interface UserAnswer {
  questionId: string;
  answer: string | number;
  isCorrect?: boolean;
  timeSpent: number;
}

export interface TestResult {
  sectionId: string;
  score: number;
  totalQuestions: number;
  timeSpent: number;
  answers: UserAnswer[];
}

export interface CommunicationTest {
  selfIntroduction: {
    transcript: string;
    score: number;
  };
  speaking: {
    sentences: string[];
    recordings: string[];
    score: number;
  };
  listening: {
    audioFiles: string[];
    userResponses: string[];
    score: number;
  };
  writing: {
    topic: string;
    essay: string;
    score: number;
  };
}

export interface FunctionSpecArg {
  name: string;
  type: string; // e.g., "number", "number[]", "string"
}

export interface FunctionSpec {
  name: string; // function name to implement
  args: FunctionSpecArg[]; // ordered argument list
  returnType: string; // e.g., "number", "number[]", "string"
}

export interface CodingQuestion {
  id: string;
  title: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  examples: Array<{
    input: string;
    output: string;
    explanation: string;
  }>;
  testCases: Array<{
    input: string;
    expectedOutput: string;
  }>;
  difficulty: 'easy' | 'medium' | 'hard';
  functionSpec?: FunctionSpec; // optional function spec to auto-generate templates
}