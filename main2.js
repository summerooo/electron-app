const { app, BrowserWindow, screen, ipcMain, dialog } = require('electron');
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

app.whenReady().then(() => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.loadFile('index.html');

  // 扫描 ./videos 目录
  async function getVideoFiles() {
    try {
      const dirPath = path.join(__dirname, 'videos');
      const files = await fs.readdir(dirPath);
      const extension = process.platform === 'darwin' ? 'heic' : 'mp4';
      return files
        .filter(file => file.toLowerCase().endsWith(`.${extension}`))
        .map(file => path.join(dirPath, file));
    } catch (err) {
      console.error('读取视频目录失败:', err);
      return [];
    }
  }

  // IPC：获取视频列表
  ipcMain.handle('get-video-files', async () => {
    return await getVideoFiles();
  });

  // IPC：选择自定义视频
  ipcMain.handle('select-custom-video', async () => {
    const extension = process.platform === 'darwin' ? 'heic' : 'mp4';
    const result = await dialog.showOpenDialog(win, {
      properties: ['openFile'],
      filters: [{ name: 'Videos', extensions: [extension] }],
      defaultPath: path.join(__dirname, 'videos')
    });
    return result.canceled ? [] : result.filePaths;
  });

  // IPC：设置壁纸
  ipcMain.on('set-wallpaper', async (event, videoPath) => {
    try {
      await fs.access(videoPath);

      if (process.platform === 'darwin') {
        // macOS：设置 HEIC 壁纸
        const script = `
          tell application "System Events"
            tell every desktop
              set picture to "${videoPath}"
            end tell
          end tell
        `;
        exec(`osascript -e '${script}'`, (err) => {
          if (err) {
            console.error('设置壁纸失败:', err);
            event.reply('set-wallpaper-result', { success: false, error: err.message });
          } else {
            console.log('壁纸已设置为:', videoPath);
            event.reply('set-wallpaper-result', { success: true });
          }
        });
      } else if (process.platform === 'win32') {
        // Windows：提示使用第三方工具
        event.reply('set-wallpaper-result', {
          success: false,
          error: `Windows 不支持直接设置动态壁纸。请使用 Wallpaper Engine 或 Lively Wallpaper 加载 ${videoPath}`
        });
        console.log('MP4 路径:', videoPath);
      } else {
        event.reply('set-wallpaper-result', { success: false, error: '不支持的平台' });
      }
    } catch (err) {
      console.error('处理视频失败:', err);
      event.reply('set-wallpaper-result', { success: false, error: err.message });
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});