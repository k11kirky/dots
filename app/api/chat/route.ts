import { kv } from '@vercel/kv'
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleGenerativeAIStream, Message, StreamingTextResponse } from 'ai';
import { NextRequest, NextResponse } from "next/server";

import { auth } from '@/auth'
import { nanoid } from '@/lib/utils'
import { getUser, getUsers } from '@/app/actions';
import { Subject } from '@/lib/types';
import { m } from 'framer-motion';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-pro", generationConfig: { maxOutputTokens: 200 } });

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
  console.log("here")
  /// Gather Subject of This message
  const userPrompt = "Who is the subject of this message? Respond with only the subject name and in lower case: ";
  const model_response_subject = await model.generateContent(messages[messages.length - 1].content + userPrompt);
  const subject = model_response_subject.response.text();

  console.log("subject", subject)

  /// Gather all messages that 
  const subject_chat_history = await getUser(subject, userId)

  let subject_messages = subject_chat_history ? subject_chat_history.messages : []
  subject_messages.push(messages[messages.length - 1])

  console.log("subject_messages", subject_messages)
  // Summarize this subject
  const summaryPrompt = "Summarize this user";
  const messagesContent = subject_messages.map(msg => msg.content).join('\n');
  console.log("messagesContent", messagesContent)
  const model_response_summary = await model.generateContent(summaryPrompt + messagesContent);
  const summary = model_response_summary.response.text();
  console.log("summary", summary)

  //Immediatley store this message for Jane
  const id = json.id ?? nanoid()
  const createdAt = Date.now()
  const path = `/subject/${id}`
  const payload = {
    id,
    name: subject,
    userId,
    createdAt,
    path,
    messages: subject_messages
  }
  console.log("payload", payload)
  await kv.hmset(`subject:${subject}`, payload)
  await kv.zadd(`user:subject:${userId}`, {
    score: createdAt,
    member: `subject:${subject}`
  })


  // Gather all Subjects
  let all_users = await getUsers(userId)
  console.log("all_users", all_users)
  let all_users_except_subject: Subject[] = [];
  if (all_users && all_users.length > 0) {
    all_users_except_subject = all_users.filter(user => user.name != subject)
  }

  console.log("all_users_except_subject", all_users_except_subject)

  // Which of these subject(s) would the Subject_prime be interested in meeting and why?

  let final_messages: Message[] = []
  if (all_users_except_subject.length > 0) {
    final_messages = [
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
                  ${user.messages.map(message => `-${message.content}`)}\n\n

                  Our User has just met ${subject}

                  Return the following:

                A Summary of What we know about ${subject}
                Give at minimum 1 recommendation for people that our user should introduce ${subject} too and 
                Give a detailed 2 sentence explanation why, also cite both the summery and info about the recommendation.`
        })}
      `
      }
    ]
  } else {
    final_messages = [
      {
        id: id,
        role: "system",
        content: `YOU ARE A SYSTEM DESIGNED TO ANALYZE INFORMATION ABOUT SUBJECTS AND OUR USERS CONTACT LIST \n
                Here is a summarty about our subject whos name is ${subject}: \n
                ${summary}
               
                this user has no contacts in their contact list.
               
                Our User has just met ${subject} here is a summary of everything they know about ${subject}\n\n

                Return the following:
                ${summary}
      `
      }
    ]
  }

  console.log("final_messages", final_messages)

  const buildGoogleGenAIPrompt = (messages: Message[]) => ({
    contents: messages
      .filter(message => message.role === 'user' || message.role === 'assistant' || message.role === 'system')
      .map(message => ({
        role: message.role === 'user' || message.role === "system" ? 'user' : 'model',
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
