import { useState, useRef, useCallback } from 'react';

export interface ExportSettings {
  template: string;
  pageSize: string;
  fontFamily: string;
  nameSize: number;
  sectionHeadersSize: number;
  subHeadersSize: number;
  bodyTextSize: number;
  sectionSpacing: number;
  entrySpacing: number;
  lineSpacing: number;
  topBottomMargin: number;
  sideMargins: number;
  alignTextLeftRight: boolean;
  pageWidth: number;
  pageHeight: number;
}

export const useExportSettings = (resumeId?: string, resumeTitle?: string) => {
  // Export panel state
  const [exportPanelOpen, setExportPanelOpen] = useState(false);
  const [pdfDownloading, setPdfDownloading] = useState(false);
  
  // Fallback timeout ref for export panel transitions
  const exportPanelFallbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Default export settings
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    template: 'standard',
    pageSize: 'letter',
    fontFamily: 'Times New Roman',
    nameSize: 40,
    sectionHeadersSize: 14,
    subHeadersSize: 10.5,
    bodyTextSize: 11,
    sectionSpacing: 12,
    entrySpacing: 9,
    lineSpacing: 12,
    topBottomMargin: 33,
    sideMargins: 33,
    alignTextLeftRight: false,
    pageWidth: 850,
    pageHeight: 1100,
  });

  // Export panel handlers
  const handleExportClick = useCallback(() => {
    setExportPanelOpen(true);
  }, []);

  const handleExportClose = useCallback(() => {
    setExportPanelOpen(false);
    // Set a fallback timeout in case onTransitionEnd doesn't fire
    exportPanelFallbackTimeoutRef.current = setTimeout(() => {
      // Fallback timeout for transition end
    }, 300); // 300ms should be enough for the transition
  }, []);

  // PDF download handler
  const handleDownloadPDF = useCallback(async (onSuccess?: (message: string) => void, onError?: (message: string) => void) => {
    if (!resumeId) {
      console.error('No resume ID available for PDF download');
      return;
    }

    try {
      console.log('🎯 Starting PDF download with export settings for resume:', resumeId);
      console.log('🎯 Export settings:', exportSettings);

      // Show loading state
      setPdfDownloading(true);

      // Use the same export settings for PDF as preview - NO SCALING
      const pdfExportSettings = {
        ...exportSettings
      };

      console.log('🎯 PDF export settings (scaled):', pdfExportSettings);

      // Call the unified PDF generation API
      const response = await fetch(`/api/resumes/${resumeId}/pdf-html`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exportSettings: pdfExportSettings,
          generatePdf: true
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('🎯 PDF generation error response:', errorData);
        throw new Error(errorData.error || errorData.details || 'Failed to generate PDF');
      }

      // Get the PDF blob
      const pdfBlob = await response.blob();

      // Create a download link
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${resumeTitle || 'resume'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Show success message
      const successMessage = 'PDF downloaded successfully!';
      onSuccess?.(successMessage);

      // Close the export panel
      setExportPanelOpen(false);

      console.log('🎯 PDF download completed successfully');

    } catch (error) {
      console.error('🎯 PDF download error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to download PDF';
      onError?.(errorMessage);
    } finally {
      setPdfDownloading(false);
    }
  }, [resumeId, exportSettings, resumeTitle, setExportPanelOpen]);

  // Cleanup function for timeouts
  const cleanup = useCallback(() => {
    if (exportPanelFallbackTimeoutRef.current) {
      clearTimeout(exportPanelFallbackTimeoutRef.current);
    }
  }, []);

  return {
    // State
    exportPanelOpen,
    pdfDownloading,
    exportSettings,
    
    // Setters
    setExportPanelOpen,
    setExportSettings,
    
    // Handlers
    handleExportClick,
    handleExportClose,
    handleDownloadPDF,
    
    // Cleanup
    cleanup,
  };
};
