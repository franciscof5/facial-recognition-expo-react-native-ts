import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Camera } from 'expo-camera';
import * as FaceDetector from 'expo-face-detector';
import { ColorSpace } from 'react-native-reanimated';

const FaceCapture = () => {
  const [hasPermission, setHasPermission] = useState<any>(null);
  const [type, setType] = useState(Camera.Constants.Type);
  const [faceDetected, setFaceDetected] = useState(false);

  const handleFaceDetect = ({ faces }: { faces: { [key: string]: any }[] }) => {
    if (faces.length > 0) {
      console.log('face detected', faces);
      setFaceDetected(true);
      
      //Camera.takePictureAsync().then(onPictureSaved);
      //your onPictureSaved function
      //const onPictureSaved = ({ uri, width, height, exif, base64 }) => {
      //  console.log(uri);
      //}
    } else {
      console.log('no face detected');
      setFaceDetected(false);
    }
  };

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

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
          <TouchableOpacity style={styles.button}>
            <Text style={styles.text}>Capture</Text>
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
