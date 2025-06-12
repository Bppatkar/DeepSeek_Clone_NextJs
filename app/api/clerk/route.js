import { Webhook } from "svix";
import connectDB from "@/config/db";
import User from "@/models/User";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

export async function POST(req, res) {
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
    email:
      data.email_addresses && data.email_addresses.length > 0
        ? data.email_addresses[0].email_address
        : null,
    image: data.image_url,
  };

  // connect to the database
  await connectDB();

  switch (type) {
    case "user.created":
      await User.create(userData);
      break;
    case "user.updated":
      await User.findByIdAndUpdate(data.id, userData);
      break;
    case "user.deleted":
      await User.findByIdAndDelete(data.id);
      break;

    default:
      break;
  }
  return NextRequest.json({ message: "Event received" });
}
