const {ipcRenderer} = require('electron');
var refresh_wifi_btn = document.getElementById('refresh-wifi');
var button_submit_wifi = document.getElementById('button-submit-wifi');
var connectFormWifi = document.getElementById('connectFormWifi');
var button_login_hyh = document.getElementById('button-login-hyh');
var select = document.getElementById("wifi-networks");
var loginFormAPIConnection = null


var initlistener = () => {
    if (refresh_wifi_btn) {
        refresh_wifi_btn.addEventListener('click', () => {
            ipcRenderer.send('fill-network', 'ping')
        })
    } if (connectFormWifi) {
        connectFormWifi.addEventListener("submit", (e, value) => {
            let object = {};
            let formData = new FormData(connectFormWifi);
        
            e.preventDefault();
            formData.forEach((value, key) => object[key] = value);
            ipcRenderer.send('connectWifiNetwork', JSON.stringify(object))
        })
    }
    var loginFormAPIConnection = document.getElementById('loginFormAPIConnection');

    if (loginFormAPIConnection) {
        loginFormAPIConnection.addEventListener("submit", (e, value) => {
            let object = {};
            let formData = new FormData(loginFormAPIConnection);
            
            if (!formData) return;
            e.preventDefault();
            formData.forEach((value, key) => object[key] = value);
            console.log(object)
            ipcRenderer.send('authHYHAPI', JSON.stringify(object))
        }, false)
    }

    var captorform = document.getElementById('register-captor');
    if (captorform) {
        captorform.addEventListener("submit", (e, value) => {
            let object = {};
            let formData = new FormData(captorform);
        
            e.preventDefault();
            formData.forEach((value, key) => object[key] = value);
            console.log(object)
            ipcRenderer.send('authHYHAPI', JSON.stringify(object))
        }, false)
    }

    var detectionSub = document.getElementById('detection-sub');
    if (detectionSub) {
        console.log("C'est lancé")
        //getLastPrediction()
        window.myAPI.onNewPrediction((_event, value) => {
            let detectionSubTmp = document.getElementById('detection-sub');
            detectionSubTmp.innerText = value;
        })
    }

    var quitButton = document.getElementById('quit');
    if (quitButton) {
        quitButton.addEventListener('click', () => {
            window.myAPI.onQuitPressed()
        })

    }

}

initlistener()

ipcRenderer.on('refresh-wifi-reply', (event, value)=> {

    console.log("Wifi reply")
    while (select.firstChild) {
        select.removeChild(select.lastChild);
    }
    let data = JSON.parse(value);
    console.log(data)
    data.forEach((item, index) => {
        let option = document.createElement("option");
        option.text = item.ssid;
        option.value = item.ssid;
        select.appendChild(option);
    })
})

// ipcRenderer.on('new-sound-detected', (event, value)=> {
//     //let data = JSON.parse(value)

//     //let data = JSON.parse(value)
//     console.log("tazezae")
//     var detection_sub = document.getElementById('detection-sub');

//     if (detection_sub) {
//         detection_sub.innerHTML = value;
//     }
// })
