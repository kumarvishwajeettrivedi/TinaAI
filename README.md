# TinaAI 🤖

> **Next-Gen AI Interviewer Platform**
> 
> Automate and enhance your hiring process with intelligent, empathetic, and efficient AI interviewers.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)

## 📖 Overview

**TinaAI** is a comprehensive platform designed to revolutionize the recruitment application process. By leveraging advanced Large Language Models (LLMs) and voice technologies, TinaAI allows organizations to create custom AI agents that conduct initial phone screens and interviews. These agents can be tailored with specific personality traits, expertise, and objectives to ensure a perfect cultural and technical fit.

## ✨ Key Features

-   **🤖 Custom AI Agents**: Create interviewers with adjustable parameters like **Empathy**, **Exploration**, **Rapport**, and **Speed**.
-   **🎙️ Voice-Native Interactions**: Powered by **Retell AI** for natural, low-latency voice conversations.
-   **📋 Campaign Management**: Organize interviews into campaigns with valid objectives, custom questions, and detailed descriptions.
-   **🏢 Multi-Tenancy**: Built for organizations with role-based access control and plan management (Free/Pro tiers).
-   **📊 Smart Analytics**:
    -   Detailed transcripts and audio recordings.
    -   Automated candidate scoring and feedback.
    -   Key insights extraction.
    -   Duration and engagement tracking.
-   **🔐 Secure & Scalable**: Authentication via **Clerk** and database management with **Supabase**.

## 🛠️ Tech Stack

-   **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
-   **Database**: [Supabase](https://supabase.com/) (PostgreSQL) & [Prisma](https://www.prisma.io/)
-   **Authentication**: [Clerk](https://clerk.com/)
-   **AI & Logic**:
    -   [OpenAI SDK](https://platform.openai.com/docs/libraries/node-js-library)
    -   [Google Generative AI (Gemini)](https://ai.google.dev/)
    -   [LangChain](https://js.langchain.com/)
    -   [Retell AI](https://retellai.com/) (Voice)
-   **State Management**: [TanStack Query](https://tanstack.com/query/latest)
-   **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

-   **Node.js** (v18+ recommended)
-   **npm** or **yarn**
-   **Docker** (optional, for containerized deployment)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/tina-ai.git
cd tina-ai
```

### 2. Install Dependencies

```bash
yarn install
# or
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory. You can start by copying the example:

```bash
cp .env.example .env
```

Fill in the required environment variables:

```env
# App Configuration
NEXT_PUBLIC_LIVE_URL=http://localhost:3000

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# AI Services
GEMINI_API_KEY=your-gemini-key
OPENAI_API_KEY=your-openai-key # If used
RETELL_API_KEY=your-retell-key # For voice services
```

### 4. Database Setup

Ensure your Supabase instance is running or connected. If using Prisma:

```bash
npx prisma generate
npx prisma db push
```

*(Note: Refer to `supabase_schema.sql` for the raw SQL schema if not using Prisma migrations fully).*

### 5. Run the Application

Start the development server:

```bash
yarn dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

```
├── src
│   ├── app          # Next.js App Router pages and API routes
│   ├── components   # Reusable UI components
│   ├── contexts     # React Context providers (e.g., InterviewersContext)
│   ├── lib          # Utility functions and library configurations
│   └── styles       # Global styles
├── public           # Static assets
├── prisma           # Prisma schema and migrations (if applicable)
├── .env.example     # Environment variable template
├── package.json     # Dependencies and scripts
└── ...
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
