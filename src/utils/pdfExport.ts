import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { marked } from 'marked';

// Function to render markdown content to HTML
export async function renderMarkdown(markdown: string): Promise<string> {
  return await marked.parse(markdown);
}

// Enhanced version that properly converts HTML to PDF
export async function exportMarkdownReportAsPdf(
  elementId: string,
  markdownContent: string,
  svgIconId: string,
  fileName: string = 'report.pdf'
): Promise<void> {
  try {
    // Get the container and prepare it for export
    const exportContainer = document.getElementById(elementId);
    const markdownTarget = exportContainer?.querySelector('#markdownContent');

    if (!exportContainer) {
      throw new Error(`Export container with ID '${elementId}' not found.`);
    }
    
    if (!markdownTarget) {
      throw new Error(`Markdown target '#markdownContent' not found within #${elementId}.`);
    }

    // 1. Parse Markdown and inject into the container
    try {
      const htmlContent = await marked.parse(markdownContent);
      markdownTarget.innerHTML = htmlContent;
    } catch (error) {
      console.error('Error parsing Markdown:', error);
      markdownTarget.innerHTML = '<p>Error loading content.</p>';
    }

    // Store original display style and make container visible for capture
    const originalDisplayStyle = exportContainer.style.display;
    const originalVisibility = exportContainer.style.visibility;
    exportContainer.style.display = 'block';
    exportContainer.style.visibility = 'visible';

    // Allow rendering time after DOM update
    await new Promise(resolve => setTimeout(resolve, 150));

    try {
      // 2. Capture the container with html2canvas with better settings
      const canvas = await html2canvas(exportContainer, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        allowTaint: true,
        scrollY: -window.scrollY, // Handle scrolling positions
        windowWidth: document.documentElement.offsetWidth,
        windowHeight: document.documentElement.offsetHeight,
        onclone: (clonedDoc) => {
          // Styles for the cloned document to ensure proper rendering
          const clonedElement = clonedDoc.getElementById(elementId);
          if (clonedElement) {
            clonedElement.style.display = 'block';
            clonedElement.style.visibility = 'visible';
            clonedElement.style.position = 'relative';
            clonedElement.style.width = '800px';
            clonedElement.style.margin = '0';
            clonedElement.style.padding = '20px';
            
            // Additional styles for better table rendering
            Array.from(clonedElement.querySelectorAll('table')).forEach(table => {
              table.style.width = '100%';
              table.style.borderCollapse = 'collapse';
              table.style.margin = '10px 0';
            });
            
            Array.from(clonedElement.querySelectorAll('th')).forEach(th => {
              th.style.backgroundColor = '#f0f8ff';
              th.style.padding = '8px';
              th.style.borderBottom = '1px solid #ddd';
              th.style.textAlign = 'left';
            });
            
            Array.from(clonedElement.querySelectorAll('td')).forEach(td => {
              td.style.padding = '8px';
              td.style.borderBottom = '1px solid #eee';
            });
          }
        }
      });

      // Restore original display style after capture
      exportContainer.style.display = originalDisplayStyle;
      exportContainer.style.visibility = originalVisibility;

      // 3. Create PDF with proper dimensions
      const imgData = canvas.toDataURL('image/png');
      
      // Use A4 format for better standardization
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 10; // mm
      
      // Calculate content dimensions to fit on A4 without margins
      const contentWidth = pdfWidth - (margin * 2);
      const aspectRatio = canvas.width / canvas.height;
      const contentHeight = contentWidth / aspectRatio;
      
      // Add image to first page with 0 position to avoid blank space
      pdf.addImage(
        imgData, 
        'PNG', 
        margin, 
        0, // Start from the very top - no blank space
        contentWidth, 
        contentHeight
      );
      
      // If content exceeds page height, create additional pages
      if (contentHeight > pdfHeight - margin) {
        let heightLeft = contentHeight;
        let position = 0;
        let page = 1;
        
        position = -pdfHeight; // Start position for second page
        
        while (heightLeft > 0) {
          // Add new page
          pdf.addPage();
          page++;
          
          // Add the same image but position it differently to show the next portion
          pdf.addImage(
            imgData, 
            'PNG', 
            margin, 
            position, 
            contentWidth, 
            contentHeight
          );
          
          // Reduce heightLeft and increase negative position
          heightLeft -= (pdfHeight - margin);
          position -= pdfHeight;
          
          // Add page number
          pdf.setFontSize(8);
          pdf.setTextColor(100, 100, 100);
          pdf.text(`Page ${page}`, pdfWidth - 25, pdfHeight - 10);
        }
      }
      
      // Add minimal Focus.AI footer on last page
      const lastPage = pdf.getNumberOfPages();
      pdf.setPage(lastPage);
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Generated by Focus.AI', pdfWidth/2, pdfHeight - 10, { align: 'center' });
      
      // Save the PDF
      pdf.save(fileName + '.pdf');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      exportContainer.style.display = originalDisplayStyle;
      exportContainer.style.visibility = originalVisibility;
      throw error;
    }
  } catch (error) {
    console.error('PDF Export error:', error);
    throw error;
  }
}

// Function to export a container element to PDF
export async function exportToPDF(
  containerId: string, 
  filename: string = 'report',
  markdownContent?: string
): Promise<void> {
  try {
    // Get the container element
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container element with ID "${containerId}" not found`);
    }

    // If markdown content is provided, inject it into the markdownContent section
    if (markdownContent) {
      const contentContainer = container.querySelector('#markdownContent');
      if (contentContainer) {
        contentContainer.innerHTML = await renderMarkdown(markdownContent);
      }
    }

    // Make container visible for capturing (if it was hidden)
    const originalDisplay = container.style.display;
    container.style.display = 'block';

    // Wait for any images to load
    await new Promise(resolve => setTimeout(resolve, 100));

    // Create canvas from the container
    const canvas = await html2canvas(container, {
      scale: 2, // Higher scale for better quality
      useCORS: true, // Allow cross-origin images
      logging: false,
      onclone: (clonedDoc) => {
        // Any modifications to the cloned document before rendering
        const clonedElement = clonedDoc.getElementById(containerId);
        if (clonedElement) {
          clonedElement.style.display = 'block';
          clonedElement.style.width = '850px'; // Match the container width
        }
      }
    });

    // Calculate PDF dimensions based on container aspect ratio
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210; // A4 width in mm (210 mm)
    const pageHeight = 297; // A4 height in mm (297 mm)
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Create PDF document
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Add image to PDF (the report)
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

    // Handle multi-page content
    let heightLeft = imgHeight;
    let position = 0;

    // Remove the first page that was automatically added
    if (heightLeft < pageHeight) {
      // Save the PDF if it fits on one page
      pdf.save(`${filename}.pdf`);
    } else {
      // Create multiple pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save(`${filename}.pdf`);
    }

    // Restore original display state
    container.style.display = originalDisplay;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

// SAMPLE_MARKDOWN constant and any other utility functions
const SAMPLE_MARKDOWN = `
# Sample Markdown Content

This is a sample markdown content for testing PDF export functionality.

## Lists

- Item 1
- Item 2
- Item 3

## Table

| Header 1 | Header 2 |
| -------- | -------- |
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |

## Links

[Link to Google](https://www.google.com)

## Inline Code

Inline code: \`code\`

## Code Block

\`\`\`javascript
function helloWorld() {
  console.log("Hello, World!");
}
\`\`\`
`;
