## What we built!

## Problem 
In the fast-paced world of networking, making meaningful connections is key to professional growth. That's why our team, during the 48-hour whirlwind of innovation known as our Hackathon, developed ContactBot: a chatbot designed to revolutionize the way professionals manage and expand their networks.

## The Challenge
We recognized a common problem among professionals: the difficulty in tracking details about new contacts and leveraging existing networks to meet potential collaborators or clients. Our challenge was to create a solution that not only helps users manage their growing list of contacts but also intelligently recommends new connections based on shared interests, goals, and mutual contacts.

## Contact Information Storage
After every meeting or networking event, you can tell Dots about the new people you've met. This information is securely stored and easily retrievable. Using Redis. 


<img width="1270" alt="Screen Shot 2024-03-03 at 12 08 46 AM" src="https://github.com/k11kirky/dots/assets/25588954/c13514f8-2578-4b5c-9c46-a99621a3d017"><a>
  <h1 align="center">CONTACT LIST IN MEMORY</h1>
</a>

<p align="center">
  An open-source AI chatbot app template built with Next.js, the Vercel AI SDK, OpenAI, and Vercel KV.
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#model-providers"><strong>Model Providers</strong></a> ·
  <a href="#deploy-your-own"><strong>Deployment</strong></a> ·
  <a href="#running-locally"><strong>Running locally</strong></a> ·
  <a href="#authors"><strong>Authors</strong></a>
</p>
<br/>

## Model Providers
-Gemini

## Creating a KV Database Instance

Follow the steps outlined in the [quick start guide](https://vercel.com/docs/storage/vercel-kv/quickstart#create-a-kv-database) provided by Vercel. This guide will assist you in creating and configuring your KV database instance on Vercel, enabling your application to interact with it.

Remember to update your environment variables (`KV_URL`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `KV_REST_API_READ_ONLY_TOKEN`) in the `.env` file with the appropriate credentials provided during the KV database setup.

## Running locally

You will need to use the environment variables [defined in `.env.example`](.env.example) to run Next.js AI Chatbot. 

1. Install Vercel CLI: `npm i -g vercel`
2. Link local instance with Vercel and GitHub accounts (creates `.vercel` directory): `vercel link`
3. Download your environment variables: `vercel env pull`

```bash
pnpm install
pnpm dev
```

Your app template should now be running on [localhost:3000](http://localhost:3000/).

## Authors
AGI house Hackathon 3/3/2024
S/o to vercel for the help full template!

This library is created by [Vercel](https://vercel.com) and [Next.js](https://nextjs.org) team members, with contributions from:

- Jared Palmer ([@jaredpalmer](https://twitter.com/jaredpalmer)) - [Vercel](https://vercel.com)
- Shu Ding ([@shuding\_](https://twitter.com/shuding_)) - [Vercel](https://vercel.com)
- shadcn ([@shadcn](https://twitter.com/shadcn)) - [Vercel](https://vercel.com)
