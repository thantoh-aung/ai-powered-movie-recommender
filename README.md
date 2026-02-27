# Explainable Hybrid AI Movie Recommender

🌟 **Live Demo:** [https://ai-powered-movie-recommender-theta.vercel.app/](https://ai-powered-movie-recommender-theta.vercel.app/)

A full-stack, **Neuro-Symbolic AI** movie recommendation system that bridges traditional logic programming with modern transformer-based neural networks. Built with **Prolog** (Reasoning Engine), **Sentence-Transformers** (Semantic Search), and **Next.js** (Frontend).

## 🚀 Key Features

*   **Neuro-Symbolic Hybrid Architecture:** Combines the strict logical reliability of **Prolog** with the creative semantic understanding of **Transformer models** (`all-MiniLM-L6-v2`).
*   **Swift Mode (Tinder-style):** A high-performance discovery interface using `framer-motion` where users can swipe to like or pass on movies, teaching the AI in real-time.
*   **Explainable AI (XAI):** Generates traceable, natural language explanations for every recommendation, proving why a film fits your profile.
*   **Backend Age Enforcement:** Uses a secure database-level age filter. Logged-in users have their age verified by the server, ensuring minors can never bypass content restrictions by simply moving a UI slider.
*   **Real-time Learning:** As users swipe movies in Swift Mode, the system dynamically asserts new facts into the Prolog Knowledge Base, refining recommendations instantly.
*   **Semantic Search:** Integrated **ChromaDB** vector database allows for "vibe-based" searches (e.g., searching for "lonely space exploration" finds movies like *Interstellar* even if the words aren't in the title).

---

## 🛠️ Tech Stack

**Frontend:**
*   [Next.js 14](https://nextjs.org/) (React Framework)
*   [Framer Motion](https://www.framer.com/motion/) (Animations & Gestures)
*   [Tailwind CSS](https://tailwindcss.com/) (Styling)

**Backend:**
*   [Django 5](https://www.djangoproject.com/) (REST Framework / API Layer)
*   [PySWIP](https://pypi.org/project/pyswip/) (Python-to-Prolog Bridge)
*   [ChromaDB](https://www.trychroma.com/) (Vector Database)
*   [Sentence-Transformers](https://sbert.net/) (`all-MiniLM-L6-v2` model)

**AI Engine:**
*   [SWI-Prolog](https://www.swi-prolog.org/) (Logical Reasoning & Knowledge Base)

---

## 🧠 Architecture Flow

1.  **Semantic Retrieval:** ChromaDB finds the top 100 movies matching the "meaning" of the user's search query.
2.  **Logical Filtering:** The **Prolog Engine** intercepts these results and applies hard rules (Age check, Genre matching, Mood constraints).
3.  **Collaborative Feedback:** Prolog prioritizes movies similar to the user's "Liked" history.
4.  **Explanation Generation:** The engine constructs a human-readable bridge between the user's input and the selected result.

---

## 💻 Local Development Setup

### Prerequisites
*   Node.js (`v18+`)
*   Python (`3.10+`)
*   SWI-Prolog installed natively on your OS (`swipl`).

### 1. Backend (Django + Prolog)
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows
   .\venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure TMDB:
   * Create a `.env` file in the `/backend` directory.
   * Add your API key: `TMDB_API_KEY=your_api_key_here`
5. Run Migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```
6. Start the server:
   ```bash
   python manage.py runserver
   ```

### 2. Frontend (Next.js)
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the React development server:
   ```bash
   npm run dev
   ```
4. Access the UI at `http://localhost:3000`.

---

## 🌍 Production Deployment

### Backend (Railway / Render)
**Recommended:** Use a persistent server like [Railway.app](https://railway.app) to avoid cold starts when loading the AI models.
*   Ensure SWI-Prolog is installed in the environment (use the provided `Dockerfile`).

### Frontend (Vercel)
*   Connect the Git repository to Vercel.
*   Set the root directory to `frontend`.
*    Add `NEXT_PUBLIC_API_URL` environment variable pointing to your backend.

---

## 📝 License
MIT License
