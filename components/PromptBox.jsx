import { assets } from "@/assets/assets";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import Image from "next/image";
import React, { useState, useEffect } from "react"; // Import useEffect
import toast from "react-hot-toast";

const PromptBox = ({ isLoading, setIsLoading }) => {
  const [prompt, setPrompt] = useState("");
  const { chats, user, setChats, setSelectedChat, selectedChat } =
    useAppContext();

  // Effect to clear prompt when selectedChat changes
  useEffect(() => {
    setPrompt(""); // Clear prompt when a different chat is selected
  }, [selectedChat]); // Dependency array: run this effect whenever selectedChat changes

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendPrompt(e);
    }
  };

  const sendPrompt = async (e) => {
    const promptCopy = prompt; // Save prompt for potential error recovery
    try {
      e.preventDefault();

      // Client-side validation checks
      if (!user) return toast.error("Login to send message");
      if (isLoading) return toast.error("Wait for the previous prompt result");
      if (!selectedChat) {
        toast.error("Please select or create a chat first.");
        setIsLoading(false);
        return;
      }
      if (!prompt.trim()) {
        toast.error("Please enter a message.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setPrompt(""); // Clear input field immediately after sending

      const userPrompt = {
        role: "user",
        content: prompt.trim(),
        timestamp: Date.now(),
      };

      // Add user's message to local state immediately
      const currentSelectedChatMessages = selectedChat.message || [];
      const updatedMessagesWithUserPrompt = [...currentSelectedChatMessages, userPrompt];

      // Update the specific chat in the `chats` array
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat._id === selectedChat._id
            ? { ...chat, message: updatedMessagesWithUserPrompt }
            : chat // Return chat as is if not the selected one
        )
      );
      // Update the `selectedChat` state
      setSelectedChat((prev) => ({
        ...prev,
        message: updatedMessagesWithUserPrompt,
      }));

      // Send prompt to API
      const { data: apiResponse } = await axios.post("/api/chat/ai", {
        chatId: selectedChat._id,
        prompt: prompt.trim(),
      });

      if (apiResponse.success) {
        const aiMessageContent = apiResponse.data.content;
        const aiMessageRole = apiResponse.data.role;
        const aiMessageTimestamp = apiResponse.data.timestamp;

        // Add an empty assistant message for streaming display
        let assistantMessageForStreaming = {
          role: aiMessageRole,
          content: " ",
          timestamp: aiMessageTimestamp,
        };
        const messagesWithInitialAIMessage = [...updatedMessagesWithUserPrompt, assistantMessageForStreaming];

        // Update selectedChat immediately for streaming
        setSelectedChat((prev) => {
          if (!prev) return null; // Handle if selectedChat becomes null unexpectedly
          return { ...prev, message: messagesWithInitialAIMessage };
        });

        // Update the specific chat in the `chats` array with the initial AI message
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat._id === selectedChat._id
              ? { ...chat, message: messagesWithInitialAIMessage }
              : chat
          )
        );


        // Simulate typing/streaming effect for AI response
        const messageTokens = aiMessageContent.split(" ");
        let currentStreamedContent = "";

        for (let i = 0; i < messageTokens.length; i++) {
          await new Promise(resolve => setTimeout(resolve, i * 10)); // Delay for typing effect
          currentStreamedContent += (i > 0 ? " " : "") + messageTokens[i];

          setSelectedChat((prev) => {
            if (!prev || !prev.message) return prev;
            const updatedMessages = [...prev.message];
            const lastMessageIndex = updatedMessages.length - 1;

            if (lastMessageIndex >= 0 && updatedMessages[lastMessageIndex].role === aiMessageRole) {
              updatedMessages[lastMessageIndex] = {
                ...updatedMessages[lastMessageIndex],
                content: currentStreamedContent,
              };
            }
            return { ...prev, message: updatedMessages };
          });
        }
        // Ensure the full message is displayed after streaming
        setSelectedChat((prev) => {
            if (!prev || !prev.message) return prev;
            const updatedMessages = [...prev.message];
            const lastMessageIndex = updatedMessages.length - 1;
            if (lastMessageIndex >= 0 && updatedMessages[lastMessageIndex].role === aiMessageRole) {
                updatedMessages[lastMessageIndex] = {
                    ...updatedMessages[lastMessageIndex],
                    content: aiMessageContent,
                };
            }
            return { ...prev, message: updatedMessages };
        });

      } else {
        toast.error(apiResponse.message);
        setPrompt(promptCopy); // Restore prompt on API error
      }
    } catch (error) {
      console.error("Error sending prompt:", error); // Log the error for debugging
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "An unexpected error occurred."
      );
      setPrompt(promptCopy); // Restore prompt on fetch error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={sendPrompt}
      className={`w-full bg-[#404045] p-4 mt-4 rounded-3xl transition-all ${
        selectedChat?.message?.length > 0 ? "max-w-3xl" : "max-w-2xl"
      }`}
    >
      <textarea
        onKeyDown={handleKeyDown}
        className="outline-none w-full resize-none overflow-hidden break-words bg-transparent"
        rows={2}
        placeholder="Message Deepseek "
        required
        onChange={(e) => setPrompt(e.target.value)}
        value={prompt}
      />
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <p className="flex items-center gap-2 text-sm border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20 transition">
            <Image className="h-5" src={assets.deepthink_icon} alt="" />
            DeepThink (R1)
          </p>
          <p className="flex items-center gap-2 text-sm border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20 transition">
            <Image className="h-5" src={assets.search_icon} alt="" />
            Search
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Image className="w-4 cursor-pointer" src={assets.pin_icon} alt="" />
          <button
            type="submit" // Ensure this is a submit button
            className={`${
              prompt ? "bg-primary" : "bg-[#71717a]"
            } rounded-full p-2 cursor-pointer`}
          >
            <Image
              className="w-3.5 aspect-square"
              src={prompt ? assets.arrow_icon : assets.arrow_icon_dull}
              alt=""
              width={14}
              height={14}
            />
          </button>
        </div>
      </div>
    </form>
  );
};

export default PromptBox;