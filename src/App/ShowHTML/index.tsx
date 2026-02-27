import { Button } from "@mui/material";
import React from "react";
import { useCurrentTemplate } from "../../modules/templates/store";
import { setSelectedMainTab } from "../../documents/editor/EditorContext";

type Props = {};

const ShowHTML = (props: Props) => {
	const currentTemplate = useCurrentTemplate();

	return (
		<Button
			href={"#"}
			disabled={!currentTemplate?.id}
			size="small"
			onClick={() => setSelectedMainTab("html")}
		>
			Show HTML
		</Button>
	);
};

export default ShowHTML;
