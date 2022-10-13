from librosa import feature
from librosa.feature.spectral import mfcc
from scipy.sparse import data
import tensorflow as tf
from sklearn.preprocessing import LabelEncoder
import sys
import numpy as np
import librosa
from flask import Flask, json, request, jsonify
import json 
import sounddevice as sd
from scipy.io.wavfile import write
import tkinter as tk
import time 
from threading import Thread
from tkinter.ttk import Label

MODEL_PATH = "/home/hyh/Documents/HYH-IA/model.h5"
CLASS_PATH = "/home/hyh/Documents/HYH-IA/classes.npy"
SAMPLE_RATE = 44100
SECONDS = 4

class MyTkinter:
    def __init__(self):
        self.ACTIVE = True
        self.window = tk.Tk()
        self.fullScreenState = True
        self.window.attributes("-fullscreen", self.fullScreenState)
        self._resultStr = tk.StringVar()
        self._resultStr.set("Recording ...")
        self.w, self.h = self.window.winfo_screenwidth(), self.window.winfo_screenheight()
        self.window.geometry("%dx%d" % (self.w, self.h))
        
        #self.window.bind("<F11>", self.toggleFullScreen)
        self.window.bind("<Escape>", self.quitFullScreen)

        self.protocol = self.window.protocol
        self.protocol("WM_DELETE_WINDOW", self.on_closing)
        self._result = Label(self.window, textvariable=self._resultStr, font=('Courier 35'))
        self._result.configure(foreground="white", background="black")
        self._result.pack(ipadx=10, ipady=10)
        self.window.title = "Captor"
        self.window.configure(bg='black')
        self.threading()
        self.window.mainloop()


    def on_closing(self):
        print("Close")
        self.ACTIVE = False
        self.window.destroy()
        self.t1.terminate()
        exit()
    
    def threading(self): 
        self.ACTIVE = True
        self.t1=Thread(target=self.work) 
        self.t1.start()

    def work(self):     
        while self.ACTIVE == True:
            myrecording = sd.rec(int(SECONDS * SAMPLE_RATE), samplerate=SAMPLE_RATE, channels=2)
            sd.wait()
            write('/home/hyh/Documents/HYH-IA/output.wav', SAMPLE_RATE, myrecording)  #
            res = guessSound('/home/hyh/Documents/HYH-IA/output.wav', CLASS_PATH, MODEL_PATH)
            obj = {"prediction" : res}
            self._resultStr.set(res.strip('\'[]'))

    def toggleFullScreen(self, event):
        self.fullScreenState = not self.fullScreenState
        self.window.attributes("-fullscreen", self.fullScreenState)
        self.ACTIVE = False
        self.t1.join()

    def quitFullScreen(self, event):
        self.fullScreenState = False
        self.window.attributes("-fullscreen", self.fullScreenState)
        self.on_closing()


def mfcc_extract(filename):
    try:
        audio, sample_rate = librosa.load(filename, res_type='kaiser_fast') 
        mfccs = librosa.feature.mfcc(y=audio, sr=sample_rate, n_mfcc=40)
        #print(mfccs.shape)
        mfccsscaled = np.mean(mfccs.T,axis=0)
    except Exception as e:
        print("[ERROR] fail to generate mfcc of: ", filename)
        return None 
    return mfccsscaled


def printClass(le, i):
    try:
        tmp = le.inverse_transform([i])
        return str(tmp)
    except Exception as e:
        print("[Error] ")
        print(e)

def loadLabelEncoder(path):
    le = LabelEncoder()
    le.classes_ = np.load(path)
    return le

def guessSound(filename, leP, modelP):        
    le = loadLabelEncoder(leP)
    model = tf.keras.models.load_model(modelP)
    #model.summary()
    mfcc = mfcc_extract(filename=filename)
    pre = model.predict(np.array([mfcc]), batch_size=4)
    pre = pre.ravel()
    for index, val in enumerate(pre):
        print(f'{printClass(le, index)} => {str(round(val * 100, 3))}%')
    print(f'[Predicted Class] => {printClass(le, np.argmax(pre))}')
    return printClass(le, np.argmax(pre))
    
if __name__ == '__main__':
    app = MyTkinter()  
