const { ipcRenderer } = require('electron');

var select = document.getElementById('color')
var sensorName = document.getElementById('SensorName')
var quit = document.getElementById('quit');
var KITCHEN = document.getElementById('KITCHEN');
var BEDROOM_BABY = document.getElementById('BEDROOM_BABY');
var BEDROOM_PARENT = document.getElementById('BEDROOM_PARENT');
var LIVINGROOM = document.getElementById('LIVINGROOM');
var GARAGE = document.getElementById('GARAGE');
var BATHROOM = document.getElementById('BATHROOM');
var create = document.getElementById('create')
var invalid = document.getElementById('invalid')

if (quit) {
    quit.addEventListener('click', () => {
        ipcRenderer.invoke('quitApp').onQuitPressed()
    })
}

if (KITCHEN) {
    KITCHEN.addEventListener('click', () => {
        resetCSS();
        KITCHEN.style.border = '3px solid black';
        KITCHEN.style.backgroundColor = '#61a4bc';
        IconSelect = 'KITCHEN';
    })
}

if (BEDROOM_BABY) {
    BEDROOM_BABY.addEventListener('click', () => {
        resetCSS();
        BEDROOM_BABY.style.border = '3px solid black';
        BEDROOM_BABY.style.backgroundColor = '#61a4bc';
        IconSelect = 'BEDROOM_BABY';
    })
}

if (BEDROOM_PARENT) {
    BEDROOM_PARENT.addEventListener('click', () => {
        resetCSS();
        BEDROOM_PARENT.style.border = '3px solid black';
        BEDROOM_PARENT.style.backgroundColor = '#61a4bc';
        IconSelect = 'BEDROOM_PARENT';
    })
}

if (LIVINGROOM) {
    LIVINGROOM.addEventListener('click', () => {
        resetCSS();
        LIVINGROOM.style.border = '3px solid black';
        LIVINGROOM.style.backgroundColor = '#61a4bc';
        IconSelect = 'LIVINGROOM';
    })
}

if (GARAGE) {
    GARAGE.addEventListener('click', () => {
        resetCSS();
        GARAGE.style.border = '3px solid black';
        GARAGE.style.backgroundColor = '#61a4bc';
        IconSelect = 'GARAGE';
    })
}

if (BATHROOM) {
    BATHROOM.addEventListener('click', () => {
        resetCSS();
        BATHROOM.style.border = '3px solid black';
        BATHROOM.style.backgroundColor = '#61a4bc';
        IconSelect = 'BATHROOM';
    })
}

if (create) {
    create.addEventListener('click', () => {
        if (sensorName.value == undefined || sensorName.value.length < 2 || sensorName.value.length > 32) {
            invalid.style.visibility = 'visible';
            invalid.innerHTML = 'The password must contain between 2 and 32 characters';
            return
        }
        content = {
            "name": sensorName.value,
            "type": "SENSOR",
            "color": color.value,
            "icon": IconSelect,
            "configuration": {
                "alarm": true,
                "baby": true,
                "dogBark": true,
                "knockKnock": true,
                "waterFlow": true
            }
        }
        ipcRenderer.invoke('buy-sensor', content).then((res) => {
            ipcRenderer.invoke('create-sensor', content).then((res) => {
                    window.location.href = '../Main/Main.html'
                }).catch(error => {
                    invalid.style.visibility = 'visible';
                    invalid.innerHTML = 'The name of the sensor is already in use';
            })
        }).catch(error => {
            console.log('error to create a new sensor')
        })
    })
}

select.onchange = () => {
    if (select.options[select.selectedIndex].value == 'DARK_BLUE')
        select.style.backgroundColor = 'DARKBLUE';    
    else
        select.style.backgroundColor = select.options[select.selectedIndex].value;
}

function resetCSS() {
    KITCHEN.style.border = '0px solid black';
    KITCHEN.style.backgroundColor = '#f7e2e2';
    BEDROOM_BABY.style.border = '0px solid black';
    BEDROOM_BABY.style.backgroundColor = '#f7e2e2';
    BEDROOM_PARENT.style.border = '0px solid black';
    BEDROOM_PARENT.style.backgroundColor = '#f7e2e2';
    LIVINGROOM.style.border = '0px solid black';
    LIVINGROOM.style.backgroundColor = '#f7e2e2';
    GARAGE.style.border = '0px solid black';
    GARAGE.style.backgroundColor = '#f7e2e2';
    BATHROOM.style.border = '0px solid black';
    BATHROOM.style.backgroundColor = '#f7e2e2';
}


IconSelect = 'KITCHEN';
KITCHEN.style.border = '3px solid black';
KITCHEN.style.backgroundColor = '#61a4bc';