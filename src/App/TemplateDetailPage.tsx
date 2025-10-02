import React, { useEffect } from "react";
import InspectorDrawer from "./InspectorDrawer";
import TemplatePanel from "./TemplatePanel";
import { useParams } from "react-router-dom";
import { useFetchTemplateDetail } from "../contexts/templates";
import { useDocument } from "../documents/editor/EditorContext";

type Props = {};

const TemplateDetailPage = (props: Props) => {
	const { id } = useParams();
	useEffect(() => {
		useFetchTemplateDetail(id);
	}, [id]);

	return (
		<>
			<TemplatePanel />
			<InspectorDrawer />
		</>
	);
};

export default TemplateDetailPage;
