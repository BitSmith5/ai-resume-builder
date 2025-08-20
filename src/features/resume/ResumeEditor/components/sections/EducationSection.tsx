import React from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Button,
  Checkbox,
  FormControlLabel,
  Card,
} from '@mui/material';
import {
  DeleteOutline as DeleteOutlineIcon,
  Add as AddIcon,
  DragIndicator as DragIndicatorIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { ResumeData } from '../../types';
import { DatePicker } from '../DatePicker';
import { useDatePicker } from '../../hooks/useDatePicker';

interface EducationSectionProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  onDeleteSection: (sectionName: string) => void;
}

export const EducationSection: React.FC<EducationSectionProps> = ({
  resumeData,
  setResumeData,
  onDeleteSection,
}) => {
  const { datePickerOpen, datePickerPosition, openDatePicker, closeDatePicker, handleDateSelect } = useDatePicker();

  // Clean up any existing duplicate IDs on component mount
  React.useEffect(() => {
    const education = resumeData.education || [];
    let hasChanges = false;
    
    // Check for duplicate IDs and fix them
    const seenIds = new Set<string>();
    const cleanedEducation = education.map(edu => {
      // Ensure education entry has unique ID
      let eduId = edu.id;
      if (!eduId || seenIds.has(eduId)) {
        eduId = `education-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        hasChanges = true;
      }
      seenIds.add(eduId);
      return { ...edu, id: eduId };
    });
    
    // Update data if changes were made
    if (hasChanges) {
      setResumeData(prev => ({
        ...prev,
        education: cleanedEducation
      }));
    }
  }, [resumeData.education, setResumeData]); // Include dependencies

  const addEducation = () => {
    const newEducation = {
      id: `education-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      institution: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
      current: false,
      gpa: undefined
    };
    setResumeData(prev => ({
      ...prev,
      education: [...(prev.education || []), newEducation]
    }));
  };

  const updateEducation = (educationId: string, updates: Partial<{
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    current: boolean;
    gpa?: number;
  }>) => {
    setResumeData(prev => ({
      ...prev,
      education: (prev.education || []).map((edu) =>
        edu.id === educationId ? { ...edu, ...updates } : edu
      )
    }));
  };

  const deleteEducation = (educationId: string) => {
    setResumeData(prev => ({
      ...prev,
      education: (prev.education || []).filter((edu) => edu.id !== educationId)
    }));
  };

  const handleEducationDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newEducation = Array.from((resumeData.education || []));
    const [removed] = newEducation.splice(result.source.index, 1);
    newEducation.splice(result.destination.index, 0, removed);

    setResumeData(prev => ({ ...prev, education: newEducation }));
  };

  return (
    <Box 
      component="section" 
      aria-labelledby="education-header"
      sx={{ py: 2 }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
        <Typography 
          id="education-header"
          variant="h6" 
          fontWeight={600}
          component="h2"
        >
          Education
        </Typography>
        <IconButton
          size="small"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDeleteSection('Education');
          }}
          aria-label="Remove Education section from resume"
          aria-describedby="delete-education-section-description"
          sx={{ 
            border: '1px solid #e0e0e0',
            borderRadius: '50%',
            '&:hover': {
              backgroundColor: '#f5f5f5',
              border: '1px solid #f5f5f5',
              borderRadius: '50%'
            }
          }}
        >
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Education Entries */}
      <DragDropContext onDragEnd={handleEducationDragEnd}>
        <Droppable droppableId="education" type="education">
          {(provided) => (
            <div 
              ref={provided.innerRef} 
              {...provided.droppableProps} 
              style={{ minHeight: (resumeData.education || []).length === 0 ? 10 : 100 }}
              aria-label="Education entries list"
              aria-describedby="education-instructions"
            >
              {(resumeData.education || []).map((education, educationIndex) => (
                <React.Fragment key={education.id}>
                  <Draggable draggableId={`education-${educationIndex}`} index={educationIndex}>
                    {(provided) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        role="article"
                        aria-labelledby={`education-${educationIndex}-header`}
                        aria-describedby={`education-${educationIndex}-content`}
                        sx={{ mb: 3, p: 2, mr: 2 }}
                      >
                        {/* Institution and Degree */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, mt: 1, gap: 2 }}>
                          <Box
                            {...provided.dragHandleProps}
                            role="button"
                            tabIndex={0}
                            aria-label={`Drag to reorder education at ${education.institution || 'this institution'}`}
                            aria-describedby={`drag-education-${educationIndex}-instructions`}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              cursor: 'grab',
                              userSelect: 'none',
                              color: '#bbb',
                              '&:focus': {
                                outline: '2px solid rgb(173, 126, 233)',
                                outlineOffset: '2px',
                              },
                            }}
                          >
                            <DragIndicatorIcon sx={{ fontSize: 20, color: '#a0a0a0' }} />
                          </Box>
                          <TextField
                            value={education.institution}
                            onChange={(e) => updateEducation(education.id, { institution: e.target.value })}
                            placeholder="Institution"
                            variant="outlined"
                            label="Institution"
                            size="small"
                            aria-required="true"
                            aria-describedby={`institution-help-${educationIndex}`}
                            inputProps={{
                              'aria-label': 'Educational institution name',
                              'aria-describedby': `institution-error-${educationIndex}`
                            }}
                            sx={{ minWidth: 200 }}
                          />
                          <TextField
                            value={education.degree}
                            onChange={(e) => updateEducation(education.id, { degree: e.target.value })}
                            placeholder="Degree"
                            variant="outlined"
                            label="Degree"
                            size="small"
                            aria-required="true"
                            aria-describedby={`degree-help-${educationIndex}`}
                            inputProps={{
                              'aria-label': 'Degree type (e.g., Bachelor\'s, Master\'s)',
                              'aria-describedby': `degree-error-${educationIndex}`
                            }}
                            sx={{ minWidth: 150 }}
                          />
                          <TextField
                            value={education.field}
                            onChange={(e) => updateEducation(education.id, { field: e.target.value })}
                            placeholder="Field of Study"
                            variant="outlined"
                            label="Field of Study"
                            size="small"
                            aria-required="true"
                            aria-describedby={`field-help-${educationIndex}`}
                            inputProps={{
                              'aria-label': 'Field or major of study',
                              'aria-describedby': `field-error-${educationIndex}`
                            }}
                            sx={{ minWidth: 200 }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => deleteEducation(education.id)}
                            aria-label={`Delete education at ${education.institution || 'this institution'}`}
                            aria-describedby={`delete-education-${educationIndex}-description`}
                            sx={{
                              border: '1px solid #e0e0e0',
                              borderRadius: '50%',
                              backgroundColor: 'white',
                              '&:hover': {
                                backgroundColor: '#e0e0e0',
                                border: '1px solid #a0a0a0',
                              }
                            }}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Box>

                        {/* Dates and GPA */}
                        <Box sx={{ display: 'flex', alignItems: 'center', my: 2, ml: 4.5, gap: 2 }}>
                          <Box sx={{ position: 'relative' }}>
                            <TextField
                              value={education.startDate}
                              placeholder="Start Date"
                              variant="outlined"
                              label="Start Date"
                              size="small"
                              aria-required="true"
                              aria-describedby={`start-date-help-${educationIndex}`}
                              inputProps={{
                                'aria-label': 'Education start date',
                                'aria-describedby': `start-date-error-${educationIndex}`,
                                'aria-haspopup': 'dialog'
                              }}
                              sx={{ width: 150 }}
                              InputProps={{
                                readOnly: true,
                                endAdornment: (
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      const rect = e.currentTarget.getBoundingClientRect();
                                      openDatePicker(
                                        { x: rect.left, y: rect.bottom + 5 },
                                        (date) => updateEducation(education.id, { startDate: date })
                                      );
                                    }}
                                    aria-label={`Select start date for ${education.institution || 'this education'}`}
                                    aria-describedby={`start-date-picker-${educationIndex}`}
                                    sx={{ p: 0.5 }}
                                  >
                                    <CalendarIcon fontSize="small" />
                                  </IconButton>
                                ),
                              }}
                            />
                          </Box>
                          <Box sx={{ position: 'relative' }}>
                            <TextField
                              value={education.endDate}
                              placeholder="End Date"
                              variant="outlined"
                              label="End Date"
                              size="small"
                              disabled={education.current}
                              aria-describedby={`end-date-help-${educationIndex}`}
                              inputProps={{
                                'aria-label': education.current ? 'End date (disabled for current education)' : 'Education end date',
                                'aria-describedby': `end-date-error-${educationIndex}`,
                                'aria-haspopup': education.current ? undefined : 'dialog'
                              }}
                              sx={{ width: 150 }}
                              InputProps={{
                                readOnly: true,
                                endAdornment: (
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      if (!education.current) {
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        openDatePicker(
                                          { x: rect.left, y: rect.bottom + 5 },
                                          (date) => updateEducation(education.id, { endDate: date })
                                        );
                                      }
                                    }}
                                    disabled={education.current}
                                    aria-label={education.current ? 'End date picker (disabled for current education)' : `Select end date for ${education.institution || 'this education'}`}
                                    aria-describedby={`end-date-picker-${educationIndex}`}
                                    sx={{ p: 0.5 }}
                                  >
                                    <CalendarIcon fontSize="small" />
                                  </IconButton>
                                ),
                              }}
                            />
                          </Box>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={education.current}
                                onChange={(e) => updateEducation(education.id, { current: e.target.checked })}
                                aria-label={`Mark ${education.institution || 'this education'} as current`}
                                aria-describedby={`current-checkbox-${educationIndex}`}
                              />
                            }
                            label="Current"
                          />
                          <TextField
                            value={education.gpa || ''}
                            onChange={(e) => {
                              const gpa = parseFloat(e.target.value);
                              updateEducation(education.id, { gpa: isNaN(gpa) ? undefined : gpa });
                            }}
                            placeholder="GPA (optional)"
                            variant="outlined"
                            label="GPA"
                            size="small"
                            aria-describedby={`gpa-help-${educationIndex}`}
                            inputProps={{ 
                              step: 0.01, 
                              min: 0, 
                              max: 4.0,
                              'aria-label': 'Grade point average (optional)',
                              'aria-describedby': `gpa-error-${educationIndex}`
                            }}
                            sx={{ width: 100 }}
                            type="number"
                          />
                        </Box>
                      </Card>
                    )}
                  </Draggable>
                  {provided.placeholder}
                </React.Fragment>
              ))}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Add Education Button */}
      <Button
        startIcon={<AddIcon />}
        onClick={addEducation}
        variant="outlined"
        size="small"
        aria-label="Add new education entry"
        aria-describedby="add-education-description"
      >
        Add Education
      </Button>

      {/* DatePicker Component */}
      <DatePicker
        isOpen={datePickerOpen}
        onClose={closeDatePicker}
        onSelect={handleDateSelect}
        position={datePickerPosition}
      />

      {/* Hidden descriptions for screen readers */}
      <div id="delete-education-section-description" className="sr-only">
        Removes the entire Education section from your resume. This action cannot be undone.
      </div>
      <div id="education-instructions" className="sr-only">
        List of education entries. Each entry can be reordered using drag and drop, and individual entries can be edited or deleted.
      </div>
      {(resumeData.education || []).map((education, index) => (
        <React.Fragment key={index}>
          <div id={`education-${index}-header`} className="sr-only">
            Education at {education.institution || 'institution'} for {education.degree || 'degree'} in {education.field || 'field of study'}
          </div>
          <div id={`education-${index}-content`} className="sr-only">
            Education details including institution, degree, field of study, dates, and optional GPA.
          </div>
          <div id={`drag-education-${index}-instructions`} className="sr-only">
            Click and drag to reorder this education entry within the list.
          </div>
          <div id={`delete-education-${index}-description`} className="sr-only">
            Removes this education entry from your resume. This action cannot be undone.
          </div>
          <div id={`institution-help-${index}`} className="sr-only">
            Enter the name of the educational institution (university, college, school).
          </div>
          <div id={`degree-help-${index}`} className="sr-only">
            Enter the type of degree (e.g., Bachelor of Science, Master of Arts).
          </div>
          <div id={`field-help-${index}`} className="sr-only">
            Enter your major or field of study (e.g., Computer Science, Business Administration).
          </div>
          <div id={`start-date-help-${index}`} className="sr-only">
            Select the date when you started this educational program.
          </div>
          <div id={`end-date-help-${index}`} className="sr-only">
            Select the date when you completed this educational program, or leave blank if currently enrolled.
          </div>
          <div id={`current-checkbox-${index}`} className="sr-only">
            Check this box if you are currently enrolled in this educational program. This will disable the end date field.
          </div>
          <div id={`start-date-picker-${index}`} className="sr-only">
            Click to open a date picker for selecting the start date.
          </div>
          <div id={`end-date-picker-${index}`} className="sr-only">
            Click to open a date picker for selecting the end date.
          </div>
          <div id={`gpa-help-${index}`} className="sr-only">
            Enter your grade point average if you&apos;d like to include it. This field is optional.
          </div>
        </React.Fragment>
      ))}
      <div id="add-education-description" className="sr-only">
        Adds a new education entry to your resume. You can then fill in the institution, degree, field of study, dates, and optional GPA.
      </div>
    </Box>
  );
};
