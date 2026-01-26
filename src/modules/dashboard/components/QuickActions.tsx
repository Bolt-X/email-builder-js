import React from "react";
import { Card, CardContent, Typography, Button, Stack } from "@mui/material";
import { Add, PersonAdd, ColorLens } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const QuickActions: React.FC = () => {
	const navigate = useNavigate();
	const { t } = useTranslation();

	return (
		<Card
			sx={{
				borderRadius: 4,
				boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
				border: "1px solid",
				borderColor: "rgba(0,0,0,0.05)",
				height: "100%",
			}}
		>
			<CardContent sx={{ p: 3 }}>
				<Typography
					variant="h6"
					sx={{ fontWeight: 700, mb: 3, fontSize: "1.1rem" }}
				>
					{t("dashboard.quick_actions")}
				</Typography>
				<Stack spacing={1.5}>
					<Button
						variant="contained"
						fullWidth
						disableElevation
						startIcon={<Add />}
						onClick={() => navigate("/campaigns/new")}
						sx={{
							borderRadius: 3,
							py: 1.5,
							textTransform: "none",
							fontWeight: 700,
							justifyContent: "flex-start",
							px: 2,
							bgcolor: "primary.main",
							"&:hover": { bgcolor: "primary.dark" },
						}}
					>
						{t("dashboard.actions.create_campaign")}
					</Button>
					{[
						{
							label: t("dashboard.actions.design_template"),
							icon: <ColorLens />,
							path: "/templates",
						},
						{
							label: t("dashboard.actions.import_contacts"),
							icon: <PersonAdd />,
							path: "/contacts",
						},
					].map((action) => (
						<Button
							key={action.label}
							variant="outlined"
							fullWidth
							startIcon={action.icon}
							onClick={() => navigate(action.path)}
							sx={{
								borderRadius: 3,
								py: 1.5,
								textTransform: "none",
								fontWeight: 600,
								justifyContent: "flex-start",
								px: 2,
								color: "text.primary",
								borderColor: "rgba(0,0,0,0.1)",
								"&:hover": {
									borderColor: "primary.main",
									bgcolor: "rgba(0,0,0,0.02)",
								},
							}}
						>
							{action.label}
						</Button>
					))}
				</Stack>
			</CardContent>
		</Card>
	);
};

export default QuickActions;
