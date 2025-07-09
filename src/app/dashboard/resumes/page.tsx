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
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridCellParams,
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
  createdAt: string;
}

interface Strength {
  id: number;
  skillName: string;
  rating: number;
}

export default function ResumesPage() {
  const router = useRouter();

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
      flex: 1,
      minWidth: 200,
    },
    {
      field: "createdAt",
      headerName: "Created",
      width: 120,
      valueGetter: (params: GridCellParams) => {
        return new Date(params.value as string).toLocaleDateString();
      },
    },
    {
      field: "strengths",
      headerName: "Skills",
      width: 200,
      renderCell: (params) => {
        const strengths = params.value as Strength[];
        if (!strengths || strengths.length === 0) {
          return <Typography variant="body2" color="text.secondary">No skills</Typography>;
        }
        return (
          <Box display="flex" flexWrap="wrap" gap={0.5}>
            {strengths.slice(0, 2).map((strength) => (
              <Chip
                key={strength.id}
                label={`${strength.skillName} (${strength.rating}/10)`}
                size="small"
                color={getStrengthColor(strength.rating) as "success" | "warning" | "error"}
                variant="outlined"
              />
            ))}
            {strengths.length > 2 && (
              <Chip
                label={`+${strengths.length - 2} more`}
                size="small"
                variant="outlined"
              />
            )}
          </Box>
        );
      },
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 120,
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
    console.log("View resume:", id);
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
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
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

        <Box sx={{ height: 600, width: "100%" }}>
          <DataGrid
            rows={resumes}
            columns={columns}
            pageSizeOptions={[5, 10, 25]}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 10 },
              },
            }}
            disableRowSelectionOnClick
            sx={{
              "& .MuiDataGrid-cell": {
                borderBottom: "1px solid #e0e0e0",
              },
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#f5f5f5",
                borderBottom: "2px solid #e0e0e0",
              },
            }}
          />
        </Box>
      </Box>
    </DashboardLayout>
  );
} 