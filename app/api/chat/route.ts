import { kv } from '@vercel/kv'
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleGenerativeAIStream, Message, StreamingTextResponse } from 'ai';
import { NextRequest, NextResponse } from "next/server";

import { auth } from '@/auth'
import { nanoid } from '@/lib/utils'
import { getUser, getUsers } from '@/app/actions';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-pro", generationConfig: { maxOutputTokens: 200 }});

export const runtime = 'edge'

export async function POST(req: Request) {
  const json = await req.json()
  const { messages, previewToken } = json
  const userId = (await auth())?.user.id

  if (!userId) {
    return new Response('Unauthorized', {
      status: 401
    })
  }
  /// Gather Subject of This message
  const userPrompt = "Who is the subject of this message?: ";
  const model_response_subject = await model.generateContent(messages[messages.length-1].content + userPrompt);
  const subject = model_response_subject.response.text();
  
  /// Gather all messages that 
  const subject_chat_history = await getUser(subject, userId)
  
  let subject_messages = [
    ...(subject_chat_history?.messages || []),
    {
      content: messages[messages.length-1],
      role: 'user'
    }
  ]
  // Summarize this subject
  const summaryPrompt = "Summarize this user";
  const messagesContent = subject_messages.map(msg => msg.content).join('\n');
  const model_response_summary = await model.generateContent(summaryPrompt + messagesContent);
  const summary = model_response_summary.response.text();

  //Immediatley store this message for Jane
  const id = json.id ?? nanoid()
  const createdAt = Date.now()
  const path = `/subject/${id}`
  const payload = {
    id,
    name:subject,
    userId,
    createdAt,
    path,
    messages: subject_messages
  }
  await kv.hmset(`subject:${id}`, payload)
  await kv.zadd(`user:subject:${userId}`, {
    score: createdAt,
    member: `subject:${subject}`
  })


  // Gather all Subjects
  const all_users = await getUsers(userId)
  const all_users_except_subject = all_users.filter(user => user.name != subject)
  
  // Which of these subject(s) would the Subject_prime be interested in meeting and why?

  const final_messages: Message[] = [
    {
      id: id,
      role: "system",
      content: `YOU ARE A SYSTEM DESIGNED TO ANALYZE INFORMATION ABOUT SUBJECTS AND OUR USERS CONTACT LIST \n
                Here is a summarty about our subject whos name is ${subject}: \n
                ${summary}
                Here is information about every contact in our users contact list: \n
                ${all_users_except_subject.map(user => {
                  return `name: ${user.name}\n
                  everything we know about ${user.name}:
                  ${user.messages.map(message => `-${message.content}`)}`
                })}
      `
    },
    {
      id:id,
      role: "user",
      content: `Our User has just met ${subject} here is a summary of everything they know about ${subject}\n
                Give at minimum 1 recommendation for people that our user should introduce ${subject} too and 
                Give a detailed 2 sentence explanation why, also cite both ${summary} and info about the recommendation.
          `
    },
  ]

  const buildGoogleGenAIPrompt = (messages: Message[]) => ({
    contents: messages
      .filter(message => message.role === 'user' || message.role === 'assistant' || message.role ==='system')
      .map(message => ({
        role: message.role === 'user' ? 'user' : 'model',
        parts: [{ text: message.content }],
      })),
  });
  //Synchronous request
  // subject
  
  // Ask Google Generative AI for a streaming completion given the Subject
  const res = await genAI
    .getGenerativeModel({ model: 'gemini-pro' })
    .generateContentStream(buildGoogleGenAIPrompt(final_messages));

  const stream = GoogleGenerativeAIStream(res, {

  })

  return new StreamingTextResponse(stream)
}
