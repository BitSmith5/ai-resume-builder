"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  Box,
  Typography,
  Button,
  Alert,
  LinearProgress,
  Chip,
  Card,
  CardContent,
  IconButton,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
} from "@mui/x-data-grid";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import DashboardLayout from "@/components/DashboardLayout";

interface Resume {
  id: number;
  title: string;
  content: unknown;
  strengths: Strength[];
  createdAt: string | Date;
}

interface Strength {
  id: number;
  skillName: string;
  rating: number;
}

export default function ResumesPage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await fetch("/api/resumes");
      if (response.ok) {
        const data = await response.json();
        setResumes(data);
      } else {
        setError("Failed to load resumes");
      }
    } catch {
      setError("An error occurred while loading resumes");
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = (rating: number) => {
    if (rating >= 8) return "success";
    if (rating >= 6) return "warning";
    return "error";
  };

  const columns: GridColDef[] = [
    {
      field: "title",
      headerName: "Title",
      width: 200,
      minWidth: 150,
      maxWidth: 300,
      renderCell: (params) => (
        <Box sx={{ width: '100%', py: 1, display: 'flex', alignItems: 'center', height: '100%' }}>
          <Typography variant="body1" fontWeight="medium" noWrap>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: "createdAt",
      headerName: "Created",
      width: 120,
      minWidth: 100,
      maxWidth: 150,
      renderCell: (params) => {
        const dateValue = params.value;
        const rowDateValue = params.row.createdAt;
        const finalDateValue = dateValue || rowDateValue;
        
        if (!finalDateValue) {
          return (
            <Box sx={{ width: '100%', py: 1, display: 'flex', alignItems: 'center', height: '100%' }}>
              <Typography variant="body2" color="text.secondary">N/A</Typography>
            </Box>
          );
        }
        
        if (finalDateValue instanceof Date) {
          return (
            <Box sx={{ width: '100%', py: 1, display: 'flex', alignItems: 'center', height: '100%' }}>
              <Typography variant="body2" noWrap>
                {finalDateValue.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit'
                })}
              </Typography>
            </Box>
          );
        }
        
        const date = new Date(finalDateValue as string);
        if (isNaN(date.getTime())) {
          return (
            <Box sx={{ width: '100%', py: 1, display: 'flex', alignItems: 'center', height: '100%' }}>
              <Typography variant="body2" color="error">Invalid Date</Typography>
            </Box>
          );
        }
        
        return (
          <Box sx={{ width: '100%', py: 1, display: 'flex', alignItems: 'center', height: '100%' }}>
            <Typography variant="body2" noWrap>
              {date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
              })}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "strengths",
      headerName: "Skills",
      width: 200,
      minWidth: 150,
      maxWidth: 250,
      renderCell: (params) => {
        const strengths = params.value as Strength[];
        if (!strengths || strengths.length === 0) {
          return (
            <Box sx={{ width: '100%', py: 1, display: 'flex', alignItems: 'center', height: '100%' }}>
              <Typography variant="body2" color="text.secondary">No skills</Typography>
            </Box>
          );
        }
        return (
          <Box sx={{ width: '100%', py: 1, display: 'flex', alignItems: 'center', height: '100%' }}>
            <Box display="flex" flexDirection="column" gap={0.5}>
              {strengths.slice(0, 2).map((strength) => (
                <Chip
                  key={strength.id}
                  label={`${strength.skillName} (${strength.rating}/10)`}
                  size="small"
                  color={getStrengthColor(strength.rating) as "success" | "warning" | "error"}
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', maxWidth: '100%' }}
                />
              ))}
              {strengths.length > 2 && (
                <Chip
                  label={`+${strengths.length - 2} more`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem' }}
                />
              )}
            </Box>
          </Box>
        );
      },
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      minWidth: 80,
      maxWidth: 120,
      getActions: (params) => [
        <GridActionsCellItem
          key="view"
          icon={<ViewIcon />}
          label="View"
          onClick={() => handleView(params.row.id)}
        />,
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleEdit(params.row.id)}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDelete(params.row.id)}
        />,
      ],
    },
  ];

  const handleView = (id: number) => {
    // Navigate to view resume page
    router.push(`/dashboard/resumes/${id}`);
  };

  const handleEdit = (id: number) => {
    // Navigate to edit resume page
    router.push(`/dashboard/resumes/${id}/edit`);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this resume?")) {
      try {
        const response = await fetch(`/api/resumes/${id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          setResumes(resumes.filter(resume => resume.id !== id));
        } else {
          setError("Failed to delete resume");
        }
      } catch {
        setError("An error occurred while deleting the resume");
      }
    }
  };

  const formatDate = (dateValue: string | Date | null | undefined) => {
    if (!dateValue) return "N/A";
    
    if (dateValue instanceof Date) {
      return dateValue.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    }
    
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "Invalid Date";
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const renderMobileCard = (resume: Resume) => (
    <Card key={resume.id} sx={{ mb: 2, boxShadow: 2 }}>
      <CardContent sx={{ p: 2 }}>
        <Stack spacing={1.5}>
          {/* Title */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="medium" noWrap>
              {resume.title}
            </Typography>
          </Box>
          
          {/* Created Date */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Created: {formatDate(resume.createdAt)}
            </Typography>
          </Box>
          
          {/* Skills */}
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Skills:
            </Typography>
            {resume.strengths && resume.strengths.length > 0 ? (
              <Stack direction="row" flexWrap="wrap" gap={0.5}>
                {resume.strengths.slice(0, 3).map((strength) => (
                  <Chip
                    key={strength.id}
                    label={`${strength.skillName} (${strength.rating}/10)`}
                    size="small"
                    color={getStrengthColor(strength.rating) as "success" | "warning" | "error"}
                    variant="outlined"
                    sx={{ fontSize: '0.7rem' }}
                  />
                ))}
                {resume.strengths.length > 3 && (
                  <Chip
                    label={`+${resume.strengths.length - 3} more`}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem' }}
                  />
                )}
              </Stack>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No skills
                </Typography>
              </Box>
            )}
          </Box>
          
          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 1, pt: 1 }}>
            <IconButton
              size="small"
              onClick={() => handleView(resume.id)}
              sx={{ color: 'primary.main' }}
            >
              <ViewIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleEdit(resume.id)}
              sx={{ color: 'primary.main' }}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleDelete(resume.id)}
              sx={{ color: 'error.main' }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ width: "100%" }}>
          <LinearProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} p={{xs: 2, md: 3}}>
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="h4" component="h1" gutterBottom>
              My Resumes
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage and organize your professional resumes
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            size="large"
            href="/dashboard/resumes/new"
          >
            Create New Resume
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {isMobile ? (
          // Mobile layout - stacked cards
          <Box sx={{ width: "100%" }} p={{xs: 2, md: 3}}>
            {resumes.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
                <Typography variant="body1" color="text.secondary">
                  No resumes found. Create your first resume to get started.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {resumes.map(renderMobileCard)}
              </Stack>
            )}
          </Box>
        ) : (
          // Desktop layout - DataGrid
          <Box sx={{ 
            height: 600, 
            width: "100%",
            overflow: "hidden",
            p: {xs: 2, md: 3}
          }}>
            <DataGrid
              rows={resumes}
              columns={columns}
              pageSizeOptions={[5, 10, 25]}
              rowHeight={100}
              getRowId={(row) => row.id}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 10 },
                },
              }}
              disableRowSelectionOnClick
              autoHeight={false}
              sx={{
                "& .MuiDataGrid-cell": {
                  borderBottom: "1px solid #e0e0e0",
                  padding: "8px 16px",
                },
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#f5f5f5",
                  borderBottom: "2px solid #e0e0e0",
                },
                "& .MuiDataGrid-row": {
                  "&:hover": {
                    backgroundColor: "#f8f9fa",
                  },
                },
                "& .MuiDataGrid-virtualScroller": {
                  overflow: "auto",
                },
                "& .MuiDataGrid-main": {
                  overflow: "auto",
                },
                "& .MuiDataGrid-virtualScrollerContent": {
                  minWidth: "100%",
                },
              }}
            />
          </Box>
        )}
      </Box>
    </DashboardLayout>
  );
} 