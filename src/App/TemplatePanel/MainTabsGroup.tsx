import React from "react";
import { useTranslation } from "react-i18next";
import { EditOutlined, PreviewOutlined } from "@mui/icons-material";
import { Tab, Tabs, Tooltip } from "@mui/material";
import {
	setSelectedMainTab,
	useSelectedMainTab,
} from "../../documents/editor/EditorContext";

export default function MainTabsGroup() {
	const { t } = useTranslation();
	const selectedMainTab = useSelectedMainTab();
	const handleChange = (_: unknown, v: unknown) => {
		switch (v) {
			case "json":
			case "preview":
			case "editor":
			case "html":
				setSelectedMainTab(v);
				return;
			default:
				setSelectedMainTab("editor");
		}
	};

	return (
		<Tabs
			value={selectedMainTab}
			onChange={handleChange}
		>
			<Tab
				value="editor"
				label={
					<Tooltip title={t("common.edit")}>
						<EditOutlined fontSize="small" />
					</Tooltip>
				}
			/>
			<Tab
				value="preview"
				label={
					<Tooltip title={t("campaigns.preview")}>
						<PreviewOutlined fontSize="small" />
					</Tooltip>
				}
			/>
		</Tabs>
	);
}
