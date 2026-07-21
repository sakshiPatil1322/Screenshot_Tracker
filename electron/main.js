import { app, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import screenshot from "screenshot-desktop";
import fs from "fs-extra";

// ES Modules __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let isCapturing = false;

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Load React frontend (dev or production both point here)
  win.loadFile(path.join(__dirname, "../dist/index.html"));
}

// Async screenshot function
// Async screenshot function
async function captureScreenshot() {
  if (isCapturing) return;
  isCapturing = true;

  try {
    // Store screenshots in Desktop\Screenshot Tracker\screenshots
    const folder = path.join(app.getPath("desktop"), "screenshot-tracker", "screenshots");
    fs.ensureDirSync(folder); // create folder if it doesn't exist

    const fileName = `screenshot_${new Date()
      .toISOString()
      .replace(/[:.]/g, "-")}.png`;
    const filePath = path.join(folder, fileName);

    const img = await screenshot(); // full screen
    fs.writeFileSync(filePath, img);
    console.log(`[${new Date().toLocaleTimeString()}] Screenshot saved: ${filePath}`);
  } catch (err) {
    console.error("Screenshot failed:", err);
  } finally {
    isCapturing = false;
  }
}

// Schedule every 2 minutes
setInterval(captureScreenshot, 2 * 60 * 1000);
captureScreenshot();

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});