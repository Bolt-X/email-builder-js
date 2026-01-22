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
				sx={{ px: 3, py: "20px", bgcolor: "white", mb: 2 }}
			>
				<Typography
					variant="h4"
					sx={{ fontWeight: 600, color: "text.primary" }}
				>
					Segments
				</Typography>
				<Button
					variant="contained"
					startIcon={<Add />}
					sx={{
						borderRadius: 10,
						textTransform: "none",
						px: 3,
						height: 44,
						fontWeight: 700,
					}}
				>
					Create segment
				</Button>
			</Stack>

			{/* TODO: Implement segments table */}
			<Typography
				variant="body2"
				color="text.secondary"
			>
				Segments feature coming soon. This will allow you to create dynamic
				filters for contacts.
			</Typography>
		</Box>
	);
}
