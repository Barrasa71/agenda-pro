import { createRequire } from 'module';
const require = createRequire(import.meta.url);
// Import the whole namespace first
const electron = require('electron');
const { app, BrowserWindow, ipcMain, shell } = electron;
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Define typed IPC channels here if needed
// ipcMain.on('...', ...)

let mainWindow: any;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 900,
        minHeight: 600,
        backgroundColor: '#ffffff', // Start white to avoid black flash
        titleBarStyle: 'hidden', // Custom title bar for glassmorphism
        titleBarOverlay: {
            color: '#00000000', // Transparent
            symbolColor: '#74b1be',
            height: 30
        },
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false // Needed for some node interactions if we add them later
        },
    });

    const startUrl = process.env.NODE_ENV === 'development'
        ? 'http://localhost:5175'
        : `file://${path.join(__dirname, '../dist/index.html')}`;

    mainWindow.loadURL(startUrl);

    if (process.env.NODE_ENV === 'development') {
        // mainWindow.webContents.openDevTools();
    }

    // Open external links in browser
    mainWindow.webContents.setWindowOpenHandler(({ url }: { url: string }) => {
        if (url.startsWith('http')) {
            shell.openExternal(url);
            return { action: 'deny' };
        }
        return { action: 'allow' };
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
