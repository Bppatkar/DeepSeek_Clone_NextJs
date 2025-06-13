"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

export const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppContextProvider = ({ children }) => {
  const { user } = useUser();
  const { getToken } = useAuth();

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  const createNewChat = async () => {
    try {
      if (!user) {
        toast.error("Please login to create a chat.");
        return null;
      }
      const token = await getToken();
      const response = await axios.post(
        "/api/chat/create",
        { userId: user.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const newChat = response.data.data;
        setChats((prevChats) => [newChat, ...prevChats]);
        setSelectedChat(newChat);
        toast.success("New chat created!");
        return newChat;
      } else {
        toast.error(response.data.message || "Failed to create new chat.");
        return null;
      }
    } catch (error) {
      console.error("Error creating new chat:", error);
      toast.error(error.response?.data?.message || error.message || "Error creating chat.");
      return null;
    }
  };

  const fetchUserChat = async () => {
    try {
      if (!user) {
        setChats([]);
        setSelectedChat(null); // Clear selected chat if user is not logged in
        return;
      }
      const token = await getToken();
      const { data } = await axios.get("/api/chat/get", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        let fetchedChats = data.data || [];

        // Sort chats by last updated time to show recents first
        fetchedChats.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        if (fetchedChats.length === 0) {
          // If no chats, create a new one
          const newChat = await createNewChat();
          if (newChat) {
             setChats([newChat]);
             setSelectedChat(newChat);
          }
        } else {
          setChats(fetchedChats);
          // If selectedChat is null or not in the fetched chats, select the most recent one
          if (!selectedChat || !fetchedChats.some(chat => chat._id === selectedChat._id)) {
            setSelectedChat(fetchedChats[0]);
          }
        }
      } else {
        toast.error(data.message || "Failed to fetch chats.");
      }
    } catch (error) {
      console.error("Error fetching user chats:", error);
      toast.error(error.response?.data?.message || error.message || "Error fetching chats.");
      setChats([]); // Clear chats on error
      setSelectedChat(null); // Clear selected chat on error
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchUserChat();
    } else {
      setChats([]);
      setSelectedChat(null);
    }
  }, [user?.id]); // Dependency array ensures it runs when user.id changes

  const value = {
    user,
    chats,
    setChats,
    selectedChat,
    setSelectedChat,
    fetchUserChat, 
    createNewChat,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};