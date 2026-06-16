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

## 📱 Using the QR Code Scanner

### Setup for Mobile:

1. **Install Node Modules:**

   ```bash
   cd frontend
   npm install
   ```

2. **Build for Mobile (Android/iOS):**

   ```bash
   npm run build
   npx cap sync
   npx cap open android    # For Android
   ```

3. **In your components**, import and use the scanner:

   ```jsx
   import QRScanner from "../components/QRScanner";

   const [showScanner, setShowScanner] = useState(false);

   const handleScan = (data) => {
     console.log("Scanned QR Code:", data);
     // Handle the scanned data here
   };

   return (
     <>
       <button onClick={() => setShowScanner(true)}>Scan QR Code</button>

       {showScanner && (
         <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
       )}
     </>
   );
   ```

### Test Scanner (Web Preview):

- Try the example page at: `src/pages/ScannerExample.jsx`
- Add it to your router to test

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

Update the API base URL in your `frontend/src/` components:

```jsx
const API_BASE_URL = "http://localhost:8000";
```

---

## 📂 Project Structure

```
app/
├── backend/                    # Python FastAPI server
│   ├── main.py                # FastAPI app entry
│   ├── requirements.txt        # Python dependencies ✅
│   ├── database.py            # MongoDB config
│   └── routes/                # API endpoints
│
├── frontend/                  # React + Vite web app
│   ├── package.json           # Dependencies updated ✅
│   ├── src/
│   │   ├── components/
│   │   │   └── QRScanner.jsx  # QR scanner component ✅
│   │   ├── pages/
│   │   │   └── ScannerExample.jsx  # Scanner demo page ✅
│   │   └── App.jsx
│   └── vite.config.js
│
└── android/                   # Capacitor Android app
```

---

## 🎯 Next Steps

1. **Test Backend**:

   ```bash
   curl http://localhost:8000/
   ```

2. **Test Frontend**:
   - Open http://localhost:5173 in your browser

3. **Test Scanner**:
   - Navigate to the ScannerExample page
   - Click "Start Scanning"
   - Generate a test QR code and scan it

4. **Build for Mobile**:
   ```bash
   cd frontend
   npm run build
   npx cap sync
   ```

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

### Scanner not working:

- Make sure you're testing on a mobile device or using Capacitor
- Check camera permissions in app settings
- For Android: Add camera permission in `AndroidManifest.xml`

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
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

---

## ✨ Features Ready to Use

- ✅ FastAPI backend with MongoDB
- ✅ React + Vite frontend with Capacitor
- ✅ QR Code scanner (mobile)
- ✅ Authentication setup
- ✅ Interview & Resume routes
- ✅ AI service integration

**You're ready to go! 🎉**
