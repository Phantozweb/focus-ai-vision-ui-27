
import { jsPDF } from 'jspdf';
import { marked } from 'marked';

// Function to render markdown content to HTML
export async function renderMarkdown(markdown: string): Promise<string> {
  return await marked.parse(markdown);
}

// Core function to export markdown content directly to PDF
export async function exportMarkdownReportAsPdf(
  elementId: string,
  markdownContent: string,
  svgIconId: string,
  fileName: string = 'report.pdf'
): Promise<void> {
  try {
    // Create a new jsPDF instance (A4 format)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Parse markdown to HTML
    const htmlContent = await renderMarkdown(markdownContent);

    // Simple styling for the PDF content - more focused approach without canvas
    pdf.setFont("helvetica");
    pdf.setFontSize(11);

    // Define margins and page dimensions
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20; // mm
    const contentWidth = pageWidth - (margin * 2);
    
    // Title section (if needed)
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    
    // Split the markdown content into sections (e.g., by headers)
    const sections = htmlContent
      .replace(/<h[1-6]>/gi, '###SECTION###$&')
      .split('###SECTION###')
      .filter(Boolean);

    // Current vertical position on the page
    let yPos = margin;

    // Function to add a new page
    const addNewPage = () => {
      pdf.addPage();
      yPos = margin;
    };

    // Process each section
    sections.forEach((section, index) => {
      // Calculate the height needed for this section
      // This is a simplified estimation as we can't truly know without rendering
      const textLines = section.replace(/<[^>]*>/g, '').split('\n');
      const estimatedHeight = textLines.length * 6; // rough estimate

      // Check if we need a new page
      if (yPos + estimatedHeight > pageHeight - margin && index > 0) {
        addNewPage();
      }

      // Clean the section text (remove HTML tags for this simplified approach)
      const plainText = section.replace(/<[^>]*>/g, '').trim();
      
      // Check if this is a heading (starts with #)
      if (plainText.startsWith('#')) {
        // Extract heading content and level
        const headingMatch = plainText.match(/^(#+)\s+(.*)/);
        if (headingMatch) {
          const headingLevel = headingMatch[1].length;
          const headingText = headingMatch[2].trim();
          
          // Set font size based on heading level
          const headingSize = Math.max(20 - (headingLevel * 2), 12);
          pdf.setFontSize(headingSize);
          pdf.setFont("helvetica", "bold");
          
          pdf.text(headingText, margin, yPos);
          yPos += 10; // Space after heading
          
          // Reset to normal text
          pdf.setFontSize(11);
          pdf.setFont("helvetica", "normal");
        }
      } else {
        // Handle regular text
        const splitText = pdf.splitTextToSize(plainText, contentWidth);
        pdf.text(splitText, margin, yPos);
        yPos += splitText.length * 7; // Adjust based on line count
      }
      
      // Add spacing between sections
      yPos += 5;
      
      // Check if we need a page break after this section
      if (yPos > pageHeight - margin) {
        addNewPage();
      }
    });
    
    // Save the PDF
    pdf.save(fileName);
  } catch (error) {
    console.error('PDF Export error:', error);
    throw error;
  }
}

// Simplified export function that uses the core function
export async function exportToPDF(
  containerId: string, 
  filename: string = 'report',
  markdownContent?: string
): Promise<void> {
  if (markdownContent) {
    return exportMarkdownReportAsPdf(containerId, markdownContent, '', filename);
  } else {
    console.error('No content provided for PDF export');
    throw new Error('No content provided for PDF export');
  }
}
