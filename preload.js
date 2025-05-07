const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getVideoFiles: () => ipcRenderer.invoke('get-video-files'),
  selectCustomVideo: () => ipcRenderer.invoke('select-custom-video'),
  setWallpaper: (videoPath) => ipcRenderer.send('set-wallpaper', videoPath),
  onSetWallpaperResult: (callback) => ipcRenderer.on('set-wallpaper-result', (event, result) => callback(result))
});