import os
import json
import base64
import numpy as np
import cv2
import torch
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image
from datetime import datetime
from ultralytics import YOLO

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
WORKERS_FILE = os.path.join(DATA_DIR, "workers.json")
ATTENDANCE_FILE = os.path.join(DATA_DIR, "attendance.json")
FACES_DIR = os.path.join(DATA_DIR, "faces")

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(FACES_DIR, exist_ok=True)

# Initialize JSON files if not present
if not os.path.exists(WORKERS_FILE):
    with open(WORKERS_FILE, "w") as f:
        json.dump([], f, indent=2)

if not os.path.exists(ATTENDANCE_FILE):
    with open(ATTENDANCE_FILE, "w") as f:
        json.dump([], f, indent=2)


class FaceEmbeddingEngine:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"[FaceEngine] Initializing Face Detection & PyTorch ResNet-18 on {self.device}...")
        
        # 1. Face & Person Landmark Detector: YOLOv8-pose
        self.detector = YOLO("yolov8n-pose.pt")
        
        # 2. Deep Feature Extractor: ResNet-18 backbone (512-dim embedding)
        resnet = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
        self.feature_extractor = torch.nn.Sequential(*list(resnet.children())[:-1])
        self.feature_extractor.to(self.device)
        self.feature_extractor.eval()
        
        # Transforms for standard face alignment / normalization
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])
        print("[FaceEngine] Biometric Face Recognition Engine ready!")

    def detect_faces(self, cv2_img):
        """
        Detects faces in the image using YOLOv8 keypoints (nose, eyes, ears)
        and person bounding boxes. Returns list of face bounding boxes [x, y, w, h].
        """
        h_img, w_img = cv2_img.shape[:2]
        results = self.detector(cv2_img, conf=0.35, verbose=False)
        face_boxes = []

        for r in results:
            # Check keypoints if detected
            if r.keypoints is not None and len(r.keypoints) > 0:
                kpts_data = r.keypoints.xy.cpu().numpy() # [num_persons, 17, 2]
                boxes_data = r.boxes.xyxy.cpu().numpy() # [num_persons, 4]

                for i, kpts in enumerate(kpts_data):
                    # Keypoints 0..4 are nose, left_eye, right_eye, left_ear, right_ear
                    head_kpts = kpts[0:5]
                    valid_kpts = [pt for pt in head_kpts if pt[0] > 0 and pt[1] > 0]

                    if len(valid_kpts) >= 2:
                        # Compute bounding box covering head keypoints
                        xs = [pt[0] for pt in valid_kpts]
                        ys = [pt[1] for pt in valid_kpts]
                        min_x, max_x = min(xs), max(xs)
                        min_y, max_y = min(ys), max(ys)

                        # Expand margin for full face/head
                        face_w = max(max_x - min_x, 40)
                        face_h = max(max_y - min_y, 40)
                        pad_x = int(face_w * 0.7)
                        pad_y = int(face_h * 0.7)

                        x1 = max(0, int(min_x - pad_x))
                        y1 = max(0, int(min_y - pad_y))
                        x2 = min(w_img, int(max_x + pad_x))
                        y2 = min(h_img, int(max_y + pad_y * 1.2))

                        face_boxes.append((x1, y1, x2 - x1, y2 - y1))
                    elif i < len(boxes_data):
                        # Fallback to upper 35% of person bounding box
                        bx1, by1, bx2, by2 = boxes_data[i]
                        p_w = bx2 - bx1
                        p_h = by2 - by1
                        head_h = int(p_h * 0.35)
                        face_boxes.append((int(bx1), int(by1), int(p_w), head_h))

        # If no keypoint or person box was found (e.g. close-up face crop), treat centered region as candidate
        if len(face_boxes) == 0:
            # Fallback for portrait photo
            cx, cy = w_img // 2, h_img // 2
            size = int(min(w_img, h_img) * 0.8)
            x1 = max(0, cx - size // 2)
            y1 = max(0, cy - size // 2)
            face_boxes.append((x1, y1, min(size, w_img - x1), min(size, h_img - y1)))

        return face_boxes

    def extract_embedding(self, face_crop_bgr):
        """Extracts normalized 512-dimensional feature vector from a face crop."""
        try:
            face_rgb = cv2.cvtColor(face_crop_bgr, cv2.COLOR_BGR2RGB)
            pil_img = Image.fromarray(face_rgb)
            tensor = self.transform(pil_img).unsqueeze(0).to(self.device)
            
            with torch.no_grad():
                feat = self.feature_extractor(tensor) # Shape: (1, 512, 1, 1)
                feat = feat.squeeze().cpu().numpy()
                
            norm = np.linalg.norm(feat)
            if norm > 0:
                feat = feat / norm
            return feat.tolist()
        except Exception as e:
            print(f"[FaceEngine] Error extracting embedding: {e}")
            return None

    def calculate_similarity(self, emb1, emb2):
        """Cosine similarity between two normalized embeddings."""
        v1 = np.array(emb1)
        v2 = np.array(emb2)
        norm1 = np.linalg.norm(v1)
        norm2 = np.linalg.norm(v2)
        if norm1 == 0 or norm2 == 0:
            return 0.0
        return float(np.dot(v1, v2) / (norm1 * norm2))


# Global Face Engine Instance
engine = FaceEmbeddingEngine()


def get_all_workers():
    with open(WORKERS_FILE, "r") as f:
        return json.load(f)


def save_workers(workers):
    with open(WORKERS_FILE, "w") as f:
        json.dump(workers, f, indent=2)


def get_all_attendance():
    with open(ATTENDANCE_FILE, "r") as f:
        return json.load(f)


def save_attendance(records):
    with open(ATTENDANCE_FILE, "w") as f:
        json.dump(records, f, indent=2)


def register_new_worker(worker_id, name, role, shift, mine_site, image_bytes):
    """
    Detects face in the image, extracts embedding, saves face snapshot, and records worker.
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        return {"success": False, "message": "Failed to decode image data."}

    faces = engine.detect_faces(img)
    if len(faces) == 0:
        return {"success": False, "message": "No face detected in the image. Please provide a clear front-facing photo."}
    
    # Take the largest face detected
    x, y, w, h = max(faces, key=lambda b: b[2] * b[3])
    h_img, w_img = img.shape[:2]
    face_crop = img[max(0, y):min(h_img, y+h), max(0, x):min(w_img, x+w)]

    if face_crop.size == 0:
        face_crop = img

    embedding = engine.extract_embedding(face_crop)
    if embedding is None:
        return {"success": False, "message": "Failed to extract ML face embedding."}

    # Save face image to disk
    face_filename = f"{worker_id}_{int(datetime.now().timestamp())}.jpg"
    face_path = os.path.join(FACES_DIR, face_filename)
    cv2.imwrite(face_path, face_crop)

    # Encode thumbnail to base64 for fast UI rendering
    _, buffer = cv2.imencode('.jpg', face_crop)
    thumb_b64 = "data:image/jpeg;base64," + base64.b64encode(buffer).decode('utf-8')

    workers = get_all_workers()
    existing_idx = next((i for i, w in enumerate(workers) if w["worker_id"] == worker_id), -1)
    
    worker_record = {
        "worker_id": worker_id,
        "name": name,
        "role": role,
        "shift": shift,
        "mine_site": mine_site,
        "photo_url": f"/faces/{face_filename}",
        "photo_b64": thumb_b64,
        "embedding": embedding,
        "registered_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

    if existing_idx >= 0:
        workers[existing_idx] = worker_record
    else:
        workers.append(worker_record)

    save_workers(workers)
    return {"success": True, "worker": worker_record, "message": f"Worker '{name}' ({worker_id}) registered successfully."}


def process_attendance_scan(image_bytes, threshold=0.62):
    """
    Scans an image/webcam frame, finds all faces, matches against registered workers,
    and returns detection results + auto-marks attendance.
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        return {"success": False, "message": "Invalid image data."}

    faces = engine.detect_faces(img)
    workers = get_all_workers()

    if len(faces) == 0:
        return {
            "success": True,
            "faces_detected": 0,
            "matches": [],
            "message": "No face detected in the frame."
        }

    matches = []
    attendance_records = get_all_attendance()
    today_str = datetime.now().strftime("%Y-%m-%d")
    now_time_str = datetime.now().strftime("%H:%M:%S")
    now_dt = datetime.now()

    for (x, y, w, h) in faces:
        face_crop = img[max(0, y):min(img.shape[0], y+h), max(0, x):min(img.shape[1], x+w)]
        if face_crop.size == 0:
            continue
            
        face_emb = engine.extract_embedding(face_crop)
        if face_emb is None:
            continue

        best_score = -1.0
        best_worker = None

        for worker in workers:
            if "embedding" in worker and worker["embedding"]:
                score = engine.calculate_similarity(face_emb, worker["embedding"])
                if score > best_score:
                    best_score = score
                    best_worker = worker

        face_result = {
            "box": {"x": int(x), "y": int(y), "w": int(w), "h": int(h)},
            "confidence": round(float(best_score) * 100, 1),
            "matched": False,
            "worker": None,
            "attendance_marked": False,
            "status_message": "Unrecognized Person"
        }

        if best_worker and best_score >= threshold:
            face_result["matched"] = True
            face_result["worker"] = {
                "worker_id": best_worker["worker_id"],
                "name": best_worker["name"],
                "role": best_worker["role"],
                "shift": best_worker["shift"],
                "mine_site": best_worker["mine_site"],
                "photo_b64": best_worker.get("photo_b64", "")
            }

            # Check attendance cooldown (don't duplicate if marked today)
            recent_record = None
            for rec in reversed(attendance_records):
                if rec["worker_id"] == best_worker["worker_id"] and rec["date"] == today_str:
                    recent_record = rec
                    break

            if recent_record is None:
                hour = now_dt.hour
                status = "Present - On Time" if hour < 10 or hour in [14, 15, 22, 23] else "Present"

                new_record = {
                    "id": f"ATT-{int(now_dt.timestamp())}-{best_worker['worker_id']}",
                    "worker_id": best_worker["worker_id"],
                    "name": best_worker["name"],
                    "role": best_worker["role"],
                    "shift": best_worker["shift"],
                    "mine_site": best_worker["mine_site"],
                    "date": today_str,
                    "time": now_time_str,
                    "status": status,
                    "confidence": f"{round(best_score * 100, 1)}%",
                    "verification_type": "AI Face Recognition (ResNet-18)",
                    "timestamp": now_dt.isoformat()
                }
                attendance_records.insert(0, new_record)
                save_attendance(attendance_records)
                face_result["attendance_marked"] = True
                face_result["status_message"] = f"Attendance Marked: {best_worker['name']} ({status})"
            else:
                face_result["attendance_marked"] = False
                face_result["status_message"] = f"Already Checked In at {recent_record['time']}"
        
        matches.append(face_result)

    return {
        "success": True,
        "faces_detected": len(faces),
        "matches": matches
    }


def get_dashboard_stats():
    workers = get_all_workers()
    attendance = get_all_attendance()
    today_str = datetime.now().strftime("%Y-%m-%d")

    today_logs = [a for a in attendance if a.get("date") == today_str]
    present_worker_ids = set(a["worker_id"] for a in today_logs)
    
    total_workers = len(workers)
    present_count = len(present_worker_ids)
    absent_count = max(0, total_workers - present_count)
    rate = round((present_count / total_workers * 100), 1) if total_workers > 0 else 0.0

    return {
        "total_workers": total_workers,
        "present_today": present_count,
        "absent_today": absent_count,
        "attendance_rate": f"{rate}%",
        "today_logs_count": len(today_logs),
        "recent_logs": attendance[:20]
    }
