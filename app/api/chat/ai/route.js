export const maxDuration = 60; // Max duration for the serverless function
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
    await connectDB(); // Connect to MongoDB
    const Chat = getChatModel();
    const { userId } = getAuth(req);
    const { chatId, prompt } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Find the chat document
    const chatDocument = await Chat.findOne({ userId, _id: chatId });

    if (!chatDocument) {
      return NextResponse.json(
        { success: false, error: "Chat not found" },
        { status: 404 }
      );
    }

    // Add user's message to the chat document
    const userMessage = {
      role: "user",
      content: prompt.trim(),
      timestamp: Date.now(),
    };
    chatDocument.message.push(userMessage);

    // Prepare messages for DeepSeek API (send full history for context)
    const messagesForDeepSeek = chatDocument.message.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    let assistantResponse;

    // Optional: Mock AI response for local development (set USE_MOCK_AI=true in .env.local)
    if (process.env.NODE_ENV === 'development' && process.env.USE_MOCK_AI === 'true') {
      console.log("Using Mock AI Response.");
      assistantResponse = {
        role: "assistant",
        content: `This is a mock AI response for: "${prompt.trim()}".`,
      };
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    } else {
      // Call DeepSeek API for chat completion
      const completion = await openai.chat.completions.create({
        messages: messagesForDeepSeek, // Pass complete conversation history
        model: "deepseek-chat",
        // 'store: true' is removed as it's not a valid parameter
      });
      assistantResponse = completion.choices[0].message;
    }

    // Add AI's response to the chat document and save
    assistantResponse.timestamp = Date.now();
    chatDocument.message.push(assistantResponse);
    await chatDocument.save(); // Await the save operation

    return NextResponse.json({ success: true, data: assistantResponse }, { status: 200 });

  } catch (error) {
    console.error("API Error in /api/chat/ai:", error); // Log detailed server error
    return NextResponse.json(
      { success: false, message: error.message || "An internal server error occurred" },
      { status: 500 }
    );
  }
}