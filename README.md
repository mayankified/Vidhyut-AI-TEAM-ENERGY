# ⚡ Urja Grid: AI-Powered Smart Energy Management System (EMS)

### 🏆 **Project at Vidhyut AI Hackathon**
| Team Name | Team Members | Repository |
| :--- | :--- | :--- |
| **Energy** | Mayank, Dhruv, Ram | [Link to your GitHub Repo] |

---

## 💡 Overview

**Urja Grid** is a next-generation, full-stack Energy Management System (EMS) designed for the proactive, real-time control and diagnostics of microgrids integrating renewable energy, storage, and EV charging infrastructure.

Built on **FastAPI (Python)** and **React/TypeScript**, the system provides a unified, intelligent dashboard that moves beyond simple monitoring by integrating advanced **Machine Learning** models, a **Digital Twin** for anomaly detection, and a cutting-edge **Reinforcement Learning (RL) Advisory Engine** for optimal energy dispatch.

## ✨ Key Features & Technical Highlights

We didn't just meet the requirements—we went above and beyond with a suite of AI-driven capabilities:

### 1. Real-Time Cloud Monitoring & Control
* **Real-Time Data Stream:** Implemented a robust **WebSocket** endpoint using FastAPI to stream live telemetry, alerts, and RL suggestions to the dashboard.
* **RESTful API:** Full suite of APIs for Site, Asset, and User management, secured with **JWT** authentication.

### 2. Advanced Diagnostics & Predictive Maintenance
* **Subsystem Health Status:** Calculates and visualizes clear health indices for PV, Battery, Inverter, and EV subsystems.
* **On-Demand ML Predictions:** Hosts and serves pre-trained models for:
    * **Motor Vibration Diagnosis** (Random Forest)
    * **Motor Fault Detection** (XGBoost)
    * **Solar Power Forecasting** (TensorFlow/Keras LSTM)
* **Digital Twin Module:** Plots real-time sensor data against ML-predicted values to automatically flag deviations (anomalies) for predictive maintenance.

### 3. AI-Powered Decision Support
* **Intelligent Alerts & Advisory:** Delivers structured alerts with severity, diagnosis, and recommended actions.
* **AI Root Cause Analysis (RCA):** Critical alerts can trigger an analysis via a **LangChain agent** and **Llama 3.1 (Groq API)** to provide deep, context-aware root cause explanations.
* **RL Advisory Engine (Bonus Requirement):** Simulates an adaptive optimization engine that pushes heuristic-based suggestions for energy dispatch (e.g., "Discharge battery to offset peak load") to the operator.

## ⚙️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Backend** | Python, **FastAPI**, Pydantic | High-performance API and data processing. |
| **Frontend** | **React**, **TypeScript**, Tailwind CSS | Responsive, unified dashboard UI. |
| **AI/ML** | LangChain, **Groq API (Llama 3.1)**, Scikit-Learn, TensorFlow | Generative AI for RCA, and served ML models for diagnostics. |
| **Data Viz** | Recharts | Interactive and detailed telemetry charts. |

---

## 🚀 Getting Started

Follow these steps to set up and run the Urja Grid application locally.

### Prerequisites

* Python 3.10+
* Node.js (LTS recommended)
* **GROQ API Key**: Required for the AI Root Cause Analysis feature.

### 1. Backend Setup (FastAPI)

1.  **Clone the repository:**
    ```bash
    git clone [YOUR_REPO_URL]
    cd next-gen-energy-management-system-dashboardiwithbackedn
    ```

2.  **Create and activate a virtual environment:**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Set Environment Variables:**
    To run the AI features securely, set your API key as an environment variable (replace `YOUR_KEY`):
    ```bash
    export GROQ_API_KEY="YOUR_KEY"
    # Note: A hardcoded key was used during the hackathon for rapid deployment, 
    # but the recommended production practice is to use environment variables.
    ```

5.  **Run the FastAPI server:**
    ```bash
    uvicorn app.main:app --reload
    ```
    The backend will be available at `http://127.0.0.1:8000`. API documentation (Swagger UI) is at `http://127.0.0.1:8000/docs`.

### 2. Frontend Setup (React)

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the React application:**
    ```bash
    npm run dev
    ```
    The dashboard will open in your browser, typically at `http://localhost:5173`.

---

## 🛠️ Known Issues & Next Steps

This is a high-fidelity prototype. For a production deployment, the following must be addressed:

* **⚠️ Security Fix:** The hardcoded Groq API key must be strictly moved to environment variables.
* **WebSocket Bug:** A fix is required in the backend WebSocket handler to ensure the event type matches the frontend listener (`"alert"` vs. `"new_alert"`).
* **Data Persistence:** Integrate a scalable **Time-Series Database** (e.g., InfluxDB, TimescaleDB) to replace the current in-memory mock data.
* **Code Cleanup:** Consolidate redundant ML logic between `prediction.py` and `simulations.py`.
