import connectDB from "@/config/db";
import getChatModel from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "user not authenticated" },
        { status: 401 }
      );
    }

    // connect the database and fetch all chats from user
    await connectDB();
    const Chat = getChatModel();
    const chats = await Chat.find({ userId });

    return NextResponse.json(
      { success: true, data: chats, message: "Chat fetched successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("API Error in /api/chat/get:", error);
    return NextResponse.json(
      { success: false, message: "Error getting chat", error: error.message },
      { status: 500 }
    );
  }
}
