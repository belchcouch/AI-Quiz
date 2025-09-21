import React from 'react';
import { QuizQuestion } from '../types';
import { CheckIcon, XIcon } from './icons';

interface QuizProps {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  userAnswer: number | null;
  onAnswerSelect: (optionIndex: number) => void;
  onNext: () => void;
  onBack: () => void;
}

const Quiz: React.FC<QuizProps> = ({
  question,
  questionNumber,
  totalQuestions,
  userAnswer,
  onAnswerSelect,
  onNext,
  onBack,
}) => {
  const hasAnswered = userAnswer !== null;
  
  const getOptionClass = (index: number) => {
    let baseClass = "w-full text-left p-3 rounded-lg border-2 transition-all duration-300 flex items-start space-x-3";
    if (!hasAnswered) {
      return `${baseClass} bg-gray-700 border-gray-600 hover:bg-gray-600 hover:border-blue-500 cursor-pointer`;
    }

    const isCorrect = index === question.correctAnswerIndex;
    const isSelected = index === userAnswer;

    if (isCorrect) {
      return `${baseClass} bg-green-900/50 border-green-500 cursor-default`;
    }
    if (isSelected && !isCorrect) {
      return `${baseClass} bg-red-900/50 border-red-500 cursor-default`;
    }
    
    return `${baseClass} bg-gray-800 border-gray-700 cursor-default opacity-50`;
  };

  const OptionPrefix: React.FC<{ index: number }> = ({ index }) => {
    const letter = String.fromCharCode(65 + index);
    return <div className="font-bold text-md text-gray-400">{letter}.</div>;
  };

  return (
    <div className="flex flex-col space-y-6">
      <div>
        <p className="text-sm text-blue-300 mb-1">
          Question {questionNumber} of {totalQuestions}
        </p>
        <h2 className="text-xl font-semibold text-gray-100">{question.question}</h2>
      </div>

      <div className="space-y-3">
        {question.options.map((option, index) => {
          const isCorrect = index === question.correctAnswerIndex;
          const isSelected = index === userAnswer;

          return (
            <button
              key={index}
              onClick={() => onAnswerSelect(index)}
              disabled={hasAnswered}
              className={getOptionClass(index)}
            >
              <OptionPrefix index={index} />
              <div className="flex-1 text-left">
                <span>{option.text}</span>
                {hasAnswered && (isCorrect || isSelected) && (
                  <div className="mt-2 text-sm flex items-start space-x-2">
                    {isCorrect ? (
                      <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    )}
                    <p className="text-gray-300">{option.explanation}</p>
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>
      
      <div className="flex justify-between items-center pt-2">
        <button
          onClick={onBack}
          disabled={questionNumber === 1}
          className="px-6 py-2 border-2 border-gray-600 text-gray-300 font-semibold rounded-lg hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
        >
          {questionNumber === totalQuestions ? 'Finish Quiz' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default Quiz;