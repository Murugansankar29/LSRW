import { CodingQuestion } from '../types';

// Type helpers
const mapJavaType = (t: string): string => {
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

const getDefaultReturn = (type: string): string => {
  switch (type) {
    case 'int': return '0';
    case 'boolean': return 'false';
    case 'string': return '""';
    case 'void': return '';
    default: return 'null';
  }
};

export const generateTemplate = (language: string, question?: CodingQuestion): string => {
  const spec = question?.functionSpec;
  const argList = (spec?.args || []).map(a => a.name).join(', ');
  
  // Helper to map types to C++ types
  const mapCppType = (t: string): string => {
    switch (t) {
      case 'number': 
      case 'int': return 'int';
      case 'number[]': return 'vector<int>';
      case 'string': return 'string';
      case 'string[]': return 'vector<string>';
      case 'boolean': return 'bool';
      case 'boolean[]': return 'vector<bool>';
      case 'void': return 'void';
      default: return 'auto';
    }
  };

  switch (language) {
    case 'cpp': {
      // For C++, create modern template with vectors and iostream
      if (spec) {
        const returnType = mapCppType(spec.returnType);
        const args = (spec.args || []).map(a => `${mapCppType(a.type)} ${a.name}`).join(', ');
        const initValues = (spec.args || []).map(a => {
          const type = mapCppType(a.type);
          if (type.startsWith('vector')) {
            return `${a.name} = {}`;
          }
          return `${a.name} = 0`;
        }).join(', ');
        
        return `#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\n${returnType} ${spec.name}(${args}) {\n    // write your code here\n    return ${returnType === 'void' ? '' : returnType === 'string' ? '""' : '0'};\n}\n\nint main() {\n    // Initialize test values\n    ${args}; // Initialize: ${initValues}\n    \n    // TODO: Parse input as per the problem's Input Format\n    ${returnType === 'void' ? 
          `${spec.name}(${argList});` : 
          `${returnType} result = ${spec.name}(${argList});\n    cout << result << endl;`}\n    \n    return 0;\n}`;
      }
      return `#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\n// Define your function here\n\nint main() {\n    // TODO: Parse input as per the problem's Input Format\n    // Initialize your variables\n    // Call your function and print the result\n    return 0;\n}`;
    }
    
    case 'c': {
      // For C, create strict template based on function spec
      if (spec) {
        return `#include <stdio.h>\n#include <stdlib.h>\n\n${spec.returnType} ${spec.name}(${(spec.args || []).map(a => `${a.type} ${a.name}`).join(', ')}) {\n    // write your code here\n    return 0;\n}\n\nint main(void) {\n    ${(spec.args || []).map(a => `${a.type} ${a.name} = 0`).join(', ')};\n    // TODO: Parse input as per the problem's Input Format\n    ${spec.returnType} result = ${spec.name}(${argList});\n    printf("%d", result);\n    return 0;\n}`;
      }
      return `#include <stdio.h>\n#include <stdlib.h>\n\n// Define your function here\n\nint main(void) {\n    // TODO: Parse input as per the problem's Input Format\n    // Call your function and print the result\n    return 0;\n}`;
    }
    
    case 'javascript': {
      // For JavaScript, use ES6 syntax
      if (spec) {
        return `function ${spec.name}(${(spec.args || []).map(a => a.name).join(', ')}) {\n    // write your code here\n    return ${spec.returnType === 'void' ? 'undefined' : '0'};\n}\n\nfunction main() {\n    // TODO: Parse input as per the problem's Input Format\n    const ${(spec.args || []).map(a => `${a.name} = 0`).join(', ')};\n    const result = ${spec.name}(${argList});\n    console.log(result);\n}\n\nmain();`;
      }
      return `// Define your function here\n\nfunction main() {\n    // TODO: Parse input as per the problem's Input Format\n    // Call your function and print the result\n}\n\nmain();`;
    }
    
    case 'python':
      return `# Write your solution here\n\n${spec ? `def ${spec.name}(${(spec.args || []).map(a => a.name).join(', ')}):\n    # TODO: implement using ${(spec?.args || []).map(a => a.name).join(', ')}\n    pass\n\n` : ''}def solve():\n    # Parse input as per the problem's Input Format\n    # args: ${argList || '(define based on input)'}\n    # TODO: parse input and call ${spec ? spec.name : 'your_function'}(...)\n    # Example:\n    # result = ${spec ? `${spec.name}(${argList})` : '...'}\n    # print(result)\n    pass\n\n# Main execution\nif __name__ == "__main__":\n    solve()`;
    
    case 'java': {
      const fn = spec ? `static ${mapJavaType(spec.returnType)} ${spec.name}(${(spec.args || []).map(a => `${mapJavaType(a.type)} ${a.name}`).join(', ')}) {\n        // TODO: implement\n        ${mapJavaType(spec.returnType) === 'void' ? '' : `return ${getDefaultReturn(spec.returnType)};`}\n    }\n\n` : '';
      return `import java.util.*;\n\npublic class Solution {\n    ${fn}    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Parse input as per the problem's Input Format\n        // Then call ${spec ? spec.name : "yourFunction"} and print the result\n    }\n}`;
    }
    
    default:
      return '';
  }
};