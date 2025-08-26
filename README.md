# 🤖 You In Control Chat Bot  

The **You In Control (YIC) Chat Bot** is a smart assistant that connects natural language commands to real-world devices. It can process user intent using AI models (Groq, OpenAI, Ollama, LM Studio, etc.), and then trigger actions in the **YIC System** such as turning on lights, activating sprinklers, or starting security cameras.  

Supports both:  
- **Direct device control** (e.g. “turn on the front sprinklers for 15 minutes”)  
- **Multi-device scenarios** (e.g. “intruder alert” → lights + cameras + alarm)  

---

## ✨ Features  

- 🔌 **Device Control**  
  - Lights, sprinklers (with duration), security cameras, alarm  
- 🛡️ **Scenario Detection**  
  - Intruder → lights + alarm + cameras  
  - Weather Alert → shut down sprinklers & lights  
  - System Check → quick system health reply  
- 💬 **AI Chat Fallback**  
  - If no device action is detected, the bot gives a short AI-generated reply  
- ⚡ **Optimistic UI**  
  - User messages appear instantly, with streaming bot replies  

---

## 🛠️ Tech Stack  

- **Frontend & API** → [Next.js](https://nextjs.org/) (React + Serverless API routes)  
- **AI Processing** → Public AI APIs (Groq, OpenAI, Ollama) + local LLMs (LM Studio, etc.)  
- **Device Execution** → Python functions (bridge to YIC system devices)  
- **Hosting** → [Cloudflare](https://www.cloudflare.com/)  

---

## 🚀 Getting Started  

Follow these steps to set up the project locally:  

### 1️⃣ Clone the Repository  
`git clone https://github.com/yourusername/you-in-control-chatbot.git`
`cd you-in-control-chatbot`

### 2️⃣ Install Dependencies
ensure you have node js installed on your computer

`npm install`

### 3️⃣ Set Up Environment Variables
Create a .env.local file in the root of the project and add your keys:

### 4️⃣ Run Next.js Dev Server
npm run dev
Now visit → http://localhost:3000

---

## Project Structure
/app
  /api/chat         → Next.js API routes (chat, intent detection)
/components   → React UI components (chat UI, inputs)
/python       → Python device control functions
/public       → Static assets

---

## ✅ Example Commands

turn on the lights

turn on the front sprinklers for 10 minutes

intruder alert

system check

---

`git clone && npm install && npm run dev`
