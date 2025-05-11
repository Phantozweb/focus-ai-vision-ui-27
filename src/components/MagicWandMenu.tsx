
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { 
  WandSparkles, 
  FileText, 
  Plus, 
  Sparkles, 
  BookText,
  Table, 
  BookmarkPlus,
  FileQuestion
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/components/ui/sonner';

interface MagicWandMenuProps {
  onOptionSelect: (option: string) => void;
}

const MagicWandMenu: React.FC<MagicWandMenuProps> = ({ onOptionSelect }) => {
  const handleSelect = (option: string) => {
    onOptionSelect(option);
    toast.success(`Applied "${option}" to your content`);
  };

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="bg-white border-gray-300 text-blue-500 hover:bg-blue-50 h-8 w-8"
              title="Format Content"
            >
              <WandSparkles className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Format Content</p>
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="bg-white">
        <DropdownMenuItem onClick={() => handleSelect('Simplify')} className="cursor-pointer">
          <Sparkles className="h-4 w-4 mr-2" />
          Simplify
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSelect('Add Details')} className="cursor-pointer">
          <Plus className="h-4 w-4 mr-2" />
          Add Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSelect('Student Friendly')} className="cursor-pointer">
          <BookText className="h-4 w-4 mr-2" />
          Student Friendly
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSelect('Clinical Focus')} className="cursor-pointer">
          <FileText className="h-4 w-4 mr-2" />
          Clinical Focus
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSelect('Add Tables')} className="cursor-pointer">
          <Table className="h-4 w-4 mr-2" />
          Add Tables
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSelect('Summarize')} className="cursor-pointer">
          <FileText className="h-4 w-4 mr-2" />
          Summarize
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSelect('Practice Questions')} className="cursor-pointer">
          <FileQuestion className="h-4 w-4 mr-2" />
          Practice Questions
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSelect('Save to Notes')} className="cursor-pointer">
          <BookmarkPlus className="h-4 w-4 mr-2" />
          Save to Notes
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MagicWandMenu;
