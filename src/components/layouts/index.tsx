import React, { useEffect } from "react";

import { Stack, useTheme } from "@mui/material";
import { INSPECTOR_DRAWER_WIDTH } from "../../App/InspectorDrawer";
import SamplesDrawer, { SAMPLES_DRAWER_WIDTH } from "../../App/SamplesDrawer";
import {
	useInspectorDrawerOpen,
	useSamplesDrawerOpen,
} from "../../documents/editor/EditorContext";
import { useUndoRedoShortcuts } from "../../hooks/useUndoRedoShortcuts";
import ModalSearch from "../modals/ModalSearch";
import { Outlet } from "react-router-dom";
import { useFetchTemplates } from "../../contexts/templates";

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
	const inspectorDrawerOpen = useInspectorDrawerOpen();
	const samplesDrawerOpen = useSamplesDrawerOpen();

	const marginLeftTransition = useDrawerTransition(
		"margin-left",
		samplesDrawerOpen
	);
	const marginRightTransition = useDrawerTransition(
		"margin-right",
		inspectorDrawerOpen
	);
	useEffect(() => {
		useFetchTemplates();
	}, []);

	return (
		<>
			<SamplesDrawer />
			<ModalSearch />

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
