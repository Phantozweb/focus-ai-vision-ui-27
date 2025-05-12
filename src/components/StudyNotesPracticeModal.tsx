
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { generateGeminiResponse } from '@/utils/geminiApi';
import { toast } from 'sonner';
import { 
  AlertDialog, 
  AlertDialogContent, 
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from '@/components/ui/alert-dialog';
import { RefreshCw } from 'lucide-react';

interface PracticeQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

interface StudyNotesPracticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: string;
}

const StudyNotesPracticeModal = ({ isOpen, onClose, topic }: StudyNotesPracticeModalProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const generateQuestions = async () => {
    if (!topic) {
      toast.error('No topic specified');
      onClose();
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `Create 5 multiple-choice practice questions on the optometry topic: ${topic}.
      
      Format each question as a JSON object with the following structure:
      {
        "question": "Question text here",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "answer": "The full text of the correct option (not just A, B, C, or D)",
        "explanation": "Brief explanation of why this answer is correct"
      }
      
      Return your response as a valid JSON array of these question objects. Do not include any text before or after the JSON array.`;

      const response = await generateGeminiResponse(prompt);
      let parsedQuestions;
      
      try {
        // Try to parse the response as JSON
        parsedQuestions = JSON.parse(response);
      } catch (error) {
        console.error('Failed to parse questions JSON:', error);
        
        // If direct parsing fails, try to extract JSON from the response
        const jsonMatch = response.match(/\[\s*\{.*\}\s*\]/s);
        if (jsonMatch) {
          parsedQuestions = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Could not extract valid JSON from response');
        }
      }
      
      if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
        setQuestions(parsedQuestions);
        setCurrentQuestionIndex(0);
        setSelectedOption(null);
        setHasSubmitted(false);
        setScore({ correct: 0, total: 0 });
      } else {
        throw new Error('Invalid question format received');
      }

    } catch (error) {
      console.error('Error generating practice questions:', error);
      toast.error('Failed to generate practice questions');
      onClose();
    } finally {
      setIsGenerating(false);
    }
  };

  React.useEffect(() => {
    if (isOpen && topic) {
      generateQuestions();
    }
    return () => {
      setQuestions([]);
      setCurrentQuestionIndex(0);
      setSelectedOption(null);
      setHasSubmitted(false);
    };
  }, [isOpen, topic]);

  const handleOptionSelect = (option: string) => {
    if (!hasSubmitted) {
      setSelectedOption(option);
    }
  };

  const handleSubmit = () => {
    if (!selectedOption || hasSubmitted) return;
    
    setHasSubmitted(true);
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedOption === currentQuestion.answer;
    
    setScore(prev => ({
      correct: isCorrect ? prev.correct + 1 : prev.correct,
      total: prev.total + 1
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setHasSubmitted(false);
    } else {
      // Quiz completed
      toast.success(`Quiz completed! Score: ${score.correct}/${score.total}`);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Practice Quiz: {topic}</AlertDialogTitle>
          <AlertDialogDescription>
            Test your knowledge with these practice questions.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {isGenerating ? (
          <div className="py-12 flex flex-col items-center justify-center">
            <RefreshCw className="h-8 w-8 text-sky-500 animate-spin mb-4" />
            <p className="text-gray-600">Generating practice questions...</p>
          </div>
        ) : questions.length > 0 ? (
          <div>
            <div className="mb-4 text-right text-sm text-gray-500">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
            
            <div className="mb-6">
              <h3 className="font-medium text-lg mb-4">{currentQuestion.question}</h3>
              
              <div className="space-y-2">
                {currentQuestion.options.map((option, index) => (
                  <div
                    key={index}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedOption === option
                        ? hasSubmitted
                          ? option === currentQuestion.answer
                            ? 'bg-green-100 border-green-300'
                            : 'bg-red-100 border-red-300'
                          : 'bg-sky-50 border-sky-300'
                        : hasSubmitted && option === currentQuestion.answer
                          ? 'bg-green-100 border-green-300'
                          : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleOptionSelect(option)}
                  >
                    {option}
                  </div>
                ))}
              </div>
            </div>
            
            {hasSubmitted && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Explanation:</h4>
                <p>{currentQuestion.explanation}</p>
              </div>
            )}
            
            <div className="flex justify-between">
              {!hasSubmitted ? (
                <Button 
                  onClick={handleSubmit}
                  disabled={!selectedOption}
                  className="bg-sky-500 hover:bg-sky-600"
                >
                  Submit Answer
                </Button>
              ) : (
                <Button 
                  onClick={handleNext}
                  className="bg-sky-500 hover:bg-sky-600"
                >
                  {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Complete Quiz'}
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            Failed to load practice questions. Please try again.
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default StudyNotesPracticeModal;
