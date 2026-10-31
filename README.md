# Rentozi Deployment & Quick-Start Guide

**Project Title:** Rentozi: AI-Assisted Smart Campus Peer-to-Peer Rental and Service Marketplace  
**Institution:** Marwadi University, Faculty of Engineering and Technology, Department of CSE – AI, ML and DS  
**Student Name:** Hariom Kumar  
**Enrollment No.:** 92500118322  
**Division:** 3EN19  
**Course:** AI-Assisted Web Application Project (Semester 3 – CSE AI/ML)  

---

## 🚀 1. Run Locally (Fastest 30-Second Start)

The web application is built with Vite, React 18, TypeScript, and Tailwind CSS. It is configured to run fully client-side out-of-the-box with rich campus mock data and built-in AI heuristics, requiring zero database setup or API keys.

```bash
# 1. Navigate to the project directory
cd rento

# 2. Install dependencies (if not already installed)
npm install

# 3. Start the Vite development server
npm run dev
```

Open your browser at:  
👉 **`http://localhost:5173/`**

---

## 🌐 2. Deploy to Vercel (1-Click Deployment - Recommended)

Vercel is the easiest, free way to deploy modern Vite React applications.

### Option A: Via GitHub (Continuous Deployment)
1. Initialize a git repository if not done:
   ```bash
   cd rento
   git init
   git add .
   git commit -m "Initial release of Rentozi AI Campus App"
   ```
2. Push to your GitHub account (`https://github.com/<your-username>/rentozi`).
3. Go to [https://vercel.com](https://vercel.com) and click **"Add New Project"**.
4. Import your GitHub repository.
5. In the build settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `./` (or `rento` if deploying from the root workspace)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
6. Click **Deploy**. Your app will be live with an SSL URL (e.g., `https://rentozi.vercel.app`).

### Option B: Via Vercel CLI (Direct Deploy from Terminal)
```bash
cd rento
npx vercel
# Follow the interactive prompts and accept the defaults.
```

---

## ☁️ 3. Deploy to Netlify

1. Build the production package:
   ```bash
   cd rento
   npm run build
   ```
2. You can drag and drop the generated `rento/dist` folder directly onto [https://app.netlify.com/drop](https://app.netlify.com/drop).
3. Or deploy via Netlify CLI:
   ```bash
   npx netlify deploy --dir=dist --prod
   ```

---

## 🐍 4. (Optional) Run Django REST API Backend

If you wish to test with the full relational SQLite backend active:

```bash
cd rento/backend

# Activate virtual environment
source venv/bin/activate

# Apply migrations
python manage.py migrate

# Start the Django development server
python manage.py runserver 8000
```

The frontend in `rento/` automatically proxies `/api` calls to `http://127.0.0.1:8000`.

---

## 📄 5. Project Report Files

The university project report has been fully compiled and formatted according to the Marwadi University template:

- **Official PDF Report:** [`Rentozi_AI_Project_Report.pdf`](file:///Users/hariompratapsingh/Downloads/Almighty/Rentozi_AI_Project_Report.pdf) (13 pages, publication-ready, with institutional headers, Table of Contents, Prompt Engineering cases, diagrams, and high-resolution screenshots).
- **Source HTML Report:** [`Rentozi_Project_Report.html`](file:///Users/hariompratapsingh/Downloads/Almighty/Rentozi_Project_Report.html)
- **PDF Generation Script:** [`generate_report_pdf.py`](file:///Users/hariompratapsingh/Downloads/Almighty/generate_report_pdf.py)

---

## 💡 6. Key Application Features for Demonstration

1. **RentoAI Campus Co-Pilot:** Click the floating **"Ask RentoAI"** button at the bottom right. Try prompts like:
   - *"I need a scientific calculator for my calculus exam tomorrow"*
   - *"Looking for a camera for the cultural fest"*
   - *"How does the campus security deposit work?"*
2. **AI Price & Description Assist:** Click **"List Item"** in the navigation header, type an item name like *"Casio FX-991CW Calculator"* or *"Sony DSLR"*, and click **"AI Price & Description Assist"**. The system instantly computes fair campus rental pricing, security deposit, and writes an optimized student-friendly listing description.
3. **Instant Search & Category Filters:** Explore verified gear across Electronics, Study, Gaming, Photography, and College Essentials.
4. **Campus Handover Verification:** Experience 6-digit OTP confirmation and Marwadi University student credentials check.
