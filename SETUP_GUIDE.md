# App Setup & Startup Guide

## ✅ What's Been Set Up

1. **Backend Dependencies** - All Python packages installed (FastAPI, MongoDB, etc.)
2. **Frontend Dependencies** - React + Vite configuration ready
3. **QR Code Scanner** - Capacitor barcode scanner integrated
4. **Scanner Component** - Pre-built React component and example page

---

## 🚀 Quick Start

### 1. Start the Backend Server

Open a terminal and run:

```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```

The backend will start at: **http://localhost:8000**

---

### 2. Install Frontend Dependencies

Open another terminal:

```bash
cd frontend
npm install
```

---

### 3. Start the Frontend Development Server

```bash
npm run dev
```

The frontend will start at: **http://localhost:5173**

---

## 📱 Running the Mobile App (USB Debugging)

### Setup for Mobile:

1. **Install Node Modules:**

   ```bash
   cd mobile
   npm install
   ```

2. **Enable USB Debugging on your Android Device:**
   - Go to **Settings > About Phone** and tap **Build Number** 7 times to enable Developer Options.
   - Go back to **Settings > Developer Options** and enable **USB Debugging**.
   - Connect your phone to your computer via USB cable.

3. **Run on Device:**

   ```bash
   npm run android
   ```
   This will start the Expo bundler and install/run the app on your connected Android device.

---

## 🔧 Configuration

### Backend Environment Variables

Create `.env` in the `backend/` folder:

```env
DATABASE_URL=mongodb://localhost:27017/interviu_ai
SECRET_KEY=your-secret-key-here
OPENAI_API_KEY=your-openai-key-here
```

### Frontend API Configuration

Update the API base URL in your components or `mobile/src/utils/api.js`:

```jsx
const API_BASE_URL = "http://10.0.2.2:8000"; // For Android Emulator
// Or use your computer's local IP address (e.g. http://192.168.1.50:8000) for USB debugging.
```

---

## 📂 Project Structure

```
app/
├── backend/                    # Python FastAPI server
│   ├── main.py                # FastAPI app entry
│   ├── requirements.txt        # Python dependencies ✅
│   └── routes/                # API endpoints
│
├── frontend/                  # React + Vite web app
│   ├── package.json           # Web dependencies ✅
│   ├── src/                   # React components & pages
│   └── vite.config.js         # Web build config
│
└── mobile/                    # React Native + Expo mobile app
    ├── App.js                 # App entry point
    ├── src/                   # Navigation & screens ✅
    └── package.json           # Mobile dependencies ✅
```

---

## 🎯 Next Steps

1. **Test Backend**:

   ```bash
   curl http://localhost:8000/
   ```

2. **Test Frontend**:
   - Open http://localhost:5173 in your browser

3. **Run Mobile app**:
   - Run `npm run android` inside `mobile/` with your device connected.

---

## 🐛 Troubleshooting

### Backend won't start:

- Make sure MongoDB is running
- Check port 8000 is not in use
- Verify all Python packages installed: `pip list`

### Frontend won't load:

- Delete `node_modules` and run `npm install` again
- Clear browser cache (Ctrl+Shift+Delete)
- Check port 5173 is not in use

### Mobile device not detected:
- Make sure USB debugging is enabled in Developer Options.
- Run `adb devices` in your command line to verify the PC sees your phone.
- Accept the debugging authorization prompt on your phone's screen.

---

## 📦 Available Scripts

**Backend:**

```bash
python -m uvicorn main:app --reload --port 8000
```

**Frontend:**

```bash
npm run dev       # Start development server
npm run build     # Build for production
```

**Mobile:**

```bash
npm start         # Start Expo server
npm run android   # Run on connected Android device
```

---

## ✨ Features Ready to Use

- ✅ FastAPI backend
- ✅ React + Vite frontend website
- ✅ React Native + Expo mobile app
- ✅ USB debugging compatibility
- ✅ Authentication setup
- ✅ Interview & Resume routes
- ✅ AI service integration

**You're ready to go! 🎉**
