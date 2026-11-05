const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let watchlistWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 950,
    height: 750,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

function createWatchlistWindow() {
  watchlistWindow = new BrowserWindow({
    width: 800,
    height: 650,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  watchlistWindow.loadFile(path.join(__dirname, 'renderer', 'watchlist.html'));
}

ipcMain.on('open-watchlist-window', () => {
  if (!watchlistWindow || watchlistWindow.isDestroyed()) {
    createWatchlistWindow();
  } else {
    watchlistWindow.focus();
  }
});

ipcMain.on('save-watchlist-file', (event, data) => {
  const filePath = path.join(__dirname, 'data', 'watchlist.json');
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
});

app.whenReady().then(createMainWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});