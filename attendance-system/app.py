import os
import io
import base64
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from face_engine import (
    register_new_worker,
    process_attendance_scan,
    get_dashboard_stats,
    get_all_workers,
    get_all_attendance,
    save_workers,
    save_attendance,
    FACES_DIR
)

app = FastAPI(title="Coal Mine Smart Attendance System (ML Facial Recognition)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(__file__)
STATIC_DIR = os.path.join(BASE_DIR, "static")
os.makedirs(STATIC_DIR, exist_ok=True)
os.makedirs(FACES_DIR, exist_ok=True)

# Mount faces and static assets
app.mount("/faces", StaticFiles(directory=FACES_DIR), name="faces")
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


class Base64ScanRequest(BaseModel):
    image: str # Base64 encoded image string (e.g. data:image/jpeg;base64,...)
    threshold: Optional[float] = 0.62


class RegisterWorkerRequest(BaseModel):
    worker_id: str
    name: str
    role: str
    shift: str
    mine_site: str
    image: str # Base64


@app.get("/", response_class=HTMLResponse)
async def serve_index():
    index_path = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(index_path):
        with open(index_path, "r", encoding="utf-8") as f:
            return f.read()
    return "<h1>Coal Mine Attendance System</h1><p>Frontend loading...</p>"


@app.get("/api/stats")
async def api_get_stats():
    return get_dashboard_stats()


@app.get("/api/workers")
async def api_get_workers():
    workers = get_all_workers()
    # Exclude raw embeddings for lighter JSON payload
    clean_workers = []
    for w in workers:
        item = {k: v for k, v in w.items() if k != "embedding"}
        clean_workers.append(item)
    return {"workers": clean_workers}


@app.delete("/api/workers/{worker_id}")
async def api_delete_worker(worker_id: str):
    workers = get_all_workers()
    new_workers = [w for w in workers if w.get("worker_id") != worker_id]
    if len(workers) == len(new_workers):
        raise HTTPException(status_code=404, detail="Worker not found")
    save_workers(new_workers)
    return {"success": True, "message": f"Worker {worker_id} removed"}


@app.get("/api/attendance")
async def api_get_attendance(date: Optional[str] = None):
    records = get_all_attendance()
    if date:
        records = [r for r in records if r.get("date") == date]
    return {"attendance": records}


@app.post("/api/attendance/clear")
async def api_clear_attendance():
    save_attendance([])
    return {"success": True, "message": "Attendance records cleared"}


@app.post("/api/workers/register")
async def api_register_worker(req: RegisterWorkerRequest):
    try:
        raw_b64 = req.image
        if "," in raw_b64:
            raw_b64 = raw_b64.split(",")[1]
        img_bytes = base64.b64decode(raw_b64)
        
        result = register_new_worker(
            worker_id=req.worker_id.strip(),
            name=req.name.strip(),
            role=req.role.strip(),
            shift=req.shift.strip(),
            mine_site=req.mine_site.strip(),
            image_bytes=img_bytes
        )
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["message"])
        
        # Omit embedding in API return
        if "worker" in result and "embedding" in result["worker"]:
            del result["worker"]["embedding"]
            
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/workers/register-upload")
async def api_register_upload(
    worker_id: str = Form(...),
    name: str = Form(...),
    role: str = Form(...),
    shift: str = Form(...),
    mine_site: str = Form(...),
    file: UploadFile = File(...)
):
    try:
        img_bytes = await file.read()
        result = register_new_worker(
            worker_id=worker_id.strip(),
            name=name.strip(),
            role=role.strip(),
            shift=shift.strip(),
            mine_site=mine_site.strip(),
            image_bytes=img_bytes
        )
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["message"])
            
        if "worker" in result and "embedding" in result["worker"]:
            del result["worker"]["embedding"]
            
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/attendance/scan")
async def api_scan_frame(req: Base64ScanRequest):
    try:
        raw_b64 = req.image
        if "," in raw_b64:
            raw_b64 = raw_b64.split(",")[1]
        img_bytes = base64.b64decode(raw_b64)
        
        result = process_attendance_scan(img_bytes, threshold=req.threshold or 0.62)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    print("\n" + "="*60)
    print("🚀 Coal Mine ML Face Recognition Attendance System")
    print("🌐 Open http://127.0.0.1:8000 in your browser")
    print("="*60 + "\n")
    uvicorn.run(app, host="0.0.0.0", port=8000)
