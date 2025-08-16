import React from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Chip,
  FormControl,
  Select,
  MenuItem,
  Card,
} from '@mui/material';
import {
  Add as AddIcon,
  DeleteOutline as DeleteOutlineIcon,
  DragIndicator as DragIndicatorIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  CalendarToday as CalendarIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { ResumeData } from '../../types';
import { DatePicker } from '../DatePicker';
import { useDatePicker } from '../../hooks/useDatePicker';
import { themeColors } from '@/lib/theme';

interface ProjectsSectionProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  onDeleteSection: (sectionName: string) => void;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  resumeData,
  setResumeData,
  onDeleteSection,
}) => {
  const { datePickerOpen, datePickerPosition, openDatePicker, closeDatePicker, handleDateSelect } = useDatePicker();


  // Initialize projects if not exists
  const projects = resumeData.projects || [
    {
      id: `project-${Date.now()}`,
      title: "AI Resume Builder",
      bulletPoints: [
        {
          id: `bullet-${Date.now()}-${Math.random()}`,
          description: "A modern web application for creating professional resumes with AI assistance"
        }
      ],
      technologies: ["React", "TypeScript", "Node.js"],
      link: "https://github.com/username/ai-resume-builder",
      startDate: "Jan 2024",
      endDate: "Mar 2024",
      current: false,
    }
  ];

  const addProject = () => {
    const newProject = {
      id: `project-${Date.now()}`,
      title: "",
      bulletPoints: [],
      technologies: [],
      link: "",
      startDate: "",
      endDate: "",
      current: false,
    };
    setResumeData(prev => ({
      ...prev,
      projects: [...(prev.projects || projects), newProject]
    }));
  };

  const updateProject = (projectId: string, updates: Partial<{
    title: string;
    bulletPoints: Array<{ id: string; description: string }>;
    technologies: string[];
    link: string;
    startDate: string;
    endDate: string;
    current: boolean;
  }>) => {
    setResumeData(prev => ({
      ...prev,
      projects: (prev.projects || projects).map(project =>
        project.id === projectId ? { ...project, ...updates } : project
      )
    }));
  };

  const deleteProject = (projectId: string) => {
    setResumeData(prev => ({
      ...prev,
      projects: (prev.projects || projects).filter(project => project.id !== projectId)
    }));
  };

  const addTechnology = (projectId: string, technology: string) => {
    if (!technology.trim()) return;
    const project = (resumeData.projects || projects).find(p => p.id === projectId);
    if (!project) return;

    const newTechnologies = [...project.technologies, technology.trim()];
    updateProject(projectId, { technologies: newTechnologies });
  };

  const removeTechnology = (projectId: string, technologyIndex: number) => {
    const project = (resumeData.projects || projects).find(p => p.id === projectId);
    if (!project) return;

    const newTechnologies = project.technologies.filter((_, index) => index !== technologyIndex);
    updateProject(projectId, { technologies: newTechnologies });
  };

  const handleTechnologyDragEnd = (event: DragEndEvent, projectId: string) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const project = (resumeData.projects || projects).find(p => p.id === projectId);
      if (!project) return;

      const oldIndex = project.technologies.findIndex((_, index) => `${projectId}-tech-${index}` === active.id);
      const newIndex = project.technologies.findIndex((_, index) => `${projectId}-tech-${index}` === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newTechnologies = arrayMove(project.technologies, oldIndex, newIndex);
        updateProject(projectId, { technologies: newTechnologies });
      }
    }
  };

  const addBulletPoint = (projectId: string) => {
    const project = (resumeData.projects || projects).find(p => p.id === projectId);
    if (!project) return;

    const newBulletPoint = {
      id: `bullet-${Date.now()}-${Math.random()}`,
      description: ""
    };

    const newBulletPoints = [...project.bulletPoints, newBulletPoint];
    updateProject(projectId, { bulletPoints: newBulletPoints });
  };

  const updateBulletPoint = (projectId: string, bulletId: string, description: string) => {
    const project = (resumeData.projects || projects).find(p => p.id === projectId);
    if (!project) return;

    const newBulletPoints = project.bulletPoints.map(bullet =>
      bullet.id === bulletId ? { ...bullet, description } : bullet
    );
    updateProject(projectId, { bulletPoints: newBulletPoints });
  };

  const deleteBulletPoint = (projectId: string, bulletId: string) => {
    const project = (resumeData.projects || projects).find(p => p.id === projectId);
    if (!project) return;

    const newBulletPoints = project.bulletPoints.filter(bullet => bullet.id !== bulletId);
    updateProject(projectId, { bulletPoints: newBulletPoints });
  };

  const handleProjectDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newProjects = Array.from((resumeData.projects || projects));
    const [removed] = newProjects.splice(result.source.index, 1);
    newProjects.splice(result.destination.index, 0, removed);

    setResumeData(prev => ({ ...prev, projects: newProjects }));
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          Projects
        </Typography>
        <IconButton
          size="small"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();

            onDeleteSection('Projects');
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

      <DragDropContext onDragEnd={handleProjectDragEnd}>
        <Droppable droppableId="projects" type="project">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} style={{ minHeight: (resumeData.projects || projects).length === 0 ? 10 : 100 }}>
              {(resumeData.projects || projects).map((project, projectIndex) => (
                <React.Fragment key={project.id}>
                  <Draggable draggableId={`project-${project.id}`} index={projectIndex}>
                    {(provided) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        sx={{ mb: 3, p: 2, mr: 2 }}
                      >
                        {/* Project Header with Drag Handle */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, width: '100%', gap: 2 }}>
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
                            value={project.title || ''}
                            onChange={(e) => updateProject(project.id, { title: e.target.value })}
                            placeholder="Project Title..."
                            variant="outlined"
                            label="Project Title"
                            size="small"
                            sx={{ width: 400 }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => deleteProject(project.id)}
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

                        {/* Project Details */}
                        <Box sx={{ ml: 4.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {/* Dates */}
                          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Box sx={{ position: 'relative' }}>
                              <TextField
                                value={project.startDate || ''}
                                placeholder="Start Date..."
                                variant="outlined"
                                label="Start Date"
                                size="small"
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
                                          (date) => updateProject(project.id, { startDate: date })
                                        );
                                      }}
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
                                value={project.endDate || ''}
                                placeholder="End Date..."
                                variant="outlined"
                                label="End Date"
                                size="small"
                                sx={{ width: 150 }}
                                disabled={project.current}
                                InputProps={{
                                  readOnly: true,
                                  endAdornment: (
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        if (!project.current) {
                                          const rect = e.currentTarget.getBoundingClientRect();
                                          openDatePicker(
                                            { x: rect.left, y: rect.bottom + 5 },
                                            (date) => updateProject(project.id, { endDate: date })
                                          );
                                        }
                                      }}
                                      sx={{ p: 0.5 }}
                                      disabled={project.current}
                                    >
                                      <CalendarIcon fontSize="small" />
                                    </IconButton>
                                  ),
                                }}
                              />
                            </Box>
                            <FormControl size="small">
                              <Select
                                value={project.current ? 'current' : 'completed'}
                                onChange={(e) => updateProject(project.id, { current: e.target.value === 'current' })}
                                sx={{ minWidth: 100 }}
                              >
                                <MenuItem value="completed">Completed</MenuItem>
                                <MenuItem value="current">Current</MenuItem>
                              </Select>
                            </FormControl>
                          </Box>

                          {/* Link */}
                          <TextField
                            value={project.link || ''}
                            onChange={(e) => updateProject(project.id, { link: e.target.value })}
                            placeholder="Project Link (optional)..."
                            variant="outlined"
                            label="Project Link (optional)"
                            size="small"
                            sx={{ width: 600 }}
                          />

                          {/* Technologies */}
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              Technologies:
                            </Typography>
                            <DndContext
                              sensors={sensors}
                              collisionDetection={closestCenter}
                              onDragEnd={(event) => handleTechnologyDragEnd(event, project.id)}
                            >
                              <SortableContext
                                items={project.technologies.map((_, index) => `${project.id}-tech-${index}`)}
                                strategy={horizontalListSortingStrategy}
                              >
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                  {project.technologies.map((tech, techIndex) => (
                                    <Chip
                                      key={`${project.id}-tech-${techIndex}`}
                                      sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        py: 1,
                                        cursor: 'grab',
                                      }}
                                      label={
                                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                          <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'grab', ml: -0.5 }}>
                                            <DragIndicatorIcon sx={{ fontSize: 20, mr: 0.5, color: '#999' }} />
                                          </Box>
                                          <Typography variant="body2" sx={{ mr: 1, flex: 1 }}>
                                            {tech}
                                          </Typography>
                                          <Box sx={{ display: 'flex', alignItems: 'center', mr: -1 }}>
                                            <IconButton
                                              size="small"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                removeTechnology(project.id, techIndex);
                                              }}
                                              onMouseDown={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                              }}
                                              sx={{ p: 0.5, borderRadius: "50%", '&:hover': { backgroundColor: themeColors.gray[500], color: themeColors.white } }}
                                            >
                                              <CloseIcon sx={{ fontSize: 16 }} />
                                            </IconButton>
                                          </Box>
                                        </Box>
                                      }
                                    />
                                  ))}
                                </Box>
                              </SortableContext>
                            </DndContext>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                              <TextField
                                size="small"
                                placeholder="Add technology..."
                                onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                  if (e.key === 'Enter') {
                                    addTechnology(project.id, e.currentTarget.value);
                                    e.currentTarget.value = '';
                                  }
                                }}
                                sx={{ width: 200 }}
                              />
                              <Button
                                size="small"
                                onClick={() => {
                                  const input = document.querySelector(`input[placeholder="Add technology..."]`) as HTMLInputElement;
                                  if (input && input.value.trim()) {
                                    addTechnology(project.id, input.value.trim());
                                    input.value = '';
                                  }
                                }}
                                sx={{ height: 32, minWidth: 'auto' }}
                              >
                                <AddCircleOutlineIcon fontSize="small" />
                              </Button>
                            </Box>
                          </Box>

                          {/* Bullet Points */}
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              Description:
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              {project.bulletPoints.map((bullet) => (
                                <Box key={bullet.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="body2" sx={{ mt: 0.5 }}>•</Typography>
                                  <TextField
                                    value={bullet.description}
                                    onChange={(e) => updateBulletPoint(project.id, bullet.id, e.target.value)}
                                    placeholder="Describe what you accomplished..."
                                    variant="outlined"
                                    size="small"
                                    multiline
                                    sx={{ width: '100%'}}
                                  />
                                  <IconButton
                                    size="small"
                                    onClick={() => deleteBulletPoint(project.id, bullet.id)}
                                    sx={{ p: 0.5 }}
                                  >
                                    <CloseIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              ))}
                              <Button
                                startIcon={<AddIcon />}
                                onClick={() => addBulletPoint(project.id)}
                                variant="outlined"
                                size="small"
                                sx={{ border: 'none', width: 'fit-content', mt: 1 }}
                              >
                                Add Bullet Point
                              </Button>
                            </Box>
                          </Box>
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
          onClick={addProject}
          variant="outlined"
          size="small"
        >
          Add Project
        </Button>
      </Box>

      {/* DatePicker Component */}
      <DatePicker
        isOpen={datePickerOpen}
        onClose={closeDatePicker}
        onSelect={handleDateSelect}
        position={datePickerPosition}
      />
    </Box>
  );
};
