import { useLocation, useParams } from "react-router-dom";
import { useGetChat } from "../../hooks/useGetChat";
import {
  Avatar,
  Box,
  Divider,
  Grid,
  IconButton,
  InputBase,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useCreateMessage } from "../../hooks/useCreateMessage";
import { useEffect, useRef, useState } from "react";
import { useGetMessages } from "../../hooks/useGetMessages";
const Chat = () => {
  const params = useParams();
  const [message, setMessage] = useState("");
  const chatId = params._id!;
  const { data } = useGetChat({ _id: chatId });
  const [createMessage] = useCreateMessage(chatId);
  const { data: messages } = useGetMessages({ chatId });
  const divRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();

  const scrollToBottom = () => divRef.current?.scrollIntoView();
  useEffect(() => {
    setMessage("");
    scrollToBottom();
  }, [location, messages]);
  const handleCreateMessage = async () => {
    await createMessage({
      variables: { createMessageInput: { content: message, chatId } },
    });
    setMessage("");
    scrollToBottom();
  };
  return (
    <Stack sx={{ height: "100%", justifyContent: "space-between" }}>
      <h1>{data?.chat.name}</h1>
      <Box sx={{ maxHeight: "70vh", overflow: "auto" }}>
        {messages?.messages.map((message) => (
          <Grid
            container
            alignItems="center"
            marginBottom="1rem">
            <Grid
              item
              xs={2}
              lg={1}>
              <Avatar
                src=""
                sx={{ width: 52, height: 52 }}
              />
            </Grid>
            <Grid
              item
              xs={10}
              lg={11}>
              <Stack>
                <Paper sx={{ width: "fit-content" }}>
                  <Typography sx={{ padding: "0.9rem" }}>
                    {message.content}
                  </Typography>
                </Paper>
                <Typography
                  variant="caption"
                  sx={{ marginLeft: "0.25rem" }}>
                  {new Date(message.createdAt).toLocaleTimeString()}
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        ))}
        <div ref={divRef}></div>
      </Box>
      <Paper
        sx={{
          p: "2px 4px",
          display: "flex",
          justifySelf: "flex-end",
          alignItems: "center",
          width: "100%",
          margin: "1rem 0",
        }}>
        <InputBase
          sx={{ ml: 1, flex: 1, width: "100%" }}
          placeholder="Message"
          onChange={(e) => setMessage(e.target.value)}
          value={message}
          onKeyDown={async (e) => {
            if (e.key === "Enter") {
              await handleCreateMessage();
            }
          }}></InputBase>
        <Divider
          sx={{ height: 28, m: 0.5 }}
          orientation="vertical"
        />
        <IconButton
          color="primary"
          sx={{ p: "10px" }}
          onClick={async () => {
            await handleCreateMessage();
          }}>
          <SendIcon />
        </IconButton>
      </Paper>
    </Stack>
  );
};
export default Chat;
