---
title: Scene Solver AI
emoji: 🔍
colorFrom: red
colorTo: purple
sdk: docker
app_port: 7860
pinned: false
---

# Scene Solver AI Service

This is the AI backend for the **Scene Solver** project.

## Endpoints

- `GET /` — Health check
- `POST /analyze` — Upload an image for scene analysis

## How it works

Analyzes uploaded images using:
- **CLIP** (zero-shot scene classification)
- **BLIP** (image captioning)
- **YOLOv8** (object detection)
- **gTTS** (text-to-speech narrative)
