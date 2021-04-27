import React, { useState, useEffect } from "react";
import queryString from 'query-string';
import io from "socket.io-client";

import TextContainer from '../TextContainer/TextContainer';
import Messages from '../Messages/Messages';
import InfoBar from '../InfoBar/InfoBar';
import Input from '../Input/Input';

import './Chat.css';

const ENDPOINT = 'http://localhost:5000/';

let socket;

const Chat = ({ location }) => {
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const [seen, setSeen] = useState(null);
  const [users, setUsers] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const { name, room } = queryString.parse(location.search);

    socket = io(ENDPOINT);

    setRoom(room);
    setName(name)

    socket.emit('join', { name, room }, (error) => {
      if(error) {
        alert(error);
      }
    });
  }, [ENDPOINT, location.search]);
  
  useEffect(() => {
    socket.on('message', message => {
      setMessages(messages => [ ...messages, message ]);
      setSeen(null)
    });
    
    socket.on("roomData", ({ users }) => {
      setUsers(users);
    });
    socket.on("seen", ( {message} ) => {
      console.log(message)
      setSeen(message)
    });
}, []);

  const crossClicked = (e) => {
    e.preventDefault();
    console.log("Cross clicked!")
  }
  
  const sendMessage = (event) => {
    event.preventDefault();
    if(message) {
      socket.emit('sendMessage', message, () => setMessage(''));
    }
  }

  const markAsRead = () => {
    socket.emit('markSeen',{userName:name},()=>{})
  }

  return (
    <div className="outerContainer">
      <div className="container">
          <InfoBar room={room} />
          <Messages messages={messages} name={name} seen={seen} />
          <Input message={message} setMessage={setMessage} sendMessage={sendMessage} />
          <div className="mark_as_read" onClick={markAsRead}>Mark as read</div>
      </div>
      <TextContainer users={users}/>
     
    </div>
  );
}

export default Chat;
