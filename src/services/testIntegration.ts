import { geminiService } from './geminiService';
import { pistonService } from './pistonService';

/**
 * Test the integration between Gemini problem generation and Piston code execution
 */
export class IntegrationTester {
  
  /**
   * Test generating coding problems from Gemini
   */
  static async testProblemGeneration() {
    console.log('🧪 Testing Gemini problem generation...');
    
    try {
      const questions = await geminiService.generateCodingQuestions();
      console.log('✅ Successfully generated questions:', questions.length);
      console.log('📝 Sample question:', questions[0]?.title);
      return questions;
    } catch (error) {
      console.error('❌ Problem generation failed:', error);
      throw error;
    }
  }

  /**
   * Test code execution with Piston API
   */
  static async testCodeExecution() {
    console.log('🧪 Testing Piston code execution...');
    
    // Simple test case
    const testCode = `
n = int(input())
arr = list(map(int, input().split()))
target = int(input())

for i in range(len(arr)):
    for j in range(i + 1, len(arr)):
        if arr[i] + arr[j] == target:
            print(i, j)
            break
    else:
        continue
    break
`;

    const testCases = [
      { input: "4\n2 7 11 15\n9", expectedOutput: "0 1" },
      { input: "3\n3 2 4\n6", expectedOutput: "1 2" }
    ];

    try {
      const results = await pistonService.runTestCases('python', testCode, testCases);
      console.log('✅ Code execution completed');
      console.log('📊 Results:', results.map(r => ({ passed: r.passed, time: r.executionTime })));
      return results;
    } catch (error) {
      console.error('❌ Code execution failed:', error);
      throw error;
    }
  }

  /**
   * Test the complete workflow
   */
  static async testCompleteWorkflow() {
    console.log('🚀 Testing complete coding assessment workflow...');
    
    try {
      // Step 1: Generate problems
      const questions = await this.testProblemGeneration();
      
      // Step 2: Test code execution with first question
      if (questions.length > 0) {
        const firstQuestion = questions[0];
        console.log(`🎯 Testing with question: ${firstQuestion.title}`);
        
        // Simple solution for Two Sum problem (common first question)
        const sampleSolution = `
# Read input
n = int(input())
arr = list(map(int, input().split()))
target = int(input())

# Two Sum solution
for i in range(len(arr)):
    for j in range(i + 1, len(arr)):
        if arr[i] + arr[j] == target:
            print(i, j)
            break
    else:
        continue
    break
`;

        const results = await pistonService.runTestCases(
          'python', 
          sampleSolution, 
          firstQuestion.testCases
        );
        
        console.log('✅ Complete workflow test successful!');
        console.log(`📈 Test results: ${results.filter(r => r.passed).length}/${results.length} passed`);
        
        return {
          questions,
          executionResults: results,
          success: true
        };
      }
      
    } catch (error) {
      console.error('❌ Complete workflow test failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test different programming languages
   */
  static async testMultipleLanguages() {
    console.log('🌐 Testing multiple programming languages...');
    
    const languages = pistonService.getAvailableLanguages();
    console.log('📋 Available languages:', languages.map(l => `${l.name} (${l.version})`));
    
    // Simple "Hello World" test for each language
    const testCodes = {
      python: 'print("Hello World")',
      javascript: 'console.log("Hello World");',
      java: `
public class Solution {
    public static void main(String[] args) {
        System.out.println("Hello World");
    }
}`,
      cpp: `
#include <iostream>
using namespace std;

int main() {
    cout << "Hello World" << endl;
    return 0;
}`,
      c: `
#include <stdio.h>

int main() {
    printf("Hello World\\n");
    return 0;
}`
    };

    const results: any[] = [];
    
    for (const lang of languages) {
      if (testCodes[lang.id as keyof typeof testCodes]) {
        try {
          console.log(`🧪 Testing ${lang.name}...`);
          const result = await pistonService.executeCode(
            lang.id, 
            testCodes[lang.id as keyof typeof testCodes], 
            ""
          );
          
          const success = result.run.output.trim() === "Hello World";
          results.push({
            language: lang.name,
            success,
            output: result.run.output.trim(),
            error: result.run.stderr
          });
          
          console.log(`${success ? '✅' : '❌'} ${lang.name}: ${success ? 'PASSED' : 'FAILED'}`);
        } catch (error) {
          results.push({
            language: lang.name,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          console.log(`❌ ${lang.name}: ERROR - ${error}`);
        }
      }
    }
    
    return results;
  }
}

// Export for use in development/testing
export const testIntegration = IntegrationTester;
