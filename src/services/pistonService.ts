interface PistonExecutionResult {
  language: string;
  version: string;
  run: {
    stdout: string;
    stderr: string;
    code: number;
    signal: string | null;
    output: string;
  };
  compile?: {
    stdout: string;
    stderr: string;
    code: number;
    signal: string | null;
    output: string;
  };
}

interface TestCaseResult {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  executionTime: number;
  error?: string;
}

export class PistonService {
  private static readonly PISTON_URL = "https://emkc.org/api/v2/piston/execute";
  
  // Language version mappings for Piston API
  private static readonly LANGUAGE_VERSIONS = {
    python: "3.10.0",
    java: "15.0.2",
    cpp: "10.2.0",
    c: "10.2.0",
    javascript: "18.15.0"
  };

  private static readonly FILE_EXTENSIONS = {
    python: "py",
    java: "java", 
    cpp: "cpp",
    c: "c",
    javascript: "js"
  };

  /**
   * Execute code with a single test input using Piston API
   */
  static async executeCode(
    language: string, 
    code: string, 
    testInput: string
  ): Promise<PistonExecutionResult> {
    const version = this.LANGUAGE_VERSIONS[language as keyof typeof this.LANGUAGE_VERSIONS];
    const extension = this.FILE_EXTENSIONS[language as keyof typeof this.FILE_EXTENSIONS];
    
    if (!version || !extension) {
      throw new Error(`Unsupported language: ${language}`);
    }

    const fileName = language === 'java' ? 'Solution.java' : `main.${extension}`;
    
    const payload = {
      language: language,
      version: version,
      files: [
        {
          name: fileName,
          content: this.preprocessCode(code, language)
        }
      ],
      stdin: testInput,
      args: [],
      compile_timeout: 10000,
      run_timeout: 3000,
      compile_memory_limit: -1,
      run_memory_limit: -1
    };

    try {
      const response = await fetch(this.PISTON_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Piston API error: ${response.status} ${response.statusText}`);
      }

      const result: PistonExecutionResult = await response.json();
      return result;
    } catch (error) {
      console.error('Error executing code with Piston:', error);
      throw error;
    }
  }

  /**
   * Run code against multiple test cases
   */
  static async runTestCases(
    language: string,
    code: string,
    testCases: Array<{ input: string; expectedOutput: string }>
  ): Promise<TestCaseResult[]> {
    const results: TestCaseResult[] = [];

    // Pre-validation: Check if code is meaningful
    const validation = this.validateCodeSyntax(code, language);
    if (!validation.valid) {
      // Return failed results for all test cases if code is invalid
      return testCases.map(testCase => ({
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: `Code validation failed: ${validation.errors.join(', ')}`,
        passed: false,
        executionTime: 0,
        error: 'Invalid Code'
      }));
    }

    // Check if code is just template/empty
    if (this.isEmptyOrTemplateCode(code, language)) {
      return testCases.map(testCase => ({
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: 'No solution provided - code appears to be empty or just template',
        passed: false,
        executionTime: 0,
        error: 'Empty Solution'
      }));
    }

    for (const testCase of testCases) {
      const startTime = Date.now();
      
      try {
        const executionResult = await this.executeCode(language, code, testCase.input);
        const executionTime = Date.now() - startTime;
        
        // Extract actual output (stdout or combined output)
        const actualOutput = executionResult.run.stdout || executionResult.run.output || '';
        const cleanActualOutput = actualOutput.trim();
        const cleanExpectedOutput = testCase.expectedOutput.trim();
        
        // Check for compilation errors
        if (executionResult.compile && executionResult.compile.code !== 0) {
          results.push({
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            actualOutput: executionResult.compile.stderr || 'Compilation failed',
            passed: false,
            executionTime,
            error: 'Compilation Error'
          });
          continue;
        }

        // Check for runtime errors
        if (executionResult.run.code !== 0) {
          const errorOutput = executionResult.run.stderr || 'Runtime error';
          results.push({
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            actualOutput: errorOutput,
            passed: false,
            executionTime,
            error: 'Runtime Error'
          });
          continue;
        }

        // Check for empty output when expecting something
        if (cleanExpectedOutput && !cleanActualOutput) {
          results.push({
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            actualOutput: '(no output)',
            passed: false,
            executionTime,
            error: 'No Output'
          });
          continue;
        }

        // Strict output comparison
        const passed = this.compareOutputs(cleanActualOutput, cleanExpectedOutput);
        
        results.push({
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: cleanActualOutput,
          passed,
          executionTime,
          error: passed ? undefined : 'Wrong Answer'
        });

      } catch (error) {
        const executionTime = Date.now() - startTime;
        results.push({
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          passed: false,
          executionTime,
          error: 'Execution Error'
        });
      }
    }

    return results;
  }

  /**
   * Preprocess code based on language requirements
   */
  private static preprocessCode(code: string, language: string): string {
    switch (language) {
      case 'java':
        // Ensure the class name is 'Solution' for Java
        if (!code.includes('class Solution')) {
          return code.replace(/class\s+\w+/g, 'class Solution');
        }
        return code;
      
      case 'python':
        // Add input handling if not present
        if (!code.includes('input()') && !code.includes('sys.stdin')) {
          // This is a basic template - users should handle input themselves
          return code;
        }
        return code;
      
      case 'cpp':
      case 'c':
        // Ensure proper includes
        if (!code.includes('#include')) {
          const includes = language === 'cpp' 
            ? '#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\n'
            : '#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n\n';
          return includes + code;
        }
        return code;
      
      default:
        return code;
    }
  }

  /**
   * Get available languages and versions
   */
  static getAvailableLanguages() {
    return Object.keys(this.LANGUAGE_VERSIONS).map(lang => ({
      id: lang,
      name: lang.charAt(0).toUpperCase() + lang.slice(1),
      version: this.LANGUAGE_VERSIONS[lang as keyof typeof this.LANGUAGE_VERSIONS],
      extension: this.FILE_EXTENSIONS[lang as keyof typeof this.FILE_EXTENSIONS]
    }));
  }

  /**
   * Check if code is empty or just template code
   */
  private static isEmptyOrTemplateCode(code: string, language: string): boolean {
    const cleanCode = code.trim();
    
    // Check for common template patterns
    const templatePatterns = {
      python: [
        'pass',
        '# Write your solution here',
        '# Your code here',
        'def solve():\n    # Your code here\n    pass'
      ],
      java: [
        '// Your code here',
        'Scanner sc = new Scanner(System.in);\n        // Your code here'
      ],
      cpp: [
        '// Your code here',
        'return 0;'
      ],
      c: [
        '// Your code here',
        'return 0;'
      ]
    };

    const patterns = templatePatterns[language as keyof typeof templatePatterns] || [];
    
    // Check if code contains only template patterns
    for (const pattern of patterns) {
      if (cleanCode.includes(pattern) && cleanCode.replace(/\s+/g, ' ').length < 50) {
        return true;
      }
    }

    // Check for minimal code that doesn't actually solve anything
    const meaningfulCodeLength = cleanCode.replace(/\s+|\n+|\t+/g, '').length;
    if (meaningfulCodeLength < 10) {
      return true;
    }

    return false;
  }

  /**
   * Compare outputs with better handling of different formats
   */
  private static compareOutputs(actual: string, expected: string): boolean {
    // Exact match first
    if (actual === expected) {
      return true;
    }

    // Normalize whitespace and compare
    const normalizeOutput = (output: string) => {
      return output
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/\n\s*\n/g, '\n')
        .trim();
    };

    const normalizedActual = normalizeOutput(actual);
    const normalizedExpected = normalizeOutput(expected);

    if (normalizedActual === normalizedExpected) {
      return true;
    }

    // For numeric outputs, try parsing and comparing
    if (/^[\d\s\-\.\,]+$/.test(expected.trim())) {
      try {
        const actualNums = actual.trim().split(/\s+/).map(s => parseFloat(s));
        const expectedNums = expected.trim().split(/\s+/).map(s => parseFloat(s));
        
        if (actualNums.length === expectedNums.length) {
          return actualNums.every((num, i) => 
            Math.abs(num - expectedNums[i]) < 1e-9
          );
        }
      } catch {
        // Fall through to false
      }
    }

    return false;
  }

  /**
   * Validate code syntax (enhanced validation)
   */
  static validateCodeSyntax(code: string, language: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!code.trim()) {
      errors.push('Code cannot be empty');
      return { valid: false, errors };
    }

    // Check for template code
    if (this.isEmptyOrTemplateCode(code, language)) {
      errors.push('Please provide a complete solution, not just template code');
      return { valid: false, errors };
    }

    switch (language) {
      case 'python':
        // Basic Python syntax checks
        if (code.includes('\t') && code.includes('    ')) {
          errors.push('Mixed tabs and spaces detected');
        }
        // Check for basic Python structure
        if (!code.includes('input()') && !code.includes('sys.stdin') && !code.includes('def ')) {
          errors.push('Python code should handle input or define functions');
        }
        break;
      
      case 'java':
        if (!code.includes('public static void main')) {
          errors.push('Java code must contain a main method');
        }
        if (!code.includes('class')) {
          errors.push('Java code must contain a class definition');
        }
        break;
      
      case 'cpp':
      case 'c':
        if (!code.includes('main')) {
          errors.push(`${language.toUpperCase()} code must contain a main function`);
        }
        break;
    }

    return { valid: errors.length === 0, errors };
  }
}

export const pistonService = PistonService;
