# 🔍 LogLense — Frontend

> **LogLense** is a modern, high-performance web dashboard for analyzing massive server and application log files fast. Built with Big Data concepts, it visualizes real-time parsing, status distributions, security threats, traffic spikes, and multi-core performance benchmarks.

---

## 🎨 Tech Stack

- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS (Custom Indigo SaaS Design System)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Routing**: React Router v6
- **Animations**: Framer Motion
- **Deployment**: Vercel (Configured with SPA rewrites via `vercel.json`)

---

## 🚀 How to Run Locally

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Start local development server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## ⚙️ Environment Variables

Configure these in `.env` for local development or in your **Vercel Project Settings**:

| Variable | Description | Default (Local) |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base URL of the LogLense Backend API | `http://127.0.0.1:8000` |
| `VITE_GOOGLE_CLIENT_ID` | Optional Google OAuth Client ID | `your-client-id` |

> **Backend Repository**: The companion FastAPI backend is available at:  
> [https://github.com/amitpatel9321597966/log-file-analyser-backend](https://github.com/amitpatel9321597966/log-file-analyser-backend)

---

## 📱 Responsive & Mobile-First Features

- **Mobile (< 640px)**: 
  - Slide-in 280px navigation drawer with active job status
  - 5-tab fixed bottom navigation bar
  - Full-width instant search overlay
  - Bottom-sheet filter drawer and log line inspector
  - 44x44px touch targets on all buttons and actions
- **Tablet (640px – 1023px)**: 
  - Collapsed 72px icon sidebar with hover tooltips
  - Horizontal-scrolling data tables with sticky column headers
- **Desktop (1024px+)**: 
  - Full 240px sidebar, expanded 4-column KPI cards, side-by-side bar charts, and slide-over inspectors.

---

## 📸 Screenshots & Preview

| View | Description |
| :--- | :--- |
| **Dashboard** | Real-time throughput KPI cards, error rate monitoring, traffic timeline area chart, and HTTP status donut chart. |
| **Upload & Sample Generator** | Drag-and-drop log streaming with format auto-detection and 100K / 1M / 5M synthetic log generator. |
| **Pipeline Visualizer** | Step-by-step MapReduce pipeline stepper (Split → Map → Reduce → Store) with live telemetry stats and stream terminal. |
| **Log Explorer** | Filter and search raw logs with client IP, status code, log level, and bottom-sheet row detail inspector. |
| **Problems & Security Issues** | Outlier detection for brute-force login attempts, 404 vulnerability scans, and 5xx error bursts. |
| **Benchmark** | Parallel speedup comparison (Single-thread vs Multi-worker cores). |

---

## 📄 License
MIT License. Built for high-speed log analytics.
