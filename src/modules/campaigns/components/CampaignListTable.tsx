import React, { useState } from "react";
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
	Checkbox,
	Typography,
	Stack,
	Tooltip,
	TablePagination,
} from "@mui/material";
import {
	RocketLaunchOutlined,
	Block,
	BarChartOutlined,
	MoreHoriz,
	Edit,
	Delete,
	ContentCopy,
} from "@mui/icons-material";
import { Campaign } from "../types";
import { useNavigate } from "react-router-dom";
import {
	deleteCampaignAction,
	duplicateCampaignAction,
} from "../stores/campaign.metadata.store";
import { startCampaign, stopCampaign } from "../service";

interface CampaignListTableProps {
	campaigns: Campaign[];
}

export default function CampaignListTable({
	campaigns,
}: CampaignListTableProps) {
	const navigate = useNavigate();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [selectedId, setSelectedId] = useState<string | number | null>(null);
	const [selectedRows, setSelectedRows] = useState<(string | number)[]>([]);

	// Pagination state
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);

	const handleMenuOpen = (
		event: React.MouseEvent<HTMLElement>,
		id: string | number
	) => {
		event.stopPropagation();
		setAnchorEl(event.currentTarget);
		setSelectedId(id);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
		setSelectedId(null);
	};

	// Status Badge Styles
	const getStatusStyles = (status: string) => {
		switch (status) {
			case "running":
				return { bgcolor: "#0091FF", color: "white" };
			case "draft":
				return { bgcolor: "#F5F5F5", color: "rgba(0,0,0,0.87)" };
			case "finished":
				return { bgcolor: "#2FB344", color: "white" };
			case "scheduled":
				return { bgcolor: "#FF9100", color: "white" };
			case "cancelled":
				return { bgcolor: "#F44336", color: "white" };
			default:
				return { bgcolor: "#757575", color: "white" };
		}
	};

	const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.checked) {
			setSelectedRows(campaigns.map((c) => c.id));
		} else {
			setSelectedRows([]);
		}
	};

	const handleSelectRow = (
		event: React.ChangeEvent<HTMLInputElement>,
		id: string | number
	) => {
		event.stopPropagation();
		if (event.target.checked) {
			setSelectedRows((prev) => [...prev, id]);
		} else {
			setSelectedRows((prev) => prev.filter((rowId) => rowId !== id));
		}
	};

	const handleAction = async (
		e: React.MouseEvent,
		action: string,
		id: string | number
	) => {
		e.stopPropagation();
		try {
			if (action === "start") await startCampaign(id, true);
			if (action === "stop") await stopCampaign(id);
			if (action === "analytics") navigate(`/campaigns/${id}/analytics`);
			// Refresh list (simplified for now)
			window.location.reload();
		} catch (error) {
			console.error(`Failed to perform ${action}:`, error);
		}
	};

	const handleChangePage = (event: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const paginatedCampaigns = campaigns.slice(
		page * rowsPerPage,
		page * rowsPerPage + rowsPerPage
	);

	return (
		<>
			<TableContainer
				component={Paper}
				elevation={0}
				sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1 }}
			>
				<Table>
					<TableHead sx={{ bgcolor: "grey.50" }}>
						<TableRow>
							<TableCell padding="checkbox">
								<Checkbox
									indeterminate={
										selectedRows.length > 0 &&
										selectedRows.length < campaigns.length
									}
									checked={
										campaigns.length > 0 &&
										selectedRows.length === campaigns.length
									}
									onChange={handleSelectAll}
									size="small"
								/>
							</TableCell>
							<TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
							<TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
							<TableCell sx={{ fontWeight: 600 }}>Contacts</TableCell>
							<TableCell sx={{ fontWeight: 600 }}>Tags</TableCell>
							<TableCell sx={{ fontWeight: 600 }}>Timestamps</TableCell>
							<TableCell sx={{ fontWeight: 600 }}>Stats</TableCell>
							<TableCell
								sx={{ fontWeight: 600 }}
								align="right"
							>
								Action
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{paginatedCampaigns.map((campaign) => {
							const isSelected = selectedRows.includes(campaign.id);
							return (
								<TableRow
									key={campaign.id}
									hover
									selected={isSelected}
									sx={{ cursor: "pointer" }}
									onClick={() => navigate(`/campaigns/${campaign.id}`)}
								>
									<TableCell padding="checkbox">
										<Checkbox
											checked={isSelected}
											onChange={(e) => handleSelectRow(e, campaign.id)}
											size="small"
										/>
									</TableCell>
									<TableCell>
										<Box>
											<Typography
												variant="body2"
												sx={{ fontWeight: 600, color: "primary.main" }}
											>
												{campaign.name}
											</Typography>
											<Typography
												variant="caption"
												color="text.secondary"
												sx={{ display: "block" }}
											>
												{campaign.description}
											</Typography>
										</Box>
									</TableCell>
									<TableCell>
										<Chip
											label={
												campaign.status.charAt(0).toUpperCase() +
												campaign.status.slice(1)
											}
											size="small"
											sx={{
												...getStatusStyles(campaign.status),
												fontWeight: 500,
												borderRadius: "4px",
											}}
										/>
									</TableCell>
									<TableCell>
										<Typography
											variant="body2"
											color="text.secondary"
										>
											{campaign.recipients?.[0]?.name || "N/A"}
										</Typography>
									</TableCell>
									<TableCell>
										<Stack
											direction="row"
											spacing={0.5}
										>
											{campaign.tags?.slice(0, 2).map((tag) => (
												<Chip
													key={tag}
													label={tag}
													size="small"
													variant="outlined"
													sx={{
														borderRadius: "4px",
														height: 20,
														fontSize: "0.65rem",
													}}
												/>
											))}
											{campaign.tags && campaign.tags.length > 2 && (
												<Typography
													variant="caption"
													color="text.secondary"
												>
													+{campaign.tags.length - 2}
												</Typography>
											)}
										</Stack>
									</TableCell>
									<TableCell>
										<Box sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
											<Box>
												Created:{" "}
												{campaign.createdAt
													? new Date(campaign.createdAt).toLocaleDateString()
													: "-"}
											</Box>
											{campaign.startedAt && (
												<Box>
													Started:{" "}
													{new Date(campaign.startedAt).toLocaleDateString()}
												</Box>
											)}
										</Box>
									</TableCell>
									<TableCell>
										<Box sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
											<Box>
												Views: {campaign.stats?.opened.toLocaleString()}
											</Box>
											<Box>
												Clicks: {campaign.stats?.clicked.toLocaleString()}
											</Box>
											<Box>
												Sent: {campaign.stats?.sent}/{campaign.stats?.total}
											</Box>
											<Box>Bounces: {campaign.stats?.bounced}</Box>
										</Box>
									</TableCell>
									<TableCell align="right">
										<Stack
											direction="row"
											spacing={0.5}
											justifyContent="flex-end"
										>
											<Tooltip title="Start">
												<IconButton
													size="small"
													onClick={(e) => handleAction(e, "start", campaign.id)}
												>
													<RocketLaunchOutlined
														fontSize="small"
														color="primary"
													/>
												</IconButton>
											</Tooltip>
											<Tooltip title="Stop">
												<IconButton
													size="small"
													onClick={(e) => handleAction(e, "stop", campaign.id)}
												>
													<Block
														fontSize="small"
														sx={{ color: "error.light" }}
													/>
												</IconButton>
											</Tooltip>
											<Tooltip title="Analytics">
												<IconButton
													size="small"
													onClick={(e) =>
														handleAction(e, "analytics", campaign.id)
													}
												>
													<BarChartOutlined fontSize="small" />
												</IconButton>
											</Tooltip>
											<IconButton
												size="small"
												onClick={(e) => handleMenuOpen(e, campaign.id)}
											>
												<MoreHoriz fontSize="small" />
											</IconButton>
										</Stack>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
				<TablePagination
					rowsPerPageOptions={[10, 25, 50]}
					component="div"
					count={campaigns.length}
					rowsPerPage={rowsPerPage}
					page={page}
					onPageChange={handleChangePage}
					onRowsPerPageChange={handleChangeRowsPerPage}
				/>
			</TableContainer>

			<Menu
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={handleMenuClose}
			>
				<MenuItem
					onClick={() => {
						navigate(`/campaigns/${selectedId}`);
						handleMenuClose();
					}}
				>
					<Edit sx={{ mr: 1, fontSize: 20 }} /> Edit
				</MenuItem>
				<MenuItem
					onClick={() => {
						selectedId && duplicateCampaignAction(selectedId);
						handleMenuClose();
					}}
				>
					<ContentCopy sx={{ mr: 1, fontSize: 20 }} /> Duplicate
				</MenuItem>
				<MenuItem
					onClick={() => {
						selectedId && deleteCampaignAction(selectedId);
						handleMenuClose();
					}}
					sx={{ color: "error.main" }}
				>
					<Delete sx={{ mr: 1, fontSize: 20 }} /> Delete
				</MenuItem>
			</Menu>
		</>
	);
}
