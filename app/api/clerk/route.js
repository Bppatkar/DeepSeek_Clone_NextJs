import { Webhook } from "svix";
import connectDB from "@/config/db";
import getUserModel from "@/models/User";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req) {
  const wh = new Webhook(process.env.SIGNING_SECRET);
  const headerPayload = await headers();
  const svixHeaders = {
    "svix-id": headerPayload.get("svix-id"),
    "svix-timestamp": headerPayload.get("svix-timestamp"),
    "svix-signature": headerPayload.get("svix-signature"),
  };

  // Get the payload and verify it
  const payload = await req.json();
  const body = JSON.stringify(payload);
  const { data, type } = wh.verify(body, svixHeaders);

  // prepare the user data to be saved in the database
  const userData = {
    _id: data.id,
    name: `${data.first_name} ${data.last_name}`,
    email: data.email_addresses[0].email_address,
    image: data.image_url,
  };

  // connect to the database
  await connectDB();
  const User = getUserModel();

  switch (type) {
    case "user.created":
      await User.create(userData);
      console.log("User created:", userData);
      break;
    case "user.updated":
      await User.findByIdAndUpdate(data.id, userData);
      console.log("User updated:", userData);
      break;
    case "user.deleted":
      await User.findByIdAndDelete(data.id);
      console.log("User deleted:", data.id);
      break;

    default:
      console.log("Unhandled event type:", type);
      break;
  }
  return NextResponse.json({ message: "Event received" });
}
