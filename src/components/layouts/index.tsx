import React, { useEffect } from "react";

import { Snackbar, Stack, useTheme } from "@mui/material";
import SamplesDrawer from "../../App/SamplesDrawer";
import {
	useInspectorDrawerOpen,
	useSamplesDrawerOpen,
} from "../../documents/editor/EditorContext";
import { useUndoRedoShortcuts } from "../../hooks/useUndoRedoShortcuts";
import ModalSearch from "../modals/ModalSearch";
import { Outlet } from "react-router-dom";
import { fetchTemplates } from "../../modules/templates/store";
import { useMessage } from "../../contexts";
import { useSamplesDrawerWidth } from "../../hooks/useSamplesDrawerWidth";
import { useInspectorDrawerWidth } from "../../hooks/useInspectorDrawerWidth";

function useDrawerTransition(
	cssProperty: "margin-left" | "margin-right",
	open: boolean
) {
	const { transitions } = useTheme();
	return transitions.create(cssProperty, {
		easing: !open ? transitions.easing.sharp : transitions.easing.easeOut,
		duration: !open
			? transitions.duration.leavingScreen
			: transitions.duration.enteringScreen,
	});
}

export default function MainLayout() {
	useUndoRedoShortcuts();
	const message = useMessage();
	const inspectorDrawerOpen = useInspectorDrawerOpen();
	const INSPECTOR_DRAWER_WIDTH = useInspectorDrawerWidth();

	const samplesDrawerOpen = useSamplesDrawerOpen();
	const SAMPLES_DRAWER_WIDTH = useSamplesDrawerWidth();

	const marginLeftTransition = useDrawerTransition(
		"margin-left",
		samplesDrawerOpen
	);
	const marginRightTransition = useDrawerTransition(
		"margin-right",
		inspectorDrawerOpen
	);
	useEffect(() => {
		fetchTemplates();
	}, []);

	return (
		<>
			<SamplesDrawer />
			<Stack
				sx={{
					marginRight: inspectorDrawerOpen ? `${INSPECTOR_DRAWER_WIDTH}px` : 0,
					marginLeft: samplesDrawerOpen ? `${SAMPLES_DRAWER_WIDTH}px` : 0,
					transition: [marginLeftTransition, marginRightTransition].join(", "),
				}}
			>
				<Outlet />
			</Stack>
		</>
	);
}
