const { ipcRenderer } = require('electron');

var quit = document.getElementById('quit');
var login = document.getElementById('login');
var username = document.getElementById('username');
var password = document.getElementById('password');
var invalid = document.getElementById('invalid');

if (quit) {
    quit.addEventListener('click', () => {
        ipcRenderer.invoke('quitApp').onQuitPressed()
    })
}

if (login) {
    login.addEventListener('click', async () => {
        content = {
            "email": username.value,
            "password": password.value
        }
        ipcRenderer.invoke('login', content).then((res) => {
            window.location.href = '../RegisterSensor/RegisterSensor.html'
        }).catch(error => {
            invalid.style.visibility = 'visible';
        })
    })
}

ipcRenderer.invoke('get-user', {}).then((res) => {
    if (res !== 'You are not logged in.')
        window.location.href = '../Main/Main.html'
}).catch(error => {
})