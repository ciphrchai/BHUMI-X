# BHUMI-X

### From Urban Data to Intelligent Development Decisions

BHUMI-X is an AI-powered urban intelligence platform designed to help planners and developers understand environmental conditions and evaluate development scenarios before construction.

It brings spatial data, machine learning, environmental analysis and scenario simulation into a unified decision-support platform.

## Key Features

* Interactive urban and parcel exploration
* Spatial and environmental analysis
* Thermal comfort and heat-stress analysis
* Wind and pedestrian comfort analysis
* ML-powered environmental insights
* Development scenario and What-If analysis
* Impact comparison between scenarios
* AI-assisted decision support

## How BHUMI-X Works

```text
Urban & Environmental Data
            ↓
     Data Processing
            ↓
      ML / Analysis
            ↓
    Risk Identification
            ↓
   Scenario Simulation
            ↓
   AI-Assisted Insights
            ↓
Intelligent Development Decisions
```

## Technology Stack

* **Frontend:** React, JavaScript
* **Backend:** Python / FastAPI
* **AI/ML:** Python, Scikit-learn, Pandas, NumPy
* **Mapping & Visualization:** Interactive geospatial visualization
* **Version Control:** Git & GitHub

## Run Locally

### Prerequisites

* Node.js 18+
* npm
* Python 3.10+ (if backend is included)

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd BHUMI-X
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Application

```bash
npm run dev
```

Open the URL displayed in your terminal, typically:

```text
http://localhost:5173
```

### Backend

If the backend is included:

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

The API will typically be available at:

```text
http://127.0.0.1:8000
```

## Objective

BHUMI-X aims to move urban planning from:

> **"What is happening?"**

to:

> **"What should we change, and what could be the impact?"**

The platform is designed to support more data-driven, explainable and climate-resilient urban development decisions.

## Prototype Note

BHUMI-X is a prototype demonstrating an AI-assisted urban decision-support workflow. Where granular real-world data is unavailable, realistic synthetic or scenario-based data may be used to demonstrate the system.

Prototype outputs should be treated as decision-support estimates and not as certified engineering or planning predictions.

---

## BHUMI-X

**From Urban Data to Intelligent Development Decisions.**
