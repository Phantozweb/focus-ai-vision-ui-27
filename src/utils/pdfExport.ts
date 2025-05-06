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

// Enhanced version without watermark text
export async function exportMarkdownReportAsPdf(
  elementId: string,
  markdownContent: string,
  svgIconId: string,
  fileName: string = 'report.pdf'
): Promise<void> {
  try {
    // Get the container and SVG elements
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
      
      // Use A4 format for better standardization
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 10; // mm
      
      // Calculate content dimensions to fit on A4 with margins
      const contentWidth = pdfWidth - (margin * 2);
      const aspectRatio = canvas.width / canvas.height;
      const contentHeight = contentWidth / aspectRatio;
      
      // Add image to first page - no blank space
      pdf.addImage(
        imgData, 
        'PNG', 
        margin, 
        margin, 
        contentWidth, 
        contentHeight
      );
      
      // If content exceeds page height, create additional pages
      if (contentHeight > pdfHeight - (margin * 2)) {
        // Calculate scale factor to fit on first page
        const scaleFactor = (pdfHeight - (margin * 2)) / contentHeight;
        const scaledWidth = contentWidth * scaleFactor;
        const scaledHeight = contentHeight * scaleFactor;
        
        // Clear page and redraw with scaled dimensions
        pdf.deletePage(1);
        pdf.addPage();
        
        pdf.addImage(
          imgData, 
          'PNG', 
          margin, 
          margin, 
          scaledWidth, 
          scaledHeight
        );
        
        // Add page number
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Page 1`, pdfWidth - 25, pdfHeight - 10);
      }
      
      // Add small Focus.AI footer on last page
      const lastPage = pdf.getNumberOfPages();
      pdf.setPage(lastPage);
      
      // Add footer text
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Generated by Focus.AI', pdfWidth/2, pdfHeight - 10, { align: 'center' });
      
      // Save the PDF
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

// Keep the rest of the code unchanged
// ... keep existing code (SAMPLE_MARKDOWN constant and any other utility functions)
