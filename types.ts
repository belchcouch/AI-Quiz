export interface QuizOption {
  text: string;
  explanation: string;
}

export interface QuizQuestion {
  question: string;
  options: QuizOption[];
  correctAnswerIndex: number;
}

export enum QuizState {
  IDLE = 'idle',
  GENERATING = 'generating',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}