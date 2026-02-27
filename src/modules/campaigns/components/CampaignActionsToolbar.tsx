import React from "react";
import { Box, Button, Stack } from "@mui/material";
import { PlayArrow, Stop, Edit, Delete } from "@mui/icons-material";

export default function CampaignActionsToolbar({ disabled }: { disabled?: boolean }) {
	// Placeholder for bulk actions toolbar
	// Will be implemented when row selection is added
	return (
		<Box sx={{ display: "flex", justifyContent: "flex-end" }}>
			<Stack direction="row" spacing={1}>
				{/* Bulk actions will appear here when campaigns are selected */}
				{/* Example of how disabled would be used: */}
				{/* <Button disabled={disabled}>Action</Button> */}
			</Stack>
		</Box>
	);
}
