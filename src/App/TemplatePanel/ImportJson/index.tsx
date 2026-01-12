import React, { useState } from "react";

import { FileUploadOutlined } from "@mui/icons-material";
import { Button, IconButton, Tooltip } from "@mui/material";

import ImportJsonDialog from "./ImportJsonDialog";
import { useCurrentTemplate } from "../../../modules/templates/store";

export default function ImportJson() {
	const [open, setOpen] = useState(false);
	const currentTemplate = useCurrentTemplate();

	let dialog = null;
	if (open) {
		dialog = <ImportJsonDialog onClose={() => setOpen(false)} />;
	}

	return (
		<>
			{/* <Tooltip title="Import JSON">
				<IconButton onClick={() => setOpen(true)}>
					<FileUploadOutlined fontSize="small" />
				</IconButton>
			</Tooltip> */}
			<Button
				href={"#"}
				disabled={!currentTemplate?.id}
				onClick={() => setOpen(true)}
				size="small"
			>
				Import JSON
			</Button>
			{dialog}
		</>
	);
}
