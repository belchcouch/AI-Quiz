import React, { useState, useCallback, useEffect } from 'react';
import { QuizQuestion, QuizState } from './types';
import { generateQuizFromText } from './services/geminiService';
import FileUpload from './components/FileUpload';
import Quiz from './components/Quiz';
import QuizSummary from './components/QuizSummary';
import Loader from './components/Loader';

// pdfjs-dist is loaded from a script tag in index.html
declare const pdfjsLib: any;

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [quizState, setQuizState] = useState<QuizState>(QuizState.IDLE);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  
  useEffect(() => {
    // Required to set up the PDF.js worker
    if (typeof pdfjsLib !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs`;
    }
  }, []);

  const handleFileChange = (selectedFile: File | null) => {
    setFile(selectedFile);
    setError(null);
  };

  const extractTextFromPdf = useCallback(async (pdfFile: File): Promise<string> => {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
    }
    return fullText;
  }, []);

  const handleGenerateQuiz = useCallback(async () => {
    if (!file) {
      setError('Please upload a PDF file first.');
      return;
    }

    setQuizState(QuizState.GENERATING);
    setError(null);
    setLoadingMessage('Reading your document...');

    try {
      const text = await extractTextFromPdf(file);
      
      setLoadingMessage('Crafting challenging questions...');
      const generatedQuiz = await generateQuizFromText(text);

      setQuiz(generatedQuiz);
      setUserAnswers(new Array(generatedQuiz.length).fill(null));
      setCurrentQuestionIndex(0);
      setQuizState(QuizState.IN_PROGRESS);
    } catch (err) {
      console.error(err);
      setError('Failed to generate the quiz. The document might be too complex or the content unsuitable. Please try a different file.');
      setQuizState(QuizState.IDLE);
    } finally {
        setLoadingMessage('');
    }
  }, [file, extractTextFromPdf]);

  const handleAnswerSelect = (optionIndex: number) => {
    setUserAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[currentQuestionIndex] = optionIndex;
      return newAnswers;
    });
  };

  const handleNextQuestion = () => {
    if (quiz && currentQuestionIndex < quiz.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setQuizState(QuizState.COMPLETED);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleRestart = () => {
    setFile(null);
    setQuiz(null);
    setUserAnswers([]);
    setCurrentQuestionIndex(0);
    setQuizState(QuizState.IDLE);
    setError(null);
  };

  const renderContent = () => {
    switch (quizState) {
      case QuizState.IDLE:
        return <FileUpload onFileChange={handleFileChange} onGenerate={handleGenerateQuiz} file={file} error={error} />;
      case QuizState.GENERATING:
        return <Loader message={loadingMessage} />;
      case QuizState.IN_PROGRESS:
        if (!quiz) return null;
        return (
          <Quiz
            question={quiz[currentQuestionIndex]}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={quiz.length}
            userAnswer={userAnswers[currentQuestionIndex]}
            onAnswerSelect={handleAnswerSelect}
            onNext={handleNextQuestion}
            onBack={handlePrevQuestion}
          />
        );
      case QuizState.COMPLETED:
        if (!quiz) return null;
        return <QuizSummary quiz={quiz} userAnswers={userAnswers} onRestart={handleRestart} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-6">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
            AI Quiz Generator
          </h1>
        </header>
        <main className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl shadow-blue-500/10 p-6 sm:p-8 border border-gray-700">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;