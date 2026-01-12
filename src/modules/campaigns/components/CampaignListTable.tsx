import React from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Chip,
	IconButton,
	Box,
	Menu,
	MenuItem,
} from "@mui/material";
import {
	MoreVert,
	PlayArrow,
	Stop,
	Edit,
	Delete,
} from "@mui/icons-material";
import { Campaign, CampaignStatus } from "../types";
import { statusColors } from "../utils";
import { useNavigate } from "react-router-dom";
import {
	updateCampaignMetadataAction,
	deleteCampaignAction,
	fetchCampaignById,
} from "../stores/campaign.metadata.store";
import { startCampaign, stopCampaign } from "../service";

interface CampaignListTableProps {
	campaigns: Campaign[];
}

export default function CampaignListTable({
	campaigns,
}: CampaignListTableProps) {
	const navigate = useNavigate();
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const [selectedId, setSelectedId] = React.useState<string | number | null>(
		null
	);

	const handleMenuOpen = (
		event: React.MouseEvent<HTMLElement>,
		id: string | number
	) => {
		setAnchorEl(event.currentTarget);
		setSelectedId(id);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
		setSelectedId(null);
	};

	const handleStart = async () => {
		if (selectedId) {
			try {
				await startCampaign(selectedId, true);
				// Refresh campaign list
				window.location.reload();
			} catch (error) {
				console.error("Failed to start campaign:", error);
			}
			handleMenuClose();
		}
	};

	const handleStop = async () => {
		if (selectedId) {
			try {
				await stopCampaign(selectedId);
				// Refresh campaign list
				window.location.reload();
			} catch (error) {
				console.error("Failed to stop campaign:", error);
			}
			handleMenuClose();
		}
	};

	const handleEdit = () => {
		if (selectedId) {
			navigate(`/campaigns/${selectedId}`);
			handleMenuClose();
		}
	};

	const handleDelete = async () => {
		if (selectedId) {
			if (window.confirm("Are you sure you want to delete this campaign?")) {
				await deleteCampaignAction(selectedId);
			}
			handleMenuClose();
		}
	};

	const selectedCampaign = campaigns.find((c) => c.id === selectedId);
	const canStart = selectedCampaign?.status === "draft" || selectedCampaign?.status === "scheduled";
	const canStop = selectedCampaign?.status === "sending";

	return (
		<>
			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Name</TableCell>
							<TableCell>Status</TableCell>
							<TableCell>Last edited</TableCell>
							<TableCell>Audience</TableCell>
							<TableCell>Scheduled time</TableCell>
							<TableCell>Stats</TableCell>
							<TableCell align="right">Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{campaigns.map((campaign) => (
							<TableRow
								key={campaign.id}
								hover
								sx={{ cursor: "pointer" }}
								onClick={() => navigate(`/campaigns/${campaign.id}`)}
							>
								<TableCell>{campaign.name}</TableCell>
								<TableCell>
									<Chip
										label={campaign.status}
										color={statusColors[campaign.status]}
										size="small"
									/>
								</TableCell>
								<TableCell>
									{campaign.lastEditedAt || campaign.updatedAt
										? new Date(campaign.lastEditedAt || campaign.updatedAt!).toLocaleString()
										: "Never"}
								</TableCell>
								<TableCell>
									{campaign.recipients && campaign.recipients.length > 0
										? `${campaign.recipients.length} list${campaign.recipients.length > 1 ? "s" : ""} / ${campaign.recipients.reduce((sum, r) => sum + (r.count || 0), 0)} recipients`
										: "No recipients"}
								</TableCell>
								<TableCell>
									{campaign.scheduledAt || campaign.scheduleAt
										? new Date(campaign.scheduledAt || campaign.scheduleAt!).toLocaleString()
										: "Not scheduled"}
								</TableCell>
								<TableCell>
									{campaign.stats && (
										<Box>
											Sent: {campaign.stats.sent} | Opened:{" "}
											{campaign.stats.opened} | Clicked:{" "}
											{campaign.stats.clicked}
										</Box>
									)}
								</TableCell>
								<TableCell
									align="right"
									onClick={(e) => e.stopPropagation()}
								>
									<IconButton
										size="small"
										onClick={(e) => handleMenuOpen(e, campaign.id)}
									>
										<MoreVert />
									</IconButton>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			<Menu
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={handleMenuClose}
			>
				<MenuItem onClick={handleEdit}>
					<Edit sx={{ mr: 1 }} />
					Edit
				</MenuItem>
				{canStart && (
					<MenuItem onClick={handleStart}>
						<PlayArrow sx={{ mr: 1 }} />
						Start
					</MenuItem>
				)}
				{canStop && (
					<MenuItem onClick={handleStop}>
						<Stop sx={{ mr: 1 }} />
						Pause
					</MenuItem>
				)}
				{/* TODO: Add duplicate and send test actions */}
				<MenuItem
					onClick={handleDelete}
					sx={{ color: "error.main" }}
				>
					<Delete sx={{ mr: 1 }} />
					Delete
				</MenuItem>
			</Menu>
		</>
	);
}
