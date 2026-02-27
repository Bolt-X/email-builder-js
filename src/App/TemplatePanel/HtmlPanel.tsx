import React, { useMemo } from "react";
import { renderToStaticMarkup } from "@usewaypoint/email-builder";
import { Box, Button, Stack } from "@mui/material";
import { FileDownloadOutlined } from "@mui/icons-material";

import { useDocument } from "../../documents/editor/EditorContext";
import { useCurrentTemplate } from "../../modules/templates/store";

import { READER_DICTIONARY } from "../../documents/editor/core";

import HighlightedCodePanel from "./helper/HighlightedCodePanel";

export default function HtmlPanel() {
	const document = useDocument();
	const currentTemplate = useCurrentTemplate();
	const code = useMemo(() => {
		return renderToStaticMarkup(
			document as any,
			{
				rootBlockId: "root",
				blockConfigurationDictionary: READER_DICTIONARY,
			} as any,
		);
	}, [document]);

	const downloadHref = useMemo(() => {
		return `data:text/html;charset=utf-8,${encodeURIComponent(code)}`;
	}, [code]);

	return (
		<Stack sx={{ height: "100%" }}>
			<Box
				sx={{
					p: 1,
					px: 2,
					borderBottom: 1,
					borderColor: "divider",
					display: "flex",
					justifyContent: "flex-end",
					bgcolor: "background.paper",
				}}
			>
				<Button
					variant="contained"
					size="small"
					startIcon={<FileDownloadOutlined />}
					href={downloadHref}
					download={(currentTemplate?.name || "template") + ".html"}
				>
					Download HTML
				</Button>
			</Box>
			<Box sx={{ flex: 1, overflow: "auto" }}>
				<HighlightedCodePanel
					type="html"
					value={code}
				/>
			</Box>
		</Stack>
	);
}
