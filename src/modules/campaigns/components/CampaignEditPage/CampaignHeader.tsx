import React from "react";
import {
	Box,
	Button,
	Stack,
	Typography,
	Chip,
	IconButton,
	Tooltip,
} from "@mui/material";
import {
	ArrowBack,
	Send,
	PlayArrow,
	Schedule,
	Edit,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Campaign, CampaignStatus } from "../../types";
import { statusColors } from "../../utils";
import { useAutosaveState } from "../../stores/campaign.metadata.store";

interface CampaignHeaderProps {
	campaign: Campaign;
	onSendTest?: () => void;
	onStartCampaign?: () => void;
	onSave?: () => Promise<void>;
}

export default function CampaignHeader({
	campaign,
	onSendTest,
	onStartCampaign,
	onSave,
}: CampaignHeaderProps) {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const autosaveState = useAutosaveState();

	const handleBack = () => {
		navigate("/campaigns");
	};

	const handleStartCampaign = async () => {
		if (onSave) {
			await onSave();
		}
		if (onStartCampaign) {
			onStartCampaign();
		}
	};

	const formatLastEditTime = (dateString?: string) => {
		if (!dateString) return t("campaigns.never");
		const date = new Date(dateString);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);

		if (diffMins < 1) return t("campaigns.just_now");
		if (diffMins < 60)
			return `${diffMins} ${t(diffMins > 1 ? "campaigns.minutes" : "campaigns.minute")} ${t("campaigns.ago")}`;
		const diffHours = Math.floor(diffMins / 60);
		if (diffHours < 24)
			return `${diffHours} ${t(diffHours > 1 ? "campaigns.hours" : "campaigns.hour")} ${t("campaigns.ago")}`;
		const diffDays = Math.floor(diffHours / 24);
		return `${diffDays} ${t(diffDays > 1 ? "campaigns.days" : "campaigns.day")} ${t("campaigns.ago")}`;
	};

	const canStart =
		campaign.status === "draft" || campaign.status === "scheduled";

	return (
		<Box
			sx={{
				borderBottom: 1,
				borderColor: "divider",
				px: 3,
				py: 2,
				height: 64,
				backgroundColor: "background.paper",
				boxSizing: "border-box",
			}}
		>
			<Stack
				direction="row"
				justifyContent="space-between"
				alignItems="center"
				spacing={2}
			>
				{/* Left side: Back button, Campaign name, Status, Last edit */}
				<Stack
					direction="row"
					alignItems="center"
					spacing={2}
					flex={1}
				>
					<IconButton
						onClick={handleBack}
						sx={{ color: "text.primary" }}
					>
						<ArrowBack />
					</IconButton>

					<Stack
						direction="row"
						alignItems="center"
						spacing={2}
					>
						<Typography
							variant="h5"
							fontWeight="bold"
						>
							{campaign.name || t("campaigns.untitled")}
						</Typography>
						<Chip
							label={t(`campaigns.status.${campaign.status}`)}
							size="small"
							sx={{
								backgroundColor: "action.hover",
								color: "text.secondary",
								fontWeight: "500",
								textTransform: "capitalize",
							}}
						/>
						{campaign.template && (
							<Button
								variant="text"
								size="small"
								onClick={() => navigate(`/templates/${campaign.template}`)}
								sx={{
									textTransform: "none",
									fontWeight: 600,
									color: "primary.main",
									"&:hover": { textDecoration: "underline" },
								}}
							>
								{t("campaigns.edit_design")}
							</Button>
						)}
						<Stack
							direction="row"
							alignItems="center"
							spacing={1}
						>
							<Typography
								variant="caption"
								color="text.secondary"
							>
								{t("campaigns.last_edited")}{" "}
								{formatLastEditTime(
									campaign.date_updated || campaign.date_created || undefined,
								)}
							</Typography>
							{autosaveState.isDirty && (
								<Typography
									variant="caption"
									color="warning.main"
								>
									• {t("campaigns.unsaved_changes")}
								</Typography>
							)}
							{autosaveState.lastSavedAt && !autosaveState.isDirty && (
								<Typography
									variant="caption"
									color="success.main"
								>
									• {t("campaigns.saved")}
								</Typography>
							)}
						</Stack>
					</Stack>
				</Stack>

				{/* Right side: Actions */}
				<Stack
					direction="row"
					alignItems="center"
					spacing={2}
				>
					<Button
						variant="text"
						onClick={onSendTest}
						sx={{
							textTransform: "none",
							fontWeight: 600,
							borderRadius: "100px",
							px: 3,
							color: "primary.main",
							"&:hover": {
								textDecoration: "underline",
								bgcolor: "transparent",
							},
						}}
					>
						{t("campaigns.send_test_email")}
					</Button>
					<Button
						variant="outlined"
						onClick={onSave}
						sx={{
							borderRadius: "100px",
							px: 4,
							py: 1,
							textTransform: "none",
							fontWeight: 600,
							borderWidth: 1.5,
							borderColor: "primary.main",
							color: "primary.main",
							"&:hover": {
								borderWidth: 1.5,
								bgcolor: "rgba(25, 118, 210, 0.04)",
							},
						}}
					>
						{t("common.save")}
					</Button>
					{canStart && (
						<Button
							variant="contained"
							onClick={handleStartCampaign}
							sx={{
								borderRadius: "100px",
								px: 4,
								py: 1,
								textTransform: "none",
								fontWeight: 600,
								boxShadow: "none",
								border: "1.5px solid",
								borderColor: "primary.main",
								bgcolor: "primary.main",
								"&:hover": {
									boxShadow: "none",
									bgcolor: "primary.dark",
									borderColor: "primary.dark",
								},
							}}
						>
							{campaign.sendTime === "schedule"
								? t("campaigns.schedule")
								: t("campaigns.start")}{" "}
							{t("sidebar.campaigns").toLowerCase()}
						</Button>
					)}
				</Stack>
			</Stack>
		</Box>
	);
}
