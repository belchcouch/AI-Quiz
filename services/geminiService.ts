import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const quizSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      question: {
        type: Type.STRING,
        description: 'The question text.'
      },
      options: {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                text: {
                    type: Type.STRING,
                    description: 'The answer option text.'
                },
                explanation: {
                    type: Type.STRING,
                    description: 'A brief and condensed explanation of why this specific option is correct or incorrect.'
                }
            },
            required: ["text", "explanation"],
        },
        description: 'An array of 4 possible answer option objects.'
      },
      correctAnswerIndex: {
        type: Type.INTEGER,
        description: 'The 0-based index of the correct answer in the options array.'
      }
    },
    required: ["question", "options", "correctAnswerIndex"],
  }
};


export const generateQuizFromText = async (text: string): Promise<QuizQuestion[]> => {
  const prompt = `You are an expert instructional designer creating exam questions for a master's level curriculum. Your task is to generate a 20-question multiple-choice quiz based on the provided text from lecture slides. The questions must be difficult and designed to test a deep, integrated understanding of the material, going beyond simple recall to require critical thinking.

  Follow these strict requirements for each question:
  1.  **Advanced Question Formulation:** Questions should force the user to synthesize concepts from the text. Questions that test on subtle distinctions between closely related concepts are preferred.
  2.  **Highly Plausible Distractors:** All incorrect answer choices (distractors) must be highly plausible and represent common errors, subtle misconceptions, or concepts that are true but not the *best* answer to the specific question. The distractors should be tempting and require careful consideration. There should be exactly 3 distractors for each question, for a total of 4 options.
  3.  **Focus on Principles:** Focus on the underlying principles, mechanisms, and classifications presented in the text.
  4.  **Avoid Structural Clues:** Ensure all answer choices (correct and incorrect) are of similar length, detail, and grammatical structure. Avoid making the correct answer obvious through formatting or length.
  5.  **Comprehensive Coverage:** The questions must be drawn from the entire breadth of the provided document. Do not focus only on the main headings or summaries. Actively seek out and test on a wide variety of concepts, including both major themes and specific, nuanced details found throughout the text.
  6. **Explanations:** For each of the 4 options, provide a brief, condensed explanation for why that specific option is either correct or incorrect.
  
  Here is the lecture content:
  ---
  ${text}
  ---
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: quizSchema,
      },
    });

    const jsonString = response.text.trim();
    const quizData = JSON.parse(jsonString);

    // Validate the structure
    if (
        !Array.isArray(quizData) || 
        quizData.some((q: any) => 
            !q.question || 
            !q.options ||
            q.options.length !== 4 ||
            q.correctAnswerIndex === undefined ||
            q.options.some((opt: any) => !opt.text || !opt.explanation)
        )
    ) {
        throw new Error("API returned data in an unexpected format.");
    }
    
    return quizData as QuizQuestion[];

  } catch (error) {
    console.error("Error generating quiz from Gemini API:", error);
    throw new Error("Failed to generate quiz. Please check the API key and input text.");
  }
};