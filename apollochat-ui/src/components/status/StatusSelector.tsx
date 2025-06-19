import React from "react";
import {
  Box,
  Menu,
  MenuItem,
  ListItemIcon,
  Typography,
  IconButton,
  Tooltip,
  alpha,
  useTheme,
} from "@mui/material";
import {
  UserStatus,
  userStatusLabels,
  userStatusDescriptions,
} from "../../constants/userStatus";
import { useUpdateStatus } from "../../hooks/useUpdateStatus";
import { StatusIndicator } from "./StatusIndicator";
import CircleIcon from "@mui/icons-material/Circle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";

interface StatusSelectorProps {
  currentStatus: UserStatus;
}

const statusOptions = [
  {
    value: UserStatus.ONLINE,
    label: userStatusLabels[UserStatus.ONLINE],
    description: userStatusDescriptions[UserStatus.ONLINE],
    icon: (
      <CircleIcon
        fontSize="small"
        sx={{ color: "#44b700" }}
      />
    ),
  },
  {
    value: UserStatus.AWAY,
    label: userStatusLabels[UserStatus.AWAY],
    description: userStatusDescriptions[UserStatus.AWAY],
    icon: (
      <AccessTimeIcon
        fontSize="small"
        sx={{ color: "#ff9800" }}
      />
    ),
  },
  {
    value: UserStatus.DND,
    label: userStatusLabels[UserStatus.DND],
    description: userStatusDescriptions[UserStatus.DND],
    icon: (
      <DoNotDisturbIcon
        fontSize="small"
        sx={{ color: "#f44336" }}
      />
    ),
  },
  {
    value: UserStatus.OFFLINE,
    label: userStatusLabels[UserStatus.OFFLINE],
    description: userStatusDescriptions[UserStatus.OFFLINE],
    icon: (
      <CircleOutlinedIcon
        fontSize="small"
        sx={{ color: "#bdbdbd" }}
      />
    ),
  },
];

export const StatusSelector: React.FC<StatusSelectorProps> = ({
  currentStatus,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { updateStatus, loading } = useUpdateStatus();
  const theme = useTheme();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleStatusChange = async (status: UserStatus) => {
    try {
      await updateStatus(status);
      handleClose();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const currentOption =
    statusOptions.find((option) => option.value === currentStatus) ||
    statusOptions.find((option) => option.value === UserStatus.OFFLINE);

  return (
    <>
      <Tooltip title="Change your status">
        <IconButton
          onClick={handleClick}
          disabled={loading}
          size="small"
          sx={{
            p: 1,
            borderRadius: 2,
            "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.1) },
          }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <StatusIndicator
              status={currentStatus}
              withTooltip={false}
            />
            <Typography
              variant="body2"
              color="text.secondary">
              {currentOption?.label || "Set Status"}
            </Typography>
          </Box>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 220,
            mt: 1.5,
            borderRadius: 2,
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.1))",
          },
        }}
        transformOrigin={{ horizontal: "left", vertical: "top" }}
        anchorOrigin={{ horizontal: "left", vertical: "bottom" }}>
        {statusOptions.map((option) => (
          <MenuItem
            key={option.value}
            onClick={() => handleStatusChange(option.value)}
            selected={currentStatus === option.value}
            disabled={loading && currentStatus !== option.value}
            sx={{
              py: 1.5,
              "&.Mui-selected": {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              },
              "&.Mui-selected:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.2),
              },
            }}>
            <ListItemIcon>{option.icon}</ListItemIcon>
            <Box>
              <Typography variant="body2">{option.label}</Typography>
              <Typography
                variant="caption"
                color="text.secondary">
                {option.description}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
