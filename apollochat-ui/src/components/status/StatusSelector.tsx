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
  Paper,
  Fade,
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
    color: "#44b700",
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
    color: "#ff9800",
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
    color: "#f44336",
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
    color: "#bdbdbd",
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
        TransitionComponent={Fade}
        transitionDuration={200}
        MenuListProps={{
          sx: {
            p: 1,
          },
        }}
        PaperProps={{
          component: Paper,
          elevation: 6,
          sx: {
            minWidth: { xs: 240, sm: 280 },
            maxWidth: "95vw",
            mt: 1.5,
            borderRadius: 3,
            backdropFilter: "blur(10px)",
            background: alpha(theme.palette.background.paper, 0.85),
            backgroundImage: `linear-gradient(to bottom right, ${alpha(
              theme.palette.background.paper,
              0.95
            )}, ${alpha(theme.palette.background.paper, 0.85)})`,
            overflow: "hidden",
            boxShadow: `0 10px 40px -10px ${alpha(
              theme.palette.common.black,
              0.3
            )}`,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            "&:before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "4px",
              background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            },
          },
        }}
        transformOrigin={{ horizontal: "left", vertical: "top" }}
        anchorOrigin={{ horizontal: "left", vertical: "bottom" }}>
        <Box sx={{ px: 1, pb: 1, pt: 2 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              textTransform: "uppercase",
              fontSize: "0.7rem",
              letterSpacing: 0.5,
              opacity: 0.7,
              ml: 1.5,
            }}>
            Set Your Status
          </Typography>
        </Box>
        {statusOptions.map((option) => (
          <MenuItem
            key={option.value}
            onClick={() => handleStatusChange(option.value)}
            selected={currentStatus === option.value}
            disabled={loading && currentStatus !== option.value}
            sx={{
              py: 1.5,
              px: 2,
              borderRadius: 2,
              mb: 0.5,
              position: "relative",
              overflow: "hidden",
              transition: "all 0.2s ease",
              "&:last-child": {
                mb: 0,
              },
              "&.Mui-selected": {
                backgroundColor: alpha(option.color, 0.1),
                "&:before": {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 4,
                  height: "60%",
                  borderRadius: "0 4px 4px 0",
                  backgroundColor: option.color,
                },
              },
              "&:hover": {
                backgroundColor: alpha(option.color, 0.08),
                transform: "translateX(2px)",
              },
              "&.Mui-selected:hover": {
                backgroundColor: alpha(option.color, 0.15),
              },
            }}>
            <ListItemIcon
              sx={{
                minWidth: 36,
                color: option.color,
              }}>
              {option.icon}
            </ListItemIcon>
            <Box sx={{ overflow: "hidden" }}>
              <Typography
                variant="body2"
                fontWeight={500}
                sx={{
                  display: "block",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}>
                {option.label}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "block",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: { xs: "180px", sm: "220px" },
                }}>
                {option.description}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

