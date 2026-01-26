import React from "react";
import {
	Card,
	CardContent,
	Typography,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Chip,
	Box,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { Campaign } from "../../campaigns/types";

interface RecentCampaignsTableProps {
	campaigns: Campaign[];
}

const RecentCampaignsTable: React.FC<RecentCampaignsTableProps> = ({
	campaigns,
}) => {
	const { t } = useTranslation();
	const getStatusStyles = (status: string) => {
		switch (status) {
			case "finished":
				return { color: "#10b981", bgcolor: "rgba(16, 185, 129, 0.1)" };
			case "running":
				return { color: "#0ea5e9", bgcolor: "rgba(14, 165, 233, 0.1)" };
			case "scheduled":
				return { color: "#f59e0b", bgcolor: "rgba(245, 158, 11, 0.1)" };
			default:
				return { color: "#64748b", bgcolor: "rgba(100, 116, 139, 0.1)" };
		}
	};

	return (
		<Card
			sx={{
				borderRadius: 4,
				boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
				border: "1px solid",
				borderColor: "rgba(0,0,0,0.05)",
			}}
		>
			<CardContent sx={{ p: 0 }}>
				<Box sx={{ p: 3, borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
					<Typography
						variant="h6"
						sx={{ fontWeight: 700, fontSize: "1.1rem" }}
					>
						{t("dashboard.recent_campaigns")}
					</Typography>
				</Box>
				<TableContainer sx={{ overflowX: "auto" }}>
					<Table sx={{ minWidth: { xs: 650, md: "100%" } }}>
						<TableHead sx={{ bgcolor: "action.hover" }}>
							<TableRow>
								<TableCell
									sx={{
										fontWeight: 700,
										color: "text.secondary",
										fontSize: "0.75rem",
										textTransform: "uppercase",
										letterSpacing: "1px",
									}}
								>
									{t("campaigns.columns.name")}
								</TableCell>
								<TableCell
									sx={{
										fontWeight: 700,
										color: "text.secondary",
										fontSize: "0.75rem",
										textTransform: "uppercase",
										letterSpacing: "1px",
									}}
								>
									{t("campaigns.columns.status")}
								</TableCell>
								<TableCell
									sx={{
										fontWeight: 700,
										color: "text.secondary",
										fontSize: "0.75rem",
										textTransform: "uppercase",
										letterSpacing: "1px",
									}}
								>
									{t("dashboard.sent")}
								</TableCell>
								<TableCell
									sx={{
										fontWeight: 700,
										color: "text.secondary",
										fontSize: "0.75rem",
										textTransform: "uppercase",
										letterSpacing: "1px",
									}}
								>
									{t("dashboard.open_rate")}
								</TableCell>
								<TableCell
									sx={{
										fontWeight: 700,
										color: "text.secondary",
										fontSize: "0.75rem",
										textTransform: "uppercase",
										letterSpacing: "1px",
									}}
								>
									{t("campaigns.date_created")}
								</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{campaigns.slice(0, 5).map((campaign) => {
								const openRate = campaign.sent
									? ((campaign.views || 0) / campaign.sent) * 100
									: 0;
								return (
									<TableRow
										key={campaign.slug}
										hover
										sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
									>
										<TableCell sx={{ fontWeight: 600, color: "text.primary" }}>
											{campaign.name}
										</TableCell>
										<TableCell>
											{(() => {
												const styles = getStatusStyles(campaign.status);
												return (
													<Chip
														label={t(`campaigns.status.${campaign.status}`)}
														size="small"
														sx={{
															textTransform: "capitalize",
															fontWeight: 700,
															fontSize: "0.7rem",
															color: styles.color,
															bgcolor: styles.bgcolor,
															border: "none",
															height: 24,
														}}
													/>
												);
											})()}
										</TableCell>
										<TableCell sx={{ fontWeight: 500 }}>
											{campaign.sent || 0}
										</TableCell>
										<TableCell sx={{ fontWeight: 500 }}>
											{openRate.toFixed(1)}%
										</TableCell>
										<TableCell
											sx={{ fontWeight: 500, color: "text.secondary" }}
										>
											{campaign.date_created
												? new Date(campaign.date_created).toLocaleDateString()
												: "N/A"}
										</TableCell>
									</TableRow>
								);
							})}
							{campaigns.length === 0 && (
								<TableRow>
									<TableCell
										colSpan={5}
										align="center"
										sx={{ py: 6 }}
									>
										<Typography
											variant="body2"
											color="text.secondary"
											sx={{ fontWeight: 500 }}
										>
											{t("dashboard.no_campaigns")}
										</Typography>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</TableContainer>
			</CardContent>
		</Card>
	);
};

export default RecentCampaignsTable;
