import React, { useMemo } from "react";

import { FileDownloadOutlined } from "@mui/icons-material";
import { Button, IconButton, Tooltip } from "@mui/material";

import { useDocument } from "../../../documents/editor/EditorContext";
import { useCurrentTemplate } from "../../../contexts/templates";

export default function DownloadJson() {
	const doc = useDocument();
	const currentTemplate = useCurrentTemplate();
	const href = useMemo(() => {
		return `data:text/plain,${encodeURIComponent(JSON.stringify(doc, null, "  "))}`;
	}, [doc]);
	return (
		<Button
			href={href}
			disabled={!currentTemplate?.id}
			download={currentTemplate?.name + ".json"}
			size="small"
		>
			Download JSON
		</Button>
	);
}
