#Helper packages 
import tensorflow as tf
from tensorflow.keras.preprocessing.image import img_to_array
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
import numpy as np
import cv2

#decode the image
import base64



class Helper:
    def __init__(self) -> None:
        self.interpreter = tf.lite.Interpreter(model_path="./model.tflite")
        self.interpreter.allocate_tensors()
        self.input_index = self.interpreter.get_input_details()[0]['index']
        self.output_index = self.interpreter.get_output_details()[0]['index']
        self.classes= ['No DR','Mild','Moderate','Severe','Proliferate ']
        self.sigmaX = 10


    def predict(self,bs4string) ->dict:
        '''
        :input -> base64 encoded string
        '''
        #decode image string 
        img = base64.b64decode(bs4string)
        img = cv2.imdecode(np.fromstring(img,np.uint8), cv2.IMREAD_ANYCOLOR)
        
        
        #applying filter
        gaussian = cv2.addWeighted(img, 4, cv2.GaussianBlur(img, (0,0), self.sigmaX), -4, 128)

        #image preprocess
        img = img_to_array(gaussian)
        img = preprocess_input(img)
        data = np.expand_dims(img, axis=0)

        #model inference
        self.interpreter.set_tensor(self.input_index,data)
        self.interpreter.invoke()
        output=self.interpreter.get_tensor(self.output_index)
     
        #result 
        res = dict() 
        res['cls'] = self.classes[np.argmax(output[0])]
        res['acc'] = round(output[0][np.argmax(output[0])]*100,2)

        return res

