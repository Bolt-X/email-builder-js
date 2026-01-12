import React from "react";
import { Box, Typography, Button, Stack } from "@mui/material";
import { Add } from "@mui/icons-material";
import { useSegments } from "../../stores/segment.store";

export default function SegmentsTable() {
	const segments = useSegments();

	return (
		<Box>
			<Stack
				direction="row"
				justifyContent="space-between"
				alignItems="center"
				mb={3}
			>
				<Typography variant="h6">Segments</Typography>
				<Button
					variant="contained"
					startIcon={<Add />}
				>
					Create segment
				</Button>
			</Stack>

			{/* TODO: Implement segments table */}
			<Typography variant="body2" color="text.secondary">
				Segments feature coming soon. This will allow you to create dynamic
				filters for contacts.
			</Typography>
		</Box>
	);
}
