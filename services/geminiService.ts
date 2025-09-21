import { QuizQuestion } from '../types';

export const generateQuizFromText = async (text: string): Promise<QuizQuestion[]> => {
  try {
    const response = await fetch('/api/generateQuiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'An unknown server error occurred.' }));
      throw new Error(`Failed to generate quiz: ${errorData.error || response.statusText}`);
    }

    const quizData = await response.json();
    
    // Basic validation of the response from our own API
    if (!Array.isArray(quizData)) {
      throw new Error("API returned data in an unexpected format.");
    }
    
    return quizData as QuizQuestion[];

  } catch (error) {
    console.error("Error calling quiz generation API:", error);
    if (error instanceof Error) {
        throw new Error(error.message);
    }
    throw new Error("An unknown error occurred while generating the quiz.");
  }
};
