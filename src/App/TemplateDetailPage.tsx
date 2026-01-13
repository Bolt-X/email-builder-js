import React, { useEffect } from "react";
import InspectorDrawer from "./InspectorDrawer";
import TemplatePanel from "./TemplatePanel";
import { Box } from "@mui/material";
import { useParams } from "react-router-dom";
import {
	fetchTemplateDetail,
	setCurrentTemplate,
} from "../modules/templates/store";
import { useDocument, resetDocument } from "../documents/editor/EditorContext";
import EMPTY_EMAIL_MESSAGE from "../getConfiguration/sample/empty-email-message";

type Props = {};

const TemplateDetailPage = (props: Props) => {
	const { id } = useParams();
	useEffect(() => {
		if (id && id !== "new") {
			fetchTemplateDetail(id);
		} else if (id === "new") {
			setCurrentTemplate(null);
			resetDocument(EMPTY_EMAIL_MESSAGE);
		}
	}, [id]);

	return (
		<Box
			sx={{
				display: "flex",
				width: "100%",
				height: "100%",
				overflow: "hidden",
				position: "relative",
			}}
		>
			<Box sx={{ flexGrow: 1, height: "100%", overflow: "hidden" }}>
				<TemplatePanel />
			</Box>
			<InspectorDrawer />
		</Box>
	);
};

export default TemplateDetailPage;
