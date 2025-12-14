# ML Project Instructions

### Architecture Overview

```
┌─────────────────┐         HTTP/JSON         ┌─────────────────┐
│    Frontend     │ ◄──────────────────────► │     Backend     │
│  React + Vite   │     localhost:5173        │     FastAPI     │
│   TypeScript    │          ↔                │  scikit-learn   │
└─────────────────┘     localhost:8000        └─────────────────┘
                                                      │
                                                      ▼
                                              ┌─────────────────┐
                                              │  ML Models      │
                                              │  (.pkl files)   │
                                              └─────────────────┘
```

### Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React + TypeScript | UI components with type safety |
| **Build Tool** | Vite | Fast dev server & bundling |
| **Backend** | FastAPI | High-performance Python API |
| **ML Library** | scikit-learn | Train & run ML models |
| **Data Validation** | Pydantic | Request/response schemas |

---

## Where to Save & Use ML Models

### Training Models
Create and train models in the `notebooks/` folder using Jupyter:

```python
# notebooks/train_model.ipynb
from sklearn.linear_model import LinearRegression
import joblib

model = LinearRegression()
model.fit(X_train, y_train)

# Save to models/ folder
joblib.dump(model, '../models/my_model.pkl')
```

### Loading Models in Backend
Use models in `backend/app/services/`:

```python
# backend/app/services/ml_service.py
import joblib

model = joblib.load('../../models/my_model.pkl')

def predict(features):
    return model.predict([features])
```

### Folder Purposes

| Folder | What Goes Here |
|--------|----------------|
| `models/` | Saved `.pkl` model files |
| `data/` | Training datasets (CSV, JSON) |
| `notebooks/` | Jupyter notebooks for experimentation |
| `backend/app/services/` | Python code that loads & uses models |
| `backend/app/routes/` | API endpoints that call services |

---

## Quick Start Commands

**Backend:**
```powershell
cd backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```

**Frontend:**
```powershell
cd frontend
npm run dev
```

- **Frontend:** http://localhost:5173
- **API Docs:** http://localhost:8000/docs (interactive Swagger UI)

---


# Run the Project
## Setup Guide for New PC

Follow these steps to set up the project from scratch on a new machine.

### Prerequisites
- **Python** (3.10 or higher)
- **Node.js** (LTS version)
- **Git** (Optional)

### 1. Backend Setup
1. Open a terminal and navigate to the `backend` folder.
2. Create a virtual environment:
   ```powershell
   python -m venv venv
   ```
3. Activate the virtual environment:
   - **Windows (PowerShell):** `.\venv\Scripts\Activate.ps1`
   - **Mac/Linux:** `source venv/bin/activate`
4. Install dependencies:
   ```powershell
   pip install -r requirements.txt
   ```
5. Start the backend server:
   ```powershell
   uvicorn app.main:app --reload
   ```

### 2. Frontend Setup
1. Open a **new** terminal and navigate to the `frontend` folder.
2. Install Node.js dependencies:
   ```powershell
   npm install
   ```
3. Start the development server:
   ```powershell
   npm run dev
   ```

### 3. Access the Application
- **Frontend:** Open the URL shown in the terminal (usually http://localhost:3000 or http://localhost:5173)
- **Backend API:** http://localhost:8000
