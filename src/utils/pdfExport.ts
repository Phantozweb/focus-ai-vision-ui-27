
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { marked } from 'marked';

// Function to render markdown content to HTML
export function renderMarkdown(markdown: string): string {
  return marked.parse(markdown);
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
        contentContainer.innerHTML = renderMarkdown(markdownContent);
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
      orientation: imgHeight > pageHeight ? 'portrait' : 'portrait',
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

// Sample markdown content for testing
export const SAMPLE_MARKDOWN = `
# Sample Report Title

## Introduction
This is a sample report generated with markdown. It demonstrates various formatting options.

## Features
- **Bold text** and *italic text*
- Lists (like this one)
- Code blocks
- Tables
- And more!

## Table Example

| Name | Email | Role |
|------|-------|------|
| John Doe | john@example.com | Administrator |
| Jane Smith | jane@example.com | Editor |
| Bob Johnson | bob@example.com | Viewer |

## Code Example

\`\`\`javascript
// This is a code block
function sayHello() {
  console.log("Hello, world!");
}
\`\`\`

## Conclusion

Thank you for reviewing this sample report. For more information, visit [our website](https://example.com).
`;
