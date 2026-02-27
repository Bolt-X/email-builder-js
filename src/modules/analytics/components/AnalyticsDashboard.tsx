import { Box, Typography, Stack } from "@mui/material";

export default function AnalyticsDashboard() {
	return (
		<Box>
			<Stack
				direction="row"
				justifyContent="space-between"
				alignItems="center"
				sx={{
					px: 3,
					py: 2,
					height: 64,
					bgcolor: "background.paper",
					borderBottom: 1,
					borderColor: "divider",
					mb: 2,
				}}
			>
				<Typography
					variant="h4"
					sx={{ fontWeight: 600, color: "text.primary" }}
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
