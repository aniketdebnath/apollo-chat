import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  CircularProgress,
  alpha,
  useTheme,
} from "@mui/material";
import { User } from "../../../gql/graphql";
import { BanDuration } from "../../../constants/banDuration";
import { UserAvatar } from "../../common/UserAvatar";

interface BanUserDialogProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onBan: (
    userId: string,
    duration: BanDuration,
    reason: string
  ) => Promise<void>;
  isLoading: boolean;
  isSmallScreen?: boolean;
}

const BanUserDialog: React.FC<BanUserDialogProps> = ({
  open,
  user,
  onClose,
  onBan,
  isLoading,
  isSmallScreen = false,
}) => {
  const theme = useTheme();
  const [duration, setDuration] = useState<BanDuration>(BanDuration.OneDay);
  const [reason, setReason] = useState("");

  const handleBan = async () => {
    if (!user) return;
    await onBan(user._id, duration, reason);
    setDuration(BanDuration.OneDay);
    setReason("");
  };

  const getDurationLabel = (duration: BanDuration) => {
    switch (duration) {
      case BanDuration.OneDay:
        return "1 Day";
      case BanDuration.OneWeek:
        return "1 Week";
      case BanDuration.OneMonth:
        return "1 Month";
      case BanDuration.Permanent:
        return "Permanent";
      default:
        return duration;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: isSmallScreen ? 2 : 3,
          backgroundImage: `linear-gradient(135deg, ${alpha(
            theme.palette.background.paper,
            0.95
          )}, ${alpha(theme.palette.background.paper, 0.85)})`,
          backdropFilter: "blur(10px)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
        },
      }}>
      <DialogTitle
        sx={{
          fontWeight: 600,
          pt: isSmallScreen ? 2 : 3,
          pb: isSmallScreen ? 1 : 2,
          px: isSmallScreen ? 2 : 3,
          fontSize: isSmallScreen ? "1.1rem" : "1.25rem",
        }}>
        Ban User
      </DialogTitle>
      <DialogContent
        sx={{
          px: isSmallScreen ? 2 : 3,
          py: isSmallScreen ? 1 : 2,
        }}>
        {user && (
          <>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: isSmallScreen ? 2 : 3,
                mt: isSmallScreen ? 0.5 : 1,
              }}>
              <UserAvatar
                username={user.username}
                imageUrl={user.imageUrl}
                size={isSmallScreen ? "medium" : "large"}
                sx={{ mr: isSmallScreen ? 1.5 : 2 }}
              />
              <Typography variant={isSmallScreen ? "subtitle1" : "h6"}>
                {user.username}
              </Typography>
            </Box>

            <FormControl
              fullWidth
              sx={{ mb: isSmallScreen ? 2 : 3 }}>
              <InputLabel
                id="ban-duration-label"
                sx={{ fontSize: isSmallScreen ? "0.875rem" : "inherit" }}>
                Ban Duration
              </InputLabel>
              <Select
                labelId="ban-duration-label"
                id="ban-duration"
                value={duration}
                label="Ban Duration"
                onChange={(e) => setDuration(e.target.value as BanDuration)}
                sx={{
                  fontSize: isSmallScreen ? "0.875rem" : "inherit",
                  "& .MuiSelect-select": {
                    py: isSmallScreen ? 1 : 1.5,
                  },
                }}>
                <MenuItem value={BanDuration.OneDay}>
                  {getDurationLabel(BanDuration.OneDay)}
                </MenuItem>
                <MenuItem value={BanDuration.OneWeek}>
                  {getDurationLabel(BanDuration.OneWeek)}
                </MenuItem>
                <MenuItem value={BanDuration.OneMonth}>
                  {getDurationLabel(BanDuration.OneMonth)}
                </MenuItem>
                <MenuItem value={BanDuration.Permanent}>
                  {getDurationLabel(BanDuration.Permanent)}
                </MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Reason (optional)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              multiline
              rows={isSmallScreen ? 2 : 3}
              variant="outlined"
              placeholder="Provide a reason for banning this user"
              sx={{
                "& .MuiInputLabel-root": {
                  fontSize: isSmallScreen ? "0.875rem" : "inherit",
                },
                "& .MuiOutlinedInput-input": {
                  fontSize: isSmallScreen ? "0.875rem" : "inherit",
                },
              }}
            />
          </>
        )}
      </DialogContent>
      <DialogActions
        sx={{
          px: isSmallScreen ? 2 : 3,
          pb: isSmallScreen ? 2 : 3,
          pt: isSmallScreen ? 1 : 2,
        }}>
        <Button
          onClick={onClose}
          sx={{
            fontWeight: 500,
            textTransform: "none",
            borderRadius: 2,
            px: isSmallScreen ? 1.5 : 2,
            fontSize: isSmallScreen ? "0.875rem" : "inherit",
          }}>
          Cancel
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={handleBan}
          disabled={isLoading || !user}
          sx={{
            fontWeight: 600,
            textTransform: "none",
            borderRadius: 2,
            px: isSmallScreen ? 1.5 : 2,
            fontSize: isSmallScreen ? "0.875rem" : "inherit",
            boxShadow: "none",
            "&:hover": {
              boxShadow: "0 4px 12px rgba(255, 101, 132, 0.2)",
            },
          }}>
          {isLoading ? (
            <CircularProgress
              size={isSmallScreen ? 20 : 24}
              color="inherit"
            />
          ) : (
            "Ban User"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BanUserDialog;
