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
		if (!dateString) return "Never";
		const date = new Date(dateString);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);

		if (diffMins < 1) return "Just now";
		if (diffMins < 60)
			return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
		const diffHours = Math.floor(diffMins / 60);
		if (diffHours < 24)
			return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
		const diffDays = Math.floor(diffHours / 24);
		return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
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
				backgroundColor: "background.paper",
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
							{campaign.name || "Untitled Campaign"}
						</Typography>
						<Chip
							label={campaign.status}
							size="small"
							sx={{
								backgroundColor: "neutral.black.10",
								color: "neutral.black.100",
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
								Edit Design
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
								Last edited{" "}
								{formatLastEditTime(
									campaign.date_updated || campaign.date_created || undefined,
								)}
							</Typography>
							{autosaveState.isDirty && (
								<Typography
									variant="caption"
									color="warning.main"
								>
									• Unsaved changes
								</Typography>
							)}
							{autosaveState.lastSavedAt && !autosaveState.isDirty && (
								<Typography
									variant="caption"
									color="success.main"
								>
									• Saved
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
						Send test email
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
						Save
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
							{campaign.sendTime === "schedule" ? "Schedule" : "Start"} campaign
						</Button>
					)}
				</Stack>
			</Stack>
		</Box>
	);
}
