
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { WandSparkles } from 'lucide-react';
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
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="bg-white border-gray-300 text-blue-500 hover:bg-blue-50 text-xs flex items-center gap-1 h-6"
          title="Magic Wand Options"
        >
          <WandSparkles className="h-3 w-3" />
          Format
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white">
        <DropdownMenuItem onClick={() => handleSelect('Simplify')} className="cursor-pointer">
          Simplify
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSelect('Add Details')} className="cursor-pointer">
          Add Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSelect('Student Friendly')} className="cursor-pointer">
          Student Friendly
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSelect('Clinical Focus')} className="cursor-pointer">
          Clinical Focus
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSelect('Add Tables')} className="cursor-pointer">
          Add Tables
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSelect('EMR Format')} className="cursor-pointer">
          EMR Format
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MagicWandMenu;
