
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useQuiz } from '@/hooks/useQuiz';
import QuizGenerator from '@/components/quiz/QuizGenerator';
import ActiveQuiz from '@/components/quiz/ActiveQuiz';
import QuizResults from '@/components/quiz/QuizResults';
import { Button } from '@/components/ui/button';
import { RotateCw } from 'lucide-react';
import { toast } from 'sonner';

const Quizzes = () => {
  const quiz = useQuiz();
  
  const handleGenerateQuiz = () => {
    if (!quiz.topic.trim()) {
      toast.error('Please enter a quiz topic');
      return;
    }
    
    // Setting the quizTopic to match the topic field to ensure consistency
    quiz.setQuizTopic(quiz.topic);
    
    toast.info(`Generating quiz on ${quiz.topic}...`);
    quiz.generateQuiz();
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-sky-800">Practice Quizzes</h1>
            
            {/* Quick generate button when in middle of a quiz */}
            {quiz.questions.length > 0 && !quiz.quizFinished && (
              <div className="mt-4">
                <Button
                  onClick={quiz.createNewQuiz}
                  variant="outline"
                  className="text-sky-600 border-sky-300 hover:bg-sky-50"
                >
                  <RotateCw className="h-4 w-4 mr-2" />
                  Generate New Quiz
                </Button>
              </div>
            )}
          </div>
          
          {quiz.questions.length === 0 && (
            <QuizGenerator 
              topic={quiz.topic}
              setTopic={quiz.setTopic}
              questionCount={quiz.questionCount}
              setQuestionCount={quiz.setQuestionCount}
              difficulty={quiz.difficulty}
              setDifficulty={quiz.setDifficulty}
              selectedQuestionTypes={quiz.selectedQuestionTypes}
              setSelectedQuestionTypes={quiz.setSelectedQuestionTypes}
              generateQuiz={handleGenerateQuiz} // Use our wrapper function
              isGenerating={quiz.isGenerating}
            />
          )}

          {quiz.questions.length > 0 && !quiz.quizFinished && (
            <ActiveQuiz 
              topic={quiz.topic}
              difficulty={quiz.difficulty}
              questions={quiz.questions}
              currentQuestionIndex={quiz.currentQuestionIndex}
              userAnswers={quiz.userAnswers}
              userMatchingAnswers={quiz.userMatchingAnswers}
              showExplanation={quiz.showExplanation}
              handleAnswerSelection={quiz.handleAnswerSelection}
              handleTextAnswer={quiz.handleTextAnswer}
              handleMatchingAnswer={quiz.handleMatchingAnswer}
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
