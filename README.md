# 🤖 You In Control Chat Bot

A Next.js Edge Runtime chatbot that uses [Groq](https://groq.com/) LLMs to understand user commands, detect intent, and control simulated smart-home devices.  
Supports both **direct device control** (lights, sprinklers, cameras, alarm) and **multi-device scenarios** (intruder alert, weather alert, system check).

---

## ✨ Features

- 🔌 **Device Control**
  - Lights, sprinklers (with duration), security cameras, alarm
- 🛡️ **Scenario Detection**
  - **Intruder** → turn on lights, alarm, and cameras
  - **Weather Alert** → turn off sprinklers + lights
  - **System Check** → health check reply
- 💬 **Chatbot Fallback**
  - If no intent is detected, bot replies with a short AI-generated response
- ⚡ **Optimistic UI**
  - User messages appear instantly, bot replies stream in after processing
- 🎨 **Modern UI**
  - Built with TailwindCSS for styling  
  - Smooth animations and chat bubbles

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Edge runtime)
- **AI Model**: [Groq LLMs](https://groq.com/) (`llama3-8b-8192`)
- **Frontend**: React, Tailwind CSS
- **API**: Next.js serverless route (`/api/chat`)

---

## 📂 Project Structure

