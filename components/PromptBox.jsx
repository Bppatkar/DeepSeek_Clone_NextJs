import { assets } from "@/assets/assets";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import Image from "next/image";
import React, { useState } from "react";
import toast from "react-hot-toast";

const PromptBox = ({ isLoading, setIsLoading }) => {
  const [prompt, setPrompt] = useState("");
  const { chats, user, setChats, setSelectedChat, selectedChat } =
    useAppContext();

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendPrompt(e);
     
    }
  };
  const sendPrompt = async (e) => {
    const promptCopy = prompt;
    try {
      e.preventDefault();
      if (!user) return toast.error("Login to send message");
      if (isLoading) return toast.error("wait for the previous prompt result");

      setIsLoading(true);
      setPrompt("");

      const userPrompt = {
        role: "user",
        content: prompt.trim(),
        timestamp: Date.now(),
      };

      // saving the user prompts in chat arrays
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat._id === selectedChat._id
            ? { ...chat, message: [...chat.message, userPrompt] }
            : { ...chat }
        )
      );

      // saving user prompt in selected chat

      setSelectedChat((prev) => ({
        ...prev,
        message: [...prev.message, userPrompt],
      }));

      const { data } = await axios.post("/api/chat/ai", {
        chatId: selectedChat._id,
        prompt,
      });

      if (data.success) {
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat._id === selectedChat._id
              ? { ...chat, message: [...chat.message, data.data] }
              : chat
          )
        );

        const message = data.data.content;
        const messageTokens = message.split(" ");
        let assistantMessage = {
          role: "assistant",
          content: " ",
          timestamp: Date.now(),
        };
        setSelectedChat((prev) => ({
          ...prev,
          message: [...prev.message, assistantMessage],
        }));

        for (let i = 0; i < messageTokens.length; i++) {
          setTimeout(() => {
            assistantMessage.content = messageTokens.slice(0, i + 1).join(" ");
            setSelectedChat((prev) => {
              const updatedMessages = [
                ...prev.messages.slice(0, -1),
                assistantMessage,
              ];
              return { ...prev, messages: updatedMessages };
            });
          }, i * 100);
        }
      } else {
        toast.error(data.message);
        setPrompt(promptCopy);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "An unexpected error occurred."
      );
      setPrompt(promptCopy);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <form
      onSubmit={sendPrompt}
      className={`w-full  bg-[#404045] p-4 mt-4 rounded-3xl transition-all ${
        selectedChat?.message.length > 0 ? "max-w-3xl" : "max-w-2xl"
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
            className={`${
              prompt ? "bg-primary" : "bg-[#71717a]"
            } rounded-full p-2 cursor-pointer`}
          >
            <Image
              className="w-3.5 aspect-square"
              src={prompt ? assets.arrow_icon : assets.arrow_icon_dull}
              alt=""
              width="auto"
              height="auto"
            />
          </button>
        </div>
      </div>
    </form>
  );
};

export default PromptBox;

