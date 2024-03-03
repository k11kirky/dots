import { kv } from '@vercel/kv'
import { OpenAIStream, StreamingTextResponse } from 'ai'
// import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleGenerativeAIStream, StreamingTextResponse } from 'ai';
 
import { auth } from '@/auth'
import { nanoid } from '@/lib/utils'

export const runtime = 'edge'

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY
// })
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export async function POST(req: Request) {
  // Extract the `prompt` from the body of the request
  const { prompt } = await req.json();
 
  // Ask Google Generative AI for a streaming completion given the prompt
  const res = await genAI
    .getGenerativeModel({ model: 'gemini-pro' })
    .generateContentStream({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
 
  // Convert the response into a friendly text-stream
  const stream = GoogleGenerativeAIStream(res);
 

  const stream = OpenAIStream(res, {
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
    }
  })

  return new StreamingTextResponse(stream)
}
