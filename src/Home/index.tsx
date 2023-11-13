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
	// const [image, setImage] = useState(
	// 	"https://cdn.icon-icons.com/icons2/564/PNG/512/Add_Image_icon-icons.com_54218.png"
	// );
	const [image, setImage] = useState<string | null>(null); // Cmachado: dado da Face detectada pela camera, inicializa o estado da imagem como null para não aparecer a imagem padrão
	const [cameraRef, setCameraRef] = useState<string | null | any>(null); // Cmachado: altera o estado da cameraRef para null para permitir que a camera seja inicializada apenas uma vez
	const [faceDir, setFaceDir] = useState<string | null>(null); // Cmachado: inicializa o estado do diretório como null para criar o diretório apenas uma vez
	const [faceImage, setFaceImage] = useState<string | null>(null); // Cmachado: inicializa o estado da imagem como null para não aparecer a imagem padrão
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
			// console.log(
			// 	"faceValues: ",
			// 	face.leftEyeOpenProbability,
			// 	face.rightEyeOpenProbability
			// );
			await extractFace(face); // Cmachado: chama a função para extrair o rosto da imagem chamada anteriormente a renderização
			await setFaceDetected(true);
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

	async function extractFace(face: any) {
		// funçaõ para extrair o rosto da imagem dectada pela camera
		if (ativarImgProps) {
			console.info(
				"ativarImgProps: ",
				ativarImgProps,
				"faceDetected: ",
				faceDetected,
				"apiResponse: ",
				apiResponse
			);
			if (faceDetected && apiResponse) {
				await takePicture();
			} else if (
				face.leftEyeOpenProbability > 0.8 &&
				face.rightEyeOpenProbability < 0.8
			) {
				await takePicture(); // Cmachado: chama a função para tirar a foto da imagem detectada pela camera
			} else {
				setFaceDetected(false);
			}
		} else {
			await setFaceDetected(false);
		}
	}

	async function takePicture() {
		if (cameraRef) {
			let photo = await cameraRef.takePictureAsync();
			// Renderiza a imagem tirada pela camera por 3 segundos
			await setImage(photo.uri); // Cmachado: altera o source para a imagem que foi tirada
			// await new Promise((resolve) => setTimeout(resolve, 3000));

			// Salva a imagem no diretório criado com o nome de image.jpg
			if (faceDir !== null) {
				// Cmachado: verifica se o diretório já foi criado para não criar novamente
				const dirInfo = await FileSystem.getInfoAsync(faceDir);
				console.log("dirInfo  ", dirInfo.exists);
				await saveImage(photo);
			} else {
				await createDirectory();
				await saveImage(photo); // Cmachado: salva a imagem no diretório criado anteriormente
			}
		}
	}

	async function createDirectory() {
		const dir = FileSystem.documentDirectory + "faceDetected/"; // Cmachado: cria o diretório para salvar a imagem com o nome de faceDetected

		try {
			await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
			console.log("Diretório criado!");
			await setFaceDir(dir);
		} catch (error) {
			console.error("Erro ao criar o diretório:", error);
			setFaceDir(null);
		}
	}
	async function saveImage(cameraRef: any) {
		if (cameraRef) {
			let photo = cameraRef;
			console.log("photo: ", photo.uri);

			const newFileUri = `${faceDir}/image.jpg`;

			try {
				await FileSystem.moveAsync({
					from: photo.uri,
					to: newFileUri,
				});
				await setFaceImage(newFileUri);
				console.log("Imagem salva!");
			} catch (error) {
				console.error("Erro ao salvar a imagem:", error);
			}
		}
		if (faceImage !== null) {
			await uploadImage();
		}
	}

	async function uploadImage() {
		const uri = faceImage;
		let localUri = uri;
		let filename = localUri ? localUri.split("/").pop() : "";
		console.log("enviando para api: ", filename);
		await setApiResponse(false); // Cmachado: seta o estado para false para não permitir que o usuário faça mais de um upload por vez

		try {
			if (localUri) {
				// Cmachado: verifica se a uri não está vazia para fazer o upload
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
				console.log("Response", response.body);
				await FileSystem.deleteAsync(localUri)
					.then(() => {
						console.log("Arquivo deletado com sucesso");
					})
					.catch((error) => {
						console.error("Erro ao deletar o arquivo:", error);
					});
				await setApiResponse(true);
			}
		} catch (error) {
			console.error(error);
			await setApiResponse(true);
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
					mode: FaceDetector.FaceDetectorMode.accurate, // Cmachado: altera o modo de detecção para o modo mais preciso
					detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
					runClassifications: FaceDetector.FaceDetectorClassifications.all,
					minDetectionInterval: 7000,
					tracking: true,
				}}
			/>
			{apiResponse !== true && (
				<Animated.Image
					style={animatedStyle}
					source={{ uri: faceImage ?? undefined }} // Cmachado: altera o source para a imagem que foi tirada checar se é undefined
				/>
			)}
		</View>
	);
}
