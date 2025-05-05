
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { generateQuizWithAnswers, QuizDifficulty } from '@/utils/geminiApi';
import { Check, X, HelpCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizResultItem {
  question: string;
  userAnswer: number | null;
  correctAnswer: number;
  isCorrect: boolean;
}

const Quizzes = () => {
  const [topic, setTopic] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState<QuizDifficulty>("medium");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizResults, setQuizResults] = useState<QuizResultItem[]>([]);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  
  // When answers change, update the score
  useEffect(() => {
    if (quizFinished && questions.length > 0) {
      const correct = userAnswers.reduce((count, answer, index) => {
        return answer === questions[index].correctAnswer ? count + 1 : count;
      }, 0);
      setScore({ correct, total: questions.length });
    }
  }, [quizFinished, questions, userAnswers]);

  const generateQuiz = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setIsGenerating(true);
    setQuestions([]);
    setUserAnswers([]);
    setCurrentQuestionIndex(0);
    setQuizFinished(false);
    setShowExplanation(false);
    
    try {
      const generatedQuestions = await generateQuizWithAnswers(topic, questionCount, difficulty);
      setQuestions(generatedQuestions);
      setUserAnswers(new Array(generatedQuestions.length).fill(null));
      toast.success(`Generated ${questionCount} ${difficulty} questions about ${topic}`);
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast.error('Failed to generate quiz. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswerSelection = (optionIndex: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setUserAnswers(newAnswers);
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowExplanation(false);
    } else {
      finishQuiz();
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setShowExplanation(false);
    }
  };

  const toggleExplanation = () => {
    setShowExplanation(!showExplanation);
  };

  const finishQuiz = () => {
    const results = questions.map((q, index) => ({
      question: q.question,
      userAnswer: userAnswers[index],
      correctAnswer: q.correctAnswer,
      isCorrect: userAnswers[index] === q.correctAnswer
    }));
    
    setQuizResults(results);
    setQuizFinished(true);
  };

  const restartQuiz = () => {
    setUserAnswers(new Array(questions.length).fill(null));
    setCurrentQuestionIndex(0);
    setQuizFinished(false);
    setShowExplanation(false);
  };

  const createNewQuiz = () => {
    setQuestions([]);
    setUserAnswers([]);
    setCurrentQuestionIndex(0);
    setQuizFinished(false);
    setShowExplanation(false);
  };

  const renderQuizGenerator = () => (
    <div className="tool-card mb-8">
      <h2 className="text-2xl font-bold text-white mb-2">Create a Custom Quiz</h2>
      <p className="text-slate-400 mb-6">Generate practice questions on any optometry topic</p>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="topic" className="block text-white mb-2">Topic</label>
          <Input
            id="topic"
            placeholder="Enter a specific optometry topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full bg-darkBg border-slate-700 focus:border-focusBlue text-white"
          />
        </div>
        
        <div>
          <label htmlFor="questionCount" className="block text-white mb-2">Number of Questions</label>
          <div className="flex gap-2">
            {[5, 10, 15, 20].map(count => (
              <Button
                key={count}
                type="button"
                variant={questionCount === count ? "default" : "outline"}
                className={questionCount === count ? "bg-blue-600 text-white" : "bg-darkBg border-slate-700 text-slate-300"}
                onClick={() => setQuestionCount(count)}
              >
                {count}
              </Button>
            ))}
          </div>
        </div>
        
        <div>
          <label htmlFor="difficulty" className="block text-white mb-2">Difficulty Level</label>
          <div className="flex gap-2">
            {['easy', 'medium', 'hard'].map(level => (
              <Button
                key={level}
                type="button"
                variant={difficulty === level as QuizDifficulty ? "default" : "outline"}
                className={difficulty === level ? "bg-blue-600 text-white" : "bg-darkBg border-slate-700 text-slate-300"}
                onClick={() => setDifficulty(level as QuizDifficulty)}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </Button>
            ))}
          </div>
        </div>
        
        <Button
          onClick={generateQuiz}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4"
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Generate Quiz'}
        </Button>
      </div>
    </div>
  );

  const renderActiveQuiz = () => {
    if (questions.length === 0) return null;
    
    const currentQuestion = questions[currentQuestionIndex];
    const currentAnswer = userAnswers[currentQuestionIndex];
    
    return (
      <div className="tool-card mb-8">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-white">Quiz: {topic}</h3>
            <span className="text-slate-400">Question {currentQuestionIndex + 1} of {questions.length}</span>
          </div>
          <Progress value={(currentQuestionIndex + 1) / questions.length * 100} className="h-1.5" />
        </div>
        
        <div className="py-4">
          <h4 className="text-xl font-medium text-white mb-6">{currentQuestion.question}</h4>
          
          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswerSelection(idx)}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${
                  currentAnswer === idx 
                    ? 'bg-blue-900/30 border-blue-500 text-white' 
                    : 'border-slate-700 text-slate-300 hover:bg-darkBg-lighter'
                }`}
              >
                <span className="font-medium mr-2">{String.fromCharCode(65 + idx)}.</span> {option}
              </button>
            ))}
          </div>
          
          {showExplanation && (
            <div className="mt-6 p-4 bg-slate-800 rounded-lg">
              <h5 className="font-medium text-blue-400 mb-2">Explanation:</h5>
              <p className="text-slate-300">{currentQuestion.explanation}</p>
            </div>
          )}
          
          <div className="flex justify-between mt-8">
            <div>
              <Button
                variant="outline"
                onClick={toggleExplanation}
                className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <HelpCircle className="mr-2 h-4 w-4" /> 
                {showExplanation ? 'Hide Explanation' : 'Show Explanation'}
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={goToPreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
              
              <Button
                onClick={goToNextQuestion}
                disabled={currentAnswer === null}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {currentQuestionIndex < questions.length - 1 ? (
                  <>Next <ArrowRight className="ml-2 h-4 w-4" /></>
                ) : (
                  'Finish Quiz'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderQuizResults = () => {
    if (!quizFinished) return null;
    
    return (
      <div className="tool-card mb-8">
        <h3 className="text-2xl font-bold text-white mb-4">Quiz Results</h3>
        
        <div className="bg-darkBg-lighter p-6 rounded-lg mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="text-lg font-medium text-white">Your Score</h4>
              <p className="text-slate-400">{topic} - {difficulty} difficulty</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-blue-400">{score.correct}/{score.total}</span>
              <p className="text-slate-400">{Math.round(score.correct / score.total * 100)}%</p>
            </div>
          </div>
          
          <Progress 
            value={score.correct / score.total * 100} 
            className="h-2.5" 
          />
        </div>
        
        <div className="space-y-6">
          <h4 className="text-lg font-medium text-white mb-2">Question Summary</h4>
          
          {quizResults.map((result, idx) => (
            <div 
              key={idx} 
              className={`p-4 rounded-lg border ${
                result.isCorrect 
                  ? 'border-green-500/50 bg-green-950/20' 
                  : 'border-red-500/50 bg-red-950/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-1.5 rounded-full ${
                  result.isCorrect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {result.isCorrect ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                </div>
                
                <div className="flex-1">
                  <h5 className="font-medium text-white mb-2">{result.question}</h5>
                  
                  <div className="text-sm text-slate-400 mb-1">
                    <span className="font-medium">Your answer:</span> {
                      result.userAnswer !== null
                        ? `${String.fromCharCode(65 + result.userAnswer)}. ${questions[idx].options[result.userAnswer]}`
                        : 'No answer selected'
                    }
                  </div>
                  
                  {!result.isCorrect && (
                    <div className="text-sm text-blue-400 mb-1">
                      <span className="font-medium">Correct answer:</span> {
                        `${String.fromCharCode(65 + result.correctAnswer)}. ${questions[idx].options[result.correctAnswer]}`
                      }
                    </div>
                  )}
                  
                  <div className="mt-3 pt-3 border-t border-slate-700/50">
                    <p className="text-slate-300 text-sm">{questions[idx].explanation}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex gap-4 mt-8">
          <Button
            onClick={restartQuiz}
            variant="outline"
            className="flex-1 bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            Retake Quiz
          </Button>
          
          <Button
            onClick={createNewQuiz}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Create New Quiz
          </Button>
        </div>
      </div>
    );
  };

  const renderPastQuizzes = () => (
    <div className="tool-card">
      <h2 className="text-2xl font-bold text-white mb-4">Past Quizzes</h2>
      
      <div className="space-y-4">
        <QuizHistoryItem
          title="Glaucoma Diagnosis"
          date="May 3, 2025"
          score="8/10"
          questions={10}
          difficulty="Medium"
        />
        <QuizHistoryItem
          title="Retina Pathology"
          date="May 1, 2025"
          score="7/10"
          questions={10}
          difficulty="Hard"
        />
        <QuizHistoryItem
          title="Contact Lens Fitting"
          date="Apr 28, 2025"
          score="9/10" 
          questions={10}
          difficulty="Easy"
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-xl text-blue-400 font-medium mb-6">Quiz Generator</h1>
          
          {questions.length === 0 && renderQuizGenerator()}
          {questions.length > 0 && !quizFinished && renderActiveQuiz()}
          {quizFinished && renderQuizResults()}
          {!questions.length && renderPastQuizzes()}
        </div>
      </main>

      <Footer />
    </div>
  );
};

interface QuizHistoryItemProps {
  title: string;
  date: string;
  score: string;
  questions: number;
  difficulty: string;
}

const QuizHistoryItem = ({ title, date, score, questions, difficulty }: QuizHistoryItemProps) => {
  return (
    <div 
      className="flex justify-between items-center p-4 border border-slate-800 rounded-lg hover:bg-darkBg-lighter transition-colors cursor-pointer"
      onClick={() => toast.info(`This would open the "${title}" quiz results`)}
    >
      <div>
        <h3 className="text-white font-medium">{title}</h3>
        <p className="text-sm text-slate-500">{date} • {questions} questions • {difficulty}</p>
      </div>
      <div className="text-right">
        <span className="text-blue-400 font-bold">{score}</span>
      </div>
    </div>
  );
};

export default Quizzes;
