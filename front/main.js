const { app, BrowserWindow, net, ipcMain, ipcRenderer } = require('electron');
const path = require('path')
const wifi = require('node-wifi');
const axios = require('axios');
const dns = require('dns');
const electron = require('electron');
const { resolve } = require('path');
const fs = require('fs');

var LAST_PREDICTION = ""


var win = null;

API_BACKEND_IA_PROD = 'http://0.0.0.0:9000'
API_BACKEND_IA_DEV = 'http://192.168.1.26:9000'


API_HYH = 'http://x2023hearyourhome520328821002.francecentral.cloudapp.azure.com:8000';

wifi.init({
  iface: null // network interface, choose a random wifi interface if set to null
})

/*
  Checker si l'user est connecté a internet
  Checker si l'user est connecté à HYH
  Checker si l'user à achete un capteur
  Demander à l'user les informations du capteur'(noms/couleurs/localisation)
  Demarer à l'api les derniers sons reconnue.

*/

class AppState {
  constructor() {
    this.connectedToInternet = false;
    this.connectedToHYHAPI = false;
    this.deviceRegistred = false;
  }
}

const config = {
  headers: {
    'accept' : 'application/json',
    'Content-Type': 'application/json',
  }
}

var connectToHYHAPI = () => {
  return new Promise((resolve, reject) => {
    let req1 = axios.post(API_HYH + '/users/signin', {
        "email": "vincent.vega@gmail.com",
        "password": "password"
    }, config);
  })
}


/* ---- INTERNET CONNECTION ---- */

var getListNearNetwork = () => {
  return new Promise((resolve, reject) => {
    wifi.scan((error, networks) => {
      if (error) {
        reject({
          "err": "Cannot pull the nearest network information 🤨 !",
          "system": error
        })
      } else {
        let list = networks.sort((a,b) => (b.quality - a.quality));
        let withoutDuplicateList = Array.from(new Set(list.map(a => a.ssid))).map(ssid => {
          return list.find(a => a.ssid === ssid)
        })
        resolve(withoutDuplicateList);
      }
    });
  })
}

var connectToNetwork = (ssid, password) => {
  return new Promise((resolve, reject) => {
    isConnectedInternet().then(() => {
      resolve()
      }).catch(() => {
        wifi.connect({ ssid: ssid, password: password }, () => {
          console.log('Connected');
          isConnectedInternet().then(() => { // Check if user is connected to internet
            resolve()
          }).catch((e) => {
            reject(e)
          })
        });
    })
  });
}

var isConnectedInternet = () =>  {
  console.log("Test")
  return new Promise((resolve, reject) => {
    dns.resolve('www.google.com', (err) => {
      if (err) {
         console.log("No connection");
         reject(err)
      } else {
         console.log("Connected");
         resolve();
      }
    });
  });
}

var fillNetwork = () => {
  return new Promise((resolve, reject) => {
    isConnectedInternet().then(() => {
      console.log("Connecter a internet !")
      reject("Already connecter internet")
      }).catch(() => {
        console.log("Pas connecter a internet !")
        getListNearNetwork().then(data => {
          console.log(data);
          resolve(data)
        }).catch((err) => {
          console.log(err)
          reject(err)
        })
    })
  })
}

const createInternetConnectionWindow = () => {
  const appState = new AppState();
  win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: false,
      preload: path.join(__dirname ,'preload.js'),
    },
    fullscreen: true,
    width: 480,
    height: 320
  });
  win.loadFile('./page/InternetConnection/file.html');
  
  //win.webContents.openDevTools();
};


/* ---- AUTH ---- */


const authHYHAPI = (username, password) => {
  console.log(username)
  console.log(password)
  return new Promise(async (resolve, reject) => {
    await axios.post('http://x2023hearyourhome520328821002.francecentral.cloudapp.azure.com:8000/users/signin', {
      email: username,
      password: password
    })
    .then((response) => {
      resolve(response)
    }).catch(e => {
      reject(e)
    })
  })
}

/* ---- REGISTER ---- */


const registerCaptorAPI = (username, password) => {
  console.log(username)
  console.log(password)
  return new Promise(async (resolve, reject) => {
    await axios.post('http://x2023hearyourhome520328821002.francecentral.cloudapp.azure.com:8000/users/signin', {
      email: username,
      password: password
    })
    .then((response) => {
      resolve(response)
    }).catch(e => {
      reject(e)
    })
  })
}

/* ---- LISTEN PAGE ---- */

const getLastPrediction = async () =>  {
  setInterval(async() => {
    await axios.get(API_BACKEND_IA_PROD).then((response) => {
      //console.log(response);
      LAST_PREDICTION = response.data
      console.log("On send", LAST_PREDICTION)
      win.webContents.send('new-sound-detected', LAST_PREDICTION);
      
    }).catch(e => {
      //reject(e)
      console.log("[ERROR]", e)
    })
  }, 6 * 1000)

}


/* ---- ++++++++ ---- */


app.whenReady().then(() => {
  createInternetConnectionWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createInternetConnectionWindow();
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

ipcMain.on('fill-network', event => {
  // It's so good because below have a delay 5s to execute, and this don't lock rendereder :)
  fillNetwork().then((data)=> {
    event.sender.send('refresh-wifi-reply', JSON.stringify(data))
  }).catch((err) => {
    console.log(err)
  })
})


ipcMain.on('connectWifiNetwork', (event, value) => {
    let data = JSON.parse(value);
    console.log(data)
    connectToNetwork(data.ssid, data.password).then((data) => {
      console.log("Your connected");
      
      win.loadFile('./page/APIConnection/file.html')
      //event.sender.send('refresh-var-connection-api', 'a')
  }).catch((err) => {
    console.log("The connection failed !", err);
  })
})



ipcMain.on('authHYHAPI', (e, value) => {
  let data = JSON.parse(value);

  authHYHAPI(data.username, data.password).then((r) => {
    console.log("Authentifié")
    cookies = r.headers['set-cookie'];
    if (cookies.length < 1) console.log("[Error] Fail to get cookies")
    else {
      let cookie = cookies[0];
      console.log(cookie)
      cookie = cookie.substring(12);
      cookie = cookie.split(';')[0]
      console.log(cookie)
      fs.writeFile('./.cookie', cookie, { flag: 'w+' }, err => {});
      win.loadFile('./page/ListenMode/file.html')
      getLastPrediction()
    }

  }).catch((e) => {
    console.log(e.response)
  })
})
const quitApp = () => {
  app.quit()
} 

ipcMain.handle('quitApp', quitApp)


