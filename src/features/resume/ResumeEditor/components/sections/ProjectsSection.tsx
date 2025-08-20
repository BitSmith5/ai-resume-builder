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
  
  // State for technology input fields
  const [techInputs, setTechInputs] = React.useState<{ [key: string]: string }>({});
  
  // Removed unused bulletIdCounter variable

  // Clean up any existing duplicate IDs on component mount
  React.useEffect(() => {
    const projects = resumeData.projects || [];
    let hasChanges = false;
    
    // Check for duplicate IDs and fix them
    const seenProjectIds = new Set<string>();
    const cleanedProjects = projects.map(project => {
      // Ensure project has unique ID
      let projectId = project.id;
      if (!projectId || seenProjectIds.has(projectId)) {
        projectId = `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        hasChanges = true;
      }
      seenProjectIds.add(projectId);
      
      // Check bullet points for duplicate IDs
      const seenBulletIds = new Set<string>();
      const cleanedBulletPoints = project.bulletPoints.map(bullet => {
        let bulletId = bullet.id;
        if (!bulletId || seenBulletIds.has(bulletId)) {
          bulletId = `bullet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          hasChanges = true;
        }
        seenBulletIds.add(bulletId);
        return { ...bullet, id: bulletId };
      });
      
      return { ...project, id: projectId, bulletPoints: cleanedBulletPoints };
    });
    
    // Update data if changes were made
    if (hasChanges) {
      setResumeData(prev => ({
        ...prev,
        projects: cleanedProjects
      }));
    }
  }, [resumeData.projects, setResumeData]); // Include dependencies

  // Initialize projects if not exists
  const projects = resumeData.projects || [
    {
      id: `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: "AI Resume Builder",
      bulletPoints: [
        {
          id: `bullet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
      id: `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
    
    // Clear the input field
    setTechInputs(prev => ({ ...prev, [projectId]: '' }));
  };

  const handleTechInputChange = (projectId: string, value: string) => {
    setTechInputs(prev => ({ ...prev, [projectId]: value }));
  };

  const handleTechInputKeyPress = (projectId: string, e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const value = techInputs[projectId] || '';
      if (value.trim()) {
        addTechnology(projectId, value.trim());
      }
    }
  };

  const removeTechnology = (projectId: string, technologyIndex: number) => {
    const project = (resumeData.projects || projects).find(p => p.id === projectId);
    if (!project) return;

    const newTechnologies = project.technologies.filter((_, index) => index !== technologyIndex);
    updateProject(projectId, { technologies: newTechnologies });
  };

  const handleTechnologyDragEnd = (result: DropResult, projectId: string) => {
    if (!result.destination) return;

    const project = (resumeData.projects || projects).find(p => p.id === projectId);
    if (!project) return;

    const newTechnologies = Array.from(project.technologies);
    const [removed] = newTechnologies.splice(result.source.index, 1);
    newTechnologies.splice(result.destination.index, 0, removed);

    updateProject(projectId, { technologies: newTechnologies });
  };

  const handleAllDragEnd = (result: DropResult) => {
    // Check if this is a technology drag
    if (result.source.droppableId.startsWith('tech-')) {
      const projectId = result.source.droppableId.replace('tech-', '');
      handleTechnologyDragEnd(result, projectId);
    } else if (result.source.droppableId === 'projects') {
      // This is a project drag
      handleProjectDragEnd(result);
    }
  };

  const addBulletPoint = (projectId: string, description: string = "") => {
    const newBulletPoint = {
      id: `bullet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      description: description
    };
    setResumeData(prev => ({
      ...prev,
      projects: (prev.projects || projects).map(project =>
        project.id === projectId ? { ...project, bulletPoints: [...project.bulletPoints, newBulletPoint] } : project
      )
    }));
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

             <DragDropContext onDragEnd={handleAllDragEnd}>
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
                         data-project-id={project.id}
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
                                                           <Droppable droppableId={`tech-${project.id}`} direction="horizontal" type="technology">
                               {(provided) => (
                                 <Box 
                                   ref={provided.innerRef}
                                   {...provided.droppableProps}
                                   sx={{ 
                                     display: 'flex', 
                                     flexWrap: 'wrap', 
                                     gap: 1, 
                                     mb: 2,
                                     minHeight: 40
                                   }}
                                 >
                                   {project.technologies.map((tech, techIndex) => (
                                                                           <Draggable 
                                        key={`${project.id}-tech-${techIndex}`} 
                                        draggableId={`${project.id}-tech-${techIndex}`} 
                                        index={techIndex}
                                      >
                                       {(provided, snapshot) => (
                                         <Box
                                           ref={provided.innerRef}
                                           {...provided.draggableProps}
                                           {...provided.dragHandleProps}
                                           sx={{
                                             display: 'flex',
                                             alignItems: 'center',
                                             opacity: snapshot.isDragging ? 0.8 : 1,
                                             transform: snapshot.isDragging ? 'rotate(5deg)' : 'none',
                                             transition: 'all 0.2s ease',
                                           }}
                                         >
                                           <Chip
                                             sx={{
                                               display: 'flex',
                                               alignItems: 'center',
                                               py: 1,
                                               cursor: 'grab',
                                               userSelect: 'none',
                                               '&:active': {
                                                 cursor: 'grabbing',
                                               },
                                               '&:focus': {
                                                 outline: 'none',
                                               },
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
                                         </Box>
                                       )}
                                     </Draggable>
                                   ))}
                                   {provided.placeholder}
                                 </Box>
                               )}
                             </Droppable>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                             <TextField
                                 size="small"
                                 placeholder="Add technology..."
                                 value={techInputs[project.id] || ''}
                                 onChange={(e) => handleTechInputChange(project.id, e.target.value)}
                                 onKeyPress={(e) => handleTechInputKeyPress(project.id, e)}
                                 sx={{ width: 200 }}
                               />
                                                             <Button
                                 size="small"
                                 onClick={() => {
                                   const value = techInputs[project.id] || '';
                                   if (value.trim()) {
                                     addTechnology(project.id, value.trim());
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


