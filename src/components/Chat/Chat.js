import React, { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  TextField,
  IconButton,
  createTheme,
  ThemeProvider,
  Typography,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

const ChatDrawer = ({ open, onClose, playerData }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");

  const handleInput = (event) => {
    setInputValue(event.target.value);
  };

  const handleSend = () => {
    if (inputValue.trim() !== "") {
      setMessages((prevMessages) => [
        ...prevMessages,
        { message: inputValue, sender: `${playerData.name}` },
      ]);
      setInputValue("");
    }
  };

  const theme = createTheme({
    palette: {
      mode: "dark",
    },
    components: {
      MuiDrawer: {
        styleOverrides: {
          paper: {
            width: 400,
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <Drawer anchor="left" open={open} onClose={onClose}>
        <div>
          <Typography variant="h6" style={{ padding: "1rem" }}>
            Chat
          </Typography>
          <List>
            {messages.map((msg, index) => (
              <ListItem key={index}>
                <ListItemAvatar>
                  <Avatar>{msg.sender[0].toUpperCase()}</Avatar>
                </ListItemAvatar>
                <ListItemText primary={msg.sender} secondary={msg.message} />
              </ListItem>
            ))}
          </List>
        </div>
        <div
          style={{
            padding: "1rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <TextField
            label="Type your message"
            variant="outlined"
            fullWidth
            value={inputValue}
            onChange={handleInput}
          />
          <IconButton onClick={handleSend}>
            <SendIcon />
          </IconButton>
        </div>
      </Drawer>
    </ThemeProvider>
  );
};

export default ChatDrawer;
