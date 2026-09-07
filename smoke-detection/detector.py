"""
Coal Mine Intelligent Smoke & Air Quality Breathability Detector
Pixel-level smoke mask segmentation, smoke coverage %, and asphyxiation hazard evaluation.
"""

from ultralytics import YOLO
import cv2
import numpy as np

class SmokeBreathabilityDetector:
    def __init__(self, model_path="best.pt", base_conf=0.18, unbreathable_conf=0.46, unbreathable_smoke_pct=4.0):
        self.model = YOLO(model_path)
        self.base_conf = base_conf
        self.unbreathable_conf = unbreathable_conf
        self.unbreathable_smoke_pct = unbreathable_smoke_pct
        self.consecutive_hazard_frames = 0
        self.alert_active = False

    def process_frame(self, frame):
        """
        Process a single BGR video frame.
        Returns:
            annotated_frame (np.ndarray): Frame with bounding boxes & translucent segmentation mask
            telemetry (dict): Detailed air quality, smoke coverage %, and hazard telemetry
        """
        h, w = frame.shape[:2]
        total_pixels = h * w

        results = self.model(frame, conf=self.base_conf, verbose=False)
        boxes = results[0].boxes

        if len(boxes) == 0:
            self.consecutive_hazard_frames = max(0, self.consecutive_hazard_frames - 1)
            if self.consecutive_hazard_frames == 0:
                self.alert_active = False

            return frame, {
                "status": "SAFE",
                "breathability": "BREATHABLE (SAFE)",
                "alert_active": False,
                "is_unbreathable": False,
                "is_light_smoke": False,
                "smoke_percentage": 0.0,
                "max_confidence": 0.0,
                "detection_count": 0,
                "boxes": []
            }

        smoke_mask = np.zeros((h, w), dtype=np.uint8)
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)

        max_conf = 0.0
        parsed_boxes = []

        for b in boxes:
            conf = float(b.conf[0])
            if conf > max_conf:
                max_conf = conf

            x1, y1, x2, y2 = map(int, b.xyxy[0])
            x1, y1 = max(0, x1), max(0, y1)
            x2, y2 = min(w, x2), min(h, y2)

            roi_gray = gray[y1:y2, x1:x2]
            roi_sat = hsv[y1:y2, x1:x2, 1]

            smoke_submask = (roi_sat < 105) & (roi_gray > 40) & (roi_gray < 235)
            smoke_mask[y1:y2, x1:x2][smoke_submask] = 255

            parsed_boxes.append({
                "box": [x1, y1, x2, y2],
                "confidence": round(conf * 100.0, 1),
                "area_pct": round(((x2 - x1) * (y2 - y1) / total_pixels) * 100.0, 1)
            })

        smoke_pixels = np.count_nonzero(smoke_mask)
        smoke_pct = round((smoke_pixels / total_pixels) * 100.0, 1) if total_pixels > 0 else 0.0

        is_unbreathable = (max_conf >= self.unbreathable_conf and smoke_pct >= self.unbreathable_smoke_pct) or (max_conf >= 0.65)
        is_light = not is_unbreathable and (len(boxes) > 0)

        if is_unbreathable:
            self.consecutive_hazard_frames += 1
            if self.consecutive_hazard_frames >= 2:
                self.alert_active = True
        else:
            self.consecutive_hazard_frames = max(0, self.consecutive_hazard_frames - 1)
            if self.consecutive_hazard_frames == 0:
                self.alert_active = False

        status = "HAZARD_ALERT" if self.alert_active else ("LIGHT_SMOKE" if is_light else "SAFE")
        breathability = "UNBREATHABLE (HAZARDOUS)" if self.alert_active else ("BREATHABLE (MONITORING)" if is_light else "BREATHABLE (SAFE)")

        # Annotated image
        annotated = frame.copy()
        if smoke_pixels > 0:
            tint = np.zeros_like(frame)
            tint[smoke_mask == 255] = [0, 0, 255] if self.alert_active else [0, 220, 255]
            cv2.addWeighted(annotated, 1.0, tint, 0.35, 0, annotated)

        for b in parsed_boxes:
            x1, y1, x2, y2 = b["box"]
            color = (0, 0, 255) if self.alert_active or (b["confidence"] >= self.unbreathable_conf * 100) else (0, 215, 255)
            cv2.rectangle(annotated, (x1, y1), (x2, y2), color, 2)

        return annotated, {
            "status": status,
            "breathability": breathability,
            "alert_active": self.alert_active,
            "is_unbreathable": is_unbreathable,
            "is_light_smoke": is_light,
            "smoke_percentage": smoke_pct,
            "max_confidence": round(max_conf * 100.0, 1),
            "detection_count": len(boxes),
            "boxes": parsed_boxes
        }
