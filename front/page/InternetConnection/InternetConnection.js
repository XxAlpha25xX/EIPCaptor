const { ipcRenderer } = require('electron');
const wifi = require('node-wifi');

var quit = document.getElementById('quit');
var refresh = document.getElementById('refresh');
var connect = document.getElementById('connect');
var invalid = document.getElementById('invalid');

if (quit) {
    quit.addEventListener('click', () => {
        ipcRenderer.invoke('quitApp').onQuitPressed()
    })
}

if (refresh) {
    refresh.addEventListener('click', () => {
        reloadWifi()
    })
}

if (connect) {
    connect.addEventListener('click', () => {
        connectWifi()
    })
}

wifi.init({
    iface: null // network interface, choose a random wifi interface if set to null
})

function getWifi() {
    var wifis = document.getElementById('wifis');
    wifi.scan((error, networks) => {
        if (error) {
            reject({
                "err": "Cannot pull the nearest network information 🤨 !",
                "system": error
            })
        } else {
            let list = networks.sort((a, b) => (b.quality - a.quality));
            let withoutDuplicateList = Array.from(new Set(list.map(a => a.ssid))).map(ssid => {
                return list.find(a => a.ssid === ssid)
            })
            let i = 0;
            console.log(withoutDuplicateList);
            for (const elem of withoutDuplicateList) {
                var opt = document.createElement("option");
                opt.value = i;
                opt.text = elem.ssid;
                wifis.add(opt)
                i++;
            }
        }
    });
}

function reloadWifi() {
    var wifis = document.getElementById('wifis');
    var length = wifis.options.length;

    for (i = length - 1; i >= 0; i--) {
        wifis.options[i] = null;
    }
    getWifi()
}

function connectWifi() {
    var selectW = document.getElementById('wifis');
    var password = document.getElementById('password').value;
    var ssid = selectW.options[selectW.selectedIndex].text

    wifi.connect({ ssid: ssid, password: password }, (res) => {
        if (res == undefined) {
            window.location.href = "../APIConnection/APIConnection.html";
        } else {
            invalid.style.visibility = 'visible';
        }
    }, (error) => {
        console.log('error2')
    });
}

getWifi()

ipcRenderer.invoke('ping', {}).then((res) => {
    window.location.href = '../APIConnection/APIConnection.html'
}).catch(error => {
})


const Keyboard = window.SimpleKeyboard.default;
const KeyboardLayouts = window.SimpleKeyboardLayouts.default;

const layout = new KeyboardLayouts().get("french");

const myKeyboard = new Keyboard({
  onChange: input => onChange(input),
  onKeyPress: button => onKeyPress(button),
  ...layout
});

function onChange(input) {
  document.querySelector("#password").value = input;
  console.log("Input changed", input);
}

function onKeyPress(button) {
  console.log("Button pressed", button);
  if (button === "{enter}") {
    if (keyboard_layout) {
        keyboard_layout.classList.add('invisible');
        keyboard_layout.classList.remove('visible');
    }
  }
}


var input_password = document.getElementById('password');
var keyboard_layout = document.getElementById('keyboard-layout');
var body_id = document.getElementById('body-id');

if (input_password) {
    input_password.addEventListener('focus', (event) => { 
        if (keyboard_layout) {
            keyboard_layout.classList.add('visible');
            keyboard_layout.classList.remove('invisible');
        }
    });
}