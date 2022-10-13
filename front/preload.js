const {ipcRenderer} = require('electron');

// preload with contextIsolation disabled
window.myAPI = {
    send: (channel, data) => {
        // whitelist channels
        let validChannels = ["toMain"];
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
        }
    },
    receive: (channel, func) => {
        let validChannels = ["fromMain"];
        if (validChannels.includes(channel)) { 
            ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
    },
    onNewPrediction :(callback) => ipcRenderer.on('new-sound-detected', callback),
    onQuitPressed: (code) => ipcRenderer.invoke('quitApp')
}