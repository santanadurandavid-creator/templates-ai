export type Template = {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  usageCount: number;
  isQuick: boolean;
  createdAt: string;
  color?: string;
  order?: number;
};

export type Link = {
  id: string;
  title: string;
  url: string;
  category: 'forms' | 'sheets';
};

export type TreeNode = {
  type: 'question' | 'process' | 'end';
  title: string;
  hint?: string;
  // Para preguntas
  yes?: string;
  no?: string;
  options?: { label: string; icon: string; next: string }[];
  // Para procesos
  steps?: string[];
  next?: string;
  // Para finales
  variant?: 'ok' | 'warn';
  icon?: string;
  message?: string;
};

export type TreeData = Record<string, TreeNode>;

export type KnowledgeProcess = {
  id: string;
  title: string;
  tag: string;
  description: string; // Puede ser texto plano o JSON del árbol
};

export type FollowUpProcess = {
  id: string;
  title: string;
  description: string;
};

export type FollowUp = {
  id: string;
  caseUrl: string;
  processId: string;
  processTitle: string;
  processDescription: string;
  description?: string;
  status: 'pending' | 'done';
  createdAt: string;
}

export type AITemplate = {
  id: string;
  context: string;
  title: string;
  content: string;
  summary: string;
  suggestedTags: string[];
  recommendedTag?: string;
  matchedProcessTitle?: string;
  createdAt: string;
}

export type RephrasedTemplate = {
  id: string;
  originalTemplateId: string;
  originalContent: string;
  rephrasedContent: string;
  createdAt: string;
};

export type TagSuggestion = {
  id: string;
  situation: string;
  tag: string;
  severity: 'VERDE' | 'AMARILLO' | 'ROJO';
  justification: string;
  createdAt: string;
};

export type AppData = {
  templates?: Template[];
  quickTemplates?: Template[];
  links?: Link[];
  knowledgeBase?: KnowledgeProcess[];
  followUpProcesses?: FollowUpProcess[];
  aiHistory?: AITemplate[];
  rephraseHistory?: RephrasedTemplate[];
  tagSuggestions?: TagSuggestion[];
  followUps?: FollowUp[];
  tagRules?: string;
};

export type AppEvent = 'open-quick-template-dialog';
