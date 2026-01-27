import React from "react";

import { Box, Drawer, Tab, Tabs, useMediaQuery } from "@mui/material";

import {
	setSidebarTab,
	useInspectorDrawerOpen,
	useSelectedSidebarTab,
} from "../../documents/editor/EditorContext";

import { useTranslation } from "react-i18next";
import ConfigurationPanel from "./ConfigurationPanel";
import StylesPanel from "./StylesPanel";
import { useInspectorDrawerWidth } from "../../hooks/useInspectorDrawerWidth";

export default function InspectorDrawer() {
	const { t } = useTranslation();
	const selectedSidebarTab = useSelectedSidebarTab();
	const inspectorDrawerOpen = useInspectorDrawerOpen();
	const INSPECTOR_DRAWER_WIDTH = useInspectorDrawerWidth();

	const renderCurrentSidebarPanel = () => {
		switch (selectedSidebarTab) {
			case "block-configuration":
				return <ConfigurationPanel />;
			case "styles":
				return <StylesPanel />;
		}
	};

	return (
		<Drawer
			variant="persistent"
			anchor="right"
			open={inspectorDrawerOpen}
			PaperProps={{
				sx: {
					bgcolor: "background.paper",
					borderLeft: 1,
					borderColor: "divider",
				},
			}}
			sx={{
				width: inspectorDrawerOpen ? INSPECTOR_DRAWER_WIDTH : 0,
			}}
		>
			<Box
				sx={{
					width: INSPECTOR_DRAWER_WIDTH,
					height: 49,
					borderBottom: 1,
					borderColor: "divider",
					bgcolor: "background.paper",
				}}
			>
				<Box px={2}>
					<Tabs
						value={selectedSidebarTab}
						onChange={(_, v) => setSidebarTab(v)}
					>
						<Tab
							value="styles"
							label={t("templates.editor.tabs.styles")}
						/>
						<Tab
							value="block-configuration"
							label={t("templates.editor.tabs.inspect")}
						/>
					</Tabs>
				</Box>
			</Box>
			<Box
				sx={{
					width: INSPECTOR_DRAWER_WIDTH,
					height: "calc(100% - 49px)",
					overflow: "auto",
				}}
			>
				{renderCurrentSidebarPanel()}
			</Box>
		</Drawer>
	);
}
