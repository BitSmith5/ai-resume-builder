import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Drawer,
  Typography,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  FormControlLabel,
  ToggleButton,
  Button,
  Stack,
  CircularProgress,
  Slider,
  TextField,
} from '@mui/material';
import {
  Close as CloseIcon,
  RestartAlt as RestartAltIcon,
} from '@mui/icons-material';
import { COLORS } from '../../../lib/colorSystem';

interface ExportSettings {
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

interface ExportPanelProps {
  open: boolean;
  onClose: () => void;
  exportSettings: ExportSettings;
  setExportSettings: React.Dispatch<React.SetStateAction<ExportSettings>>;
  resumeId: string;
  resumeData: any;
  onDownloadPDF: () => Promise<void>;
  pdfDownloading: boolean;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({
  open,
  onClose,
  exportSettings,
  setExportSettings,
  resumeId,
  resumeData,
  onDownloadPDF,
  pdfDownloading,
}) => {
  const [exportPanelFullyClosed, setExportPanelFullyClosed] = useState(true);
  const exportPanelFallbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // PDF Preview state
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string>('');

  // Cache for preview results to avoid unnecessary API calls
  const previewCache = useRef<Map<string, string>>(new Map());

  // Create a cache key from export settings
  const getCacheKey = useCallback((): string => {
    return JSON.stringify(exportSettings);
  }, [exportSettings]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (exportPanelFallbackTimeoutRef.current) {
        clearTimeout(exportPanelFallbackTimeoutRef.current);
      }
    };
  }, []);

  // Load PDF preview when export panel opens or settings change
  useEffect(() => {
    if (open && resumeId) {
      // Create AbortController for request cancellation
      const abortController = new AbortController();

      // Check cache first
      const cacheKey = getCacheKey();
      const cachedHtml = previewCache.current.get(cacheKey);

      if (cachedHtml) {
        setPreviewHtml(cachedHtml);
        setPreviewLoading(false);
        setPreviewError('');
        return;
      }

      // Debounce the API call to avoid excessive requests
      const timeoutId = setTimeout(async () => {
        try {
          setPreviewLoading(true);
          setPreviewError('');
          const response = await fetch(`/api/resumes/${resumeId}/pdf-html`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              exportSettings: exportSettings
            }),
            signal: abortController.signal,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate preview');
          }

          const html = await response.text();
          setPreviewHtml(html);
          setPreviewError('');

          // Cache the result
          previewCache.current.set(cacheKey, html);

        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            // Request was cancelled, do nothing
            return;
          }
          console.error('Preview generation error:', error);
          setPreviewError(error instanceof Error ? error.message : 'Failed to generate preview');
        } finally {
          setPreviewLoading(false);
        }
      }, 500); // 500ms debounce

      return () => {
        clearTimeout(timeoutId);
        abortController.abort();
      };
    }
  }, [open, resumeId, getCacheKey, exportSettings]);

  const handleClose = () => {
    onClose();
    // Set a fallback timeout in case onTransitionEnd doesn't fire
    exportPanelFallbackTimeoutRef.current = setTimeout(() => {
      setExportPanelFullyClosed(true);
    }, 300); // 300ms should be enough for the transition
  };

  const handleResetFormatting = () => {
    const currentTemplate = exportSettings.template;

    if (currentTemplate === 'standard') {
      setExportSettings(prev => ({
        ...prev,
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
      }));
    } else if (currentTemplate === 'compact') {
      setExportSettings(prev => ({
        ...prev,
        fontFamily: 'Arial',
        nameSize: 32,
        sectionHeadersSize: 12,
        subHeadersSize: 10,
        bodyTextSize: 10,
        sectionSpacing: 8,
        entrySpacing: 6,
        lineSpacing: 10,
        topBottomMargin: 25,
        sideMargins: 25,
        alignTextLeftRight: false,
      }));
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      onTransitionEnd={() => {
        if (!open) {
          setExportPanelFullyClosed(true);
          // Clear the fallback timeout if it exists
          if (exportPanelFallbackTimeoutRef.current) {
            clearTimeout(exportPanelFallbackTimeoutRef.current);
            exportPanelFallbackTimeoutRef.current = null;
          }
        }
      }}
      sx={{
        '& .MuiDrawer-paper': {
          width: 1170,
          backgroundColor: 'white',
          borderLeft: '1px solid #e0e0e0',
          boxShadow: '-2px 0 8px rgba(0,0,0,0.1)',
          borderTopLeftRadius: 20,
          borderBottomLeftRadius: 20,
        },
      }}
    >
      <Box sx={{ py: 2, px: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
          pb: 2,
          borderBottom: '1px solid #e0e0e0'
        }}>
          <Typography variant="h6" fontWeight={600}>
            Export Resume
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content - Two Column Layout */}
        <Box sx={{ flex: 1, display: 'flex', gap: 3, overflow: 'hidden' }}>
          {/* Left Column - Resume Preview */}
          <Box sx={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            pr: 1,
            // Webkit scrollbar styling - more specific
            '&::-webkit-scrollbar': {
              width: '8px !important',
              backgroundColor: 'transparent !important',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent !important',
              backgroundColor: 'transparent !important',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#cccccc !important',
              backgroundColor: '#cccccc !important',
              borderRadius: '4px !important',
              border: 'none !important',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#aaaaaa !important',
              backgroundColor: '#aaaaaa !important',
            },
            '&::-webkit-scrollbar-button': {
              display: 'none !important',
            },
            '&::-webkit-scrollbar-corner': {
              background: 'transparent !important',
            },
            // Firefox scrollbar styling
            scrollbarWidth: 'thin',
            scrollbarColor: '#cccccc transparent',
          }}>
            {/* Resume Preview */}
            <Box sx={{
              overflowY: 'visible',
              overflowX: 'hidden',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              pb: 2,
            }}>
              {previewLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <CircularProgress />
                </Box>
              ) : previewError ? (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: '100%',
                  color: 'error.main',
                  textAlign: 'center',
                  px: 2
                }}>
                  <Typography variant="body2" color="error">
                    {previewError}
                  </Typography>
                </Box>
              ) : previewHtml ? (
                <Box
                  component="div"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                  sx={{
                    width: '100%',
                    maxWidth: '100%',
                    height: 'auto',
                    minHeight: '100%',
                    margin: 0,
                    padding: 0,
                  }}
                />
              ) : null}
            </Box>
          </Box>

          {/* Right Column - Resume Template Settings */}
          <Box sx={{
            width: '35%',
            overflowY: 'auto',
            px: 0.5,
            // Webkit scrollbar styling
            '&::-webkit-scrollbar': {
              width: '10px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent !important',
              marginLeft: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#cccccc !important',
              borderRadius: '5px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#aaaaaa !important',
            },
            '&::-webkit-scrollbar-button': {
              display: 'block',
              height: '8px',
              border: 'none',
            },
            '&::-webkit-scrollbar-button:hover': {
              // No background
            },
            // Firefox scrollbar styling
            scrollbarWidth: 'thin',
            scrollbarColor: '#cccccc transparent',
          }}>
            {/* Resume Template Section */}
            <Box sx={{
              mb: 4,
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              p: 2,
              backgroundColor: 'white'
            }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Resume Template
              </Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <Select
                  value={exportSettings.pageSize}
                  onChange={(e) => {
                    const newPageSize = e.target.value;
                    setExportSettings(prev => ({
                      ...prev,
                      pageSize: newPageSize,
                      pageWidth: newPageSize === 'letter' ? 850 : 794,
                      pageHeight: newPageSize === 'letter' ? 1100 : 1123,
                    }));
                  }}
                  sx={{
                    height: 33,
                    fontSize: 14,
                    backgroundColor: '#f5f5f5',
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#f5f5f5',
                      '& fieldset': {
                        border: 'none',
                      },
                      '&:hover fieldset': {
                        border: 'none',
                      },
                      '&.Mui-focused fieldset': {
                        border: 'none',
                      },
                      '&.Mui-focused': {
                        border: `2px solid ${COLORS.primary}`,
                        outline: 'none',
                      },
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      border: 'none',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      border: `2px solid ${COLORS.primary} !important`,
                    },
                    '& .MuiMenuItem-root.Mui-selected': {
                      backgroundColor: COLORS.primary,
                      color: 'white',
                      '&:hover': {
                        backgroundColor: COLORS.hover,
                      },
                    },
                  }}
                >
                  <MenuItem value="letter">Letter (8.5" × 11")</MenuItem>
                  <MenuItem value="a4">A4 (210 × 297 mm)</MenuItem>
                </Select>
              </FormControl>

              {/* Template Style Buttons */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Button
                  variant={exportSettings.template === 'standard' ? 'contained' : 'outlined'}
                  onClick={() => setExportSettings(prev => ({ ...prev, template: 'standard' }))}
                  sx={{
                    flex: 1,
                    height: 32,
                    fontSize: 12,
                    textTransform: 'none',
                    borderRadius: 2,
                    backgroundColor: exportSettings.template === 'standard' ? COLORS.primary : 'transparent',
                    color: exportSettings.template === 'standard' ? 'white' : COLORS.primary,
                    borderColor: COLORS.primary,
                    '&:hover': {
                      backgroundColor: exportSettings.template === 'standard' ? COLORS.hover : COLORS.selectedBackground,
                    },
                  }}
                >
                  Standard
                </Button>
                <Button
                  variant={exportSettings.template === 'compact' ? 'contained' : 'outlined'}
                  onClick={() => setExportSettings(prev => ({ ...prev, template: 'compact' }))}
                  sx={{
                    flex: 1,
                    height: 32,
                    fontSize: 12,
                    textTransform: 'none',
                    borderRadius: 2,
                    backgroundColor: exportSettings.template === 'compact' ? COLORS.primary : 'transparent',
                    color: exportSettings.template === 'compact' ? 'white' : COLORS.primary,
                    borderColor: COLORS.primary,
                    '&:hover': {
                      backgroundColor: exportSettings.template === 'compact' ? COLORS.hover : COLORS.selectedBackground,
                    },
                  }}
                >
                  Compact
                </Button>
              </Box>
            </Box>

            {/* Font Settings */}
            <Box sx={{
              mb: 4,
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              p: 2,
              backgroundColor: 'white'
            }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Font Settings
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <Select
                  value={exportSettings.fontFamily}
                  onChange={(e) => setExportSettings(prev => ({ ...prev, fontFamily: e.target.value }))}
                  sx={{
                    height: 33,
                    fontSize: 14,
                    backgroundColor: '#f5f5f5',
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#f5f5f5',
                      '& fieldset': {
                        border: 'none',
                      },
                      '&:hover fieldset': {
                        border: 'none',
                      },
                      '&.Mui-focused fieldset': {
                        border: 'none',
                      },
                      '&.Mui-focused': {
                        border: `2px solid ${COLORS.primary}`,
                        outline: 'none',
                      },
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      border: 'none',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      border: `2px solid ${COLORS.primary} !important`,
                    },
                  }}
                >
                  <MenuItem value="Times New Roman">Times New Roman</MenuItem>
                  <MenuItem value="Arial">Arial</MenuItem>
                  <MenuItem value="Calibri">Calibri</MenuItem>
                  <MenuItem value="Georgia">Georgia</MenuItem>
                  <MenuItem value="Verdana">Verdana</MenuItem>
                </Select>
              </FormControl>

              {/* Font Size Settings */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Name Size: {exportSettings.nameSize}px
                </Typography>
                <TextField
                  type="number"
                  value={exportSettings.nameSize}
                  onChange={(e) => setExportSettings(prev => ({ ...prev, nameSize: Number(e.target.value) }))}
                  inputProps={{ min: 20, max: 60, step: 1 }}
                  sx={{
                    width: '100%',
                    '& .MuiOutlinedInput-root': {
                      height: 33,
                      fontSize: 14,
                      backgroundColor: '#f5f5f5',
                      '& fieldset': {
                        border: 'none',
                      },
                      '&:hover fieldset': {
                        border: 'none',
                      },
                      '&.Mui-focused fieldset': {
                        border: 'none',
                      },
                      '&.Mui-focused': {
                        border: `2px solid ${COLORS.primary}`,
                        outline: 'none',
                      },
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      border: 'none',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      border: `2px solid ${COLORS.primary} !important`,
                    },
                  }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Section Headers: {exportSettings.sectionHeadersSize}px
                </Typography>
                <TextField
                  type="number"
                  value={exportSettings.sectionHeadersSize}
                  onChange={(e) => setExportSettings(prev => ({ ...prev, sectionHeadersSize: Number(e.target.value) }))}
                  inputProps={{ min: 8, max: 20, step: 0.5 }}
                  sx={{
                    width: '100%',
                    '& .MuiOutlinedInput-root': {
                      height: 33,
                      fontSize: 14,
                      backgroundColor: '#f5f5f5',
                      '& fieldset': {
                        border: 'none',
                      },
                      '&:hover fieldset': {
                        border: 'none',
                      },
                      '&.Mui-focused fieldset': {
                        border: 'none',
                      },
                      '&.Mui-focused': {
                        border: `2px solid ${COLORS.primary}`,
                        outline: 'none',
                      },
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      border: 'none',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      border: `2px solid ${COLORS.primary} !important`,
                    },
                  }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Sub Headers: {exportSettings.subHeadersSize}px
                </Typography>
                <TextField
                  type="number"
                  value={exportSettings.subHeadersSize}
                  onChange={(e) => setExportSettings(prev => ({ ...prev, subHeadersSize: Number(e.target.value) }))}
                  inputProps={{ min: 8, max: 16, step: 0.5 }}
                  sx={{
                    width: '100%',
                    '& .MuiOutlinedInput-root': {
                      height: 33,
                      fontSize: 14,
                      backgroundColor: '#f5f5f5',
                      '& fieldset': {
                        border: 'none',
                      },
                      '&:hover fieldset': {
                        border: 'none',
                      },
                      '&.Mui-focused fieldset': {
                        border: 'none',
                      },
                      '&.Mui-focused': {
                        border: `2px solid ${COLORS.primary}`,
                        outline: 'none',
                      },
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      border: 'none',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      border: `2px solid ${COLORS.primary} !important`,
                    },
                  }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Body Text: {exportSettings.bodyTextSize}px
                </Typography>
                <TextField
                  type="number"
                  value={exportSettings.bodyTextSize}
                  onChange={(e) => setExportSettings(prev => ({ ...prev, bodyTextSize: Number(e.target.value) }))}
                  inputProps={{ min: 8, max: 16, step: 0.5 }}
                  sx={{
                    width: '100%',
                    '& .MuiOutlinedInput-root': {
                      height: 33,
                      fontSize: 14,
                      backgroundColor: '#f5f5f5',
                      '& fieldset': {
                        border: 'none',
                      },
                      '&:hover fieldset': {
                        border: 'none',
                      },
                      '&.Mui-focused fieldset': {
                        border: 'none',
                      },
                      '&.Mui-focused': {
                        border: `2px solid ${COLORS.primary}`,
                        outline: 'none',
                      },
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      border: 'none',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      border: `2px solid ${COLORS.primary} !important`,
                    },
                  }}
                />
              </Box>
            </Box>

            {/* Spacing Settings */}
            <Box sx={{
              mb: 4,
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              p: 2,
              backgroundColor: 'white'
            }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Spacing Settings
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Section Spacing: {exportSettings.sectionSpacing}px
                </Typography>
                <Slider
                  value={exportSettings.sectionSpacing}
                  onChange={(_, value) => setExportSettings(prev => ({ ...prev, sectionSpacing: value as number }))}
                  min={6}
                  max={20}
                  step={1}
                  sx={{
                    '& .MuiSlider-thumb': {
                      width: 16,
                      height: 16,
                      backgroundColor: COLORS.primary,
                      border: '2px solid white',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      '&:hover': {
                        backgroundColor: COLORS.hover,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                      },
                      '&:active': {
                        backgroundColor: 'white',
                        boxShadow: 'none',
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '6px',
                        height: '6px',
                        backgroundColor: 'black',
                        borderRadius: '50%',
                      },
                    },
                    '& .MuiSlider-track': {
                      backgroundColor: COLORS.primary,
                      border: 'none',
                    },
                    '& .MuiSlider-rail': {
                      backgroundColor: '#e0e0e0',
                    },
                    '& .MuiSlider-valueLabel': {
                      borderRadius: '8px',
                      padding: '4px 6px',
                      backgroundColor: 'black',
                    },
                  }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Entry Spacing: {exportSettings.entrySpacing}px
                </Typography>
                <Slider
                  value={exportSettings.entrySpacing}
                  onChange={(_, value) => setExportSettings(prev => ({ ...prev, entrySpacing: value as number }))}
                  min={4}
                  max={16}
                  step={1}
                  sx={{
                    '& .MuiSlider-thumb': {
                      width: 16,
                      height: 16,
                      backgroundColor: COLORS.primary,
                      border: '2px solid white',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      '&:hover': {
                        backgroundColor: COLORS.hover,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                      },
                      '&:active': {
                        backgroundColor: 'white',
                        boxShadow: 'none',
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '6px',
                        height: '6px',
                        backgroundColor: 'black',
                        borderRadius: '50%',
                      },
                    },
                    '& .MuiSlider-track': {
                      backgroundColor: COLORS.primary,
                      border: 'none',
                    },
                    '& .MuiSlider-rail': {
                      backgroundColor: '#e0e0e0',
                    },
                    '& .MuiSlider-valueLabel': {
                      borderRadius: '8px',
                      padding: '4px 6px',
                      backgroundColor: 'black',
                    },
                  }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Line Spacing: {exportSettings.lineSpacing}px
                </Typography>
                <Slider
                  value={exportSettings.lineSpacing}
                  onChange={(_, value) => setExportSettings(prev => ({ ...prev, lineSpacing: value as number }))}
                  min={8}
                  max={20}
                  step={1}
                  sx={{
                    '& .MuiSlider-thumb': {
                      width: 16,
                      height: 16,
                      backgroundColor: COLORS.primary,
                      border: '2px solid white',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      '&:hover': {
                        backgroundColor: COLORS.hover,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                      },
                      '&:active': {
                        backgroundColor: 'white',
                        boxShadow: 'none',
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '6px',
                        height: '6px',
                        backgroundColor: 'black',
                        borderRadius: '50%',
                      },
                    },
                    '& .MuiSlider-track': {
                      backgroundColor: COLORS.primary,
                      border: 'none',
                    },
                    '& .MuiSlider-rail': {
                      backgroundColor: '#e0e0e0',
                    },
                    '& .MuiSlider-valueLabel': {
                      borderRadius: '8px',
                      padding: '4px 6px',
                      backgroundColor: 'black',
                    },
                  }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Top/Bottom Margin: {exportSettings.topBottomMargin}px
                </Typography>
                <Slider
                  value={exportSettings.topBottomMargin}
                  onChange={(_, value) => setExportSettings(prev => ({ ...prev, topBottomMargin: value as number }))}
                  min={20}
                  max={50}
                  step={1}
                  sx={{
                    '& .MuiSlider-thumb': {
                      width: 16,
                      height: 16,
                      backgroundColor: COLORS.primary,
                      border: '2px solid white',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      '&:hover': {
                        backgroundColor: COLORS.hover,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                      },
                      '&:active': {
                        backgroundColor: 'white',
                        boxShadow: 'none',
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '6px',
                        height: '6px',
                        backgroundColor: 'black',
                        borderRadius: '50%',
                      },
                    },
                    '& .MuiSlider-track': {
                      backgroundColor: COLORS.primary,
                      border: 'none',
                    },
                    '& .MuiSlider-rail': {
                      backgroundColor: '#e0e0e0',
                    },
                    '& .MuiSlider-valueLabel': {
                      borderRadius: '8px',
                      padding: '4px 6px',
                      backgroundColor: 'black',
                    },
                  }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Side Margins: {exportSettings.sideMargins}px
                </Typography>
                <Slider
                  value={exportSettings.sideMargins}
                  onChange={(_, value) => setExportSettings(prev => ({ ...prev, sideMargins: value as number }))}
                  min={20}
                  max={50}
                  step={1}
                  sx={{
                    '& .MuiSlider-thumb': {
                      width: 16,
                      height: 16,
                      backgroundColor: COLORS.primary,
                      border: '2px solid white',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      '&:hover': {
                        backgroundColor: COLORS.hover,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                      },
                      '&:active': {
                        backgroundColor: 'white',
                        boxShadow: 'none',
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '6px',
                        height: '6px',
                        backgroundColor: 'black',
                        borderRadius: '50%',
                      },
                    },
                    '& .MuiSlider-track': {
                      backgroundColor: COLORS.primary,
                      border: 'none',
                    },
                    '& .MuiSlider-rail': {
                      backgroundColor: '#e0e0e0',
                    },
                    '& .MuiSlider-valueLabel': {
                      borderRadius: '8px',
                      padding: '4px 6px',
                      backgroundColor: 'black',
                    },
                  }}
                />
              </Box>

              <FormControlLabel
                control={
                  <ToggleButton
                    value="align"
                    selected={exportSettings.alignTextLeftRight}
                    onChange={() => setExportSettings(prev => ({ ...prev, alignTextLeftRight: !prev.alignTextLeftRight }))}
                    sx={{
                      mr: -1,
                      width: 50,
                      height: 24,
                      borderRadius: '20px',
                      border: 'none',
                      backgroundColor: exportSettings.alignTextLeftRight ? COLORS.primary : '#e0e0e0',
                      '&.Mui-selected': {
                        backgroundColor: COLORS.primary,
                      },
                      '&:hover': {
                        backgroundColor: '#e0e0e0',
                      },
                      '&.Mui-selected:hover': {
                        backgroundColor: COLORS.primaryLight,
                      },
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: '3px',
                        left: exportSettings.alignTextLeftRight ? 'calc(100% - 21px)' : '3px',
                        width: 18,
                        height: 18,
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        transition: 'left 0.2s ease',
                      },
                    }}
                  />
                }
                label="Align Text Left & Right"
                labelPlacement="start"
                sx={{
                  justifyContent: 'space-between',
                  width: '100%',
                  ml: 0,
                  '& .MuiFormControlLabel-label': {
                    fontSize: '0.875rem'
                  }
                }}
              />
            </Box>

            {/* Reset Formatting Button */}
            <Box sx={{ mb: 4 }}>
              <Button
                variant="outlined"
                onClick={handleResetFormatting}
                fullWidth
                startIcon={<RestartAltIcon />}
                sx={{
                  borderRadius: 2,
                  border: '1px solid #e0e0e0',
                  color: '#666',
                  textTransform: 'none',
                  py: 1,
                }}
              >
                Reset formatting
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Footer - Download Buttons */}
        <Stack direction="row" spacing={2} justifyContent="center" sx={{ pt: 2, borderTop: '1px solid #e0e0e0' }}>
          <Button
            variant="contained"
            onClick={onDownloadPDF}
            disabled={pdfDownloading}
            startIcon={pdfDownloading ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{
              borderRadius: 6,
              backgroundColor: '#000',
              color: 'white',
              textTransform: 'none',
              fontSize: 16,
              boxShadow: 'none',
              '&:disabled': {
                backgroundColor: '#666',
                color: 'white',
              },
            }}
          >
            {pdfDownloading ? 'Generating PDF...' : 'Download by PDF'}
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
};
