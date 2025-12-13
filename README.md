# Scene Solver

An AI-powered crime scene analysis application that uses computer vision and natural language processing to analyze images and videos.

## Features

- 🔍 **Scene Analysis**: Upload images/videos for AI-powered analysis
- 🎯 **Object Detection**: Identifies objects using YOLOv8
- 📝 **Caption Generation**: Generates descriptions using BLIP
- 🏷️ **Scene Classification**: Classifies scenes using CLIP
- 🔊 **Text-to-Speech**: Converts analysis results to audio
- 📊 **History Tracking**: View and manage past analyses
- 🗑️ **Trash Management**: Soft delete with restore functionality

## Tech Stack

### Frontend
- React.js
- Axios
- React Router

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Multer (file uploads)

### AI Service
- Python + Flask
- PyTorch
- Transformers (CLIP, BLIP)
- Ultralytics YOLOv8
- gTTS (Text-to-Speech)

## Setup

### Prerequisites
- Node.js (v14+)
- Python 3.10
- MongoDB
- Docker (optional, for AI service)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd "Scene Solver"
   ```

2. **Backend Setup**
   ```bash
   cd Backend
   npm install
   ```
   Create `.env` file:
   ```
   MONGO_URI=mongodb://127.0.0.1:27017/scenesolver
   PORT=5000
   AI_SERVICE_URL=http://127.0.0.1:5001/analyze
   JWT_SECRET=yourSecretJWTKey
   ```

3. **Frontend Setup**
   ```bash
   cd Frontendnew
   npm install
   ```

4. **AI Service Setup**
   
   **Option A: Docker (Recommended)**
   ```bash
   cd Ai
   docker compose up --build
   ```
   
   **Option B: Local Python**
   ```bash
   cd Ai
   pip install -r requirements.txt
   python ai_service.py
   ```

### Running the Application

Use the provided batch script:
```bash
start_services.bat
```

Or manually start each service:
1. MongoDB: `docker start scene_solver_mongo`
2. Backend: `cd Backend && npm start`
3. AI Service: `cd Ai && docker compose up`
4. Frontend: `cd Frontendnew && npm start`

### First Time Use

1. Open `http://localhost:3000`
2. Click **"Sign Up"** to create an account
3. Log in with your credentials
4. Navigate to **"Upload"** to analyze scenes

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### Analysis
- `POST /api/analysis` - Upload and analyze media (requires auth)
- `GET /api/analysis/history` - Get user's analysis history (requires auth)
- `GET /api/analysis/trash/all` - Get deleted items (requires auth)
- `DELETE /api/analysis/:id` - Soft delete analysis (requires auth)
- `PUT /api/analysis/restore/:id` - Restore deleted analysis (requires auth)
- `DELETE /api/analysis/permanent/:id` - Permanently delete (requires auth)

## Project Structure

```
Scene Solver/
├── Ai/                    # AI Service (Python/Flask)
│   ├── ai_service.py
│   ├── requirements.txt
│   └── Dockerfile
├── Backend/               # Node.js Backend
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   └── server.js
├── Frontendnew/          # React Frontend
│   └── src/
│       └── components/
└── start_services.bat    # Startup script
```

## License

MIT
