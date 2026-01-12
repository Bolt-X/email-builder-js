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
		if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
		const diffHours = Math.floor(diffMins / 60);
		if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
		const diffDays = Math.floor(diffHours / 24);
		return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
	};

	const canStart = campaign.status === "draft" || campaign.status === "scheduled";

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
						size="small"
					>
						<ArrowBack />
					</IconButton>
					
					<Stack spacing={0.5}>
						<Stack
							direction="row"
							alignItems="center"
							spacing={1.5}
						>
							<Typography variant="h6">
								{campaign.name || "Untitled Campaign"}
							</Typography>
							<Chip
								label={campaign.status}
								color={statusColors[campaign.status]}
								size="small"
							/>
						</Stack>
						<Stack
							direction="row"
							alignItems="center"
							spacing={1}
						>
							<Typography
								variant="caption"
								color="text.secondary"
							>
								Last edited {formatLastEditTime(campaign.lastEditedAt || campaign.updatedAt)}
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
					spacing={1}
				>
					<Button
						variant="outlined"
						startIcon={<Send />}
						onClick={onSendTest}
						size="small"
					>
						Send test email
					</Button>
					{canStart && (
						<Button
							variant="contained"
							startIcon={campaign.sendTime === "schedule" ? <Schedule /> : <PlayArrow />}
							onClick={handleStartCampaign}
							size="small"
						>
							{campaign.sendTime === "schedule" ? "Schedule" : "Start"} campaign
						</Button>
					)}
				</Stack>
			</Stack>
		</Box>
	);
}
