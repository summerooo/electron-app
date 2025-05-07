const path = require('path');

async function loadVideoList() {
  const videoList = document.getElementById('video-list');
  videoList.innerHTML = '';

  const videos = await window.electronAPI.getVideoFiles();
  if (videos.length === 0) {
    videoList.innerHTML = '<li>未找到视频文件</li>';
    return;
  }

  videos.forEach(video => {
    const li = document.createElement('li');
    li.textContent = path.basename(video);
    const button = document.createElement('button');
    button.textContent = '设为壁纸';
    button.onclick = () => setWallpaper(video);
    li.appendChild(button);
    videoList.appendChild(li);
  });
}

async function selectCustomVideo() {
  const files = await window.electronAPI.selectCustomVideo();
  if (files.length > 0) {
    setWallpaper(files[0]);
  }
}

function setWallpaper(videoPath) {
  window.electronAPI.setWallpaper(videoPath);
}

window.electronAPI.onSetWallpaperResult((result) => {
  if (result.success) {
    alert('壁纸设置成功！');
  } else {
    alert('壁纸设置失败：' + result.error);
  }
});

document.addEventListener('DOMContentLoaded', loadVideoList);