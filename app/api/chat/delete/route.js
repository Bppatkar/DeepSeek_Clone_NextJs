import getChatModel from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";

export async function POST(req) {
  try {
    const { userId } = getAuth(req);
    const { chatId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "user not authenticated" },
        { status: 401 }
      );
    }

    // connect the database and delete the chat
    await connectDB();
    const Chat = getChatModel();
    await Chat.deleteOne({ _id: chatId, userId });

    return NextResponse.json(
      { success: true, message: "Chat Deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("API Error in /api/chat/delete:", error);
    return NextResponse.json(
      { success: false, message: "Error renaming chat", error: error.message },
      { status: 500 }
    );
  }
}
