import React from "react";
import { Box, Typography } from "@mui/material";

export default function MediaPage() {
	return (
		<Box>
			<Typography variant="h4" sx={{ mb: 3 }}>Media Library</Typography>
			<Box>
				{/* Media content placeholder */}
				<Typography color="text.secondary">Media library coming soon...</Typography>
			</Box>
		</Box>
	);
}
