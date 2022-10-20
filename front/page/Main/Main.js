const { ipcRenderer } = require('electron');
const axios = require('axios').default;
// const brightness = require('brightness');

var wifiState = document.getElementById('wifi-status');
var userState = document.getElementById('user-status');
var userOption = document.getElementById('user-option-log');
var logout = document.getElementById('logout');
var sensorName = document.getElementById('sensor-name');
var picto = document.getElementById('picto');
var color = document.getElementById('color');
var btnSound = document.getElementById('btn-sound');
var soundImg = document.getElementById('sound-img');
var sound = document.getElementById('sound');
var lastPrediction1 = document.getElementById('lastPrediction1');
var lastPrediction2 = document.getElementById('lastPrediction2');
var lastPrediction3 = document.getElementById('lastPrediction3');
var allContent = document.querySelectorAll('.content');
var body = document.getElementById('body');

var mic = 'OFF';
var lastPrediction = ['', '', '']
API_IA_PROD = 'http://0.0.0.0:9000'

// brightness.set(0.5)

if (btnSound) {
  btnSound.addEventListener('click', async () => {
    if (mic === 'OFF') {
      soundImg.src = './../../img/MIC.svg';
      mic = 'ON';
      getSound();
    } else {
      soundImg.src = './../../img/MICOFF.svg';
      mic = 'OFF';
      sound.innerHTML = '';
    }
  })
}

if (logout) {
  logout.addEventListener('click', async () => {
    ipcRenderer.invoke('logout', {}).then((res) => {
      window.location.href = '../APIConnection/APIConnection.html'
    }).catch(error => {
    })
  })
}

ipcRenderer.invoke('ping', {}).then((res) => {
  wifiState.innerHTML = 'Wifi: Connected';
}).catch(error => {
  wifiState.innerHTML = 'Wifi: Not connected'
})

ipcRenderer.invoke('get-user', {}).then((res) => {
  if (res === 'You are not logged in.') {
    userState.innerHTML = 'You are not logged in.';
    userOption.innerHTML = 'Login';
  } else {
    userState.innerHTML = res.username;
    userOption.innerHTML = 'Logout';
  }
}).catch(error => {
  userState.innerHTML = 'Error';
})

ipcRenderer.invoke('get-sensor', {}).then((res) => {
  if (res === 'No sensor') {
    sensorName.innerHTML = 'You have not created a sensor';
  } else {
    sensorName.innerHTML = res.name;
    picto.src = `../../img/${res.icon}.svg`;
    if (res.color === 'DARK_BLUE')
      color.style.backgroundColor = 'DARKBLUE';
    else
      color.style.backgroundColor = res.color;
  }
}).catch(error => {
  sensorName.innerHTML = 'Error';
})

const delay = ms => new Promise(res => setTimeout(res, ms));

async function getSound() {
  while (mic === 'ON') {
    var res = await axios.get(`http://0.0.0.0:9000/`, { withCredentials: true })
    console.log(res);
    if (res.data === 'NoSound' || mic === 'OFF')
      sound.innerHTML = '';
    else {
      sound.innerHTML = res.data;
      var tmp = '';
      var important = false;
      switch (res.data) {
        case 'waterFlow':
          tmp = 'water_flow';
          break;
        case 'Alarm':
          tmp = 'alarm';
          important = true;
          break;
        case 'Baby':
          tmp = 'baby';
          important = true;
          break;
        case 'DogBark':
          tmp = 'dog_bark';
          break;
        case 'knockKnock':
          tmp = 'knock_knock';
          break;
        default:
          break;
      }
      allContent.forEach(c => {
        c.style.visibility = 'hidden';
      })
      sound.style.visibility = 'visible';
      // brightness.set(1)
      if (important)
        body.style.backgroundColor = 'rgba(160, 0, 0, 255)';
      await delay(2000);
      allContent.forEach(c => {
        c.style.visibility = 'visible';
      })
      sound.style.visibility = 'hidden';
      // brightness.set(0.5)
      if (important)
        body.style.backgroundColor = '#61a4bc';
      var today = new Date();
      lastPrediction.unshift(today.toLocaleString("en-US") + ' : ' + res.data);
      lastPrediction.pop();
      lastPrediction1.innerHTML = lastPrediction[0];
      lastPrediction2.innerHTML = lastPrediction[1];
      lastPrediction3.innerHTML = lastPrediction[2];
      var content = {
        'soundRecognition': tmp
      }
      ipcRenderer.invoke('recognitions', content).then(async (res) => {
      }).catch(error => {
        console.log(error);
      })
    }
  }
}