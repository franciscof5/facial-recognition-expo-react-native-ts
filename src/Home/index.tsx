import { useEffect, useState } from "react";
import { View } from "react-native";
import { Camera, CameraType, FaceDetectionResult } from "expo-camera";
import * as FaceDetector from "expo-face-detector";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
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
	useEffect(() => {
		requestPermission();
	}, []);
	const [faceDetected, setFaceDetected] = useState(false);
	const [permission, requestPermission] = Camera.useCameraPermissions();
	const [image, setImage] = useState(
		"https://cdn.icon-icons.com/icons2/564/PNG/512/Add_Image_icon-icons.com_54218.png"
	);
	const [cameraRef, setCameraRef] = useState<any>(null);
	const [faceDir, setFaceDir] = useState<any>("");
	const [faceImage, setFaceImage] = useState<any>("");
	const [apiResponse, setApiResponse] = useState<any>(true);

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

	async function handleFacesDetected({ faces }: FaceDetectionResult) {
		const face = faces[0] as any;

		if (face) {
			const { size, origin } = face.bounds;
			faceValues.value = {
				width: size.width,
				height: size.height,
				x: origin.x,
				y: origin.y,
			};

			setFaceDetected(true);
			await dectectFace(face);
		}
	}
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

	async function dectectFace(face: any) {
		if (ativarImgProps && apiResponse) {
			if (face.smilingProbability > 0.9) {
				await freezeFrame();
			} else if (
				face.leftEyeOpenProbability > 0.8 &&
				face.rightEyeOpenProbability < 0.8
			) {
				await freezeFrame();
			} else {
				setFaceDetected(false);
			}
		} else {
			setFaceDetected(false);
		}
	}

	async function freezeFrame() {
		if (cameraRef) {
			let photo = await cameraRef.takePictureAsync();
			// Freeze the image for 3 seconds
			await setImage(photo.uri);
			await new Promise((resolve) => setTimeout(resolve, 3000));

			// Save the image as a jpg file
			const dirInfo = await FileSystem.getInfoAsync(faceDir);
			faceDir ? console.log(dirInfo) : createDirectory();
			await saveImage(photo);
			// upload image to faceID API
			await uploadImage();
			// setReadToDetect(false);
			// // Start a new 7 second timer before allowing a new detection
			// await new Promise((resolve) => setTimeout(resolve, 7000));
			// setFaceDetected(true);
		}
	}

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
			let photo = cameraRef;

			const newFileUri = `${faceDir}/image.jpg`;

			try {
				await FileSystem.moveAsync({
					from: photo.uri,
					to: newFileUri,
				});
				setFaceImage(newFileUri);
				console.log("Imagem salva!");
			} catch (error) {
				console.error("Erro ao salvar a imagem:", error);
			}
		}
	}
	async function uploadImage() {
		const uri = faceImage;
		let localUri = uri;
		let filename = localUri.split("/").pop();
		console.log("filename: ", filename);
		setApiResponse(false); // Cmachado: seta o estado para false para não permitir que o usuário faça mais de um upload por vez

		try {
			const response = await FileSystem.uploadAsync(
				"http://192.168.0.10:7000/upload",
				localUri,
				{
					fieldName: "file",
					httpMethod: "POST",
					uploadType: FileSystem.FileSystemUploadType.MULTIPART,
					mimeType: "multipart/form-data",
					parameters: {
						boundaryString: "---011000010111000001101001",
					},
				}
			);
			console.log(response);
			setApiResponse(true);
		} catch (error) {
			console.error(error);
			setApiResponse(false);
		}
	}

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
