
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { exportMarkdownReportAsPdf } from '@/utils/pdfExport';
import { toast } from '@/components/ui/sonner';

interface PdfExportButtonProps {
  containerId?: string;
  filename?: string;
  markdownContent: string;
  className?: string;
  label?: string;
  svgIconId?: string;
}

const PdfExportButton: React.FC<PdfExportButtonProps> = ({
  containerId = 'exportContainer',
  filename = 'focus-ai-conversation',
  markdownContent,
  className = '',
  label = 'Export as PDF',
  svgIconId = 'logoArea',
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      toast.info('Preparing PDF export...');

      await exportMarkdownReportAsPdf(
        containerId, 
        markdownContent, 
        svgIconId, 
        filename
      );
      
      toast.success('PDF exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      className={`flex items-center gap-2 ${className}`}
    >
      <FileDown className="h-4 w-4" />
      {isExporting ? 'Exporting...' : label}
    </Button>
  );
};

export default PdfExportButton;
