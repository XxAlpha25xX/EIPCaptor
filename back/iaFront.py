from librosa import feature
from librosa.feature.spectral import mfcc
from scipy.sparse import data
import tensorflow as tf
from sklearn.preprocessing import LabelEncoder
import sys
import numpy as np
import librosa
import json 
import sounddevice as sd
from scipy.io.wavfile import write
import tkinter as tk
import time 
from threading import Thread
from tkinter.ttk import Label, Button
import requests
import time

class MyTkinter:
    def __init__(self):
        self.ACTIVE = True
        self.window = tk.Tk()
        self.fullScreenState = True
        #self.window.attributes("-fullscreen", self.fullScreenState)
        self._resultStr = tk.StringVar()
        self._resultStr.set("Recording ...")
        self.w, self.h = self.window.winfo_screenwidth(), self.window.winfo_screenheight()
        self.window.geometry("%dx%d" % (self.w, self.h))
        
        #self.window.bind("<F11>", self.toggleFullScreen)
        self.window.bind("<Escape>", self.quitFullScreen)

        self.protocol = self.window.protocol
        self.protocol("WM_DELETE_WINDOW", self.on_closing)
        self._result = Label(self.window, textvariable=self._resultStr, font=('Courier 35'))
        self._button = Button(self.window, text ="Quit", command = self.quitFullScreen)
        self._result.configure(foreground="white", background="black")
        self._result.pack(ipadx=10, ipady=10)
        self.window.title = "Captor"
        self.window.configure(bg='black')
        self.work()
        self.window.mainloop()


    def on_closing(self):
        print("Close")
        r = requests.get('http://127.0.0.1:9000/terminate')
        self.window.destroy()
        quit()

    def work(self):
        r = requests.get('http://127.0.0.1:9000/')
        if r.status_code == 200:
            self._resultStr.set(r.text)
        else:
            self._resultStr.set("Wrong request")
        self.window.after(5 * 1000, self.work)


    def quitFullScreen(self, event):
        self.fullScreenState = False
        self.window.attributes("-fullscreen", self.fullScreenState)
        self.on_closing()
    
if __name__ == '__main__':
    app = MyTkinter()  
