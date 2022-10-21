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



const Keyboard = window.SimpleKeyboard.default;
const KeyboardLayouts = window.SimpleKeyboardLayouts.default;
var tag = 0
const layout = new KeyboardLayouts().get("french");

const myKeyboard = new Keyboard({
  onChange: input => onChange(input),
  onKeyPress: button => onKeyPress(button),
  ...layout
});

function onChange(input) {
    if (tag == 1) {
        document.querySelector("#username").value = input;
        console.log("Input changed", input);
    } else if (tag == 2) {
        document.querySelector("#password").value = input;
        console.log("Input changed", input);
    }
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
var input_email = document.getElementById('email');
var keyboard_layout = document.getElementById('keyboard-layout');
var body_id = document.getElementById('body-id');

if (input_password) {
    input_password.addEventListener('focus', (event) => { 
        if (keyboard_layout) {
            tag = 2;
            keyboard_layout.classList.add('visible');
            keyboard_layout.classList.remove('invisible');
        }
    });
}

if (input_email) {
    input_email.addEventListener('focus', (event) => { 
        if (keyboard_layout) {
            tag = 1;
            keyboard_layout.classList.add('visible');
            keyboard_layout.classList.remove('invisible');
        }
    });
}