
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
} from "@/components/ui/dialog";
import QuizInCase from './QuizInCase';

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
  condition
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Practice Quiz: {caseTitle}</DialogTitle>
          <DialogDescription>
            Test your knowledge on {condition} with these case-specific questions.
          </DialogDescription>
        </DialogHeader>
        
        <QuizInCase 
          condition={condition}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CasePracticeModal;
