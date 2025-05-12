
/**
 * Utility functions for downloading content in different formats
 */

/**
 * Download content as a markdown file
 * @param content - The content to download
 * @param filename - The name of the file (without extension)
 * @param heading - Optional heading for the markdown file
 */
export const downloadAsMarkdown = (content: string, filename: string, heading?: string): void => {
  // Add heading if provided
  const contentWithHeading = heading ? 
    `# ${heading}\n\n${content}` : 
    content;
    
  const blob = new Blob([contentWithHeading], { type: 'text/markdown' });
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
 * Format the current date as YYYY-MM-DD
 */
export const getFormattedDate = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
