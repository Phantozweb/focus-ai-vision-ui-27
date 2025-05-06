
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { marked } from 'marked';

// Function to render markdown content to HTML
export async function renderMarkdown(markdown: string): Promise<string> {
  return await marked.parse(markdown);
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

// Enhanced version with watermark support
export async function exportMarkdownReportAsPdf(
  elementId: string,
  markdownContent: string,
  svgIconId: string,
  fileName: string = 'report.pdf',
  watermarkText?: string
): Promise<void> {
  try {
    // Get the container and SVG elements
    const exportContainer = document.getElementById(elementId);
    const markdownTarget = exportContainer?.querySelector('#markdownContent');
    const svgElement = document.getElementById(svgIconId);

    if (!exportContainer) {
      throw new Error(`Export container with ID '${elementId}' not found.`);
    }
    if (!markdownTarget) {
      throw new Error(`Markdown target '#markdownContent' not found within #${elementId}.`);
    }
    if (!svgElement && !watermarkText) {
      console.warn(`SVG icon with ID '${svgIconId}' not found, and no watermarkText provided. Watermark will be skipped.`);
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
      // 2. Capture the container with html2canvas
      const canvas = await html2canvas(exportContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      // Restore original display style after capture
      exportContainer.style.display = originalDisplayStyle;
      exportContainer.style.visibility = originalVisibility;

      // 3. Create PDF and add the captured image
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'l' : 'p',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      // 4. Add Watermark (SVG or Text)
      if (svgElement || watermarkText) {
        // Set transparency for watermark
        const opacity = 0.1;
        
        // Save current graphics state
        pdf.saveGraphicsState();
        
        // Set global alpha
        pdf.setGState(pdf.GState({ opacity }));
        
        if (!watermarkText && svgElement instanceof SVGElement) {
          try {
            const svgString = new XMLSerializer().serializeToString(svgElement);
            const svgDataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgString)))}`;

            const watermarkWidth = pdfWidth / 4;
            const aspectRatio = svgElement.viewBox.baseVal.width / svgElement.viewBox.baseVal.height || 1;
            const watermarkHeight = watermarkWidth / aspectRatio;
            const centerX = pdfWidth / 2 - watermarkWidth / 2;
            const centerY = pdfHeight / 2 - watermarkHeight / 2;

            pdf.addImage(svgDataUrl, 'SVG', centerX, centerY, watermarkWidth, watermarkHeight, undefined, 'NONE', 0);
          } catch (svgErr) {
            console.error("Failed to add SVG watermark:", svgErr);
            if (watermarkText) {
              // Fallback to text watermark
              pdf.setFontSize(50);
              pdf.text(watermarkText, pdfWidth / 2, pdfHeight / 2, { align: 'center', angle: 45 });
            }
          }
        } else if (watermarkText) {
          // Text watermark
          pdf.setFontSize(50);
          pdf.setTextColor(0, 0, 0, 0.1);
          pdf.text(watermarkText, pdfWidth / 2, pdfHeight / 2, { align: 'center', angle: 45 });
        }
        
        // Restore previous graphics state
        pdf.restoreGraphicsState();
      }

      // 5. Save the PDF
      pdf.save(fileName);
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
