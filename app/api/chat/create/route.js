import connectDB from "@/config/db";
import getChatModel from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "user not authemticated" },
        { status: 401 }
      );
    }
    // prepare chat data to saved in database
    const chatData = {
      userId,
      message: [],
      name: "New Chat",
    };

    // connect the database and create the new chat
    await connectDB();
    const Chat = getChatModel();
    await Chat.create(chatData);
    return NextResponse.json(
      { success: true, message: "Chat created successfully", data: chatData },
      { status: 200 }
    );
  } catch (error) {
    console.error("API Error in /api/chat/create:", error);
    return NextResponse.json(
      { success: false, message: "Error creating chat", error: error.message },
      { status: 500 }
    );
  }
}
