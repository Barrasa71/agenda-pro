// electron/main.ts
import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";
var require2 = createRequire(import.meta.url);
var electron = require2("electron");
var { app, BrowserWindow, ipcMain, shell } = electron;
var __dirname = path.dirname(fileURLToPath(import.meta.url));
var mainWindow;
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: "#ffffff",
    // Start white to avoid black flash
    titleBarStyle: "hidden",
    // Custom title bar for glassmorphism
    titleBarOverlay: {
      color: "#00000000",
      // Transparent
      symbolColor: "#74b1be",
      height: 30
    },
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
      // Needed for some node interactions if we add them later
    }
  });
  const startUrl = process.env.NODE_ENV === "development" ? "http://localhost:5175" : `file://${path.join(__dirname, "../dist/index.html")}`;
  mainWindow.loadURL(startUrl);
  if (process.env.NODE_ENV === "development") {
  }
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http")) {
      shell.openExternal(url);
      return { action: "deny" };
    }
    return { action: "allow" };
  });
}
app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
