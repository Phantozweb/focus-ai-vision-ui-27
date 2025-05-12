
/**
 * Utility functions for downloading content in different formats
 */

/**
 * Download content as a markdown file
 * @param content - The content to download
 * @param filename - The name of the file (without extension)
 */
export const downloadAsMarkdown = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename.replace(/\s+/g, '-')}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Download content as a text file
 * @param content - The content to download
 * @param filename - The name of the file (without extension)
 */
export const downloadAsText = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename.replace(/\s+/g, '-')}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Download content as a PDF file (requires html2canvas and jspdf)
 * @param elementId - The ID of the element to convert to PDF
 * @param filename - The name of the file (without extension)
 */
export const downloadAsPDF = async (elementId: string, filename: string): Promise<void> => {
  try {
    const { default: html2canvas } = await import('html2canvas');
    const { jsPDF } = await import('jspdf');
    
    const element = document.getElementById(elementId);
    if (!element) {
      console.error('Element not found');
      return;
    }
    
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');
    
    // A4 size: 210 x 297 mm
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${filename.replace(/\s+/g, '-')}.pdf`);
  } catch (error) {
    console.error('Error creating PDF:', error);
  }
};

/**
 * Format the current date as YYYY-MM-DD
 */
export const getFormattedDate = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

