export type QuestionType = 'single_mcq' | 'multiple_mcq' | 'text' | 'match';

export interface BaseQuestion {
  id: string; // Changed to string for easier generation (UUID)
  question: string;
  type: QuestionType;
}

export interface SingleMCQ extends BaseQuestion {
  type: 'single_mcq';
  options: string[];
  answer: number;
}

export interface MultipleMCQ extends BaseQuestion {
  type: 'multiple_mcq';
  options: string[];
  answer: number[];
}

export interface TextQuestion extends BaseQuestion {
  type: 'text';
  answer: string;
}

export interface MatchQuestion extends BaseQuestion {
  type: 'match';
  leftItems: string[];
  rightItems: string[];
  answer: Record<string, string>;
}

export type Question = SingleMCQ | MultipleMCQ | TextQuestion | MatchQuestion;

export interface QuizConfig {
  title: string;
  description: string;
  questions: Question[];
}

export const DEFAULT_QUIZ_CONFIG: QuizConfig = {
  title: "Welcome to the Knowledge Quiz",
  description: "Test your skills and climb the leaderboard! Please read the rules carefully before proceeding.",
  questions: [
    { id: '1', type: 'single_mcq', question: 'Which feature in JavaScript allows you to extract properties from objects and set them to variables?', options: ['Spread operator', 'Destructuring assignment', 'Rest parameters', 'Template literals'], answer: 1 },
    { id: '2', type: 'multiple_mcq', question: 'Which of the following are valid React Hooks? (Select all that apply)', options: ['useState', 'useComponent', 'useEffect', 'useFetch'], answer: [0, 2] },
    { id: '3', type: 'text', question: 'What does CSS stand for?', answer: 'cascading style sheets' },
    {
      id: '4', type: 'match', question: 'Match the framework/library to its language:',
      leftItems: ['React', 'Laravel', 'Django', 'Spring'],
      rightItems: ['Java', 'Python', 'PHP', 'JavaScript'],
      answer: { 'React': 'JavaScript', 'Laravel': 'PHP', 'Django': 'Python', 'Spring': 'Java' }
    }
  ]
};

export const getQuizConfig = (): QuizConfig => {
  const stored = localStorage.getItem('quizConfig');
  if (stored) {
    try {
      return JSON.parse(stored) as QuizConfig;
    } catch (e) {
      console.error('Failed to parse quiz config', e);
    }
  }
  return DEFAULT_QUIZ_CONFIG;
};

export const saveQuizConfig = (config: QuizConfig) => {
  localStorage.setItem('quizConfig', JSON.stringify(config));
};
