import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Grid,
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Snackbar,
  Badge,
  InputAdornment,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  List,
  ListItem,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  NotificationsActive as ActiveIcon,
  NotificationsNone as EmptyIcon,
  SignalCellularAlt as SyncIcon,
  Assessment as StatsIcon,
} from "@mui/icons-material";
import {
  fetchNotifications,
  createNotification,
  markAsRead,
  deleteNotification,
  sendLog,
} from "../api/notifications.js";
import NotificationCard from "../components/NotificationCard.jsx";

export default function Dashboard() {
  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state
  const [newType, setNewType] = useState("Event");
  const [newMessage, setNewMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Filter state
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All"); // All, Read, Unread
  const [sourceFilter, setSourceFilter] = useState("All"); // All, External, Local

  // Auto-refresh config
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(10); // seconds

  // Toast / Feedback state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // Load notifications
  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const data = await fetchNotifications();
      setNotifications(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch notifications. Displaying cached/local state.");
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  // Page Load Log - React Logging Rule
  useEffect(() => {
    sendLog("info", "page", "Notification Dashboard page loaded successfully");
    loadData();
  }, [loadData]);

  // Handle Auto-Refresh interval
  useEffect(() => {
    if (!autoRefresh) return;
    const intervalId = setInterval(() => {
      loadData(true);
    }, refreshInterval * 1000);
    return () => clearInterval(intervalId);
  }, [autoRefresh, refreshInterval, loadData]);

  // Create notification
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSubmitting(true);
    try {
      const created = await createNotification(newType, newMessage);
      setNotifications((prev) => [created, ...prev]);
      setNewMessage("");
      showToast("Notification created successfully!", "success");
    } catch (err) {
      showToast("Failed to create notification.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Mark as read
  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      showToast("Notification marked as read", "success");
    } catch (err) {
      showToast("Failed to update notification.", "error");
    }
  };

  // Delete notification
  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      showToast("Notification deleted", "info");
    } catch (err) {
      showToast("Failed to delete notification.", "error");
    }
  };

  // Utility to show feedback messages
  const showToast = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Filters application
  const filteredNotifications = notifications.filter((n) => {
    const matchesSearch = n.message.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "All" || n.type === typeFilter;
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Read" && n.read) ||
      (statusFilter === "Unread" && !n.read);
    const matchesSource =
      sourceFilter === "All" ||
      (sourceFilter === "External" && n.isExternal) ||
      (sourceFilter === "Local" && !n.isExternal);

    return matchesSearch && matchesType && matchesStatus && matchesSource;
  });

  // Calculate statistics
  const totalCount = notifications.length;
  const unreadCount = notifications.filter((n) => !n.read).length;
  const eventCount = notifications.filter((n) => n.type === "Event").length;
  const placementCount = notifications.filter((n) => n.type === "Placement").length;
  const resultCount = notifications.filter((n) => n.type === "Result").length;

  return (
    <Container maxWidth="xl" sx={{ py: 4, minHeight: "100vh" }}>
      {/* Header Section */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
        flexWrap="wrap"
        gap={2}
      >
        <Box>
          <Box display="flex" alignItems="center" gap={1.5}>
            <ActiveIcon color="primary" sx={{ fontSize: "2.5rem" }} />
            <Typography
              variant="h3"
              fontFamily="'Outfit', sans-serif"
              fontWeight="800"
              sx={{
                background: "linear-gradient(45deg, #4d7cff 30%, #b388ff 90%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              AffordMed Notification Hub
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
            Real-time campus event, placement, and result management dashboard.
          </Typography>
        </Box>

        {/* Dynamic Status Badges */}
        <Box display="flex" alignItems="center" gap={2}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 2,
              py: 0.8,
              borderRadius: "50px",
              backgroundColor: "rgba(0, 230, 118, 0.08)",
              border: "1px solid rgba(0, 230, 118, 0.15)",
            }}
          >
            <SyncIcon sx={{ color: "success.main", fontSize: "16px" }} />
            <Typography variant="caption" color="success.main" fontWeight="bold">
              AffordMed Connected
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={() => loadData()}
            disabled={loading}
            sx={{ borderRadius: "50px", px: 3 }}
          >
            Sync Now
          </Button>
        </Box>
      </Box>

      {/* Stats Counter Row */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ background: "rgba(77, 124, 255, 0.03)" }}>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Total Feed
              </Typography>
              <Typography variant="h4" fontFamily="'Outfit', sans-serif" fontWeight="800">
                {totalCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ background: "rgba(255, 77, 77, 0.03)", borderLeft: "4px solid #ff4d4d" }}>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                New / Unread
              </Typography>
              <Badge color="error" badgeContent={unreadCount} max={99}>
                <Typography variant="h4" fontFamily="'Outfit', sans-serif" fontWeight="800" sx={{ pr: unreadCount > 0 ? 1 : 0 }}>
                  {unreadCount}
                </Typography>
              </Badge>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ background: "rgba(255, 179, 0, 0.03)", borderLeft: "4px solid #ffb300" }}>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Events
              </Typography>
              <Typography variant="h4" fontFamily="'Outfit', sans-serif" fontWeight="800" sx={{ color: "warning.main" }}>
                {eventCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ background: "rgba(0, 229, 255, 0.03)", borderLeft: "4px solid #00e5ff" }}>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Placements
              </Typography>
              <Typography variant="h4" fontFamily="'Outfit', sans-serif" fontWeight="800" sx={{ color: "info.main" }}>
                {placementCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ background: "rgba(0, 230, 118, 0.03)", borderLeft: "4px solid #00e676" }}>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Results
              </Typography>
              <Typography variant="h4" fontFamily="'Outfit', sans-serif" fontWeight="800" sx={{ color: "success.main" }}>
                {resultCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Grid Content */}
      <Grid container spacing={4}>
        {/* Left Hand: Controls & Filters Panel */}
        <Grid item xs={12} lg={4}>
          <Box display="flex" flexDirection="column" gap={3}>
            {/* Create Notification Panel */}
            <Paper sx={{ p: 3, background: "rgba(18, 24, 36, 0.5)", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <AddIcon color="primary" />
                <Typography variant="h5" fontFamily="'Outfit', sans-serif" fontWeight="700">
                  Publish Notification
                </Typography>
              </Box>

              <form onSubmit={handleCreate}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="type-select-label">Category</InputLabel>
                  <Select
                    labelId="type-select-label"
                    value={newType}
                    label="Category"
                    onChange={(e) => setNewType(e.target.value)}
                  >
                    <MenuItem value="Event">Event</MenuItem>
                    <MenuItem value="Placement">Placement</MenuItem>
                    <MenuItem value="Result">Result</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Notification Message"
                  multiline
                  rows={3}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type the notification details here..."
                  sx={{ mb: 3 }}
                />

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={submitting || !newMessage.trim()}
                  startIcon={submitting ? <CircularProgress size={20} /> : <AddIcon />}
                >
                  {submitting ? "Publishing..." : "Publish Notification"}
                </Button>
              </form>
            </Paper>

            {/* Filters & Configuration */}
            <Paper sx={{ p: 3, background: "rgba(18, 24, 36, 0.5)", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
              <Typography variant="h5" fontFamily="'Outfit', sans-serif" fontWeight="700" mb={2.5}>
                Filter Feed
              </Typography>

              {/* Search Field */}
              <TextField
                fullWidth
                label="Search Messages"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
              />

              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Category
              </Typography>
              <ToggleButtonGroup
                color="primary"
                value={typeFilter}
                exclusive
                onChange={(e, val) => val && setTypeFilter(val)}
                fullWidth
                sx={{ mb: 3 }}
              >
                <ToggleButton value="All">All</ToggleButton>
                <ToggleButton value="Event">Events</ToggleButton>
                <ToggleButton value="Placement">Jobs</ToggleButton>
                <ToggleButton value="Result">Results</ToggleButton>
              </ToggleButtonGroup>

              <Grid container spacing={2} mb={3}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Read Status
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                      <MenuItem value="All">All Statuses</MenuItem>
                      <MenuItem value="Unread">New / Unread</MenuItem>
                      <MenuItem value="Read">Read Only</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Source
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
                      <MenuItem value="All">All Sources</MenuItem>
                      <MenuItem value="External">External APIs</MenuItem>
                      <MenuItem value="Local">Custom Local</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              {/* Auto Refresh Configuration */}
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" fontWeight="500">
                  Background Sync
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={autoRefresh}
                      onChange={(e) => setAutoRefresh(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={autoRefresh ? "Active" : "Paused"}
                  sx={{ mr: 0 }}
                />
              </Box>

              {autoRefresh && (
                <Box mt={2}>
                  <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                    Sync Interval (Seconds)
                  </Typography>
                  <ToggleButtonGroup
                    size="small"
                    value={refreshInterval}
                    exclusive
                    onChange={(e, val) => val && setRefreshInterval(val)}
                    fullWidth
                  >
                    <ToggleButton value={5}>5s</ToggleButton>
                    <ToggleButton value={10}>10s</ToggleButton>
                    <ToggleButton value={30}>30s</ToggleButton>
                    <ToggleButton value={60}>60s</ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              )}
            </Paper>
          </Box>
        </Grid>

        {/* Right Hand: Feed Feed */}
        <Grid item xs={12} lg={8}>
          <Box>
            {error && (
              <Alert severity="warning" sx={{ mb: 3 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {loading ? (
              <Box display="flex" flexDirection="column" alignItems="center" py={10} gap={2}>
                <CircularProgress color="primary" />
                <Typography variant="body1" color="text.secondary">
                  Connecting to AffordMed Evaluation Service...
                </Typography>
              </Box>
            ) : filteredNotifications.length === 0 ? (
              <Paper
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  py: 12,
                  px: 4,
                  textAlign: "center",
                  background: "rgba(18, 24, 36, 0.2)",
                  border: "1px dashed rgba(255, 255, 255, 0.1)",
                }}
              >
                <EmptyIcon sx={{ fontSize: "4rem", color: "text.secondary", mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" color="text.primary" fontWeight="600" mb={1}>
                  No Notifications Found
                </Typography>
                <Typography variant="body2" color="text.secondary" maxWidth="350px">
                  Try adjusting your search criteria, selecting another category filter, or creating a custom local notification.
                </Typography>
              </Paper>
            ) : (
              <Box>
                {filteredNotifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkRead={handleMarkRead}
                    onDelete={handleDelete}
                  />
                ))}
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* Bottom Snackbars for Actions Toast Feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}
