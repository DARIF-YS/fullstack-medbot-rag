## MedBot – Full Stack Medical Chatbot

MedBot is a full-stack AI medical chatbot that delivers general health answers by combining a RAG (Retrieval-Augmented Generation) pipeline with a Large Language Model (LLM), allowing users to ask medical questions, describe symptoms, and receive precise, context-aware responses.

### I. Features

- 🤖 AI-powered medical chatbot with RAG pipeline  
- 🌍 Multilingual support: English / French / Arabic  
- 🔐 Secure authentication (Google OAuth + JWT)  
- 💬 Conversation history with AI context  
- 🛡️ Admin dashboard for user and conversation management  
- 🧠 RAG pipeline: semantic search + LLM answer generation  

### II. Full Stack Architecture

### III. Results 

### IV. Run Project

#### 1. Clone the repository
<pre>
git clone https://github.com/DARIF-YS/fullstack-medbot-rag.git
cd fullstack-medbot-rag
</pre>

#### 2. Install dependencies
<pre>
pip install -r requirements.txt
</pre>

#### 3. Create and add keys to the .env file
<pre>
MYSQL_HOST=
MYSQL_PORT=
MYSQL_USER=
MYSQL_PASSWORD=
MYSQL_DB=
GOOGLE_API_KEY=
GOOGLE_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
JWT_SECRET=
ADMIN_USERNAME=
ADMIN_PASSWORD=
JWT_SECRET_ADMIN=
</pre>

#### 4. Run the Backend
<pre>
cd backend
uvicorn main:app --reload
</pre>

#### 5. Run the Frontend
<pre>
cd frontend
npm install
npm run dev
</pre>
__

*Developed by Yassine DARIF - 2025*