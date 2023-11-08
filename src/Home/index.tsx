import { useEffect, useState } from "react";
import { View } from "react-native";
import { Camera, CameraType, FaceDetectionResult } from "expo-camera";
import * as FaceDetector from "expo-face-detector";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import axios from "axios";
import FormData from "form-data";

import Animated, {
	useSharedValue,
	useAnimatedStyle,
	ColorSpace,
} from "react-native-reanimated";

import { styles } from "./styles";

export function Home({
	ativarImgProps,
	adicionarImgPropsActiveNeutro,
	setAddImgPropsNeutro,
}: any) {
	const [faceDetected, setFaceDetected] = useState(false);
	const [permission, requestPermission] = Camera.useCameraPermissions();
	const [image, setImage] = useState(
		"https://cdn.icon-icons.com/icons2/564/PNG/512/Add_Image_icon-icons.com_54218.png"
	);
	const [cameraRef, setCameraRef] = useState<any>(null);
	const [faceDir, setFaceDir] = useState<any>("");

	const handleImagePickerNeutro = async () => {
		const resultNeutro = await ImagePicker.launchImageLibraryAsync({
			aspect: [4, 4],
			allowsEditing: true,
			base64: true,
			quality: 1,
		});
		if (!resultNeutro.canceled) {
			setImage(resultNeutro.assets[0].uri);
		}
	};

	if (adicionarImgPropsActiveNeutro) {
		handleImagePickerNeutro();
		setAddImgPropsNeutro(false);
	}

	const faceValues = useSharedValue({
		width: 0,
		height: 0,
		x: 0,
		y: 0,
	});

	function handleFacesDetected({ faces }: FaceDetectionResult) {
		const face = faces[0] as any;

		if (face) {
			// console.log(face);
			const { size, origin } = face.bounds;
			faceValues.value = {
				width: size.width,
				height: size.height,
				x: origin.x,
				y: origin.y,
			};

			setFaceDetected(true);

			if (ativarImgProps) {
				// console.log(face);
				if (face.smilingProbability > 0.9) {
					freezeFrame();
				} else if (
					face.leftEyeOpenProbability > 0.8 &&
					face.rightEyeOpenProbability < 0.8
				) {
					// setImage(image);
					freezeFrame();
				} else {
					// setImage(image);
					// freezeFrame();
					setFaceDetected(false);
				}
			} else {
				setFaceDetected(false);
			}
		}
	}

	const freezeFrame = async () => {
		if (cameraRef) {
			let photo = await cameraRef.takePictureAsync();
			await setImage(photo.uri);
			// console.log(photo.uri);

			// Freeze the image for 2 seconds
			await new Promise((resolve) => setTimeout(resolve, 3000));

			// Save the image as a jpg file
			const dirInfo = await FileSystem.getInfoAsync(faceDir);
			faceDir ? console.log(dirInfo) : createDirectory();
			// let newFileUri =
			// 	photo.uri.substring(0, photo.uri.lastIndexOf(".")) + ".jpg";

			// await FileSystem.moveAsync({
			// 	from: photo.uri,
			// 	to: newFileUri,
			// });
			await saveImage(photo);
			await uploadImage();

			// Start a new 5 second timer before allowing a new detection
			await new Promise((resolve) => setTimeout(resolve, 5000));
		}
	};

	const animatedStyle = useAnimatedStyle(() => ({
		position: "absolute",
		zIndex: 1,
		width: faceValues.value.width,
		height: faceValues.value.height,
		transform: [
			{ translateX: faceValues.value.x },
			{ translateY: faceValues.value.y },
		],
		borderRadius: 100,
	}));

	async function createDirectory() {
		const dir = FileSystem.documentDirectory + "faceDetected/";

		try {
			await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
			console.log("Diretório criado!");
			setFaceDir(dir);
		} catch (error) {
			console.error("Erro ao criar o diretório:", error);
			setFaceDir("");
		}
	}
	async function saveImage(cameraRef: any) {
		if (cameraRef) {
			// let photo = await cameraRef.takePictureAsync();
			let photo = cameraRef;

			const newFileUri = `${faceDir}/image.jpg`;

			try {
				await FileSystem.moveAsync({
					from: photo.uri,
					to: newFileUri,
				});
				console.log("Imagem salva!");
			} catch (error) {
				console.error("Erro ao salvar a imagem:", error);
			}
		}
	}
	async function uploadImage() {
		const uri = `${faceDir}/image.jpg`;
		let formData = new FormData();
		let localUri = uri;
		let filename = localUri.split("/").pop();

		// Infer the type of the image
		let match = /\.(\w+)$/.exec(filename || "");
		let type = match ? `image/${match[1]}` : `image`;

		// Assume "file" is the name of the form field the server expects
		formData.append("file", {
			uri: localUri,
			name: filename || "image.jpg",
			type,
		});

		const options = {
			method: "POST",
			url: "http://192.168.0.10:7000/upload",
			headers: {
				"Content-Type":
					"multipart/form-data; boundary=---011000010111000001101001",
				"User-Agent": "axios",
			},
			data: formData,
		};

		try {
			const response = await axios(options);
			console.log(response.data);
		} catch (error) {
			console.error(error);
		}
	}
	useEffect(() => {
		requestPermission();
	}, []);

	if (!permission?.granted) {
		return;
	}

	return (
		<View style={styles.container}>
			<Camera
				ref={(ref) => {
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
			{faceDetected && (
				<Animated.Image style={animatedStyle} source={{ uri: image }} />
			)}
		</View>
	);
}
