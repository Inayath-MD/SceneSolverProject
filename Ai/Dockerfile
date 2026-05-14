FROM python:3.10-slim

ENV DEBIAN_FRONTEND=noninteractive
WORKDIR /app

# System dependencies required by OpenCV, torch, and gTTS
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libgl1 \
    libsm6 \
    libxrender1 \
    libxext6 \
    ffmpeg \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install CPU-only PyTorch (much smaller image size)
RUN pip install --no-cache-dir torch==2.1.0+cpu torchvision==0.16.0+cpu \
    --index-url https://download.pytorch.org/whl/cpu

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Create required runtime folders
RUN mkdir -p uploads static/audio

# HF Spaces requires port 7860
EXPOSE 7860

# Hugging Face Spaces runs app.py
CMD ["python", "app.py"]
