import React from "react";
import {
	Box,
	Typography,
	Button,
	Container,
	Stack,
	IconButton,
	Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
	ArrowBack,
	DashboardOutlined,
	RocketLaunchOutlined,
} from "@mui/icons-material";

interface ComingSoonProps {
	title: string;
	description: string;
}

export default function ComingSoon({ title, description }: ComingSoonProps) {
	const navigate = useNavigate();

	return (
		<Box
			sx={{
				bgcolor: "background.default",
				minHeight: "100vh",
				position: "relative",
				overflow: "hidden",
			}}
		>
			<Stack
				direction="row"
				alignItems="center"
				justifyContent="space-between"
				spacing={2}
				sx={{
					px: 3,
					py: 2,
					height: 64,
					backgroundColor: "background.paper",
					borderBottom: 1,
					borderColor: "divider",
					position: "relative",
					zIndex: 2,
				}}
			>
				<Typography
					variant="h4"
					sx={{ fontWeight: 600, color: "text.primary" }}
				>
					{title}
				</Typography>
			</Stack>

			<Container
				maxWidth="sm"
				sx={{ position: "relative", zIndex: 2 }}
			>
				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						textAlign: "center",
						py: { xs: 6, md: 10 },
					}}
				>
					<Chip
						icon={<RocketLaunchOutlined sx={{ fontSize: "1rem !important" }} />}
						label="Coming Soon"
						size="small"
						sx={{
							mb: 3,
							height: 28,
							fontWeight: 700,
							textTransform: "uppercase",
							letterSpacing: "0.05em",
							bgcolor: "primary.main",
							color: "white",
							fontSize: "0.7rem",
							"& .MuiChip-icon": { color: "inherit" },
						}}
					/>

					<Typography
						variant="h4"
						sx={{
							fontWeight: 800,
							mb: 1.5,
							color: "text.primary",
							fontSize: { xs: "1.2rem", md: "1.8rem" },
							letterSpacing: "-0.02em",
						}}
					>
						{title}
					</Typography>

					<Typography
						variant="body2"
						sx={{
							mb: 4,
							color: "text.secondary",
							maxWidth: 450,
							opacity: 0.8,
							fontWeight: 500,
							lineHeight: 1.5,
						}}
					>
						{description}
					</Typography>

					<Button
						variant="contained"
						size="small"
						startIcon={<DashboardOutlined />}
						onClick={() => navigate("/")}
						sx={{
							borderRadius: 2,
							px: 3,
							py: 0.8,
							textTransform: "none",
							fontWeight: 700,
							boxShadow: "none",
							"&:hover": {
								bgcolor: "primary.dark",
								boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
							},
						}}
					>
						Take me home
					</Button>
				</Box>
			</Container>

			{/* Background Abstract Shapes */}
			<Box
				sx={{
					position: "absolute",
					top: "50%",
					left: "50%",
					transform: "translate(-50%, -50%)",
					width: "120%",
					height: "120%",
					zIndex: 1,
					opacity: 0.4,
					pointerEvents: "none",
				}}
			>
				<Box
					sx={{
						position: "absolute",
						top: "10%",
						left: "10%",
						width: 400,
						height: 400,
						borderRadius: "50%",
						background:
							"radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)",
						filter: "blur(60px)",
					}}
				/>
				<Box
					sx={{
						position: "absolute",
						bottom: "10%",
						right: "10%",
						width: 500,
						height: 500,
						borderRadius: "50%",
						background:
							"radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 70%)",
						filter: "blur(80px)",
					}}
				/>
			</Box>
		</Box>
	);
}
