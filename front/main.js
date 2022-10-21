const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');
const axios = require('axios').default;
var $ = require( "jquery" );

let vkb;
// const { setupVirtualKeyboard } = require('electron-secure-virtual-keyboard');

// var virtualKeyboard = null;
// virtualKeyboard = setupVirtualKeyboard(ipcMain);

const { setupVirtualKeyboard } = require('electron-secure-virtual-keyboard');
var virtualKeyboard;

var win = null;
var user = 'You are not logged in.';
var sensor = 'No sensor'

API_URL = 'http://x2023hearyourhome520328821002.francecentral.cloudapp.azure.com:8000'

const createWindow = () => {
    win = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: false,
            preload: path.join(__dirname, 'preload.js'),
        },
       // fullscreen: true,
        width: 480,
        height: 320
    });
    win.loadFile('./page/InternetConnection/InternetConnection.html');
    virtualKeyboard = setupVirtualKeyboard(ipcMain);

    win.webContents.openDevTools();
};

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
    } else {
        app.quit();
    }
});


ipcMain.handle('quitApp', () => {
    app.quit()
})

ipcMain.handle('login', async(event, content) => {
    const res = await axios.post(`${API_URL}/users/signin`,
        content, { withCredentials: true })
    c = res.headers['set-cookie'][0].split(';')[0].split('=')
    const cookie = { url: `${API_URL}`, name: c[0], value: c[1] }
    session.defaultSession.cookies.set(cookie).then(() => {
        console.log('A cookie has been set !')
    }, (erreur) => {
        console.rror(erreur)
    })
    user = res.data
    return user
})

ipcMain.handle('ping', async(event, content) => {
    const res = await axios.get(`${API_URL}/ping`, { withCredentials: true })
    return res.data
})

ipcMain.handle('get-user', async(event, content) => {
    return user
})

ipcMain.handle('get-sensor', async(event, content) => {
    return sensor
})


ipcMain.handle('logout', async(event, content) => {
    user = 'You are not logged in.';
    return user
})

ipcMain.handle('create-sensor', async(event, content) => {
    const id = user.id;
    const ss = await session.defaultSession.cookies.get({})
    c = ss[0].name + '=' + ss[0].value
    const res = await axios.post(`${API_URL}/devices/${id}`,
        content, {
            withCredentials: true,
            headers: {
                Cookie: c
            }
        })
    sensor = res.data
    return 0
})

ipcMain.handle('buy-sensor', async(event, content) => {
    const id = user.id;
    session.defaultSession.cookies.get({})
        .then(async(cookies) => {
            c = cookies[0].name + '=' + cookies[0].value
            const res = await axios.post(`${API_URL}/shop/sensor/${id}`, {}, {
                withCredentials: true,
                headers: {
                    Cookie: c
                }
            })
        }).catch((error) => {
            console.log(error)
        })

    return 'OK'
})

ipcMain.handle('recognitions', async(event, content) => {
    const id = sensor.id;
    const ss = await session.defaultSession.cookies.get({})
    c = ss[0].name + '=' + ss[0].value
    const res = await axios.post(`${API_URL}/devices/${id}/recognitions`,
        content, {
            withCredentials: true,
            headers: {
                Cookie: c
            }
        })
    return 0
})