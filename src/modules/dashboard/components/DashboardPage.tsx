import React from "react";
import { Box, Typography, Stack } from "@mui/material";

export default function DashboardPage() {
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
					Dashboard
				</Typography>
			</Stack>
		</Box>
	);
}
