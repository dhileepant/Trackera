# Trackera 

Trackera is a premium, full-featured **Student Coding Practice and Progress Tracking Platform** designed to help students master Data Structures & Algorithms (DSA), build coding streaks, and prepare for placement interviews. The platform combines comprehensive dashboard visualizations, Monaco Editor-powered coding workspaces, and an AI-backed Coding Assistant.

---

##  Key Features

- 📊 **Dynamic Dashboards**: Full analytics detailing coding statistics, placement offers, problem-solving progress, and streaks.
- 🔥 **GitHub-style Coding Heatmap**: A contribution calendar tracking student's daily coding activities.
- 💻 **Problem Workspace**: A premium environment featuring the Monaco Editor, multiple programming language supports, dynamic output compiling, and testcase verification.
- 🤖 **AI Assistant**: A generative AI-powered tutor that offers code reviews, algorithmic hints, and debugging suggestions in real-time.
- 🏢 **Placement & Target Tracking**: Set target companies, track placement preparations, and manage active job applications.
- 🛡️ **Role-Based Security**: Complete Student and Administrator dashboards with fully secure, JWT-based authentication.

---

##  Technology Stack

### Backend
- **Node.js** & **Express.js** (REST API)
- **MongoDB** with **Mongoose** (Database & ODM)
- **JSON Web Tokens (JWT)** (Secure authentication)
- **Cors** & **Dotenv** (Middleware and configurations)

### Frontend
- **React.js** (Vite-powered SPA)
- **Tailwind CSS** (Premium glassmorphic styling)
- **Monaco Editor React** (Coding editor)
- **Recharts** (Progress charts)
- **Lucide Icons** (UI Icons)
- **Axios** (API Client)

---

## ⚙️ Project Structure

```bash
Trackera/
├── backend/
│   ├── controllers/      # Route logic handlers (Auth, Practice, AI, etc.)
│   ├── middleware/       # JWT Authorization middleware
│   ├── models/           # Mongoose schemas (User, Problem, Submission, etc.)
│   ├── routes/           # REST API Route endpoints
│   ├── scripts/          # Seeding scripts for problems
│   ├── utils/            # Calculation utilities (Stats aggregations)
│   └── server.js         # Entrypoint configuration
│
└── frontend/
    ├── src/
    │   ├── components/   # Logo, StatCard, Heatmap, Charts, Dashboards
    │   ├── pages/        # Auth, Student Dashboard, Problem Workspace, AI Assistant
    │   ├── services/     # API Axios client integrations (Auth, Practice, AI)
    │   ├── App.jsx       # Routing configurations
    │   └── main.jsx      # DOM mounting point
```

---

##  Installation & Local Setup

### 1. Prerequisites
Ensure you have **Node.js** and **MongoDB** installed and running on your system.

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure the Environment:
   Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
   Provide your `PORT`, `MONGODB_URI`, `JWT_SECRET`, and optional `GEMINI_API_KEY` for the AI assistant.
4. Seed the Problem Database:
   ```bash
   node scripts/seedProblems.js
   ```
5. Start the backend:
   ```bash
   npm start
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
4. Access the web interface at `http://localhost:5173`.

---

## 📄 License
This project is licensed under the MIT License.
