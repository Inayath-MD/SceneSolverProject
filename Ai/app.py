# app.py — Hugging Face Spaces entry point (renames ai_service.py logic)
# HF Spaces requires the main file to be app.py

import os
import traceback
import uuid
from PIL import Image
from flask import Flask, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
from flask_cors import CORS
import cv2

import torch
from transformers import CLIPModel, CLIPProcessor, BlipProcessor, BlipForConditionalGeneration
from ultralytics import YOLO

from gtts import gTTS

# -----------------------------
# Flask Setup
# -----------------------------
app = Flask(__name__)

UPLOAD_FOLDER = "uploads"
AUDIO_FOLDER = "static/audio"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(AUDIO_FOLDER, exist_ok=True)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# Enable CORS for ALL origins (needed for your frontend)
CORS(app, resources={r"/*": {"origins": "*"}})

print("🔌 Loading AI models... (first run takes time)")

device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"📦 Using device: {device}")

# -----------------------------
# MODELS
# -----------------------------
clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(device)
clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

blip_processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
blip_model = BlipForConditionalGeneration.from_pretrained(
    "Salesforce/blip-image-captioning-base"
).to(device).eval()

yolo_model = YOLO("yolov8s.pt")

print("✅ All models loaded.\n")

# -----------------------------
# Scene Labels
# -----------------------------
scene_labels = [
    "murder", "stabbing", "shooting", "robbery",
    "shoplifting", "fighting", "explosion",
    "accident", "armed_threat", "screenshot", "normal"
]


# -----------------------------
# CLIP Zero-Shot
# -----------------------------
def classify_with_clip(image):
    inputs = clip_processor(text=scene_labels, images=image, return_tensors="pt", padding=True).to(device)
    with torch.no_grad():
        logits = clip_model(**inputs).logits_per_image[0]
    return scene_labels[logits.argmax().item()]


# -----------------------------
# Image Analysis Pipeline
# -----------------------------
def analyze_image(image_path):
    image = Image.open(image_path).convert("RGB")

    # CLIP
    try:
        clip_pred = classify_with_clip(image)
    except:
        clip_pred = "normal"

    # YOLO
    yolo_results = yolo_model(image_path, verbose=False)[0]
    yolo_labels = []
    found_objects = []

    if yolo_results.boxes:
        for box in yolo_results.boxes:
            cls_id = int(box.cls[0])
            conf = float(box.conf[0])
            coco_name = yolo_model.names.get(cls_id, str(cls_id)).lower()
            yolo_labels.append(coco_name)
            found_objects.append({
                "object": coco_name,
                "match": round(conf * 100),
                "box": [int(x) for x in box.xyxy[0].tolist()]
            })

    # BLIP Caption
    try:
        blip_inputs = blip_processor(images=image, return_tensors="pt").to(device)
        blip_out = blip_model.generate(**blip_inputs, max_new_tokens=64)
        caption = blip_processor.decode(blip_out[0], skip_special_tokens=True)
    except:
        caption = ""

    caption_low = caption.lower()

    # Smart fusion logic
    final_label = clip_pred

    dead_terms = ["dead", "body", "corpse", "covered", "lying"]
    violence_terms = ["stab", "murder", "shot", "shooting", "kill"]
    safe_terms = ["screen shot", "screenshot", "webpage", "text", "document"]

    if any(t in caption_low for t in safe_terms):
        final_label = "normal"
    elif any(t in caption_low for t in dead_terms + violence_terms):
        final_label = "murder"
    elif "knife" in yolo_labels:
        final_label = "stabbing"
    elif "gun" in yolo_labels:
        final_label = "shooting"
    elif "fire" in yolo_labels or "smoke" in yolo_labels:
        final_label = "explosion"

    return {
        "final_label": final_label,
        "clip_pred": clip_pred,
        "yolo_labels": list(set(yolo_labels)),
        "found_objects_details": found_objects,
        "caption": caption
    }


# -----------------------------
# Serve Audio
# -----------------------------
@app.route('/static/audio/<filename>')
def serve_audio(filename):
    return send_from_directory(AUDIO_FOLDER, filename)


# -----------------------------
# Health Check
# -----------------------------
@app.route("/", methods=["GET"])
def health():
    return jsonify({"status": "Scene Solver AI is running ✅", "device": device})


# -----------------------------
# Main Analyze Endpoint
# -----------------------------
@app.route("/analyze", methods=["POST"])
def analyze_media():
    try:
        if "media" not in request.files:
            return jsonify({"error": "No media provided"}), 400

        file = request.files["media"]
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)

        if not (file.mimetype.startswith("image") or file.mimetype.startswith("video")):
            os.remove(filepath)
            return jsonify({"error": "Only images and videos are supported"}), 400

        is_video = file.mimetype.startswith("video")
        target_path = filepath
        temp_frame_path = None

        if is_video:
            # Extract the middle frame from the video using OpenCV
            cap = cv2.VideoCapture(filepath)
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            mid_frame = max(0, total_frames // 2)
            cap.set(cv2.CAP_PROP_POS_FRAMES, mid_frame)
            
            ret, frame = cap.read()
            cap.release()

            if not ret:
                os.remove(filepath)
                return jsonify({"error": "Could not extract frame from video"}), 400
                
            temp_frame_path = filepath + "_frame.jpg"
            cv2.imwrite(temp_frame_path, frame)
            target_path = temp_frame_path

        # Analyze
        result = analyze_image(target_path)

        # Build story
        story_text = (
            f"Detected scene: {result['final_label']}. "
            f"Objects found: {result['yolo_labels']}. "
            f"Caption says: {result['caption']}."
        )

        # Text-to-Speech
        audio_filename = f"{uuid.uuid4()}.mp3"
        audio_path = os.path.join(AUDIO_FOLDER, audio_filename)

        tts = gTTS(text=story_text, lang="en")
        tts.save(audio_path)

        audio_url = request.url_root.rstrip('/') + f"/static/audio/{audio_filename}"

        return jsonify({
            "quickCaption": result["caption"],
            "sceneKeywords": [{"keyword": result["final_label"], "match": 95}],
            "foundObjects": result["found_objects_details"],
            "fullStory": story_text,
            "audioUrl": audio_url
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

    finally:
        try:
            if 'filepath' in locals() and os.path.exists(filepath):
                os.remove(filepath)
            if 'temp_frame_path' in locals() and temp_frame_path and os.path.exists(temp_frame_path):
                os.remove(temp_frame_path)
        except:
            pass


if __name__ == "__main__":
    # HF Spaces runs on port 7860 by default
    port = int(os.environ.get("PORT", 7860))
    app.run(host="0.0.0.0", port=port)
