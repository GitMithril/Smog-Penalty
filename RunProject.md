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
