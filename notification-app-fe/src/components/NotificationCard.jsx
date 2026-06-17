import React from "react";
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  Tooltip,
  Chip,
} from "@mui/material";
import {
  Event as EventIcon,
  Work as WorkIcon,
  Assessment as AssessmentIcon,
  Drafts as ReadIcon,
  MarkChatRead as UnreadIcon,
  DeleteOutlined as DeleteIcon,
  Public as ExternalIcon,
  Person as LocalIcon,
} from "@mui/icons-material";

// Type specific styles and icons
const TYPE_CONFIG = {
  Event: {
    color: "#ffb300", // Amber
    icon: <EventIcon />,
    label: "Event",
  },
  Placement: {
    color: "#00e5ff", // Cyan
    icon: <WorkIcon />,
    label: "Placement",
  },
  Result: {
    color: "#00e676", // Green
    icon: <AssessmentIcon />,
    label: "Result",
  },
};

export default function NotificationCard({ notification, onMarkRead, onDelete }) {
  const { id, type, message, timestamp, read, isExternal } = notification;
  const config = TYPE_CONFIG[type] || { color: "#ffffff", icon: <EventIcon />, label: type };

  return (
    <Card
      sx={{
        mb: 2,
        position: "relative",
        overflow: "visible",
        background: read
          ? "rgba(18, 24, 36, 0.6)"
          : "linear-gradient(135deg, rgba(18, 24, 36, 1) 0%, rgba(26, 35, 54, 1) 100%)",
        borderLeft: `5px solid ${config.color}`,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        opacity: read ? 0.75 : 1,
        "&:hover": {
          borderLeftWidth: "8px",
        },
      }}
    >
      {/* Unread Glow Indicator */}
      {!read && (
        <Box
          sx={{
            position: "absolute",
            top: -4,
            left: -4,
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: "error.main",
            boxShadow: "0 0 10px #ff4d4d",
          }}
        />
      )}

      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Box display="flex" alignItems="flex-start" gap={2}>
          {/* Avatar Icon Container */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: 1.5,
              borderRadius: "12px",
              backgroundColor: `rgba(${parseInt(config.color.slice(1, 3), 16)}, ${parseInt(config.color.slice(3, 5), 16)}, ${parseInt(config.color.slice(5, 7), 16)}, 0.1)`,
              color: config.color,
              boxShadow: `inset 0 0 8px 0 rgba(${parseInt(config.color.slice(1, 3), 16)}, ${parseInt(config.color.slice(3, 5), 16)}, ${parseInt(config.color.slice(5, 7), 16)}, 0.2)`,
            }}
          >
            {config.icon}
          </Box>

          {/* Core Content */}
          <Box flexGrow={1} minWidth={0}>
            <Box display="flex" alignItems="center" gap={1.5} mb={0.5} flexWrap="wrap">
              <Typography
                variant="subtitle2"
                fontWeight="700"
                fontFamily="'Outfit', sans-serif"
                sx={{ color: config.color, letterSpacing: "0.5px", textTransform: "uppercase" }}
              >
                {config.label}
              </Typography>

              {/* Source Chip */}
              <Chip
                icon={isExternal ? <ExternalIcon sx={{ fontSize: "14px !important" }} /> : <LocalIcon sx={{ fontSize: "14px !important" }} />}
                label={isExternal ? "External API" : "Custom Local"}
                size="small"
                variant="outlined"
                sx={{
                  height: "20px",
                  fontSize: "10px",
                  borderColor: isExternal ? "rgba(77, 124, 255, 0.3)" : "rgba(156, 39, 176, 0.3)",
                  color: isExternal ? "primary.main" : "secondary.main",
                  backgroundColor: isExternal ? "rgba(77, 124, 255, 0.03)" : "rgba(156, 39, 176, 0.03)",
                }}
              />

              {/* Read Status Chip */}
              <Chip
                label={read ? "Read" : "New"}
                size="small"
                color={read ? "default" : "error"}
                sx={{
                  height: "20px",
                  fontSize: "10px",
                  fontWeight: "bold",
                  px: 0.5,
                }}
              />
            </Box>

            <Typography
              variant="body1"
              color="text.primary"
              fontWeight={read ? "400" : "500"}
              sx={{
                mb: 1,
                wordBreak: "break-word",
                lineHeight: 1.4,
              }}
            >
              {message}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              {timestamp}
            </Typography>
          </Box>

          {/* Action Buttons */}
          <Box display="flex" flexDirection="column" gap={0.5} sx={{ opacity: { xs: 1, sm: 0.7 }, transition: "opacity 0.2s", "&:hover": { opacity: 1 } }}>
            {!read && (
              <Tooltip title="Mark as Read" placement="top">
                <IconButton
                  color="success"
                  onClick={() => onMarkRead(id)}
                  size="small"
                  sx={{
                    backgroundColor: "rgba(0, 230, 118, 0.05)",
                    "&:hover": { backgroundColor: "rgba(0, 230, 118, 0.15)" },
                  }}
                >
                  <UnreadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            
            {read && (
              <Tooltip title="Read" placement="top">
                <IconButton
                  disabled
                  size="small"
                  sx={{ color: "text.secondary" }}
                >
                  <ReadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            <Tooltip title="Delete Notification" placement="top">
              <IconButton
                color="error"
                onClick={() => onDelete(id)}
                size="small"
                sx={{
                  backgroundColor: "rgba(255, 77, 77, 0.05)",
                  "&:hover": { backgroundColor: "rgba(255, 77, 77, 0.15)" },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
