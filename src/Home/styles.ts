import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
	containerGeral: {
		backgroundColor: "pink",
	},
	container: {
		width: "100%",
		height: "100%",
	},
	camera: {
		flex: 1,
	},
	viewLog: {
		width: "100%",
		textAlign: "auto",
		position: "absolute",
		rigth: 0,
		bottom: 0,
		zIndex: 10,
		height: "20%",
		borderWidth: 2,
	},
	viewLogText: {
		fontSize: 30,
		height: 100,
		flex: 1,
		justifyContent: "center",
		textAlign: "center",
	},
	splashEnviando: {
		position: "absolute",
		backgroundColor: "#DDD",
		flex: 1,
		height: "80%",
		width: "100%",
		zIndex: 20,
	},
	fontIcon: {
		textAlign: "center",
		fontSize: 40,
		marginBottom: 50,
	}
});
