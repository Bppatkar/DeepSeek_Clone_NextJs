export const maxDuration = 60;
import connectDB from "@/config/db";
import getChatModel from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export async function POST(req) {
  try {
    await connectDB();
    const Chat = getChatModel();
    const { userId } = getAuth(req);
    const { chatId, prompt } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "user not authenticated" },
        { status: 401 }
      );
    }

    // find the chat document in the database based on userId and chatId
    const data = await Chat.findOne({ userId, _id: chatId });

    if (!data) {
      return NextResponse.json(
        { success: false, error: "Chat not found" },
        { status: 404 } // 404 Not Found is appropriate
      );
    }
    // create a user message object
    const userprompt = {
      role: "user",
      content: prompt,
      timestamp: Date.now(),
    };

    data.message.push(userprompt);

    // call the deepseek api to get  a chat completion

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "deepseek-chat",
      store: true,
    });
    const message = completion.choices[0].message;
    message.timestamp = Date.now();
    data.message.push(message);
    data.save();

    return NextResponse.json({ success: true, data: message }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
