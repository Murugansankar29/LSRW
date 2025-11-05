import React from 'react';
import Editor from '@monaco-editor/react';
import { editor } from 'monaco-editor';

interface MonacoEditorProps {
  code: string;
  language: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export const MonacoEditor: React.FC<MonacoEditorProps> = ({
  code,
  language,
  onChange,
  readOnly = false
}) => {
  // Map our language IDs to Monaco's language IDs
  const getMonacoLanguage = (lang: string): string => {
    const languageMap: { [key: string]: string } = {
      'c': 'c',
      'cpp': 'cpp',
      'javascript': 'javascript',
      'python': 'python',
      'java': 'java'
    };
    return languageMap[lang.toLowerCase()] || 'plaintext';
  };

  // Editor options
  const editorOptions: editor.IStandaloneEditorConstructionOptions = {
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbers: 'on',
    roundedSelection: false,
    scrollBeyondLastLine: false,
    readOnly: readOnly,
    theme: 'vs-dark',
    wordWrap: 'on',
    tabSize: 4,
    insertSpaces: true,
    automaticLayout: true
  };

  return (
    <Editor
      height="400px"
      defaultLanguage="plaintext"
      language={getMonacoLanguage(language)}
      value={code}
      options={editorOptions}
      onChange={(value) => onChange(value || '')}
      className="rounded-lg overflow-hidden border border-yellow-500/30"
    />
  );
};