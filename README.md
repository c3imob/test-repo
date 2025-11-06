# AI BlogCraft

AI BlogCraft is an AI-assisted blogging SaaS starter built with Next.js 14, TypeScript, Prisma, NextAuth, Tailwind CSS, and a local Ollama model. It helps marketing teams generate, edit, and manage SEO-friendly blog posts with subscription billing powered by Stripe.

## Features
- **AI blog generation** with topic, tone, keywords, audience, and length controls.
- **Inline editor** with markdown preview, section regeneration, and auto-save drafts.
- **SEO analyzer** showing keyword density, suggested meta title & description, and readability.
- **Exports** to Markdown, HTML, PDF, and clipboard.
- **Usage dashboard** with monthly quota tracking for free users.
- **Authentication** via email magic links using NextAuth and Prisma.
- **Stripe billing** with Free and Pro plans plus webhook handling.

## Getting started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the example environment file and update secrets:
   ```bash
   cp .env.example .env
   ```
3. Provision the database and Prisma client:
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Environment variables
See `.env.example` for all required values, including Ollama, NextAuth, database, and Stripe secrets.

## License
MIT
