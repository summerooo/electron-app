// main.js
const { app, BrowserWindow } = require('electron');

function createWindow() {
  const { width, height } = require('electron').screen.getPrimaryDisplay().workAreaSize;

  const win = new BrowserWindow({
    width,
    height,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.setAlwaysOnBottom(true);  // 窗口始终在最底层
  win.loadFile('index.html');    // 加载本地HTML或远程URL
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});