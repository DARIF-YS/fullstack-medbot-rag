## 🗪 MedBot – Full Stack Medical Chatbot

MedBot is a full-stack AI medical chatbot that delivers general health answers by combining a RAG (Retrieval-Augmented Generation) pipeline with a Large Language Model (LLM), allowing users to ask medical questions, describe symptoms, and receive precise, context-aware responses.

### I. Features

- 🤖 AI-powered medical chatbot with RAG pipeline  
- 🌍 Multilingual support: English / French / Arabic  
- 🔐 Secure authentication (Google OAuth + JWT)  
- 💬 Conversation history with AI context  
- 🛡️ Admin dashboard for user and conversation management  
- 🧠 RAG pipeline: semantic search + LLM answer generation  

### II. Architectures
#### a. RAG Architecture
<img width="1154" height="800" alt="image" src="https://github.com/user-attachments/assets/d568065d-ebf8-42ff-969e-2bbfdddc3700" />

#### b. Full Stack Architecture

<img width="1154"  alt="Full Stack Architecture" src="https://github.com/user-attachments/assets/d00ee0db-bef4-43df-8dc3-c17fa7df3ea5" />


### III. Results 
#### a. Home page
<img width="1154" height="827" alt="image" src="https://github.com/user-attachments/assets/1f0f3419-7c04-4a60-91bd-8ec51ee3b362" />
<img width="1154" height="827" alt="image" src="https://github.com/user-attachments/assets/b5bda1bb-d0d8-4962-9a3a-fb8bef8122f6" />
<img width="1154" height="827" alt="image" src="https://github.com/user-attachments/assets/9c733083-e7e6-4018-b465-f7f7b79bbf79" />
<img width="1154" height="827" alt="image" src="https://github.com/user-attachments/assets/8b8bc53b-940f-4a01-8e4d-930b024ddbd8" />

#### b. User Interface
**Login / Register Page**

<img width="1154" height="827" alt="image" src="https://github.com/user-attachments/assets/d4cc28a4-be97-4bfd-bd71-b3c877865f2b" />

**chat page**

<img width="1154" height="827" alt="image" src="https://github.com/user-attachments/assets/d9631ee9-9fc6-4833-a2c0-878870ab9b1d" />

#### c. Admin Interface

**Login page**
<img width="1154" height="827" alt="image" src="https://github.com/user-attachments/assets/fb8965dc-2b0a-4e04-82b9-768ae0161740" />

**Dashboard page**

<img width="1154" height="827" alt="image" src="https://github.com/user-attachments/assets/d773dc04-474d-4567-83e2-142d7fc0588a" />

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
