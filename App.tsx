import { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Dimensions } from "react-native";
import { Home } from "./src/Home";
import Button from "./src/Home/Button";
import axios from 'axios';
import { Camera, CameraType, FaceDetectionResult } from "expo-camera";
import FormData from 'form-data';
import imageFile from "./assets/adaptive-icon.png";
import Facial from "./src/Facial/FaceCapture"
import FaceCapture from "./src/Facial/FaceCapture";
//const baseUrl = 'https://reqres.in';
const axiosInstance = axios.create({ baseURL: 'https://reqres.in/' });

export default function App() {
  function sendAPIRequest() {
    console.log("sendPicture");
    axiosInstance.get('api/users/1').then((response) => {
      console.log(response.data);
    });

    axiosInstance.put('api/users/1', imageFile, {
      headers: {
        'Content-Type': imageFile.type
      }
    });
    /*
    return (dispatch) => {
    axios.post(URL, data, {
      headers: {
        'accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.8',
        'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
      }
    })
      .then((response) => {
        //handle success
      }).catch((error) => {
        //handle error
      });
    };}
    */

  }
  function consoleLog() {
    console.log("log");
  }

  const [ativarImg, setAtivarImg] = useState(false);
  const [ativarPropsImg, setAtivarPropsImg] = useState(true);
  const [addImgPropsNeutro, setAddImgPropsNeutro] = useState(null || Boolean);

  const AtivarImg = () => {
    setAtivarPropsImg(true);
    setAtivarImg(false);
  };
  const DesativarImg = () => {
    setAtivarPropsImg(false);
    setAtivarImg(true);
  };

  const FunctionAddImgNeutro = () => {
    setAddImgPropsNeutro(true);
  };

  const takePicture = () => {
    Camera.takePictureAsync().then(onPictureSaved);
  };
  //your onPictureSaved function
  const onPictureSaved = ({ uri, width, height, exif, base64 }) => {
    console.log(uri);
  }

 //const onPictureSaved = photo => {
 //     console.log(photo);
  //} 
  return (
    <FaceCapture />
  )
  /*return (
    <View style={styles.containerApp}>
      <Home
        ativarImgProps={ativarPropsImg}
        adicionarImgPropsActiveNeutro={addImgPropsNeutro}
        setAddImgPropsNeutro={setAddImgPropsNeutro}
      />
      <View style={styles.containerButton}></View>
      {ativarImg ? (
        <Button
          labelButton="Ativar Imagem"
          onpress={AtivarImg}
          style={styles.buttonAtivo}
        />
      ) : (
        <Button
          labelButton="Desativar Imagem!"
          onpress={DesativarImg}
          style={styles.buttonDesativo}
        />
      )}
      <Button
        labelButton="Adicionar Imagem"
        onpress={FunctionAddImgNeutro}
        style={styles.buttonAddImg}
      />
      <Button
        labelButton="API SEND"
        onpress={sendAPIRequest}
        style={styles.buttonAddImg}
      />
      <Button
        labelButton="PICTURE SEND"
        onpress={takePicture}
        style={styles.buttonAddImg}
      />
      <Button
        labelButton="log()"
        onpress={consoleLog}
        style={styles.buttonAddImg}
      />
    </View>
  );*/
}

const styles = StyleSheet.create({
  containerApp: {
    backgroundColor: "gray",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 160,
  },
  containerButton: {
    flexDirection: "row",
  },
  buttonAtivo: {
    backgroundColor: "green",
    justifyContent: "center",
    alignItems: "center",
    width: 120,
    height: 30,
    margin: 7,
  },
  buttonDesativo: {
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
    width: 120,
    height: 30,
    margin: 7,
  },
  buttonAddImg: {
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
    width: 120,
    height: 30,
    margin: 7,
  },
});
