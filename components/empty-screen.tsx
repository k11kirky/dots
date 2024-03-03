import { UseChatHelpers } from 'ai/react'

import { Button } from '@/components/ui/button'
import { ExternalLink } from '@/components/external-link'
import { IconArrowRight } from '@/components/ui/icons'

const exampleMessages = [
  {
    heading: 'Summarize a meeting',
    message: `I just met with Jane, she is a software engineer at Google. She is interested in machine learning and has a dog named Max.`
  },
  {
    heading: 'Remember an insight',
    message: 'Jane loves to travel and has been to 20 countries.'
  },
  {
    heading: 'Remind me about...',
    message: `Remind me that Jane is a software engineer at Google.`
  }
]

export function EmptyScreen({ setInput }: Pick<UseChatHelpers, 'setInput'>) {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="rounded-lg border bg-background p-8">
        <h1 className="mb-2 text-lg font-semibold">
          Welcome to Dots!
        </h1>
        <p className="mb-2 leading-normal text-muted-foreground">
          Dots is an AI-powered chatbot that can help you with making meaningful social connections.
        </p>
        <p className="leading-normal text-muted-foreground">
          Before we can connect the dots we need to collect them:
        </p>
        <div className="mt-4 flex flex-col items-start space-y-2">
          {exampleMessages.map((message, index) => (
            <Button
              key={index}
              variant="link"
              className="h-auto p-0 text-base"
              onClick={() => setInput(message.message)}
            >
              <IconArrowRight className="mr-2 text-muted-foreground" />
              {message.heading}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
