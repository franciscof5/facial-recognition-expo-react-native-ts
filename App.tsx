import { View, StyleSheet } from "react-native";
import React from "react";

import Button from "./src/Home/Button";
import { Home } from "./src/Home"; // Fixed import statement

export default function App() {
	const styles = StyleSheet.create({
		containerApp: {
			backgroundColor: "gray",
			justifyContent: "center",
			alignItems: "center",
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

	return (
		<View style={styles.containerApp}>
			<Home />
		</View>
	);
}
