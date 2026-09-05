import cv2
import time
import argparse
import numpy as np
from ultralytics import YOLO

# ==========================================================
# COAL MINE AI VISION & SMOKE AIR QUALITY SAFETY SYSTEM
# Features:
# 1. Pixel-Level Smoke Segmentation Mask & Coverage Area %
# 2. Air Quality & Human Breathability Index (Breathable vs Unbreathable)
# 3. Intelligent Dual-Severity Alert Gating:
#    - Dense/Unbreathable Smoke -> 🚨 HAZARD ALARM TRIGGERED
#    - Light/Breathable Smoke   -> 🟡 MONITORING ONLY (NO ALERT)
#    - Safe / Clear             -> 🟢 SAFE
# ==========================================================

MODEL_PATH = "best.pt"
DEFAULT_SOURCES = {
    "1": ("light-smoke.mp4", "Light Smoke (Breathable - No Alert Sample)"),
    "2": ("high-smoke.mp4", "Heavy Smoke 1 (Critical Unbreathable Sample)"),
}

# Detection Sensitivity
BASE_CONF = 0.18

# Breathability & Hazard Thresholds
UNBREATHABLE_CONF_THRESH = 0.46     # High confidence dense smoke signature
UNBREATHABLE_SMOKE_PCT_THRESH = 4.0 # Minimum smoke coverage for unbreathable alarm
CRITICAL_CONF_OVERRIDE = 0.65       # Very high confidence smoke triggers immediate hazard

class SmokeBreathabilitySegmentor:
    def __init__(self, model_path=MODEL_PATH):
        print(f"Loading YOLO AI Model from '{model_path}'...")
        self.model = YOLO(model_path)
        self.consecutive_hazard_frames = 0
        self.alert_active = False

    def segment_and_evaluate(self, frame):
        """
        Segments smoke plumes pixel-by-pixel, calculates smoke coverage %,
        and evaluates human breathability / toxicity hazard.
        """
        h, w = frame.shape[:2]
        total_pixels = h * w

        # Run YOLO inference
        results = self.model(frame, conf=BASE_CONF, verbose=False)
        boxes = results[0].boxes

        if len(boxes) == 0:
            self.consecutive_hazard_frames = max(0, self.consecutive_hazard_frames - 1)
            if self.consecutive_hazard_frames == 0:
                self.alert_active = False
            return {
                "boxes": [],
                "smoke_mask": np.zeros((h, w), dtype=np.uint8),
                "smoke_pct": 0.0,
                "max_conf": 0.0,
                "is_unbreathable": False,
                "is_light_smoke": False,
                "alert_active": False,
                "status": "SAFE",
                "breathability": "BREATHABLE (NORMAL)",
            }

        # 1. Pixel-wise Segmentation inside detected smoke regions
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

            # Pixel filter: Smoke has low saturation and gray attenuation
            smoke_submask = (roi_sat < 105) & (roi_gray > 40) & (roi_gray < 235)
            smoke_mask[y1:y2, x1:x2][smoke_submask] = 255

            box_area = (x2 - x1) * (y2 - y1)
            parsed_boxes.append({
                "box": (x1, y1, x2, y2),
                "conf": conf,
                "area_pct": (box_area / total_pixels) * 100.0 if total_pixels > 0 else 0.0
            })

        smoke_pixels = np.count_nonzero(smoke_mask)
        smoke_pct = (smoke_pixels / total_pixels) * 100.0 if total_pixels > 0 else 0.0

        # 2. Human Breathability & Hazard Classification
        # Unbreathable = High confidence dense plume AND significant smoke coverage
        is_unbreathable_frame = (max_conf >= UNBREATHABLE_CONF_THRESH and smoke_pct >= UNBREATHABLE_SMOKE_PCT_THRESH) or (max_conf >= CRITICAL_CONF_OVERRIDE)
        is_light_smoke_frame = not is_unbreathable_frame and (len(boxes) > 0)

        # Temporal smoothing for alert stability
        if is_unbreathable_frame:
            self.consecutive_hazard_frames += 1
            if self.consecutive_hazard_frames >= 2:
                self.alert_active = True
        else:
            self.consecutive_hazard_frames = max(0, self.consecutive_hazard_frames - 1)
            if self.consecutive_hazard_frames == 0:
                self.alert_active = False

        if self.alert_active:
            status = "HAZARD_ALERT"
            breathability = "UNBREATHABLE (HAZARDOUS)"
        elif is_light_smoke_frame:
            status = "LIGHT_SMOKE"
            breathability = "BREATHABLE (MONITORING)"
        else:
            status = "SAFE"
            breathability = "SAFE (NORMAL)"

        return {
            "boxes": parsed_boxes,
            "smoke_mask": smoke_mask,
            "smoke_pct": round(smoke_pct, 1),
            "max_conf": round(max_conf * 100.0, 1),
            "is_unbreathable": is_unbreathable_frame,
            "is_light_smoke": is_light_smoke_frame,
            "alert_active": self.alert_active,
            "status": status,
            "breathability": breathability,
        }


def draw_hud(frame, telemetry, fps):
    """
    Renders the professional coal mine safety HUD overlay.
    """
    h, w = frame.shape[:2]

    # 1. Translucent Segmentation Mask Overlay
    smoke_mask = telemetry["smoke_mask"]
    if np.count_nonzero(smoke_mask) > 0:
        mask_color = np.zeros_like(frame)
        if telemetry["alert_active"]:
            mask_color[smoke_mask == 255] = [0, 0, 255]      # Translucent Red for Hazard Smoke
        else:
            mask_color[smoke_mask == 255] = [0, 220, 255]    # Translucent Gold for Light Smoke
        cv2.addWeighted(frame, 1.0, mask_color, 0.35, 0, frame)

    # 2. Draw Bounding Boxes with Labels
    for item in telemetry["boxes"]:
        x1, y1, x2, y2 = item["box"]
        conf = item["conf"]
        is_hazard = (conf >= UNBREATHABLE_CONF_THRESH) or telemetry["alert_active"]

        color = (0, 0, 255) if is_hazard else (0, 215, 255)
        label = f"HAZARD SMOKE: {conf*100:.1f}%" if is_hazard else f"Light Smoke: {conf*100:.1f}% [Safe]"

        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
        (lw, lh), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.52, 2)
        cv2.rectangle(frame, (x1, max(0, y1 - 22)), (x1 + lw + 8, y1), color, -1)
        cv2.putText(
            frame,
            label,
            (x1 + 4, y1 - 6),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.52,
            (255, 255, 255) if is_hazard else (0, 0, 0),
            2,
            cv2.LINE_AA
        )

    # 3. Top Status Dashboard Banner
    overlay = frame.copy()
    cv2.rectangle(overlay, (0, 0), (w, 90), (15, 20, 28), -1)
    cv2.addWeighted(overlay, 0.80, frame, 0.20, 0, frame)

    # Status text & colors
    if telemetry["alert_active"]:
        title_text = "🚨 UNBREATHABLE SMOKE HAZARD — EVACUATION ALARM ACTIVE!"
        title_color = (0, 0, 255)       # Red
        badge_bg = (0, 0, 220)
        badge_text = "ALARM: ACTIVE"
        # Pulsing Red Frame Border during critical unbreathable smoke
        if int(time.time() * 4) % 2 == 0:
            cv2.rectangle(frame, (0, 0), (w - 1, h - 1), (0, 0, 255), 5)
    elif telemetry["is_light_smoke"]:
        title_text = "🟡 LIGHT SMOKE DETECTED — AIR QUALITY: BREATHABLE (NO ALERT)"
        title_color = (0, 220, 255)     # Yellow / Gold
        badge_bg = (0, 160, 200)
        badge_text = "ALARM: OFF"
    else:
        title_text = "🟢 SAFE ATMOSPHERE — NO SMOKE HAZARD DETECTED"
        title_color = (0, 255, 128)     # Green
        badge_bg = (0, 150, 0)
        badge_text = "ALARM: CLEAR"

    # Render Main Header Line
    cv2.putText(frame, title_text, (20, 34), cv2.FONT_HERSHEY_DUPLEX, 0.72, title_color, 2, cv2.LINE_AA)

    # Render Telemetry Metrics Line
    metrics = (
        f"Smoke Coverage: {telemetry['smoke_pct']}%  |  "
        f"Breathability: {telemetry['breathability']}  |  "
        f"Max Conf: {telemetry['max_conf']}%  |  "
        f"FPS: {fps:.1f}"
    )
    cv2.putText(frame, metrics, (20, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.52, (220, 225, 230), 1, cv2.LINE_AA)

    # Render Right Badge
    (bw, bh), _ = cv2.getTextSize(badge_text, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
    badge_x1 = w - bw - 35
    cv2.rectangle(frame, (badge_x1, 18), (w - 15, 58), badge_bg, -1)
    cv2.rectangle(frame, (badge_x1, 18), (w - 15, 58), (255, 255, 255), 1)
    cv2.putText(frame, badge_text, (badge_x1 + 10, 44), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2, cv2.LINE_AA)

    return frame


def main():
    parser = argparse.ArgumentParser(description="Coal Mine AI Smoke & Air Quality Vision Monitor")
    parser.add_argument("--source", type=str, default="light-smoke.mp4", help="Video source (file path or '0' for webcam)")
    args = parser.parse_args()

    video_source = args.source
    if video_source.isdigit():
        video_source = int(video_source)

    print("=" * 70)
    print("🔥 COAL MINE AI SMOKE & BREATHABILITY VISION SYSTEM")
    print(f"Source: '{video_source}'")
    print("Hierarchy:")
    print("  🚨 Dense / Heavy Smoke (Unbreathable) -> TRIGGER ALARM")
    print("  🟡 Light / Faint Smoke (Breathable)   -> NO ALERT (Normal Monitoring)")
    print("  🟢 Clear Atmosphere                   -> SAFE")
    print("=" * 70)

    segmentor = SmokeBreathabilitySegmentor(MODEL_PATH)
    cap = cv2.VideoCapture(video_source)

    if not cap.isOpened():
        print(f"❌ Error opening video source '{video_source}'.")
        return

    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    prev_time = time.time()
    curr_fps = fps
    paused = False

    print("\nControls:")
    print("  'q' or ESC : Exit")
    print("  'p'        : Pause / Resume")
    print("  'r'        : Restart video from start")
    print("  '1'        : Switch to 'light-smoke.mp4'")
    print("  '2'        : Switch to 'high-smoke-1.mp4'")
    print("  '3'        : Switch to 'high-smoke-2.mp4'\n")

    while True:
        if not paused:
            ret, frame = cap.read()
            if not ret:
                cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                continue

            # Calculate FPS
            curr_time = time.time()
            time_diff = curr_time - prev_time
            prev_time = curr_time
            if time_diff > 0:
                curr_fps = 0.9 * curr_fps + 0.1 * (1.0 / time_diff)

            # Segment and evaluate breathability
            telemetry = segmentor.segment_and_evaluate(frame)

            # Draw HUD
            annotated_frame = draw_hud(frame, telemetry, curr_fps)

            # Terminal log
            if telemetry["alert_active"]:
                print(f"[🚨 HAZARD ALARM] Smoke: {telemetry['smoke_pct']}% | Conf: {telemetry['max_conf']}% | Breathability: {telemetry['breathability']}")
            elif telemetry["is_light_smoke"]:
                print(f"[🟡 LIGHT SMOKE] Smoke: {telemetry['smoke_pct']}% | Conf: {telemetry['max_conf']}% | Breathability: {telemetry['breathability']} (No Alert)")

        cv2.imshow("Coal Mine AI Vision: Smoke & Breathability Monitor", annotated_frame if not paused else frame)

        key = cv2.waitKey(1 if not paused else 50) & 0xFF
        if key == ord("q") or key == 27:
            print("Exiting smoke detection monitoring.")
            break
        elif key == ord("p"):
            paused = not paused
            print("Paused" if paused else "Resumed")
        elif key == ord("r"):
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            print("Restarting current stream...")
        elif key in [ord("1"), ord("2"), ord("3")]:
            src_key = chr(key)
            new_path, desc = DEFAULT_SOURCES[src_key]
            print(f"Switching video source to: {new_path} ({desc})")
            cap.release()
            cap = cv2.VideoCapture(new_path)

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()