import { assets } from "@/assets/assets";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import Image from "next/image";
import React from "react";
import toast from "react-hot-toast";

// Destructure `isSelected` and `onClick` from props as they are passed from Sidebar
const ChatLabel = ({ openMenu, setOpenMenu, id, name, isSelected, onClick }) => {
  // Use the correct function name: fetchUserChat
  const { fetchUserChat, setSelectedChat } = useAppContext();

  const renameHandler = async () => {
    try {
      const newName = prompt("Enter new name");
      if (!newName) return;
      const { data } = await axios.post("/api/chat/rename", {
        chatId: id,
        name: newName,
      });
      if (data.success) {
        fetchUserChat(); // Corrected function name
        setOpenMenu({ id: 0, open: false });
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      // It's good practice to log the full error object for debugging
      console.error("Error renaming chat:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to rename chat.");
    }
  };

  const deleteHandler = async () => {
    try {
      const confirm = window.confirm(
        "Are you sure you want to delete this chat?"
      );
      if (!confirm) return;
      const { data } = await axios.post("/api/chat/delete", {
        chatId: id,
      });
      if (data.success) {
        fetchUserChat(); // Corrected function name
        setOpenMenu({ id: 0, open: false });
        setSelectedChat(null); // Clear selected chat after deletion
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      // It's good practice to log the full error object for debugging
      console.error("Error deleting chat:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to delete chat.");
    }
  };

  return (
    <div
      onClick={onClick} // Use the onClick prop passed from Sidebar
      className={`flex items-center justify-between p-2 text-white/80 hover:bg-white/10 rounded-lg text-sm group cursor-pointer ${
        isSelected ? "bg-primary" : "" // Apply styling based on isSelected prop
      }`}
    >
      <p className="group-hover:max-w-5/6 truncate">{name}</p>
      <div
        onClick={(e) => {
          e.stopPropagation(); // Prevents `onClick` of the parent div
          setOpenMenu({ id: id, open: !openMenu.open });
        }}
        className="group relative flex items-center justify-center h-6 w-6 aspect-square hover:bg-black/80 rounded-lg"
      >
        <Image
          src={assets.three_dots}
          alt=""
          className={`w-4 ${
            openMenu.id === id && openMenu.open ? "" : "hidden" // No need for extra space
          } group-hover:block`}
        />
        <div
          className={`absolute -right-36 top-6 bg-gray-700 rounded-xl w-max p-2 ${
            openMenu.id === id && openMenu.open ? "" : "hidden" // No need for extra space
          }`}
        >
          <div
            onClick={renameHandler}
            className="flex items-center gap-3 hover:bg-white/10 px-3 py-2 cursor-pointer"
          >
            <Image src={assets.pencil_icon} alt="" className="w-4" />
            <p>Rename</p>
          </div>
          <div
            onClick={deleteHandler}
            className="flex items-center gap-3 hover:bg-white/10 px-3 py-2 cursor-pointer"
          >
            <Image src={assets.delete_icon} alt="" className="w-4" />
            <p>Delete</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatLabel;