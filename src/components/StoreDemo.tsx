'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  Paper,
} from '@mui/material';
import {
  useUser,
  useResumeDrafts,
  useCurrentDraft,
  useAppStore,
} from '@/lib/store';
import { useNotificationActions } from '@/hooks/useNotifications';
import { ResumeDraft } from '@/lib/store';

export const StoreDemo: React.FC = () => {
  const user = useUser();
  const resumeDrafts = useResumeDrafts();
  const currentDraft = useCurrentDraft();
  const { addResumeDraft, setCurrentDraft, removeResumeDraft } = useAppStore();
  const { showSuccess, showError, showWarning, showInfo, showActionNotification } = useNotificationActions();

  const [newDraftTitle, setNewDraftTitle] = useState('');

  const handleCreateDraft = () => {
    if (!newDraftTitle.trim()) {
      showError('Please enter a draft title');
      return;
    }

    const newDraft: ResumeDraft = {
      title: newDraftTitle,
      content: { sections: [] },
      strengths: [],
    };

    addResumeDraft(newDraft);
    setNewDraftTitle('');
    showSuccess(`Draft "${newDraftTitle}" created successfully!`);
  };

  const handleSelectDraft = (draft: ResumeDraft) => {
    setCurrentDraft(draft);
    showInfo(`Selected draft: ${draft.title}`);
  };

  const handleDeleteDraft = (draft: ResumeDraft) => {
    showActionNotification(
      `Are you sure you want to delete "${draft.title}"?`,
      'Undo',
      () => {
        addResumeDraft(draft);
        showSuccess('Draft restored!');
      },
      'warning',
      10000
    );
    removeResumeDraft(draft.id!);
  };

  const handleTestNotifications = () => {
    showSuccess('This is a success notification!');
    setTimeout(() => showError('This is an error notification!'), 1000);
    setTimeout(() => showWarning('This is a warning notification!'), 2000);
    setTimeout(() => showInfo('This is an info notification!'), 3000);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Zustand Store Demo
      </Typography>

      {/* User Info Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Current User
          </Typography>
          {user ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {user.image && (
                <Image
                  src={user.image}
                  alt={user.name || 'User'}
                  width={40}
                  height={40}
                  style={{ borderRadius: '50%' }}
                />
              )}
              <Box>
                <Typography variant="body1">
                  <strong>Name:</strong> {user.name || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Email:</strong> {user.email || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>ID:</strong> {user.id}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Typography color="text.secondary">No user logged in</Typography>
          )}
        </CardContent>
      </Card>

      {/* Resume Drafts Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Resume Drafts ({resumeDrafts.length})
          </Typography>

          {/* Create New Draft */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              label="Draft Title"
              value={newDraftTitle}
              onChange={(e) => setNewDraftTitle(e.target.value)}
              placeholder="Enter draft title..."
              size="small"
            />
            <Button
              variant="contained"
              onClick={handleCreateDraft}
              disabled={!newDraftTitle.trim()}
            >
              Create Draft
            </Button>
          </Box>

          {/* Drafts List */}
          {resumeDrafts.length > 0 ? (
            <List>
              {resumeDrafts.map((draft, index) => (
                <React.Fragment key={draft.id}>
                  <ListItem
                    sx={{
                      bgcolor: currentDraft?.id === draft.id ? 'action.selected' : 'transparent',
                      borderRadius: 1,
                    }}
                  >
                    <ListItemText
                      primary={draft.title}
                      secondary={
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
                          <Chip
                            label={draft.isDirty ? 'Modified' : 'Clean'}
                            size="small"
                            color={draft.isDirty ? 'warning' : 'default'}
                          />
                          {draft.lastModified && (
                            <Typography variant="caption" color="text.secondary">
                              Modified: {new Date(draft.lastModified).toLocaleString()}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        onClick={() => handleSelectDraft(draft)}
                        disabled={currentDraft?.id === draft.id}
                      >
                        Select
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleDeleteDraft(draft)}
                      >
                        Delete
                      </Button>
                    </Box>
                  </ListItem>
                  {index < resumeDrafts.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Typography color="text.secondary">No drafts available</Typography>
          )}
        </CardContent>
      </Card>

      {/* Current Draft Section */}
      {currentDraft && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Current Draft
            </Typography>
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="body1">
                <strong>Title:</strong> {currentDraft.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Content:</strong> {JSON.stringify(currentDraft.content, null, 2)}
              </Typography>
            </Paper>
          </CardContent>
        </Card>
      )}

      {/* Notification Test Section */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Test Notifications
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="contained" color="success" onClick={() => showSuccess('Success message!')}>
              Success
            </Button>
            <Button variant="contained" color="error" onClick={() => showError('Error message!')}>
              Error
            </Button>
            <Button variant="contained" color="warning" onClick={() => showWarning('Warning message!')}>
              Warning
            </Button>
            <Button variant="contained" color="info" onClick={() => showInfo('Info message!')}>
              Info
            </Button>
            <Button variant="outlined" onClick={handleTestNotifications}>
              Test All
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}; 