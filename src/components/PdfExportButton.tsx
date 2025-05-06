
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { exportToPDF, SAMPLE_MARKDOWN } from '@/utils/pdfExport';
import { toast } from '@/components/ui/sonner';

interface PdfExportButtonProps {
  containerId?: string;
  filename?: string;
  markdownContent?: string;
  className?: string;
  label?: string;
}

const PdfExportButton: React.FC<PdfExportButtonProps> = ({
  containerId = 'exportContainer',
  filename = 'report',
  markdownContent = SAMPLE_MARKDOWN,
  className = '',
  label = 'Export as PDF',
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      toast.info('Preparing PDF export...');
      await exportToPDF(containerId, filename, markdownContent);
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
