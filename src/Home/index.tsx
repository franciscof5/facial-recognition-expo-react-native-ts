import { SetStateAction, useEffect, useState } from "react";
import { View, Text, Image, ImageBackground } from "react-native";
import { Camera, CameraType, FaceDetectionResult } from "expo-camera";
import * as FaceDetector from "expo-face-detector";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withSpring,
	withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import CircleMask from "./../../assets/circle-mask.png";
import { styles } from "./styles";
import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCrosshairs } from "@fortawesome/free-solid-svg-icons/faCrosshairs";
import {
	IconLookup,
	IconName,
	IconProp,
} from "@fortawesome/fontawesome-svg-core";
import { CompreFace } from "@exadel/compreface-js-sdk";

export function Home() {
	useEffect(() => {
		requestPermission();
	}, []);
	const [logColor, setlogColor] = useState("#17a2b8");
	const [logIcon, setlogIcon] = useState<IconProp | any>("gear");
	const [logText, setlogText] = useState(
		"inicializando app... posicione o rosto no centro do círculo"
	);
	const [countAPIerrors, setcountAPIerrors] = useState(0);
	const [faceDetected, setFaceDetected] = useState(false);
	const [faceDetectedOnCenter, setFaceDetectedOnCenter] = useState(false);
	const [permission, requestPermission] = Camera.useCameraPermissions();
	// const [image, setImage] = useState(
	// 	"https://cdn.icon-icons.com/icons2/564/PNG/512/Add_Image_icon-icons.com_54218.png"
	// );
	const [image, setImage] = useState<string | null>(null); // Cmachado: dado da Face detectada pela camera, inicializa o estado da imagem como null para não aparecer a imagem padrão
	const [cameraRef, setCameraRef] = useState<string | null | any>(null); // Cmachado: altera o estado da cameraRef para null para permitir que a camera seja inicializada apenas uma vez
	const [faceDir, setFaceDir] = useState<string | null>(null); // Cmachado: inicializa o estado do diretório como null para criar o diretório apenas uma vez
	const [faceImage, setFaceImage] = useState<string | null>(null); // Cmachado: inicializa o estado da imagem como null para não aparecer a imagem padrão
	const [waitingApiResponse, setwaitingApiResponse] = useState<any>(false);
	const [CPFApiResponse, setCPFApiResponse] = useState<any>(0);

	const putMessageOnScreen = (
		msg: SetStateAction<string>,
		color: SetStateAction<string>,
		icon: SetStateAction<string>,
		loud: any
	) => {
		setlogText(msg);
		if (color) setlogColor(color);
		if (icon) setlogIcon(icon); // Cmachado: altera o ícone do log typagem any
		if (loud) {
			Speech.speak(msg.toString());
		}
	};

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

	const faceValues = useSharedValue({
		//width: 110,
		//height: 110,
		//x: 110,
		//y: 110,
	});

	async function handleFacesDetected({ faces }: FaceDetectionResult) {
		const face = faces[0] as any;

		if (face) {
			const { size, origin } = face.bounds;
			//faceValues.value = {
			//	width: size.width,
			//	height: size.height,
			//	x: origin.x,
			//	y: origin.y,
			//};
			// console.log(
			// 	"faceValues: ",
			// 	face.leftEyeOpenProbability,
			// 	face.rightEyeOpenProbability
			// );
			await extractFace(face); // Cmachado: chama a função para extrair o rosto da imagem chamada anteriormente a renderização
			setFaceDetected(true);
		}
	}
	const animatedStyle = useAnimatedStyle(() => ({
		//position: "absolute",
		//zIndex: -10,
		width: "100%",
		height: 10,
		//transform: [
		//	{ translateX: +10 },
		//	{ translateY: 200 },
		//],
		//borderRadius: 100,
		//width: faceValues.value.width,
		//height: faceValues.value.height,
		//transform: [
		//	{ translateX: faceValues.value.x },
		//	{ translateY: faceValues.value.y },
		//],
	}));

	const truncatedAnimation = useAnimatedStyle(() => {
		return {
			height: withTiming(640, { duration: 2000 }),
		};
	}, []);

	async function extractFace(face: any) {
		console.log("extractFace()");
		if (waitingApiResponse) {
			setlogColor("#ffc107");
			console.log("aguardando resposta da API...");
		} else {
			console.info("faceDir: " + faceDir);
			if (faceDir != null) {
				putMessageOnScreen("rosto detectado", "#DDD", "crosshairs", true);
				// funçaõ para extrair o rosto da imagem dectada pela camera
				console.info(
					"faceDetected: ",
					faceDetected,
					"waitingApiResponse: ",
					waitingApiResponse
				);
				if (faceDetected) {
					takePicture();
				} else if (
					face.leftEyeOpenProbability > 0.8 &&
					face.rightEyeOpenProbability < 0.8
				) {
					//esta redundante takePicture(); // Cmachado: chama a função para tirar a foto da imagem detectada pela camera
				} else {
					setFaceDetected(false);
				}
			} else {
				//force configuration
				takePicture();
			}
		}
	}

	async function takePicture() {
		console.log("takePicture()");
		if (cameraRef) {
			let photo = await cameraRef.takePictureAsync();
			// Renderiza a imagem tirada pela camera por 3 segundos
			setImage(photo.uri); // Cmachado: altera o source para a imagem que foi tirada
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
		console.log("createDirectory()");
		const dir = FileSystem.documentDirectory + "faceDetected/"; // Cmachado: cria o diretório para salvar a imagem com o nome de faceDetected

		try {
			await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
			console.log("Diretório criado!");
			putMessageOnScreen(
				"configurando o primeiro acesso",
				"#17a2b8",
				"gear",
				true
			);
			setFaceDir(dir);
		} catch (error) {
			setlogColor("#dc3545");
			putMessageOnScreen(
				"erro ao criar diretório, configuração inicial falhou...",
				"",
				"",
				false
			);
			console.error("erro ao criar o diretório:", error, "gear", true);
			setFaceDir(null);
		}
	}

	async function saveImage(cameraRef: any) {
		console.log("saveImage()");
		if (cameraRef) {
			let photo = cameraRef;
			console.log("photo.uri: ", photo.uri);

			const newFileUri = `${faceDir}/image.jpg`;
			if (faceDir) {
				//como a função de criar diretório é assíncrona, aqui o código chega antes do diretório ser criado
				try {
					await FileSystem.moveAsync({
						from: photo.uri,
						to: newFileUri,
					});
					setFaceImage(newFileUri);
					putMessageOnScreen(
						"Aguarde autorização...",
						"#09d",
						"cloud-arrow-up",
						true
					);
					console.log("Imagem salva!");
				} catch (error) {
					console.error("Erro ao salvar a imagem:", error);
				}
			}
		}
		if (faceImage !== null) {
			await uploadImage();
		}
	}

	async function uploadImage() {
		console.log("uploadImage()");
		const api_key = "453f4a82-6640-4e9b-9307-b0ab684cc2f4";
		const url = "http://localhost:8000";
		const port = 8000;
		const uri = faceImage;
		let localUri = uri;
		let filename = localUri ? localUri.split("/").pop() : "";
		let options = {
			limit: 1,
			det_prob_threshold: 0.85,
			prediction_count: 1,
			status: true,
			detect_faces: true,
		};

		putMessageOnScreen(
			"Enviando para servidor...",
			"#ffc107",
			"cloud-arrow-up",
			true
		);
		console.log("enviando para api: " + filename);
		setwaitingApiResponse(true);
		try {
			if (localUri) {
				// Cmachado: verifica se a uri não está vazia para fazer o upload
				//  const response = await FileSystem.uploadAsync(url, localUri, {
				//  	fieldName: "file",
				//  	httpMethod: "POST",
				//  	uploadType: FileSystem.FileSystemUploadType.MULTIPART,
				//  	mimeType: "multipart/form-data",

				//  	parameters: {
				//  		boundaryString: "---011000010111000001101001",
				//  	},
				//  });
				const response = await FileSystem.uploadAsync(url, localUri, {
					httpMethod: "POST",
					fieldName: "file",
					uploadType: FileSystem.FileSystemUploadType.MULTIPART,
					mimeType: "multipart/form-data",
					headers: {
						"Content-Type": "multipart/form-data",
						"x-api-key": "453f4a82-6640-4e9b-9307-b0ab684cc2f4",
					},
					parameters: {
						limit: "1",
						det_prob_threshold: "0.85",
						prediction_count: "1",
						status: "true",
						detect_faces: "true",
					},
				})
					.then((response) => {
						const data = JSON.parse(response.body);
						console.log(data);
					})
					.catch((error) => {
						console.error("error", error);
					});

				console.log("Response", response);
				let cpf = (response as any).body.slice(44, 56).toString();
				console.log("cpf", cpf);

				await FileSystem.deleteAsync(localUri)
					.then(() => {
						console.log("Arquivo deletado com sucesso");
					})
					.catch((error) => {
						console.error("Erro ao deletar o arquivo:", error);
					});
				if (cpf) {
					putMessageOnScreen(`CPF encontrado: ${cpf}`, "", "", false);
					setCPFApiResponse(cpf);
					setTimeout(() => {
						setwaitingApiResponse(false);
					}, 2000);
				} else {
					setwaitingApiResponse(false);
				}
				setcountAPIerrors(0);
			}
		} catch (error) {
			console.error(error);
			setwaitingApiResponse(false);
			setcountAPIerrors(countAPIerrors + 1);
			putMessageOnScreen(
				`erro ao comunicar-se, contagem: ${countAPIerrors}`,
				"#dc3545",
				"circle-exclamation",
				false
			);
		}
	}

	if (!permission?.granted) {
		return;
	}

	return (
		<View style={styles.container}>
			<Image
				source={CircleMask}
				style={{
					position: "absolute",
					flex: 1,
					zIndex: 10,
					width: "100%",
					height: "80%",
					resizeMode: "stretch",
				}}
			/>
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
			{waitingApiResponse == true && (
				<View style={styles.splashEnviando}>
					<Text>Enviando a foto para o servidor</Text>
					<Animated.Image
						style={[animatedStyle, truncatedAnimation]}
						source={{ uri: faceImage ?? undefined }} // Cmachado: altera o source para a imagem que foi tirada checar se é undefined
					/>
				</View>
			)}
			<View style={[styles.viewLog, { backgroundColor: logColor }]}>
				<FontAwesomeIcon icon={logIcon} size={34} style={styles.viewLogIcon} />
				<Text style={styles.viewLogText}>{logText}</Text>
			</View>
		</View>
	);
}
