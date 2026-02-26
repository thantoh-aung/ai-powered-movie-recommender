# Explainable AI Movie Recommender

🌟 **Live Demo:** [https://ai-powered-movie-recommender-theta.vercel.app/](https://ai-powered-movie-recommender-theta.vercel.app/)

A full-stack, AI-powered movie recommendation system that bridges traditional logic programming with modern web architecture. Built with **Prolog** (AI Engine), **Django** (Backend REST API), and **Next.js** (Frontend UI).


This system solves the "Black Box" problem of modern Machine Learning by utilizing a transparent, rule-based Prolog logic engine. It not only recommends movies based on dynamic constraints but also generates strictly trace-able English explanations for *why* a movie was chosen.

## 🚀 Key Features

*   **Prolog Expert System:** Uses a native `swi-prolog` knowledge base (`recommendation.pl`) to evaluate complex user preferences against movie data using logical predicates.
*   **Dynamic Knowledge Base:** The Python backend dynamically fetches the top ~60 popular movies from the TMDB API and securely *asserts* them into the running Prolog instance in real-time.
*   **Deep Search Integration:** Search queries filter against movie titles, plot overviews, and top cast members *after* Prolog determines the optimal pool.
*   **Explainable AI (XAI):** A custom React modal displays the generated natural language explanation, proving the logic trace used to select the film.
*   **High Performance:** Implements multi-threaded concurrent API calls (`concurrent.futures`) to drastically reduce TMDB metadata loading times from ~45 seconds down to ~2 seconds.
*   **Modern UI/UX:** A stunning dark-mode Next.js + TailwindCSS interface with glossy gradients, responsive grids, and rich movie metadata fetching.

---

## 🛠️ Tech Stack

**Frontend:**
*   [Next.js 14](https://nextjs.org/) (React Framework)
*   [Tailwind CSS](https://tailwindcss.com/) (Styling)
*   [Lucide React](https://lucide.dev/) (Icons)

**Backend:**
*   [Django 5](https://www.djangoproject.com/) (REST Framework / API Layer)
*   [PySWIP](https://pypi.org/project/pyswip/) (Python-to-Prolog Bridge)
*   [TMDB API](https://developer.themoviedb.org/docs) (Rich Movie Metadata)

**AI Engine:**
*   [SWI-Prolog](https://www.swi-prolog.org/) (Rule-based Logic & Knowledge Base)

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
3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure TMDB:
   * Create a `.env` file in the `/backend` directory.
   * Add your API key: `TMDB_API_KEY=your_api_key_here`
5. Start the Django server:
   ```bash
   python manage.py runserver
   ```
   *The backend will boot up on `http://127.0.0.1:8000`.*

### 2. Frontend (Next.js)
1. Open a new terminal and navigate to the frontend directory:
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

This repository is optimized for modern cloud hosting, separating the frontend and backend deployments.

### Deploying the Backend (Render)
Because PySWIP requires a native C-library of SWI-Prolog, the backend **must be deployed as a Docker Web Service**, not a standard Python template.
1. Go to [Render.com](https://render.com) and create a **New Web Service**.
2. Connect this GitHub repository.
3. For "Environment", select **Docker**.
4. Set the "Root Directory" to `backend`.
5. Add your `TMDB_API_KEY` under Environment Variables.
6. Deploy! Render will use the included `/backend/Dockerfile` to automatically install Prolog, Python, and boot the `gunicorn` server.

### Deploying the Frontend (Vercel)
1. Go to [Vercel.com](https://vercel.com) and create a **New Project**.
2. Connect this GitHub repository.
3. Set the "Root Directory" to `frontend`.
4. Add the following Environment Variable so the Next.js app knows where your Render API lives:
   * **Key:** `NEXT_PUBLIC_API_URL`
   * **Value:** `https://your-render-backend-url.onrender.com`
5. Deploy!

---

## 📝 License
MIT License
