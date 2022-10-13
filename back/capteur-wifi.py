import tkinter as tk
from tkinter import DoubleVar, ttk
import subprocess
from tkinter.tix import MAX
import sounddevice as sd
import numpy as np
import threading

exit_event = threading.Event()

window = tk.Tk()
# window.attributes('-fullscreen', True)
window.geometry("1920x1080")
window.title('Hear Your Home')
pb = tk.DoubleVar()


def getWifi(select, val):
    wifiAvailable = []
    wifiList = subprocess.run(["nmcli", "device", "wifi", "list"], capture_output=True)
    test = wifiList.stdout.decode('utf-8').split('\n')
    col_indexes = test.pop(0)
    nb = col_indexes.find(" SSID") + 1
    nbr = col_indexes.find("MODE")
    del test[-1]
    for i in test:
        i = i[nb:nbr]
        if ("-- " in i):
            continue
        wifiAvailable.append(i)
    select['menu'].delete(0, 'end')
    for option in wifiAvailable:
        select['menu'].add_command(label=option, command=tk._setit(val, option))

def changeWifi(changeWifiB, select, passwordLabel, passwordInput, connectB, reloadWifi, labelSound, progressbar, x):
    exit_event.set()
    changeWifiB.pack_forget()
    labelSound.pack_forget()
    progressbar.pack_forget()
    select.pack()
    passwordLabel.pack()
    passwordInput.pack()
    connectB.pack()
    reloadWifi.pack()

def audio_callback(indata, frames, time, status):
    volume_norm = np.linalg.norm(indata) * 10
    pb.set(volume_norm)

def thread_function():
    while True:
        if exit_event.is_set():
            break
        stream = sd.InputStream(callback=audio_callback)
        with stream:
            sd.sleep(1000)
    exit_event.clear()


def connectWifi(val, passwordInput, select, passwordLabel, reloadWifi, connectB, window):
    cmd = subprocess.run(["nmcli", "dev", "wifi", "connect", val.get().rstrip(), "password", passwordInput.get()], capture_output=True)
    test = cmd.stdout.decode('utf-8')
    if "activé" in test:
        passwordInput.pack_forget()
        select.pack_forget()
        passwordLabel.pack_forget()
        connectB.pack_forget()
        reloadWifi.pack_forget()
        labelSound = tk.Label(text="Sound intensity")
        labelSound.pack()
        progressbar = ttk.Progressbar(window, orient=tk.VERTICAL, length=100, mode='indeterminate', variable=pb, maximum=100)
        progressbar.pack(expand=True)
        x = threading.Thread(target=thread_function, args=())
        x.start()
        changeWifiB = tk.Button(text="Change Wifi", width=50, command=lambda: changeWifi(changeWifiB, select, passwordLabel, passwordInput, connectB, reloadWifi, labelSound, progressbar, x))
        changeWifiB.pack()

        
greeting = tk.Label(text="Hear Your Home")
greeting.pack()

val = tk.StringVar(window)
val.set("Select a Wifi")
select = tk.OptionMenu(window, val, [])
select.config(width=50)
select.pack()

passwordLabel = tk.Label(text="Password:")
passwordLabel.pack()
passwordInput = tk.Entry(fg="yellow", bg="blue", width=50)
passwordInput.pack()

reloadWifi = tk.Button(text="Reload !", width=50, command=lambda: getWifi(select, val))
reloadWifi.pack()

connectB = tk.Button(text="Connect", width=50, command=lambda: connectWifi(val, passwordInput, select, passwordLabel, reloadWifi, connectB, window))
connectB.pack()



getWifi(select, val)

window.mainloop()
