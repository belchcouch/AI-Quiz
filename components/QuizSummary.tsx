import React from 'react';
import { QuizQuestion } from '../types';
import { CheckIcon, XIcon } from './icons';

interface QuizSummaryProps {
  quiz: QuizQuestion[];
  userAnswers: (number | null)[];
  onRestart: () => void;
}

const QuizSummary: React.FC<QuizSummaryProps> = ({ quiz, userAnswers, onRestart }) => {
  const correctAnswers = userAnswers.filter((answer, index) => answer === quiz[index].correctAnswerIndex).length;
  const totalQuestions = quiz.length;
  const score = ((correctAnswers / totalQuestions) * 100).toFixed(0);

  const incorrectQuestions = quiz.map((question, index) => ({
    ...question,
    userAnswerIndex: userAnswers[index],
    questionIndex: index,
  })).filter((_, index) => userAnswers[index] !== quiz[index].correctAnswerIndex);

  return (
    <div className="flex flex-col space-y-8">
      <div className="text-center p-6 bg-gray-900/50 rounded-lg border border-gray-700">
        <h2 className="text-3xl font-bold text-white">Quiz Completed!</h2>
        <p className="text-5xl font-bold my-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">{score}%</p>
        <p className="text-gray-300 text-lg">You answered {correctAnswers} out of {totalQuestions} questions correctly.</p>
      </div>
      
      {incorrectQuestions.length > 0 && (
        <div>
          <h3 className="text-2xl font-semibold mb-4 text-gray-200">Review Your Incorrect Answers</h3>
          <div className="space-y-6">
            {incorrectQuestions.map((q) => (
              <div key={q.questionIndex} className="p-5 bg-gray-900/30 rounded-lg border border-gray-700">
                <p className="font-semibold text-gray-400 mb-2">Question {q.questionIndex + 1}</p>
                <p className="text-lg text-gray-100 mb-4">{q.question}</p>
                <div className="space-y-3">
                  <div className="flex items-start p-3 rounded-md bg-red-900/50 border border-red-500/50">
                    <XIcon className="w-5 h-5 text-red-400 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-red-300">Your Answer: </span>
                      <span className="text-gray-300">
                        {q.userAnswerIndex !== null ? q.options[q.userAnswerIndex].text : 'Not answered'}
                      </span>
                    </div>
                  </div>
                   <div className="flex items-start p-3 rounded-md bg-green-900/50 border border-green-500/50">
                    <CheckIcon className="w-5 h-5 text-green-400 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-green-300">Correct Answer: </span>
                      <span className="text-gray-300">{q.options[q.correctAnswerIndex].text}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-center pt-4">
        <button
          onClick={onRestart}
          className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transition-colors duration-300 transform hover:scale-105"
        >
          Create Another Quiz
        </button>
      </div>
    </div>
  );
};

export default QuizSummary;