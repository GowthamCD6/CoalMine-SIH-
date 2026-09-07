# 🛡️ Coal Mine Smart Attendance System (ML Facial Biometrics)

An AI/ML-powered facial recognition worker attendance system built for Coal Mine operations and underground personnel safety check-ins.

---

## 🌟 Key Features

1. **Admin Worker Registration (Biometric Enrollment)**:
   - Live camera snapshot capture or file upload.
   - Assigns Worker ID, Full Name, Mining Role (Underground Drill Operator, Safety Inspector, Blaster, Electrician, etc.), Shift, and Mine Site location.
   - Deep Neural Feature Extractor generates 512-dimensional L2-normalized embeddings via **PyTorch ResNet-18** and stores them securely.

2. **Live AI Facial Recognition Scanner**:
   - Real-time continuous webcam scanning with bounding box overlays.
   - Uses **YOLOv8** facial/keypoint landmarks + **ResNet-18** cosine similarity matching.
   - **Automatic Check-In**: Instantly marks attendance upon recognizing the worker with audio feedback (success chime / alert buzzer).
   - Anti-duplicate cooldown preventing multiple check-ins within the same shift.

3. **Attendance Ledger & Audit Trail**:
   - Real-time log table showing Worker Name, Employee ID, Role, Shift, Check-in Time, Status (Present - On Time / Late), ML Confidence %, and Model Engine.
   - Date filtering & real-time search.
   - **One-click Export to CSV** for shift handover reports.

4. **Mine Personnel Directory & KPI Dashboard**:
   - Total Registered, Present Today, Absent / Unreported, Shift Attendance Rate (%).
   - Worker directory cards with photo previews and management tools.

---

## 🚀 How to Run

### Quick Start (Windows):
Double click `run.bat` or run in terminal:

```bash
cd attendance-system
..\smoke-detection\venv\Scripts\python.exe app.py
```

Open your browser and navigate to:
👉 **`http://127.0.0.1:8000`**

---

## 📂 Project Structure

```
attendance-system/
├── app.py                 # FastAPI backend & REST API server
├── face_engine.py         # YOLOv8 + PyTorch ResNet-18 facial embedding & matching engine
├── requirements.txt       # Dependencies
├── run.bat                # Windows launcher batch script
├── data/
│   ├── workers.json       # Registered worker profiles & embeddings
│   ├── attendance.json    # Attendance check-in audit logs
│   └── faces/             # High-res face snapshots
└── static/
    ├── index.html         # Modern coal mine operations dashboard UI
    ├── style.css          # Futuristic dark glassmorphism theme
    └── app.js             # Live camera streaming, canvas overlay & Web Audio chimes
```
