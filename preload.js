const { contextBridge, ipcRenderer } = require('electron');

// We expose a safe API to the frontend under the name 'window.api'
contextBridge.exposeInMainWorld('api', {
    // We define a specific function for yt-dlp downloads
    downloadVideo: (url) => ipcRenderer.invoke('ytdlp:download', url)
});