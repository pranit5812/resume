# CareerPilot AI — Frontend Client 💻

The official frontend web application for **CareerPilot AI**, built with **React 19**, **Vite**, and **Tailwind CSS v4**. It features an ultra-modern liquid glassmorphic design system, interactive charts, and real-time AI career tools.

---

## 🛠️ Tech Stack & Libraries

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Routing**: [React Router DOM v7](https://reactrouter.com/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with PostCSS
- **Visualizations**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **HTTP Client**: [Axios](https://axios-http.com/)

---

## 📂 Directory Structure

```text
frontend/src/
├── assets/          # Static icons and branding media
├── components/      # Shared components (e.g., BackgroundVideo)
├── pages/           # Application views & route handlers
│   ├── CareerRec.jsx      # Career archetype matches & suggested certifications
│   ├── Dashboard.jsx      # Authenticated layout with sidebar & header
│   ├── DashboardHome.jsx  # Analytics overview with historical score charts
│   ├── Landing.jsx        # High-conversion hero landing page
│   ├── Login.jsx          # User login with glassmorphism card
│   ├── MockInterview.jsx  # Interactive interview room with scoring breakdown
│   ├── Profile.jsx        # User profile, skills, passions, and goals editor
│   ├── Register.jsx       # User registration interface
│   ├── ResumeUpload.jsx   # PDF resume uploader & ATS keyword matcher
│   └── SkillGap.jsx       # Benchmark analyzer and customized study roadmaps
├── services/        # Axios API instance with Bearer token interceptor
├── store/           # AuthContext & user state management
├── App.jsx          # Route definitions & protected route wrappers
├── index.css        # Liquid glass design system & Tailwind directives
└── main.jsx         # React application mounting
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
The app will be accessible at: `http://localhost:5173`

### 3. Build for Production
```bash
npm run build
```
Build output is saved to the `dist/` directory.

### 4. Preview Production Build
```bash
npm run preview
```

### 5. Lint Code
```bash
npm run lint
```

---

## 🔗 Backend API Connection

The frontend expects the backend FastAPI server to run at:
```
http://localhost:8000/api
```
To modify the base URL, edit [src/services/api.js](file:///d:/resume/frontend/src/services/api.js):
```javascript
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  timeout: 20000,
});
```

---

## 🎨 UI Design System

- **Liquid Glassmorphism**: Defined in `index.css` with frosted-glass backdrops (`backdrop-blur-xl`, `bg-white/10`, `border-white/15`).
- **Dynamic Backgrounds**: Responsive looping video background with subtle ambient glows.
- **Typography**: Clean, high-legibility modern sans-serif paired with Instrument Serif accents on headings.
