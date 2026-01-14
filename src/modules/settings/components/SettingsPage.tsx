import React from "react";
import { Box, Typography, Stack } from "@mui/material";

export default function SettingsPage() {
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
					sx={{ fontWeight: 800, color: "text.primary" }}
				>
					Settings
				</Typography>
			</Stack>
		</Box>
	);
}
