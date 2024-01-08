import { View, StyleSheet } from "react-native";
import React from "react";

import Button from "./src/Home/Button";
import { Home } from "./src/Home"; // Fixed import statement
/*FONT AWESOME*/
import { library } from '@fortawesome/fontawesome-svg-core'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faMugSaucer } from '@fortawesome/free-solid-svg-icons/faMugSaucer'
import { faSquareCheck } from '@fortawesome/free-solid-svg-icons/faSquareCheck'
//import { faMugEmpty } from '@fortawesome/free-solid-svg-icons/faMugEmpty'
import { faCrosshairs } from '@fortawesome/free-solid-svg-icons/faCrosshairs'
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons/faCircleExclamation'
import { faCloudArrowUp } from '@fortawesome/free-solid-svg-icons/faCloudArrowUp'
import { faGear } from '@fortawesome/free-solid-svg-icons/faGear'
library.add(fab, faSquareCheck, faMugSaucer, faCrosshairs, faCircleExclamation, faCloudArrowUp, faGear)

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
