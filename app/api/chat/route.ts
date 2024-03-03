import { kv } from '@vercel/kv'
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleGenerativeAIStream, Message, StreamingTextResponse } from 'ai';
import OpenAI from 'openai'

import { auth } from '@/auth'
import { nanoid } from '@/lib/utils'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

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

  const buildGoogleGenAIPrompt = (messages: Message[]) => ({
    contents: messages
      .filter(message => message.role === 'user' || message.role === 'assistant')
      .map(message => ({
        role: message.role === 'user' ? 'user' : 'model',
        parts: [{ text: message.content }],
      })),
  });

  // Ask Google Generative AI for a streaming completion given the messages
  const res = await genAI
    .getGenerativeModel({ model: 'gemini-pro' })
    .generateContentStream(buildGoogleGenAIPrompt(messages));

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
    }
  })

  return new StreamingTextResponse(stream)
}
