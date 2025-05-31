import {
  Avatar,
  Divider,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@mui/material";

const ChatListItem = () => {
  return (
    <>
      <ListItem alignItems="flex-start">
        <ListItemAvatar>
          <Avatar
            alt="Remy Sharp"
            src="/static/images/avatar/1.jpg"
          />
        </ListItemAvatar>
        <ListItemText
          primary="Brunch this weekend?"
          secondary={
            <>
              <Typography
                component="span"
                variant="body2"
                sx={{ color: "text.primary", display: "inline" }}>
                Ali Connors
              </Typography>
              {" — I'll be in your neighborhood doing errands this…"}
            </>
          }
        />
      </ListItem>
      <Divider
        variant="inset"
        component="li"
      />
    </>
  );
};
export default ChatListItem;
