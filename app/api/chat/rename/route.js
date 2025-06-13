import connectDB from "@/config/db";
import getChatModel from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "user not authenticated" },
        { status: 401 }
      );
    }

    const { chatId, name } = await req.json();

    // connect the database and update the chat name
    await connectDB();
    const Chat = getChatModel();
    await Chat.findOneAndUpdate({ _id: chatId, userId }, { name });

    return NextResponse.json(
      { success: true, message: "Chat renamed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("API Error in /api/chat/rename:", error);
    return NextResponse.json(
      { success: false, message: "Error renaming chat", error: error.message },
      { status: 500 }
    );
  }
}
