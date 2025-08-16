import React from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Card,
} from '@mui/material';
import {
  Add as AddIcon,
  DeleteOutline as DeleteOutlineIcon,
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
          <DeleteOutlineIcon fontSize="small" />
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
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        sx={{ mb: 3, p: 2, mr: 2 }}
                      >
                        {/* Course Header with Drag Handle */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 2 }}>
                          <Box
                            {...provided.dragHandleProps}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              cursor: 'grab',
                              userSelect: 'none',
                              color: '#bbb',
                            }}
                          >
                            <DragIndicatorIcon sx={{ fontSize: 20 }} />
                          </Box>
                          <TextField
                            value={course.title || ''}
                            onChange={(e) => updateCourse(courseIndex, { title: e.target.value })}
                            placeholder="Course Title..."
                            variant="outlined"
                            label="Course Title"
                            size="small"
                            sx={{ width: 400 }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => deleteCourse(courseIndex)}
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

                        {/* Course Details */}
                        <Box sx={{ ml: 4.5, mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <TextField
                            value={course.provider || ''}
                            onChange={(e) => updateCourse(courseIndex, { provider: e.target.value })}
                            placeholder="Provider (e.g., Udemy, Coursera)..."
                            variant="outlined"
                            label="Provider"
                            size="small"
                            sx={{ width: 400 }}
                          />
                          <TextField
                            value={course.link || ''}
                            onChange={(e) => updateCourse(courseIndex, { link: e.target.value })}
                            placeholder="Course Link (optional)..."
                            variant="outlined"
                            label="Course Link"
                            size="small"
                            sx={{ width: 600 }}
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

      <Box sx={{ mt: 2 }}>
        <Button
          startIcon={<AddIcon />}
          onClick={addCourse}
          variant="outlined"
          size="small"
        >
          Add Course
        </Button>
      </Box>
    </Box>
  );
};
