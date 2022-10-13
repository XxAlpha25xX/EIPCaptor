from librosa import feature
from librosa.feature.spectral import mfcc
from scipy.sparse import data
import tensorflow as tf
from sklearn.preprocessing import LabelEncoder
import sounddevice as sd
from scipy.io.wavfile import write
import sys
import numpy as np
import librosa
from flask import Flask, json, request, jsonify
import json
import requests

MODEL_PATH = "/home/hyh/Documents/HYH-IA/model.h5"
CLASS_PATH = "/home/hyh/Documents/HYH-IA/classes.npy"
OUTPUT_PATH = "/home/hyh/Documents/HYH-IA/output.wav"
LAST_PREDICTION = ""
SAMPLE_RATE = 44100
SECONDS = 4
SHAPE_MFCC = (40, 300)
IS_ACTIVE = True

def mfcc_extract(filename):
    try:
        audio, sample_rate = librosa.load(filename, res_type='kaiser_fast') 
        mfccs = librosa.feature.mfcc(y=audio, sr=sample_rate, n_mfcc=40)
        print("Before:", mfccs.shape)
        pad_mfccs = np.zeros(SHAPE_MFCC)
        pad_mfccs[:mfccs.shape[0],:mfccs.shape[1]] = mfccs
        if pad_mfccs.shape != SHAPE_MFCC:
            raise Exception("Sorry, no numbers below zero")
        mfccsscaled = np.mean(mfccs.T,axis=0)
        print("After:", mfccsscaled.shape)
    except Exception as e:
        print("[ERROR] fail to generate mfcc of: ", filename)
        return None
    pad_mfccs = pad_mfccs.reshape(40, 300, 1)
    print("Shape of mfcc pad = ", pad_mfccs.shape)
    return pad_mfccs


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
    print(f'Predicted Class => {printClass(le, np.argmax(pre))}')
    return printClass(le, np.argmax(pre))
    

app = Flask(__name__)

@app.route("/terminate", methods=['GET'])
def terminate():
    print("Server Shutdown")
    IS_ACTIVE = False
    return "ok"

@app.route("/", methods=['GET'])
def getLastPrediction():
    myrecording = sd.rec(int(SECONDS * SAMPLE_RATE), samplerate=SAMPLE_RATE, channels=2)
    sd.wait()
    write(OUTPUT_PATH, SAMPLE_RATE, myrecording)  #
    res = guessSound(OUTPUT_PATH, CLASS_PATH, MODEL_PATH)
    obj = {"prediction" : res}
    LAST_PREDICTION = res.strip('\'[]')
    print("Last prediction is ", LAST_PREDICTION)
    obj = {
        "prediction" : LAST_PREDICTION
    }
    return LAST_PREDICTION
    

if __name__ == "__main__":
    app.run(host="0.0.0.0",port=9000, debug=True)
    