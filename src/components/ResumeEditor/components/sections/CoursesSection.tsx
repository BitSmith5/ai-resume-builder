import React from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIndicatorIcon,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { ResumeData } from '../../types';

interface CoursesSectionProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  onDeleteSection: (sectionName: string) => void;
}

export const CoursesSection: React.FC<CoursesSectionProps> = ({
  resumeData,
  setResumeData,
  onDeleteSection,
}) => {
  // Initialize courses if not exists
  const courses = resumeData.courses || [
    {
      title: "Advanced React Development",
      provider: "Udemy",
      link: "https://udemy.com/course/advanced-react",
    }
  ];

  const addCourse = () => {
    const newCourse = {
      title: "",
      provider: "",
      link: "",
    };
    setResumeData(prev => ({
      ...prev,
      courses: [...(prev.courses || courses), newCourse]
    }));
  };

  const updateCourse = (index: number, updates: Partial<{
    title: string;
    provider: string;
    link?: string;
  }>) => {
    setResumeData(prev => ({
      ...prev,
      courses: (prev.courses || courses).map((course, i) =>
        i === index ? { ...course, ...updates } : course
      )
    }));
  };

  const deleteCourse = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      courses: (prev.courses || courses).filter((_, i) => i !== index)
    }));
  };

  const handleCourseDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newCourses = Array.from((resumeData.courses || courses));
    const [removed] = newCourses.splice(result.source.index, 1);
    newCourses.splice(result.destination.index, 0, removed);

    setResumeData(prev => ({ ...prev, courses: newCourses }));
  };

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          Courses & Certifications
        </Typography>
        <IconButton
          size="small"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();

            onDeleteSection('Courses');
          }}
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
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>

      <DragDropContext onDragEnd={handleCourseDragEnd}>
        <Droppable droppableId="courses" type="course">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} style={{ minHeight: (resumeData.courses || courses).length === 0 ? 10 : 100 }}>
              {(resumeData.courses || courses).map((course, courseIndex) => (
                <React.Fragment key={courseIndex}>
                  <Draggable draggableId={`course-${courseIndex}`} index={courseIndex}>
                    {(provided) => (
                      <Box
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        sx={{
                          mb: 3,
                          background: 'transparent',
                          p: 2,
                          ml: -5.5,
                        }}
                      >
                        {/* Course Header with Drag Handle */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, width: 300 }}>
                          <Box
                            {...provided.dragHandleProps}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              cursor: 'grab',
                              userSelect: 'none',
                              color: '#bbb',
                              mr: 0.5,
                            }}
                          >
                            <DragIndicatorIcon sx={{ fontSize: 20 }} />
                          </Box>
                          <TextField
                            value={course.title || ''}
                            onChange={(e) => updateCourse(courseIndex, { title: e.target.value })}
                            placeholder="Course Title..."
                            variant="standard"
                            sx={{
                              fontWeight: 600,
                              px: 1,
                              mr: 1,
                              borderRadius: 2,
                              backgroundColor: (course.title && course.title.trim()) ? 'transparent' : '#f5f5f5',
                              '&:hover': {
                                backgroundColor: '#f5f5f5',
                              }
                            }}
                            InputProps={{
                              style: { fontWeight: 600, fontSize: '1rem' },
                              disableUnderline: true,
                            }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => deleteCourse(courseIndex)}
                            sx={{
                              color: '#999',
                              '&:hover': { color: '#d32f2f' },
                              ml: 'auto'
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>

                        {/* Course Details */}
                        <Box sx={{ ml: 6, display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <TextField
                            value={course.provider || ''}
                            onChange={(e) => updateCourse(courseIndex, { provider: e.target.value })}
                            placeholder="Provider (e.g., Udemy, Coursera)..."
                            variant="standard"
                            sx={{
                              px: 1,
                              borderRadius: 2,
                              backgroundColor: (course.provider && course.provider.trim()) ? 'transparent' : '#f5f5f5',
                              '&:hover': {
                                backgroundColor: '#f5f5f5',
                              }
                            }}
                            InputProps={{
                              disableUnderline: true,
                            }}
                          />
                          <TextField
                            value={course.link || ''}
                            onChange={(e) => updateCourse(courseIndex, { link: e.target.value })}
                            placeholder="Course Link (optional)..."
                            variant="standard"
                            sx={{
                              px: 1,
                              borderRadius: 2,
                              backgroundColor: (course.link && course.link.trim()) ? 'transparent' : '#f5f5f5',
                              '&:hover': {
                                backgroundColor: '#f5f5f5',
                              }
                            }}
                            InputProps={{
                              disableUnderline: true,
                            }}
                          />
                        </Box>
                      </Box>
                    )}
                  </Draggable>
                  {provided.placeholder}
                </React.Fragment>
              ))}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <Box sx={{ ml: 6, mt: 2 }}>
        <Button
          startIcon={<AddIcon />}
          onClick={addCourse}
          variant="outlined"
          size="small"
          sx={{
            borderColor: '#ddd',
            color: '#666',
            '&:hover': {
              borderColor: '#999',
              backgroundColor: '#f5f5f5'
            }
          }}
        >
          Add Course
        </Button>
      </Box>
    </Box>
  );
};
