import React from "react";
import { Box, Button, Stack } from "@mui/material";
import { PlayArrow, Stop, Edit, Delete } from "@mui/icons-material";

export default function CampaignActionsToolbar() {
	// Placeholder for bulk actions toolbar
	// Will be implemented when row selection is added
	return (
		<Box sx={{ display: "flex", justifyContent: "flex-end" }}>
			<Stack direction="row" spacing={1}>
				{/* Bulk actions will appear here when campaigns are selected */}
			</Stack>
		</Box>
	);
}
