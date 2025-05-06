
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

    // Define margins and page dimensions
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20; // mm
    const contentWidth = pageWidth - (margin * 2);
    
    // Configure PDF document metadata
    pdf.setProperties({
      title: fileName,
      creator: 'Focus.AI',
      subject: 'Optometry Notes'
    });
    
    // Set default font
    pdf.setFont("helvetica");
    pdf.setFontSize(11);

    // Process markdown
    const tokens = marked.lexer(markdownContent);
    
    // Track current position on page
    let yPos = margin;
    let pageNum = 1;
    
    // Function to add new page
    const addNewPage = () => {
      pdf.addPage();
      pageNum++;
      yPos = margin;
    };

    // Process tokens and render them to PDF
    for (const token of tokens) {
      // Check if we need a new page before processing token
      if (yPos > pageHeight - margin - 10) {
        addNewPage();
      }
      
      // Different handling based on token type
      switch (token.type) {
        case 'heading': {
          // Handle headings with appropriate font sizes
          const fontSize = 20 - ((token.depth || 1) * 2);
          pdf.setFontSize(fontSize);
          pdf.setFont("helvetica", "bold");
          
          const text = token.text;
          pdf.text(text, margin, yPos);
          yPos += fontSize / 2 + 5;
          
          // Reset to normal text
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(11);
          break;
        }
        
        case 'paragraph': {
          // Handle paragraphs with line wrapping
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(11);
          
          const lines = pdf.splitTextToSize(token.text, contentWidth);
          pdf.text(lines, margin, yPos);
          
          // Move down based on how many lines were rendered
          yPos += (lines.length * 5) + 4;
          break;
        }
        
        case 'list': {
          // Handle lists (bullet points or numbered)
          pdf.setFontSize(11);
          
          const items = token.items || [];
          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const prefix = token.ordered ? `${i + 1}.` : '•';
            
            // Check if we need a new page
            if (yPos > pageHeight - margin - 15) {
              addNewPage();
            }
            
            const itemText = item.text || '';
            const bulletText = `${prefix} ${itemText}`;
            const lines = pdf.splitTextToSize(bulletText, contentWidth - 5);
            
            pdf.text(lines, margin, yPos);
            yPos += (lines.length * 5) + 2;
          }
          
          // Add extra space after list
          yPos += 3;
          break;
        }
        
        case 'table': {
          // Table handling
          pdf.setFontSize(10);
          
          // Define cell dimensions
          const columns = token.header?.length || 0;
          if (columns === 0) break;
          
          const cellWidth = contentWidth / columns;
          const cellHeight = 8;
          const cells = token.cells || [];
          
          // Draw header
          pdf.setFont("helvetica", "bold");
          for (let i = 0; i < token.header.length; i++) {
            pdf.rect(margin + (i * cellWidth), yPos - 5, cellWidth, cellHeight);
            const header = token.header[i] || '';
            pdf.text(header, margin + 2 + (i * cellWidth), yPos);
          }
          yPos += cellHeight;
          
          // Draw cells
          pdf.setFont("helvetica", "normal");
          for (let i = 0; i < cells.length; i++) {
            const row = cells[i];
            
            // Check if we need a new page
            if (yPos > pageHeight - margin - 15) {
              addNewPage();
            }
            
            for (let j = 0; j < row.length; j++) {
              pdf.rect(margin + (j * cellWidth), yPos - 5, cellWidth, cellHeight);
              const cellText = row[j] || '';
              pdf.text(cellText, margin + 2 + (j * cellWidth), yPos);
            }
            
            yPos += cellHeight;
          }
          
          // Add some space after table
          yPos += 5;
          break;
        }
        
        case 'code': {
          // Handle code blocks
          pdf.setFont("courier", "normal");
          pdf.setFontSize(9);
          
          const lines = pdf.splitTextToSize(token.text || '', contentWidth - 10);
          
          // Draw code block background
          pdf.setDrawColor(200, 200, 200);
          pdf.setFillColor(245, 245, 245);
          pdf.rect(margin - 2, yPos - 5, contentWidth + 4, (lines.length * 5) + 6, 'FD');
          
          // Draw text
          pdf.text(lines, margin, yPos);
          
          // Move position
          yPos += (lines.length * 5) + 8;
          
          // Reset to normal text
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(11);
          break;
        }
        
        case 'hr': {
          // Handle horizontal rule
          pdf.setDrawColor(200, 200, 200);
          pdf.line(margin, yPos, pageWidth - margin, yPos);
          yPos += 5;
          break;
        }
        
        case 'blockquote': {
          // Handle blockquotes
          pdf.setFont("helvetica", "italic");
          pdf.setFontSize(11);
          
          const lines = pdf.splitTextToSize(token.text || '', contentWidth - 10);
          
          // Draw quote indicator
          pdf.setDrawColor(200, 200, 200);
          pdf.setFillColor(240, 240, 240);
          pdf.rect(margin - 2, yPos - 5, 4, (lines.length * 5) + 6, 'F');
          
          // Draw text
          pdf.text(lines, margin + 5, yPos);
          
          // Move position
          yPos += (lines.length * 5) + 8;
          
          // Reset to normal text
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(11);
          break;
        }
        
        case 'space': {
          // Handle additional spacing
          yPos += 5;
          break;
        }
        
        default: {
          // Default handling for other token types
          if (token.text) {
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(11);
            
            const lines = pdf.splitTextToSize(token.text, contentWidth);
            pdf.text(lines, margin, yPos);
            
            yPos += (lines.length * 5) + 4;
          }
          break;
        }
      }
      
      // Check if we need a new page after processing token
      if (yPos > pageHeight - margin - 10 && tokens.indexOf(token) < tokens.length - 1) {
        addNewPage();
      }
    }
    
    // Save the PDF with the provided filename
    pdf.save(fileName);
    return;
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
