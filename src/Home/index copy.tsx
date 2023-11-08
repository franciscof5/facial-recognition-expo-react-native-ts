import { useEffect, useState } from "react";
import { View } from "react-native";
import { Camera, CameraType, FaceDetectionResult } from "expo-camera";
import * as FaceDetector from "expo-face-detector";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from 'expo-file-system';

import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

import { styles } from "./styles";

export function Home({
  ativarImgProps,
  adicionarImgPropsActiveNeutro,
  setAddImgPropsNeutro,
}: any) {
  const [faceDetectad, setFaceDetectad] = useState(false);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [image, setImage] = useState(
    "https://cdn.icon-icons.com/icons2/564/PNG/512/Add_Image_icon-icons.com_54218.png"
  );
  const [cameraRef, setCameraRef] = useState<any>(null);

  // ...

  function handleFacesDetected({ faces }: FaceDetectionResult) {
    const face = faces[0] as any;

    if (face) {
      // ...

      if (ativarImgProps) {
        if (face.smilingProbability > 0.5) {
          freezeFrame();
        } else if (
          face.leftEyeOpenProbability > 0.5 &&
          face.rightEyeOpenProbability < 0.5
        ) {
          freezeFrame();
        } else {
          freezeFrame();
        }
      } else {
        setFaceDetectad(false);
      }
    }
  }

  const freezeFrame = async () => {
    if (cameraRef) {
      let photo = await cameraRef.takePictureAsync();
      setImage(photo.uri);

      // Freeze the image for 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Save the image as a jpg file
      let newFileUri = photo.uri.substring(0, photo.uri.lastIndexOf(".")) + ".jpg";
      await FileSystem.moveAsync({
        from: photo.uri,
        to: newFileUri,
      });

      // Start a new 5 second timer before allowing a new detection
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  };

  // ...

  return (
    <View style={styles.container}>
      <Camera
        ref={ref => {
          setCameraRef(ref);
        }}
        style={styles.camera}
        type={CameraType.front}
        onFacesDetected={handleFacesDetected}
        faceDetectorSettings={{
          mode: FaceDetector.FaceDetectorMode.fast,
          detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
          runClassifications: FaceDetector.FaceDetectorClassifications.all,
          minDetectionInterval: 100,
          tracking: true,
        }}
      />
      {/* {faceDetectad && (
        <Animated.Image style={animatedStyle} source={{ uri: image }} />
      )} */}
    </View>
  );
}
