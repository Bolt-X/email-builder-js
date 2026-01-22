import React from "react";
import { Box, Typography, Stack } from "@mui/material";

export default function MediaPage() {
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
					Media Library
				</Typography>
			</Stack>

			<Box sx={{ px: 3 }}>
				{/* Media content placeholder */}
				<Typography color="text.secondary">
					Media library coming soon...
				</Typography>
			</Box>
		</Box>
	);
}
