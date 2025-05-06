
import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import Header from '@/components/Header';
import PdfExportButton from '@/components/PdfExportButton';
import { SAMPLE_MARKDOWN, renderMarkdown } from '@/utils/pdfExport';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const Index = () => {
  const [markdownContent, setMarkdownContent] = useState<string>(SAMPLE_MARKDOWN);
  const [filename, setFilename] = useState<string>('report');
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [useWatermark, setUseWatermark] = useState<boolean>(false);
  const [watermarkText, setWatermarkText] = useState<string>('CONFIDENTIAL');

  // Update preview when markdown changes
  useEffect(() => {
    const updatePreview = async () => {
      const html = await renderMarkdown(markdownContent);
      setPreviewHtml(html);
    };
    updatePreview();
  }, [markdownContent]);

  // Handle markdown changes
  const handleMarkdownChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setMarkdownContent(newContent);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Report Generator</h1>
          <p className="text-gray-600">Create and export professional reports from markdown content</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Markdown Editor */}
          <Card>
            <CardHeader>
              <CardTitle>Edit Markdown</CardTitle>
              <CardDescription>Write markdown content that will be exported to PDF</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <label htmlFor="filename" className="block text-sm font-medium mb-1">Filename</label>
                <Input 
                  id="filename"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  placeholder="Enter filename (without extension)"
                  className="w-full"
                />
              </div>
              <div className="flex items-center space-x-2 mb-4">
                <Switch 
                  id="use-watermark" 
                  checked={useWatermark}
                  onCheckedChange={setUseWatermark}
                />
                <Label htmlFor="use-watermark">Add watermark</Label>
              </div>
              {useWatermark && (
                <div className="mb-4">
                  <label htmlFor="watermark-text" className="block text-sm font-medium mb-1">Watermark Text</label>
                  <Input 
                    id="watermark-text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    placeholder="Enter watermark text"
                    className="w-full"
                  />
                </div>
              )}
              <Textarea
                value={markdownContent}
                onChange={handleMarkdownChange}
                className="min-h-[400px] font-mono"
                placeholder="Enter your markdown here..."
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <PdfExportButton 
                markdownContent={markdownContent}
                filename={filename}
                useWatermark={useWatermark}
                watermarkText={watermarkText}
                label="Export Report as PDF"
                className="bg-sky-500 hover:bg-sky-600"
              />
            </CardFooter>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>How your report will look when exported</CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                className="markdown-body border rounded p-4 min-h-[400px] bg-white overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Hidden export container that will be converted to PDF */}
      <div id="exportContainer" style={{ display: 'none', padding: '25px', border: '1px solid #eee', backgroundColor: '#fff', width: '850px', fontFamily: 'sans-serif' }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '25px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
          <div id="logoArea" style={{ height: '50px' }}>
            <svg viewBox="0 0 100 100" height="50" width="50" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="45" fill="#4CAF50" />
              <path d="M30 50 L50 70 L70 30" stroke="#ffffff" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1>AI Generated Report</h1>
        </header>

        <section id="markdownContent" className="markdown-body">
          {/* Markdown content will be injected here */}
        </section>

        <footer style={{ marginTop: '30px', textAlign: 'center', fontSize: '0.8em', color: '#aaa' }}>
          <p>Generated by Focus.AI - {new Date().toLocaleDateString()}</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
