export interface Problem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  category?: string;
  language: string;
  xp: number;
  description: string;
  constraints: string[];
  inputFormat: string;
  outputFormat: string;
  examples: Array<{ input: string; output: string; explanation?: string }>;
  starterCode: string;
  solutionCode?: string;
  hint?: string;
  testCases: Array<{ input: string; expectedOutput: string; isHidden: boolean }>;
}

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  language?: string;
  content?: string;
  children?: FileNode[];
  isOpen?: boolean;
}
