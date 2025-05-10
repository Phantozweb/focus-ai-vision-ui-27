
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useQuiz } from '@/hooks/useQuiz';
import QuizGenerator from '@/components/quiz/QuizGenerator';
import ActiveQuiz from '@/components/quiz/ActiveQuiz';
import QuizResults from '@/components/quiz/QuizResults';

const Quizzes = () => {
  const quiz = useQuiz();
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-sky-800">Practice Quizzes</h1>
          </div>
          
          {quiz.questions.length === 0 && (
            <QuizGenerator 
              topic={quiz.topic}
              setTopic={quiz.setTopic}
              questionCount={quiz.questionCount}
              setQuestionCount={quiz.setQuestionCount}
              difficulty={quiz.difficulty}
              setDifficulty={quiz.setDifficulty}
              generateQuiz={quiz.generateQuiz}
              isGenerating={quiz.isGenerating}
            />
          )}

          {quiz.questions.length > 0 && !quiz.quizFinished && (
            <ActiveQuiz 
              topic={quiz.topic}
              questions={quiz.questions}
              currentQuestionIndex={quiz.currentQuestionIndex}
              userAnswers={quiz.userAnswers}
              showExplanation={quiz.showExplanation}
              handleAnswerSelection={quiz.handleAnswerSelection}
              goToNextQuestion={quiz.goToNextQuestion}
              goToPreviousQuestion={quiz.goToPreviousQuestion}
              toggleExplanation={quiz.toggleExplanation}
            />
          )}

          {quiz.quizFinished && (
            <QuizResults 
              topic={quiz.topic}
              difficulty={quiz.difficulty}
              quizResults={quiz.quizResults}
              score={quiz.score}
              questions={quiz.questions}
              restartQuiz={quiz.restartQuiz}
              createNewQuiz={quiz.createNewQuiz}
              analysis={quiz.quizAnalysis}
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Quizzes;
