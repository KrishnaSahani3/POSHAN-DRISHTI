# POSHAN DRISHTI — Child Nutrition Screening System

POSHAN DRISHTI is a digital tool designed for health workers (ANMs/ASHAs) to screen children for malnutrition using WHO-standard growth charts (0–60 months). It provides instant classification (SAM, MAM, At-Risk, Normal) and suggests nearby doctors based on the child's location.

## 🚀 How to Run the Website

### Option 1: Using the Batch File (easiest)
Simply double-click on `start.bat` in the project folder. This will:
1. Start the backend server.
2. Automatically open the website in your default browser at `http://localhost:3000`.

### Option 2: Using the Terminal
1. Open a terminal in the project folder.
2. Run the command: `node server.js`
3. Open your browser and go to: `http://localhost:3000`

---

## 🌍 How to Send to a Friend

If you want your friend to see the website, you have three main ways:

### 1. Same WiFi (Local Sharing)
If your friend is connected to the **same WiFi network** as you:
- Find your IP address (yours is currently `192.168.1.8`).
- Tell your friend to open this link on their phone or laptop:
  **`http://192.168.1.8:3000`**

### 2. Over the Internet (Public URL)
If your friend is **not** on your WiFi, you can use a tool called `localtunnel` to create a temporary public link:
1. Keep your server running (`node server.js`).
2. Open a **new** terminal.
3. Run this command:
   ```bash
   npx localtunnel --port 3000
   ```
4. It will give you a URL (e.g., `https://random-words-here.loca.lt`). **Send that link to your friend.**

### 3. Send the Files (ZIP)
You can ZIP the entire project folder and send it via email or Google Drive.
- **Note**: Tell your friend to install [Node.js](https://nodejs.org/) first.
- Once they have Node.js, they just need to run `npm install` and then `node server.js`.
--
---

## 🛠️ Tech Stack
- **Frontend**: HTML5, CSS3, JavaScript (SPA architecture)
- **Backend**: Node.js, Express.js
- **Database**: SQLite (via `sql.js`)
- **Standards**: WHO Child Growth Standards (0–60 months)
- **Features**: 
  - Child Registration
  - Nutrition Screening (MUAC, WFA, HFA)
  - Area-wise Doctor Suggestions
  - Analytics Dashboard
  - Multi-language Support (English, Hindi, etc.)


### 1️⃣ Clone Repository
```bash
git git clone https://github.com/KrishnaSahani3/POSHAN-DRISHTI.git

"KRISHNA SAHANI"
Demo requests:  
📧 **mrkrishna551@gmail.com**
[LinkedIn] - """ www.linkedin.com/in/krishnasahani269"""
---

⭐ If you like this project, don't forget to star the repo!