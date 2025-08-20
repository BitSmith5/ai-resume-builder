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
  Close as CloseIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { ResumeData } from '../../types';
import { DatePicker } from '../DatePicker';
import { useDatePicker } from '../../hooks/useDatePicker';

interface WorkExperienceSectionProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  onDeleteSection: (sectionName: string) => void;
}

export const WorkExperienceSection: React.FC<WorkExperienceSectionProps> = ({
  resumeData,
  setResumeData,
  onDeleteSection,
}) => {
  const { datePickerOpen, datePickerPosition, openDatePicker, closeDatePicker, handleDateSelect } = useDatePicker();
  
  // Removed unused bulletIdCounter variable

  // Clean up any existing duplicate IDs on component mount
  React.useEffect(() => {
    const workExperience = resumeData.workExperience || [];
    let hasChanges = false;
    
    // Check for duplicate IDs and fix them
    const seenIds = new Set<string>();
    const cleanedWorkExperience = workExperience.map(work => {
      // Ensure work entry has unique ID
      let workId = work.id;
      if (!workId || seenIds.has(workId)) {
        workId = `work-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        hasChanges = true;
      }
      seenIds.add(workId);
      
      // Check bullet points for duplicate IDs
      const seenBulletIds = new Set<string>();
      const cleanedBulletPoints = work.bulletPoints.map(bullet => {
        let bulletId = bullet.id;
        if (!bulletId || seenBulletIds.has(bulletId)) {
          bulletId = `bullet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          hasChanges = true;
        }
        seenBulletIds.add(bulletId);
        return { ...bullet, id: bulletId };
      });
      
      return { ...work, id: workId, bulletPoints: cleanedBulletPoints };
    });
    
    // Update data if changes were made
    if (hasChanges) {
      setResumeData(prev => ({
        ...prev,
        workExperience: cleanedWorkExperience
      }));
    }
  }, [resumeData.workExperience, setResumeData]); // Include dependencies

  const addWorkExperience = () => {
    const newWork = {
      id: `work-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      company: "",
      position: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      bulletPoints: []
    };
    
    setResumeData(prev => ({
      ...prev,
      workExperience: [...(prev.workExperience || []), newWork]
    }));
  };

  const updateWorkExperience = (workId: string, updates: Partial<{
    company: string;
    position: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    bulletPoints: Array<{ id: string; description: string }>;
  }>) => {
    setResumeData(prev => ({
      ...prev,
      workExperience: (prev.workExperience || []).map(work =>
        work.id === workId ? { ...work, ...updates } : work
      )
    }));
  };

  const deleteWorkExperience = (workId: string) => {
    setResumeData(prev => ({
      ...prev,
      workExperience: (prev.workExperience || []).filter(work => work.id !== workId)
    }));
  };

  const addBulletPoint = (workId: string, description: string = "") => {
    // Use a combination of timestamp and random string for unique IDs
    const newBulletId = `bullet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newBullet = { id: newBulletId, description: description };
    setResumeData(prev => ({
      ...prev,
      workExperience: (prev.workExperience || []).map(work =>
        work.id === workId ? { ...work, bulletPoints: [...work.bulletPoints, newBullet] } : work
      )
    }));
  };

  const updateBulletPoint = (workId: string, bulletId: string, description: string) => {
    setResumeData(prev => ({
      ...prev,
      workExperience: (prev.workExperience || []).map(work =>
        work.id === workId ? {
          ...work,
          bulletPoints: work.bulletPoints.map(bullet =>
            bullet.id === bulletId ? { ...bullet, description } : bullet
          )
        } : work
      )
    }));
  };

  const deleteBulletPoint = (workId: string, bulletId: string) => {
    setResumeData(prev => ({
      ...prev,
      workExperience: (prev.workExperience || []).map(work =>
        work.id === workId ? {
          ...work,
          bulletPoints: work.bulletPoints.filter(bullet => bullet.id !== bulletId)
        } : work
      )
    }));
  };

  const handleWorkExperienceDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newWorkExperience = Array.from((resumeData.workExperience || []));
    const [removed] = newWorkExperience.splice(result.source.index, 1);
    newWorkExperience.splice(result.destination.index, 0, removed);

    setResumeData(prev => ({ ...prev, workExperience: newWorkExperience }));
  };

  return (
    <Box 
      component="section" 
      aria-labelledby="work-experience-header"
      sx={{ py: 2, }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
        <Typography 
          id="work-experience-header"
          variant="h6" 
          fontWeight={600}
          component="h2"
        >
          Professional Experience
        </Typography>
        <IconButton
          size="small"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDeleteSection('Work Experience');
          }}
          aria-label="Remove Work Experience section from resume"
          aria-describedby="delete-work-section-description"
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

      {/* Work Experience Entries */}
      <DragDropContext onDragEnd={handleWorkExperienceDragEnd}>
        <Droppable droppableId="workExperience" type="work">
          {(provided) => (
            <div 
              ref={provided.innerRef} 
              {...provided.droppableProps} 
              style={{ minHeight: (resumeData.workExperience || []).length === 0 ? 10 : 100 }}
              aria-label="Work experience entries list"
              aria-describedby="work-experience-instructions"
            >
              {(resumeData.workExperience || []).map((work, workIndex) => (
                <React.Fragment key={work.id}>
                  <Draggable draggableId={`work-${work.id}`} index={workIndex}>
                    {(provided) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        data-work-id={work.id}
                        role="article"
                        aria-labelledby={`work-${work.id}-header`}
                        aria-describedby={`work-${work.id}-content`}
                        sx={{ mb: 3, p: 2, mr: 2 }}
                      >
                        {/* Company and Position */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, mt: 1, gap: 2 }}>
                          <Box
                            {...provided.dragHandleProps}
                            role="button"
                            tabIndex={0}
                            aria-label={`Drag to reorder work experience at ${work.company || 'this company'}`}
                            aria-describedby={`drag-work-${work.id}-instructions`}
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
                            value={work.company}
                            onChange={(e) => updateWorkExperience(work.id, { company: e.target.value })}
                            placeholder="Company"
                            variant="outlined"
                            label="Company"
                            size="small"
                            aria-required="true"
                            aria-describedby={`company-help-${work.id}`}
                            inputProps={{
                              'aria-label': 'Company name',
                              'aria-describedby': `company-error-${work.id}`
                            }}
                            sx={{ fontWeight: 600, minWidth: 200 }}
                          />
                          <TextField
                            value={work.position}
                            onChange={(e) => updateWorkExperience(work.id, { position: e.target.value })}
                            placeholder="Position"
                            variant="outlined"
                            label="Position"
                            size="small"
                            aria-required="true"
                            aria-describedby={`position-help-${work.id}`}
                            inputProps={{
                              'aria-label': 'Job position or title',
                              'aria-describedby': `position-error-${work.id}`
                            }}
                            sx={{ minWidth: 400 }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => deleteWorkExperience(work.id)}
                            aria-label={`Delete work experience at ${work.company || 'this company'}`}
                            aria-describedby={`delete-work-${work.id}-description`}
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

                        {/* Location and Dates */}
                        <Box sx={{ display: 'flex', alignItems: 'center', my: 2, ml: 4.5, gap: 2 }}>
                          <TextField
                            value={work.location}
                            onChange={(e) => updateWorkExperience(work.id, { location: e.target.value })}
                            placeholder="Location"
                            variant="outlined"
                            label="Location"
                            size="small"
                            aria-describedby={`location-help-${work.id}`}
                            inputProps={{
                              'aria-label': 'Work location (city, state, or remote)',
                              'aria-describedby': `location-error-${work.id}`
                            }}
                            sx={{ minWidth: 150 }}
                          />
                          <Box sx={{ position: 'relative' }}>
                            <TextField
                              value={work.startDate}
                              placeholder="Start Date"
                              variant="outlined"
                              label="Start Date"
                              size="small"
                              aria-required="true"
                              aria-describedby={`start-date-help-${work.id}`}
                              inputProps={{
                                'aria-label': 'Employment start date',
                                'aria-describedby': `start-date-error-${work.id}`,
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
                                        (date) => updateWorkExperience(work.id, { startDate: date })
                                      );
                                    }}
                                    aria-label={`Select start date for ${work.company || 'this position'}`}
                                    aria-describedby={`start-date-picker-${work.id}`}
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
                              value={work.endDate}
                              placeholder="End Date"
                              variant="outlined"
                              label="End Date"
                              size="small"
                              disabled={work.current}
                              aria-describedby={`end-date-help-${work.id}`}
                              inputProps={{
                                'aria-label': work.current ? 'End date (disabled for current position)' : 'Employment end date',
                                'aria-describedby': `end-date-error-${work.id}`,
                                'aria-haspopup': work.current ? undefined : 'dialog'
                              }}
                              sx={{ width: 150 }}
                              InputProps={{
                                readOnly: true,
                                endAdornment: (
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      if (!work.current) {
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        openDatePicker(
                                          { x: rect.left, y: rect.bottom + 5 },
                                          (date) => updateWorkExperience(work.id, { endDate: date })
                                        );
                                      }
                                    }}
                                    disabled={work.current}
                                    aria-label={work.current ? 'End date picker (disabled for current position)' : `Select end date for ${work.company || 'this position'}`}
                                    aria-describedby={`end-date-picker-${work.id}`}
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
                                checked={work.current}
                                onChange={(e) => updateWorkExperience(work.id, { current: e.target.checked })}
                                aria-label={`Mark ${work.company || 'this position'} as current employment`}
                                aria-describedby={`current-checkbox-${work.id}`}
                              />
                            }
                            label="Current"
                          />
                        </Box>

                        {/* Bullet Points */}
                        <Box sx={{ ml: 3 }}>
                          {work.bulletPoints.map((bullet) => (
                            <Box key={bullet.id} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Typography sx={{ mr: 1, color: 'black', fontSize: '0.875rem' }} aria-hidden="true">•</Typography>
                              <TextField
                                value={bullet.description}
                                onChange={(e) => updateBulletPoint(work.id, bullet.id, e.target.value)}
                                placeholder="Bullet point description..."
                                variant="outlined"
                                size="small"
                                multiline
                                maxRows={3}
                                aria-label={`Bullet point ${bullet.id} for ${work.company || 'this position'}`}
                                aria-describedby={`bullet-help-${bullet.id}`}
                                inputProps={{
                                  'aria-label': `Description for bullet point ${bullet.id}`,
                                  'aria-describedby': `bullet-error-${bullet.id}`
                                }}
                                sx={{ flex: 1 }}
                              />
                              <IconButton
                                size="small"
                                onClick={() => deleteBulletPoint(work.id, bullet.id)}
                                aria-label={`Delete bullet point ${bullet.id}`}
                                aria-describedby={`delete-bullet-${bullet.id}-description`}
                                sx={{ p: 0.5, ml: 1 }}
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          ))}

                          {/* Add Bullet Point Button */}
                          <Button
                            startIcon={<AddIcon />}
                            onClick={() => addBulletPoint(work.id)}
                            variant="text"
                            size="small"
                            aria-label={`Add new bullet point for ${work.company || 'this position'}`}
                            aria-describedby={`add-bullet-${work.id}-description`}
                            sx={{
                              textTransform: 'none',
                              mt: 1,
                              px: 1,
                              color: 'rgb(143, 96, 203)',
                              '&:hover': {
                                backgroundColor: 'transparent',
                              }
                            }}
                          >
                            Add Bullet Point
                          </Button>
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

      {/* Add Work Experience Button */}
      <Button
        startIcon={<AddIcon />}
        onClick={addWorkExperience}
        variant="outlined"
        size="small"
        aria-label="Add new work experience entry"
        aria-describedby="add-work-experience-description"
      >
        Add Work Experience
      </Button>

      {/* DatePicker Component */}
      <DatePicker
        isOpen={datePickerOpen}
        onClose={closeDatePicker}
        onSelect={handleDateSelect}
        position={datePickerPosition}
      />

      {/* Hidden descriptions for screen readers */}
      <div id="delete-work-section-description" className="sr-only">
        Removes the entire Work Experience section from your resume. This action cannot be undone.
      </div>
      <div id="work-experience-instructions" className="sr-only">
        List of work experience entries. Each entry can be reordered using drag and drop, and individual entries can be edited or deleted.
      </div>
      {(resumeData.workExperience || []).map((work) => (
        <React.Fragment key={work.id}>
          <div id={`work-${work.id}-header`} className="sr-only">
            Work experience at {work.company || 'company'} as {work.position || 'position'}
          </div>
          <div id={`work-${work.id}-content`} className="sr-only">
            Work experience details including company, position, location, dates, and bullet points describing responsibilities and achievements.
          </div>
          <div id={`drag-work-${work.id}-instructions`} className="sr-only">
            Click and drag to reorder this work experience entry within the list.
          </div>
          <div id={`delete-work-${work.id}-description`} className="sr-only">
            Removes this work experience entry from your resume. This action cannot be undone.
          </div>
          <div id={`company-help-${work.id}`} className="sr-only">
            Enter the name of the company or organization where you worked.
          </div>
          <div id={`position-help-${work.id}`} className="sr-only">
            Enter your job title or position at this company.
          </div>
          <div id={`location-help-${work.id}`} className="sr-only">
            Enter the city, state, or indicate if the position was remote.
          </div>
          <div id={`start-date-help-${work.id}`} className="sr-only">
            Select the date when you started working at this company.
          </div>
          <div id={`end-date-help-${work.id}`} className="sr-only">
            Select the date when you stopped working at this company, or leave blank if currently employed.
          </div>
          <div id={`current-checkbox-${work.id}`} className="sr-only">
            Check this box if you are currently employed at this company. This will disable the end date field.
          </div>
          <div id={`start-date-picker-${work.id}`} className="sr-only">
            Click to open a date picker for selecting the start date.
          </div>
          <div id={`end-date-picker-${work.id}`} className="sr-only">
            Click to open a date picker for selecting the end date.
          </div>
          <div id={`add-bullet-${work.id}-description`} className="sr-only">
            Adds a new bullet point to describe additional responsibilities or achievements at this position.
          </div>
          {work.bulletPoints.map((bullet) => (
            <React.Fragment key={bullet.id}>
              <div id={`bullet-help-${bullet.id}`} className="sr-only">
                Describe a responsibility, achievement, or skill related to this position.
              </div>
              <div id={`delete-bullet-${bullet.id}-description`} className="sr-only">
                Removes this bullet point from the work experience entry.
              </div>
            </React.Fragment>
          ))}
        </React.Fragment>
      ))}
      <div id="add-work-experience-description" className="sr-only">
        Adds a new work experience entry to your resume. You can then fill in the company, position, dates, and bullet points.
      </div>
    </Box>
  );
};
