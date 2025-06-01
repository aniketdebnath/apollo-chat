import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormGroup,
  IconButton,
  InputBase,
  Modal,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import { useCreateChat } from "../../../hooks/useCreateChat";

interface ChatListAddProps {
  open: boolean;
  handleClose: () => void;
}

const ChatListAdd = ({ open, handleClose }: ChatListAddProps) => {
  const [isPrivate, setIsPrivate] = useState(true);
  const [createChat] = useCreateChat();
  const [name, setName] = useState<string | undefined>("");
  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}>
        <Box
          sx={{
            position: "absolute" as "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            width: 400,
            bgcolor: "background.paper",
            border: "1px solid #000",
            boxShadow: 24,
            p: 4,
          }}>
          <Stack spacing={2}>
            <Typography
              variant="h6"
              component="h2">
              Add Chat
            </Typography>
            <FormGroup>
              <FormControlLabel
                style={{ width: 0 }}
                control={
                  <Switch
                    defaultChecked
                    value={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                  />
                }
                label="Private"
              />
            </FormGroup>
            {isPrivate ? (
              <Paper
                sx={{ p: "2px 4px", display: "flex", alignItems: "center" }}>
                <InputBase
                  sx={{ ml: 1, flex: 1 }}
                  placeholder="Search Users"
                />
                <IconButton sx={{ p: "10px" }}>
                  <SearchIcon />
                </IconButton>
              </Paper>
            ) : (
              <TextField
                label="Name"
                onChange={(e) => setName(e.target.value)}
              />
            )}
            <Button
              variant="outlined"
              onClick={async () => {
                await createChat({
                  variables: {
                    createChatInput: { isPrivate, name: name || undefined },
                  },
                });
                handleClose();
              }}>
              Save
            </Button>
          </Stack>
        </Box>
      </Modal>
    </>
  );
};
export default ChatListAdd;
