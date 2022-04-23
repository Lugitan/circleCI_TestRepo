import React from "react";
import { useState } from "react";
import { Button } from "@mui/material";

function CustomButton(props) {
	const [state, setState] = useState("")

	return (
		<Button>{props.children}</Button>
	)
}

export default CustomButton;