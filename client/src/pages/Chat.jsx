import React, { useEffect, useRef, useState } from 'react';
import styled from "styled-components";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import {io} from "socket.io-client";
import { allUsersRoute,host } from '../utils/APIROUTES';
import Contacts from '../components/Contacts';
import Welcome from '../components/Welcome';
import ChatContainer from '../components/ChatContainer';



function Chat() {
  const navigate=useNavigate();
  const socket =useRef(io());
  console.log('Socket object:', socket.current);

  const [contacts,setContacts]=useState([]);
  const [currentChat,setCurrentChat]=useState(undefined);
  const [currentUser,setCurrentUser]=useState(undefined);

  useEffect(() => {
    const checkUserAndNavigate = async () => {
       const storedUser = localStorage.getItem("chat-app-user");
 
       if (!storedUser) {
          navigate("/login");
       } else {
          setCurrentUser(await JSON.parse(storedUser));
       }
    };
 
    checkUserAndNavigate();
 }, []);
 
 useEffect(() => {
  if (currentUser) {
     socket.current = io(host);
     socket.current.emit("add-user", currentUser._id);
  }
}, [currentUser]);

useEffect(() => {
  const fetchContacts = async () => {
     try {
        if (currentUser && currentUser.isAvatarImageSet) {
           const { data } = await axios.get(`${allUsersRoute}/${currentUser._id}`);
           setContacts(data);
        } else if (currentUser) {
           navigate("/setAvatar");
        }
     } catch (error) {
        console.error("Error fetching contacts:", error);
     }
  };

  if (currentUser) {
     fetchContacts();
  }
}, [currentUser]);

const handleChatChange = (chat) => {
  setCurrentChat(chat);
};


 

  return (
  
      <>
        <Container>
          <div className="container">
            <Contacts contacts={contacts} changeChat={handleChatChange} />
            {currentChat === undefined ? (
              <Welcome />
            ) : (
              <ChatContainer currentChat={currentChat} socket={socket} />
            )}
          </div>
        </Container>
      </>
    
  );
}
const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-color: #131324;
  .container {
    height: 85vh;
    width: 85vw;
    background-color: #00000076;
    display: grid;
    grid-template-columns: 25% 75%;
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      grid-template-columns: 35% 65%;
    }
  }
`;

export default Chat