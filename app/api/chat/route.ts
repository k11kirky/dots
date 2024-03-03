import { kv } from '@vercel/kv'
import { OpenAIStream, StreamingTextResponse } from 'ai'
// import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleGenerativeAIStream, StreamingTextResponse } from 'ai';
import { useCompletion } from 'ai/react';

import { auth } from '@/auth'
import { nanoid } from '@/lib/utils'
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
export const runtime = 'edge'

 
export async function POST(req: Request) {
  // Extract the `messages` from the body of the request
  const { messages } = await req.json();
 
  // Ask Google Generative AI for a streaming completion given the messages
  const res = await genAI
    .getGenerativeModel({ model: 'gemini-pro' })
    .generateContentStream({
      contents: [{ role: 'user', parts: [{ text: messages }] }],
    });
 
  // Convert the response into a friendly text-stream
  const stream = GoogleGenerativeAIStream(res, {
   async onCompletion(completion) {
      const title = json.messages[0].content.substring(0, 100)
      const id = json.id ?? nanoid()
      const createdAt = Date.now()
      const path = `/chat/${id}`
      const payload = {
        id,
        title,
        userId,
        createdAt,
        path,
        messages: [
          ...messages,
          {
            content: completion,
            role: 'assistant'
          }
        ]
      }
      await kv.hmset(`chat:${id}`, payload)
      await kv.zadd(`user:chat:${userId}`, {
        score: createdAt,
        member: `chat:${id}`
      })
    }});
     
  return new StreamingTextResponse(stream)
}
