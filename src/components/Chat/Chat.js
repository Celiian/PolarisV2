import React, { useState, useEffect } from "react";
import { ref, onValue, off } from "firebase/database";
import db from "../../firebaseConfig";
import { SendMessage } from "../../utils/utils";

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

import "./Chat.css";

// Assets bases
import Base1 from "../../assets/img/ships/ship1/base/base.png";
import Base2 from "../../assets/img/ships/ship2/base/base.png";
import Base3 from "../../assets/img/ships/ship3/base/base.png";
import Base4 from "../../assets/img/ships/ship4/base/base.png";

const ships = {
  Base1,
  Base2,
  Base3,
  Base4,
};

const ChatDrawer = ({
  open,
  onClose,
  playerData,
  setDataInDatabase,
  token,
}) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");

  const handleInput = (event) => {
    setInputValue(event.target.value);
  };

  const handleSend = async () => {
    if (inputValue.trim() !== "") {
      messages.push({
        message: inputValue,
        sender: `${playerData.name}`,
        player_id: `${playerData.id}`,
      });
      await SendMessage(setDataInDatabase, messages, token);
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

  useEffect(() => {
    if (token) {
      const databaseRef = ref(db, "/game_room/" + token);
      onValue(databaseRef, (snapshot) => {
        if (snapshot.val().chat) {
          setMessages(snapshot.val().chat);
        }
      });

      return () => {
        off(databaseRef);
      };
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Drawer anchor="left" open={open} onClose={onClose}>
        <div className="chat-container">
          <h1>GameChat</h1>
          <List>
            {messages.map((msg, index) => (
              <ListItem
                key={index}
                className={
                  msg.player_id === localStorage.getItem("player_id")
                    ? "align-right"
                    : ""
                }
              >
                <img
                  className="img-ship-players"
                  src={ships[`Base${msg.player_id}`]}
                  alt={`ship-player${msg.player_id}`}
                />
                <ListItemText
                  primary={`${msg.sender} (${playerData.points}pts)`}
                  secondary={msg.message}
                  className={
                    msg.player_id === localStorage.getItem("player_id")
                      ? "align-right-text"
                      : ""
                  }
                />
              </ListItem>
            ))}
          </List>
        </div>
        <div className="sendchat-container">
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
