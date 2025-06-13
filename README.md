# DeepSeek AI Clone (Next.js)

![Screenshot 2025-06-13 093127](https://github.com/user-attachments/assets/1263395b-de7f-4d94-8e5a-677354a06b56)
![Screenshot 2025-06-13 093153](https://github.com/user-attachments/assets/eb97a8b5-c8cc-4c12-a420-5071186e0ddb)
![Screenshot 2025-06-13 093232](https://github.com/user-attachments/assets/7b6ed3a0-05c7-45f8-ad40-6a04e876126c)
![Screenshot 2025-06-13 093307](https://github.com/user-attachments/assets/10d91f24-be03-4c09-bdcf-d544feff1bec)


A full-stack web application cloning the core functionalities of an AI chat interface, similar to DeepSeek.

## Key Features

- **Real-time Chat Interactions**: Engage in dynamic conversations with the AI
- **User Authentication**: Securely manage user sessions with Clerk
- **Chat History**: Persisted chat conversations with the ability to:
  - Rename chats
  - Delete chats
- **AI Powered Responses**: Integrates with the DeepSeek API to generate intelligent replies
- **Modern UI**: Built with Next.js for a fast and responsive user experience
- **Database**: Utilizes MongoDB Atlas for storing chat data

## Technologies Used

### Frontend:
- Next.js
- React

### Backend (API Routes in Next.js):
- Node.js
- Axios (for API calls)

### Services:
- **Authentication**: Clerk
- **Database**: MongoDB Atlas
- **AI Integration**: DeepSeek API

## Live Demo

[Live Link ](https://deep-seek-clone-next-js.vercel.app/)

**Important Note**:  
The DeepSeek AI API top-up is currently expired, so you might encounter an "insufficient balance" error when trying to send messages on the live demo.
