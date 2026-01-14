import { Box, Typography, Stack } from "@mui/material";

export default function AnalyticsDashboard() {
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
					Analytics
				</Typography>
			</Stack>
			<Box sx={{ px: 3 }}>
				<Typography color="text.secondary">
					Analytics dashboard will be implemented here.
				</Typography>
			</Box>
		</Box>
	);
}
