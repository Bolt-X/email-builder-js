import React from "react";
import { Card, CardContent, Typography, Box, Stack } from "@mui/material";

interface StatCardProps {
	title: string;
	value: string | number;
	icon: React.ReactNode;
	color: string;
	tendency?: {
		value: string;
		label: string;
		isUp: boolean;
	};
}

const StatCard: React.FC<StatCardProps> = ({
	title,
	value,
	icon,
	color,
	tendency,
}) => {
	return (
		<Card
			sx={{
				height: "100%",
				borderRadius: 4,
				boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
				border: "1px solid",
				borderColor: "rgba(0,0,0,0.05)",
				position: "relative",
				overflow: "hidden",
			}}
		>
			<CardContent sx={{ p: 3 }}>
				<Stack
					direction="row"
					justifyContent="space-between"
					alignItems="center"
					sx={{ mb: 2 }}
				>
					<Typography
						variant="body2"
						color="text.secondary"
						sx={{ fontWeight: 600, fontSize: "0.875rem" }}
					>
						{title}
					</Typography>
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							width: 40,
							height: 40,
							borderRadius: "10px",
							bgcolor: `${color}10`,
							color: color,
						}}
					>
						{React.cloneElement(icon as React.ReactElement, {
							sx: { fontSize: 22 },
						})}
					</Box>
				</Stack>

				<Typography
					variant="h4"
					sx={{
						fontWeight: 800,
						mb: tendency ? 2 : 0,
						color: "text.primary",
						fontSize: { xs: "1.75rem", md: "2.25rem" },
					}}
				>
					{value}
				</Typography>

				{tendency && (
					<Stack
						direction="row"
						spacing={1}
						alignItems="center"
					>
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								fontWeight: 700,
								fontSize: "0.75rem",
								color: tendency.isUp ? "success.dark" : "error.dark",
								bgcolor: tendency.isUp
									? "rgba(46, 125, 50, 0.1)"
									: "rgba(211, 47, 47, 0.1)",
								px: 1,
								py: 0.4,
								borderRadius: 1.5,
							}}
						>
							{tendency.isUp ? "↑" : "↓"} {tendency.value}
						</Box>
						<Typography
							variant="caption"
							color="text.secondary"
							sx={{ fontWeight: 500 }}
						>
							{tendency.label}
						</Typography>
					</Stack>
				)}
			</CardContent>
		</Card>
	);
};

export default StatCard;
