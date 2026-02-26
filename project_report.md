# Explainable AI Movie Recommendation System
**Final Year Project Proposal & Architecture Document**

## 1. Project Proposal Abstract
The rapid growth of digital content has made recommendation systems an indispensable part of modern applications. However, traditional machine learning (ML) models operate as "black boxes," offering little to no explanation for their suggestions. This lack of transparency can reduce user trust, especially in domains requiring explainable decision-making.

This project proposes an Explainable Artificial Intelligence (XAI) Movie Recommendation System. Unlike conventional systems, the core reasoning engine is built using Prolog, a declarative logic programming language. Prolog allows the system to evaluate user preferences (e.g., genre, mood, age rating) against a structured knowledge base of movies using explicit, human-readable rules. The system justifies every recommendation it makes, explicitly stating *why* a particular movie was chosen. The AI engine is integrated into a modern web stack, featuring a Next.js (React) front-end for user interaction and a Django REST Framework back-end for API communication and dynamic TMDB poster retrieval.

## 2. Problem Statement
Current recommendation systems often fail to explain their logic to users. Without understanding why a recommendation is made, users may feel confused or distrustful of the system, particularly when suggestions seem irrelevant. Furthermore, developing transparent, rule-based reasoning engines that integrate seamlessly with modern web architectures (React, REST APIs) remains a technical challenge. There is a clear need for a transparent, easily interpretable recommendation engine that still delivers a modern, dynamic user experience.

## 3. Objectives
1. **Develop an Explainable AI Engine:** Create a Prolog-based knowledge base and rule set capable of recommending movies based on multiple factors (genre, mood, rating) while generating human-readable justifications for its choices.
2. **Build a Robust Backend API:** Implement a Django REST Framework backend that orchestrates communication between the Prolog engine (via PySWIP) and the front-end, while reliably fetching external metadata from the TMDB API.
3. **Design a Modern User Interface:** Develop a Next.js front-end with a Netflix-style UI that intuitive captures user preferences and clearly displays recommendations alongside their AI-generated explanations.
4. **Demonstrate XAI Viability:** Show that rule-based Explainable AI can effectively compete with or complement black-box ML models in a real-world software architecture.

## 4. System Architecture Diagram
```text
[ Next.js Frontend (React + TailwindCSS) ]
       |                             ^
 1. Submit Preferences (JSON)        | 4. Return Movies + Posters + Explanations (JSON)
       v                             |
[ Django REST Framework Backend (Python) ]  <----->  [ TMDB External API ]
       |                             ^                   (Fetch Movie Posters)
 2. Parse & Format Query             | 3. Return Matches & Explanations
       v                             |
[ PySWIP Integration Layer (Python bridge) ]
       |                             ^
       v                             |
[ Prolog AI Engine (recommendation.pl) ]
   - Knowledge Base (Facts: Movies, Genres, Moods)
   - Rule Engine (Logic: Unification, Conditions, Explanations)
```

## 5. Why Prolog is Suitable for Explainable AI
Prolog is uniquely suited for Explainable AI (XAI) in this context for several reasons:
- **Declarative Logic:** Instead of defining *how* to compute a recommendation, we define *what* a valid recommendation is. Prolog's pattern matching (unification) automatically figures out the solution.
- **Inherent Transparency:** Because recommendations are based on explicit logical rules (e.g., `IF user wants Sci-Fi AND mood is thought-provoking, THEN recommend Inception`), the reasoning path is trivial to trace and present to the user.
- **No Black Box:** Unlike neural networks where weights and biases are incomprehensible to humans, Prolog's logic is entirely transparent and deterministic.
- **Easy Modification:** Adding a new recommendation factor (e.g., "Director") simply requires adding a new fact and updating a logical rule, without needing to retrain a massive dataset.

## 6. Future Improvements & Scalability
While this rule-based system provides excellent explainability, future improvements could scale its capabilities:
- **Hybrid AI (ML + Rules):** Combine Prolog with an ML model. The ML model could handle complex, unstructured collaborative filtering (e.g., "users who liked X also liked Y"), while Prolog enforces hard constraints (e.g., "User is under 18, strictly filter out R-rated movies") and generates high-level explanations.
- **Scalability with SWI-Prolog Servers:** For high-traffic enterprise deployment, the Prolog engine could be deployed as an independent SWI-Prolog Pengines server, rather than running strictly within PySWIP.
- **Dynamic Knowledge Base:** Connect the Prolog engine to an SQL or Graph database, dynamically pulling facts into Prolog logic at runtime rather than relying on a static `.pl` file.

## 7. Conclusion
This project bridges the gap between classic symbolic AI (Prolog) and modern web development (Django, Next.js). By explicitly designing for explainability, the resulting system not only provides personalized movie recommendations but also fosters user trust through transparent logic. The architecture is modular, scalable, and serves as an excellent foundation for both academic research in XAI and practical, portfolio-ready software engineering.
