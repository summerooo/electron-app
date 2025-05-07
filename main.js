const { app, BrowserWindow } = require('electron/main')
const path = require('node:path')
const updateElectronApp = require('update-electron-app');

// 自动更新配置
updateElectronApp({
  repo: 'summerooo/electron-app',
  updateInterval: '1 minute',
  logger: console
});

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})