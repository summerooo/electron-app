const { app, BrowserWindow, screen, desktopCapturer } = require('electron');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

app.whenReady().then(() => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  const win = new BrowserWindow({
    width,
    height,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile('index.html');

  // 捕获窗口内容并保存为图片
  async function captureWallpaper() {
    try {
      const sources = await desktopCapturer.getSources({
        types: ['window'],
        thumbnailSize: { width, height }
      });

      const source = sources.find(s => s.name === win.getTitle());
      if (source) {
        const image = source.thumbnail.toPNG();
        const outputPath = path.join(app.getPath('desktop'), 'wallpaper.png');
        fs.writeFileSync(outputPath, image);

        // 使用 AppleScript 设置壁纸
        const script = `
          tell application "System Events"
            tell every desktop
              set picture to "${outputPath}"
            end tell
          end tell
        `;
        exec(`osascript -e '${script}'`, (err) => {
          if (err) {
            console.error('设置壁纸失败:', err);
          } else {
            console.log('壁纸已设置为:', outputPath);
            win.hide(); // 隐藏窗口，避免重复显示
          }
        });
      }
    } catch (err) {
      console.error('捕获壁纸失败:', err);
    }
  }

  // 窗口加载完成后捕获
  win.webContents.on('did-finish-load', () => {
    setTimeout(captureWallpaper, 1000); // 等待内容渲染
  });
});