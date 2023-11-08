import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import * as FaceDetector from 'expo-face-detector';

const FaceCapture = () => {
  const [hasPermission, setHasPermission] = useState(null);
  //const [type, setType] = useState(Camera.Constants.Type.front);
  const [faceDetected, setFaceDetected] = useState(false);
  const [type, setType] = useState(CameraType.front);

  const handleFaceDetect = ({ faces }) => {
    //console.log(faces);
    if (faces.length > 0) {
      setFaceDetected(true);
      
      //Camera.takePictureAsync().then(onPictureSaved);
      //your onPictureSaved function
      //const onPictureSaved = ({ uri, width, height, exif, base64 }) => {
      //  console.log(uri);
      //}
    } else {
      setFaceDetected(false);
    }
  };

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const onPress = () => {
    console.log("onPress");
    if (Camera) {
      console.log(Camera);
      const options = {quality: 1, base64: true};
      //const data = await this.camera.takePictureAsync(options);
      //Camera.takePictureAsync({ onPictureSaved: onPictureSaved });
    }
  }

  const toggleCameraType = () => {
    setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
  }
  return (
    <View style={styles.container}>
      <Camera 
        style={styles.camera}
        type={type}
        onFacesDetected={handleFaceDetect}
      >
        <View style={styles.overlay}>
          <View style={[styles.oval, faceDetected ? styles.greenOval : null]}></View>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={onPress}>
            <Text style={styles.text}>Capture</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={toggleCameraType}>
            <Text style={styles.text}>Flip Camera</Text>
          </TouchableOpacity>
        </View>
      </Camera>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  oval: {
    width: '80%',
    paddingTop: '80%',
    backgroundColor: 'transparent',
    borderColor: 'rgba(255, 0, 0, 0.5)',
    borderWidth: 20,
    borderRadius: 1000,
  },
  greenOval: {
    borderColor: 'rgba(0, 255, 0, 0.5)',
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    margin: 20,
  },
  button: {
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
  },
  text: {
    fontSize: 18,
    color: 'white',
  },
});

export default FaceCapture;
