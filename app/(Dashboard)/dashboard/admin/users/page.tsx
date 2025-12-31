// app/admin/users/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Button,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Grid
} from '@mui/material';
import {
  Search,
  MoreVert,
  PersonAdd,
  PersonRemove,
  AdminPanelSettings,
  Verified,
  Block,
  Refresh,
  Edit,
  Visibility,
  CheckCircle,
  Download,
} from '@mui/icons-material';
import { useAuth } from '@/app/context/AuthContext';
import * as AppServices from '@/app/services/app.services';
import type { UserProfile, UserRole } from '@/app/types/app.types';

interface UserStats {
  total: number;
  active: number;
  byRole: {
    admin: number;
    clinician: number;
    guardian: number;
  };
}

interface FilterOptions {
  search: string;
  role: string;
  status: string;
}

type DialogAction = 'view' | 'edit' | 'delete' | 'promote' | 'deactivate';

export default function AdminUsersPage() {
  const router = useRouter();
  const { userProfile, isAdmin } = useAuth();
  
  // State
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    role: 'all',
    status: 'all',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Menu & Dialog states
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<DialogAction>('view');

  // Check admin permissions
  useEffect(() => {
    if (userProfile && !isAdmin()) {
      router.push('/dashboard');
    }
  }, [userProfile, isAdmin, router]);

  // Load data
  useEffect(() => {
    if (isAdmin()) {
      loadData();
    }
  }, [isAdmin, page, rowsPerPage, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load all users
      const response = await AppServices.getAllUsers({
        limit: rowsPerPage,
      });
      
      // Apply filters
      let filteredUsers = response.items;
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredUsers = filteredUsers.filter(user =>
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
        );
      }
      
      if (filters.role !== 'all') {
        filteredUsers = filteredUsers.filter(user => user.role === filters.role);
      }
      
      if (filters.status !== 'all') {
        filteredUsers = filteredUsers.filter(user => {
          if (filters.status === 'active') return user.isActive !== false;
          if (filters.status === 'inactive') return user.isActive === false;
          return true;
        });
      }
      
      setUsers(filteredUsers);
      setTotal(filteredUsers.length);
      
      // Calculate stats
      const statsData: UserStats = {
        total: response.total,
        active: response.items.filter(u => u.isActive !== false).length,
        byRole: {
          admin: response.items.filter(u => u.role === 'admin').length,
          clinician: response.items.filter(u => u.role === 'clinician').length,
          guardian: response.items.filter(u => u.role === 'guardian').length,
        }
      };
      setStats(statsData);
      
    } catch (err: any) {
      setError('Failed to load users: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, user: UserProfile) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action: DialogAction) => {
    setDialogAction(action);
    setDialogOpen(true);
    handleMenuClose();
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedUser(null);
  };

  const executeAction = async () => {
    if (!selectedUser || !userProfile) return;
    
    try {
      setLoading(true);
      
      switch (dialogAction) {
        case 'promote':
          await AppServices.promoteToAdmin(userProfile.uid, selectedUser.uid);
          setSuccess('User promoted to admin');
          break;
        case 'deactivate':
          if (selectedUser.isActive) {
            await AppServices.deactivateUser(userProfile.uid, selectedUser.uid, 'Deactivated by admin');
            setSuccess('User deactivated');
          }
          break;
        case 'delete':
          await AppServices.deleteUser(userProfile.uid, selectedUser.uid);
          setSuccess('User deleted');
          break;
      }
      
      handleDialogClose();
      await loadData();
      
    } catch (err: any) {
      setError('Failed to perform action: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const csvContent = [
        ['Name', 'Email', 'Role', 'Status', 'Created At'],
        ...users.map(user => [
          user.name,
          user.email,
          user.role,
          user.isActive ? 'Active' : 'Inactive',
          user.createdAt?.toISOString() || '',
        ])
      ].map(row => row.join(',')).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
    } catch (err) {
      setError('Failed to export users');
    }
  };

  // Helper functions
  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'error';
      case 'clinician': return 'primary';
      case 'guardian': return 'success';
      default: return 'default';
    }
  };

  const getStatusIcon = (user: UserProfile) => {
    if (!user.isActive) return <Block color="warning" fontSize="small" />;
    if (user.isVerified) return <Verified color="success" fontSize="small" />;
    return <CheckCircle color="action" fontSize="small" />;
  };

  const getDisplayName = (name?: string) => {
    return name || 'Unknown';
  };

  // If not admin, show loading
  if (!userProfile || !isAdmin()) {
    return (
      <Container sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          User Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage system users and permissions
        </Typography>
      </Box>

      {/* Stats */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { label: 'Total Users', value: stats.total },
            { label: 'Active Users', value: stats.active },
            { label: 'Admins', value: stats.byRole.admin },
            { label: 'Clinicians', value: stats.byRole.clinician },
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    {stat.label}
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stat.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search users..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Role</InputLabel>
              <Select
                value={filters.role}
                label="Role"
                onChange={(e) => handleFilterChange('role', e.target.value)}
              >
                <MenuItem value="all">All Roles</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="clinician">Clinician</MenuItem>
                <MenuItem value="guardian">Guardian</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={1}>
            <Button
              fullWidth
              variant="outlined"
              onClick={loadData}
              disabled={loading}
              size="small"
              startIcon={<Refresh />}
            >
              Refresh
            </Button>
          </Grid>
          <Grid item xs={12} md={1}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => router.push('/admin/users/invite')}
              size="small"
              startIcon={<PersonAdd />}
            >
              Invite
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Users Table */}
      <Paper sx={{ borderRadius: 2 }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="medium">
            Users ({total})
          </Typography>
          <Button
            startIcon={<Download />}
            onClick={handleExport}
            disabled={loading || users.length === 0}
            size="small"
          >
            Export CSV
          </Button>
        </Box>
        
        {loading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress />
          </Box>
        ) : users.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No users found
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'action.hover' }}>
                    <TableCell><Typography variant="subtitle2" fontWeight="bold">User</Typography></TableCell>
                    <TableCell><Typography variant="subtitle2" fontWeight="bold">Role</Typography></TableCell>
                    <TableCell><Typography variant="subtitle2" fontWeight="bold">Status</Typography></TableCell>
                    <TableCell><Typography variant="subtitle2" fontWeight="bold">Patients</Typography></TableCell>
                    <TableCell><Typography variant="subtitle2" fontWeight="bold">Last Login</Typography></TableCell>
                    <TableCell align="right"><Typography variant="subtitle2" fontWeight="bold">Actions</Typography></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => (
                    <TableRow key={user.uid} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar src={user.profilePicture} sx={{ bgcolor: 'primary.main' }}>
                            {getDisplayName(user.name).charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="medium">
                              {getDisplayName(user.name)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {user.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.role}
                          size="small"
                          color={getRoleColor(user.role)}
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getStatusIcon(user)}
                          <Typography variant="body2">
                            {user.isActive ? 'Active' : 'Inactive'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.patients?.length || 0}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {user.lastLogin ? (
                          new Date(user.lastLogin).toLocaleDateString()
                        ) : (
                          <Typography variant="body2" color="text.secondary">Never</Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuClick(e, user)}
                        >
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={total}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
            />
          </>
        )}
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleAction('view')}>
          <Visibility sx={{ mr: 1, fontSize: 20 }} /> View Details
        </MenuItem>
        <MenuItem onClick={() => handleAction('edit')}>
          <Edit sx={{ mr: 1, fontSize: 20 }} /> Edit
        </MenuItem>
        {selectedUser?.role !== 'admin' && (
          <MenuItem onClick={() => handleAction('promote')}>
            <AdminPanelSettings sx={{ mr: 1, fontSize: 20 }} /> Promote to Admin
          </MenuItem>
        )}
        <MenuItem onClick={() => handleAction(selectedUser?.isActive ? 'deactivate' : 'deactivate')}>
          {selectedUser?.isActive ? (
            <>
              <PersonRemove sx={{ mr: 1, fontSize: 20 }} /> Deactivate
            </>
          ) : (
            <>
              <PersonAdd sx={{ mr: 1, fontSize: 20 }} /> Activate
            </>
          )}
        </MenuItem>
      </Menu>

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogAction === 'promote' && 'Promote to Admin'}
          {dialogAction === 'deactivate' && (selectedUser?.isActive ? 'Deactivate User' : 'Activate User')}
          {dialogAction === 'delete' && 'Delete User'}
        </DialogTitle>
        <DialogContent>
          {dialogAction === 'promote' && (
            <Typography>
              Are you sure you want to promote <strong>{selectedUser?.name}</strong> to admin?
            </Typography>
          )}
          {dialogAction === 'deactivate' && (
            <>
              <Typography>
                Are you sure you want to {selectedUser?.isActive ? 'deactivate' : 'activate'} <strong>{selectedUser?.name}</strong>?
              </Typography>
              {selectedUser?.isActive && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Deactivated users cannot log in until reactivated.
                </Alert>
              )}
            </>
          )}
          {dialogAction === 'delete' && (
            <>
              <Typography>
                Are you sure you want to delete <strong>{selectedUser?.name}</strong>?
              </Typography>
              <Alert severity="error" sx={{ mt: 2 }}>
                This action cannot be undone. User data will be permanently removed.
              </Alert>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button
            onClick={executeAction}
            variant="contained"
            color={
              dialogAction === 'delete' ? 'error' :
              dialogAction === 'promote' ? 'warning' : 'primary'
            }
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}