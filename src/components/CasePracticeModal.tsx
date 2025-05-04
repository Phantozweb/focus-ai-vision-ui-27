
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface CasePracticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseTitle: string;
  condition: string;
}

const CasePracticeModal: React.FC<CasePracticeModalProps> = ({
  isOpen,
  onClose,
  caseTitle,
  condition,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  // Sample questions based on the condition
  const questions = [
    {
      question: `What is the most common clinical finding in ${condition}?`,
      options: [
        "Decreased visual acuity",
        "Ocular pain",
        "Photophobia",
        "Floaters"
      ],
      correctAnswer: 0
    },
    {
      question: `Which diagnostic test is most appropriate for evaluating ${condition}?`,
      options: [
        "Gonioscopy",
        "OCT",
        "Fundus photography",
        "All of the above"
      ],
      correctAnswer: 1
    },
    {
      question: `What is a common complication of untreated ${condition}?`,
      options: [
        "Ptosis",
        "Convergence insufficiency",
        "Vision loss",
        "Diplopia"
      ],
      correctAnswer: 2
    }
  ];

  const handleAnswerSelect = (answerIndex: number) => {
    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers[currentQuestion] = answerIndex.toString();
    setSelectedAnswers(newSelectedAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateScore();
      setShowResults(true);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    selectedAnswers.forEach((answer, index) => {
      if (parseInt(answer) === questions[index].correctAnswer) {
        correct++;
      }
    });
    setScore(correct);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setShowResults(false);
    setScore(0);
  };

  const handleClose = () => {
    resetQuiz();
    onClose();
  };

  const saveToNotes = () => {
    // Get existing study notes
    const savedNotes = localStorage.getItem('studyNotes');
    let studyNotes = savedNotes ? JSON.parse(savedNotes) : [];
    
    // Create content
    const content = questions.map((q, i) => `
## Question ${i + 1}: ${q.question}

${q.options.map((opt, idx) => `${idx === q.correctAnswer ? '✓' : '•'} ${opt}`).join('\n')}

${selectedAnswers[i] !== undefined ? (parseInt(selectedAnswers[i]) === q.correctAnswer ? 
  '**Your answer was correct**' : 
  `**Your answer was incorrect. The correct answer is: ${q.options[q.correctAnswer]}**`) : 
  '**Question not answered**'}
`).join('\n\n');
    
    const newNote = {
      id: Date.now().toString(),
      title: `Quiz: ${caseTitle}`,
      content: `# Quiz Results for ${caseTitle}\n\nScore: ${score}/${questions.length}\n\n${content}`,
      lastUpdated: Date.now(),
      tags: ['quiz', condition]
    };
    
    studyNotes = [newNote, ...studyNotes];
    localStorage.setItem('studyNotes', JSON.stringify(studyNotes));
    
    toast.success('Quiz results saved to Study Notes');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{showResults ? "Quiz Results" : `${caseTitle} Practice Quiz`}</DialogTitle>
          {!showResults && (
            <DialogDescription>
              Question {currentQuestion + 1} of {questions.length}
            </DialogDescription>
          )}
        </DialogHeader>
        
        {!showResults ? (
          <div className="py-4">
            <h3 className="font-medium text-lg mb-4">{questions[currentQuestion].question}</h3>
            <div className="space-y-2">
              {questions[currentQuestion].options.map((option, index) => (
                <div 
                  key={index}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedAnswers[currentQuestion] === index.toString()
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => handleAnswerSelect(index)}
                >
                  {option}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-4">
            <div className="text-center mb-6">
              <div className={`text-4xl font-bold mb-2 ${
                score === questions.length ? 'text-green-600' : 
                score >= questions.length / 2 ? 'text-blue-600' : 'text-orange-600'
              }`}>
                {score}/{questions.length}
              </div>
              <p>{
                score === questions.length ? 'Perfect score!' : 
                score >= questions.length / 2 ? 'Good job!' : 'Keep practicing!'
              }</p>
            </div>
            
            <div className="space-y-4">
              {questions.map((q, i) => (
                <div key={i} className="border rounded-lg p-3">
                  <p className="font-medium mb-2">{q.question}</p>
                  <p className={
                    selectedAnswers[i] === undefined ? 'text-gray-600' :
                    parseInt(selectedAnswers[i]) === q.correctAnswer ? 
                    'text-green-600 font-medium' : 'text-red-600 font-medium'
                  }>
                    {selectedAnswers[i] === undefined ? 'Not answered' :
                     parseInt(selectedAnswers[i]) === q.correctAnswer ? 
                     'Correct' : `Incorrect (Correct: ${q.options[q.correctAnswer]})`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <DialogFooter className="flex-col sm:flex-row gap-2 items-center">
          {!showResults ? (
            <>
              <div className="flex-1 flex gap-2">
                <Button variant="outline" onClick={handlePreviousQuestion} disabled={currentQuestion === 0}>
                  Previous
                </Button>
                <Button onClick={handleNextQuestion}>
                  {currentQuestion < questions.length - 1 ? 'Next' : 'Finish'}
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={resetQuiz}>
                Try Again
              </Button>
              <Button onClick={saveToNotes}>
                Save Results
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CasePracticeModal;
