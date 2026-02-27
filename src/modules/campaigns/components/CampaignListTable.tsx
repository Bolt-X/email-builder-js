import {
	Block,
	CloseOutlined,
	ContentCopy,
	DeleteOutlined,
	EditOutlined,
	LeaderboardOutlined,
	MoreHoriz,
	PreviewOutlined,
	RefreshOutlined,
	RocketLaunchOutlined,
} from "@mui/icons-material";
import {
	Box,
	Button,
	Checkbox,
	Chip,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	IconButton,
	Menu,
	MenuItem,
	Pagination,
	Paper,
	Select,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	Tooltip,
	Typography,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
	useDeleteCampaign,
	useDeleteMutipleCampaigns,
	useDuplicateCampaign,
	useUpdateCampaign,
	useUpdateMutipleCampaigns,
} from "../../../hooks/useCampaigns";
import { startCampaign, stopCampaign } from "../service";
import {
	deleteCampaignAction,
	duplicateCampaignAction,
	useVisibleColumns,
} from "../stores/campaign.metadata.store";
import { Campaign } from "../types";

interface CampaignListTableProps {
	campaigns: any[];
	loading: boolean;
}

const getStatusStyles = (status: string) => {
	switch (status) {
		case "running":
			return { bgcolor: "brand.primary.info", color: "white" };
		case "draft":
			return { bgcolor: "neutral.black.5", color: "neutral.black.100" };
		case "finished":
			return { bgcolor: "green.800", color: "white" };
		case "scheduled":
			return { bgcolor: "orange.800", color: "white" };
		case "cancelled":
			return { bgcolor: "info.error", color: "white" };
		default:
			return { bgcolor: "neutral.black.5", color: "neutral.black.100" };
	}
};

const ModalRenameCampaign = ({
	open,
	onClose,
	campaign,
}: {
	open: boolean;
	onClose: () => void;
	campaign: Campaign;
}) => {
	const { t } = useTranslation();
	const [newName, setNewName] = useState("");
	const { mutate: updateCampaignMutation } = useUpdateCampaign();
	const handleRename = async () => {
		delete campaign.fromAddress;
		updateCampaignMutation({
			slug: campaign?.slug,
			payload: { ...campaign, name: newName },
		});
		onClose();
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			fullWidth
			maxWidth="sm"
		>
			<Box
				py={2}
				pl={3}
				pr={2}
				display={"flex"}
				flexDirection="row"
				justifyContent="space-between"
				alignItems="center"
				sx={{ borderBottom: "1px solid #E5E7EB" }}
			>
				<Typography
					variant="h6"
					fontWeight={600}
				>
					{t("campaigns.rename_title")}
				</Typography>
				<IconButton onClick={onClose}>
					<CloseOutlined />
				</IconButton>
			</Box>

			<DialogContent sx={{ px: 3, pt: 3 }}>
				<TextField
					label={t("common.name")}
					fullWidth
					size="small"
					value={newName}
					onChange={(e) => setNewName(e.target.value)}
				/>
			</DialogContent>

			<DialogActions sx={{ px: 3, pb: 2 }}>
				<Button
					onClick={onClose}
					color="inherit"
				>
					{t("common.cancel")}
				</Button>
				<Button
					variant="contained"
					onClick={handleRename}
					disabled={!newName.trim()}
				>
					{t("common.rename")}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

const ModalDeleteCampaign = ({
	open,
	onClose,
	campaigns,
}: {
	open: boolean;
	onClose: () => void;
	campaigns: Campaign[];
}) => {
	const { t } = useTranslation();
	const mutateDeleteMutiple = useDeleteMutipleCampaigns();
	const mutateUpdateMutipleCampaigns = useUpdateMutipleCampaigns();

	const [listCampaigns, setListCampaigns] = useState<any[]>(campaigns);

	useEffect(() => {
		setListCampaigns(campaigns);
	}, [campaigns]);

	const handleDelete = async () => {
		if (campaigns.length === 1) {
			const campaign = await mutateUpdateMutipleCampaigns.mutateAsync({
				ids: [campaigns[0].slug],
				payload: { status: "finished" },
			});
			if (campaign[0].status === "finished") {
				mutateDeleteMutiple.mutate(campaigns.map((c) => c.slug));
			}
		} else {
			const campaigns = await mutateUpdateMutipleCampaigns.mutateAsync({
				ids: listCampaigns?.map((c) => c.slug) as string[],
				payload: { status: "finished" },
			});
			const isAllFinished =
				campaigns?.length > 0 &&
				campaigns.every((campaign) => campaign.status === "finished");
			if (isAllFinished) {
				mutateDeleteMutiple.mutate(campaigns.map((c) => c.slug));
			}
		}
		onClose();
	};

	const handleRomoveCampaignInList = (slug: string) => {
		setListCampaigns(listCampaigns.filter((c) => c.slug !== slug));
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			fullWidth
			maxWidth="sm"
		>
			<Stack
				px={3}
				py={2}
				direction="row"
				justifyContent="space-between"
				alignItems="center"
				sx={{ borderBottom: "1px solid #E5E7EB" }}
			>
				<Typography variant="h6">{t("campaigns.delete_title")}</Typography>
				<IconButton onClick={onClose}>
					<CloseOutlined />
				</IconButton>
			</Stack>
			<DialogContent>
				<Typography variant="body1">
					{t("campaigns.delete_confirm", { count: listCampaigns?.length ?? 0 })}
					<br />
					{t("common.undo_action")}
				</Typography>
				<TableContainer
					sx={{ border: "1px solid #E5E7EB", mt: 2, borderRadius: "4px" }}
				>
					<Table>
						<TableHead
							sx={{ bgColor: "#FAFAFA", maxHeight: "480px", overflowY: "auto" }}
						>
							<TableRow>
								<TableCell>{t("common.name")}</TableCell>
								<TableCell align="right">{t("common.status")}</TableCell>
								<TableCell align="right">{t("common.actions")}</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{listCampaigns?.map((campaign) => (
								<TableRow key={campaign.slug}>
									<TableCell align="left">
										<Typography
											variant="body2"
											sx={{ fontWeight: 600, color: "brand.primary.600" }}
										>
											{campaign.name}
										</Typography>
										<Typography
											variant="caption"
											sx={{ display: "block", color: "neutral.black.60" }}
										>
											{campaign.description}
										</Typography>
									</TableCell>
									<TableCell align="right">
										<Chip
											label={t(`campaigns.status.${campaign.status}`)}
											size="small"
											sx={{ ...getStatusStyles(campaign.status) }}
										/>
									</TableCell>
									<TableCell align="right">
										<IconButton
											onClick={() => handleRomoveCampaignInList(campaign.slug)}
										>
											<DeleteOutlined />
										</IconButton>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			</DialogContent>
			<DialogActions sx={{ px: 3, pb: 2 }}>
				<Button
					onClick={onClose}
					color="inherit"
					variant="outlined"
				>
					{t("common.cancel")}
				</Button>
				<Button
					onClick={handleDelete}
					color="error"
					variant="contained"
				>
					{t("common.delete")}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

const ModalConfirmStart = ({
	open,
	onClose,
	onConfirm,
	campaignName,
}: {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
	campaignName: string;
}) => {
	const { t } = useTranslation();
	return (
		<Dialog
			open={open}
			onClose={onClose}
			fullWidth
			maxWidth="sm"
		>
			<Box p={3}>
				<Typography
					variant="h6"
					mb={2}
				>
					{t("campaigns.start_title", "Start Campaign")}
				</Typography>
				<Typography
					variant="body1"
					mb={3}
				>
					{t("campaigns.start_confirm", {
						defaultValue: `Are you sure you want to start campaign "${campaignName}"?`,
						name: campaignName,
					})}
				</Typography>
				<Stack
					direction="row"
					spacing={2}
					justifyContent="flex-end"
				>
					<Button
						onClick={onClose}
						variant="outlined"
					>
						{t("common.cancel")}
					</Button>
					<Button
						onClick={onConfirm}
						variant="contained"
						color="primary"
					>
						{t("common.start", "Start Immediately")}
					</Button>
				</Stack>
			</Box>
		</Dialog>
	);
};

export default function CampaignListTable({
	campaigns,
	loading,
}: CampaignListTableProps) {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const visibleColumns = useVisibleColumns();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [selectedRows, setSelectedRows] = useState<string[]>([]);
	const [menuCampaign, setMenuCampaign] = useState<Campaign | null>(null);
	const [openModalDelete, setOpenModalDelete] = useState(false);
	//Modal action state
	const [openModalRename, setOpenModalRename] = useState(false);
	const [openModalStart, setOpenModalStart] = useState(false);
	const [campaignModal, setCampaignModal] = useState<any | null>(null);

	const { mutate: deleteCampaign } = useDeleteCampaign();
	const { mutate: duplicateCampaign } = useDuplicateCampaign();

	const handleStartCampaign = async () => {
		if (!campaignModal) return;
		try {
			await startCampaign(campaignModal.slug, true);
			setOpenModalStart(false);
			window.location.reload();
		} catch (error) {
			console.error("Failed to start campaign:", error);
		}
	};

	// Pagination state
	const [page, setPage] = useState(1);
	const [rowsPerPage, setRowsPerPage] = useState(10);

	// Reset page when campaigns list changes (filters applied)
	React.useEffect(() => {
		setPage(1);
	}, [campaigns]);

	const handleMenuOpen = (
		event: React.MouseEvent<HTMLElement>,
		id: string,
		campaign: Campaign,
	) => {
		event.stopPropagation();
		setAnchorEl(event.currentTarget);
		setSelectedId(id);
		setMenuCampaign(campaign);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
		setSelectedId(null);
		setMenuCampaign(null);
	};

	// Status Badge Styles

	const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
		const visibleCampaignIds = visibleCampaigns.map((c) => c.slug);
		if (event.target.checked) {
			// Add all visible campaigns to selection (avoid duplicates)
			setSelectedRows((prev) => {
				const newSelection = [...prev];
				visibleCampaignIds.forEach((slug) => {
					if (!newSelection.includes(slug)) {
						newSelection.push(slug);
					}
				});
				return newSelection;
			});
		} else {
			// Remove only visible campaigns from selection
			setSelectedRows((prev) =>
				prev.filter((slug) => !visibleCampaignIds.includes(slug)),
			);
		}
	};

	const handleSelectAllButton = () => {
		const visibleCampaignIds = visibleCampaigns.map((c) => c.slug);
		const allVisibleSelected = visibleCampaignIds.every((slug) =>
			selectedRows.includes(slug),
		);

		if (allVisibleSelected) {
			// Deselect all visible campaigns
			setSelectedRows((prev) =>
				prev.filter((slug) => !visibleCampaignIds.includes(slug)),
			);
		} else {
			// Select all visible campaigns (avoid duplicates)
			setSelectedRows((prev) => {
				const newSelection = [...prev];
				visibleCampaignIds.forEach((slug) => {
					if (!newSelection.includes(slug)) {
						newSelection.push(slug);
					}
				});
				return newSelection;
			});
		}
	};

	const handleSelectRow = (
		event: React.ChangeEvent<HTMLInputElement>,
		slug: string,
	) => {
		event.stopPropagation();
		if (event.target.checked) {
			setSelectedRows((prev) => [...prev, slug]);
		} else {
			setSelectedRows((prev) => prev.filter((rowSlug) => rowSlug !== slug));
		}
	};

	const handleCancelSelection = () => {
		setSelectedRows([]);
	};

	const handleBulkRename = (campaign: Campaign) => {
		setCampaignModal(campaign);
		setOpenModalRename(true);
	};

	const handleBulkDeleteModal = (campaigns: any[]) => {
		setOpenModalDelete(true);
		setCampaignModal(campaigns);
	};

	const handleAction = async (
		e: React.MouseEvent,
		action: string,
		slug: string,
	) => {
		e.stopPropagation();
		try {
			if (action === "start") {
				const campaign = campaigns.find((c) => c.slug === slug);
				if (campaign) {
					setCampaignModal(campaign);
					setOpenModalStart(true);
				}
			}
			if (action === "stop") await stopCampaign(slug);
			if (action === "analytics") navigate(`/campaigns/${slug}/analytics`);
			if (action !== "start") window.location.reload();
		} catch (error) {
			console.error(`Failed to perform ${action}:`, error);
		}
	};

	const start = (page - 1) * rowsPerPage;
	const end = start + rowsPerPage;

	const visibleCampaigns = campaigns.slice(start, end);

	// Calculate selection state for current page
	const visibleCampaignIds = visibleCampaigns.map((c) => c.slug);
	const selectedVisibleCount = visibleCampaignIds.filter((slug) =>
		selectedRows.includes(slug),
	).length;
	const allVisibleSelected =
		visibleCampaigns.length > 0 &&
		selectedVisibleCount === visibleCampaigns.length;
	const someVisibleSelected =
		selectedVisibleCount > 0 && selectedVisibleCount < visibleCampaigns.length;

	// Refs for selection bar and pagination
	const selectionBarRef = useRef<HTMLDivElement>(null);
	const paginationRef = useRef<HTMLDivElement>(null);

	return (
		<Box
			sx={{
				p: 0,
				height: "calc(100vh - 144px)", // 64 (header) + 80 (filter)
				position: "relative",
			}}
		>
			{/* Modal Rename Campaign */}
			{openModalRename && (
				<ModalRenameCampaign
					open={openModalRename}
					onClose={() => setOpenModalRename(false)}
					campaign={campaignModal}
				/>
			)}
			{/* Modal Delete Campaign */}
			{openModalDelete && (
				<ModalDeleteCampaign
					open={openModalDelete}
					onClose={() => setOpenModalDelete(false)}
					campaigns={campaignModal}
				/>
			)}
			{openModalStart && (
				<ModalConfirmStart
					open={openModalStart}
					onClose={() => setOpenModalStart(false)}
					onConfirm={handleStartCampaign}
					campaignName={campaignModal?.name || ""}
				/>
			)}
			{/* Selection Bar */}
			{selectedRows.length > 0 && (
				<Box
					ref={selectionBarRef}
					sx={{
						bgcolor: "brand.primary.600",
						color: "white",
						px: 3,
						py: 1.5,
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						flexShrink: 0,
					}}
				>
					<Stack
						direction="row"
						spacing={2}
						alignItems="center"
					>
						<Typography
							variant="body2"
							sx={{ fontWeight: 500 }}
						>
							{selectedRows.length}{" "}
							{selectedRows.length > 1
								? t("campaigns.items")
								: t("campaigns.items").slice(0, -1)}{" "}
							{t("campaigns.selected")}
						</Typography>
						<Button
							size="small"
							onClick={handleSelectAllButton}
							sx={{
								color: "white",
								textTransform: "none",
								fontWeight: 500,
								"&:hover": {
									bgcolor: "brand.primary.100",
									color: "brand.primary.600",
								},
							}}
						>
							{t("common.select_all")}
						</Button>
					</Stack>
					<Stack
						direction="row"
						spacing={2}
						alignItems="center"
					>
						{selectedRows.length === 1 && (
							<Button
								size="small"
								startIcon={<EditOutlined sx={{ fontSize: 18 }} />}
								onClick={() =>
									handleBulkRename(
										campaigns.find((c) => c.slug === selectedRows[0]) || null,
									)
								}
								sx={{
									color: "white",
									textTransform: "none",
									fontWeight: 500,
									"&:hover": {
										bgcolor: "brand.primary.100",
										color: "brand.primary.600",
									},
								}}
							>
								{t("common.rename")}
							</Button>
						)}
						<Button
							size="small"
							startIcon={<DeleteOutlined sx={{ fontSize: 18 }} />}
							onClick={() =>
								handleBulkDeleteModal(
									campaigns.filter((c) => selectedRows.includes(c.slug)),
								)
							}
							sx={{
								color: "white",
								textTransform: "none",
								fontWeight: 500,
								"&:hover": {
									bgcolor: "brand.primary.100",
									color: "brand.primary.600",
								},
							}}
						>
							{t("common.delete")}
						</Button>
						<Button
							size="small"
							onClick={handleCancelSelection}
							sx={{
								color: "white",
								textTransform: "none",
								fontWeight: 500,
								"&:hover": {
									bgcolor: "brand.primary.100",
									color: "brand.primary.600",
								},
							}}
						>
							{t("common.cancel")}
						</Button>
					</Stack>
				</Box>
			)}
			<TableContainer
				component={Paper}
				elevation={0}
				sx={{
					height: "100%",
					overflow: "auto",
					border: "none",
					borderRadius: 0,
					m: 0,
					p: 0,

					"&::-webkit-scrollbar-button": {
						display: "none",
					},
					"&::-webkit-scrollbar": {
						width: "8px",
						height: "8px",
					},
					"&::-webkit-scrollbar-thumb": {
						backgroundColor: "rgba(0, 0, 0, 0.3)",
						borderRadius: "4px",
					},
					"&::-webkit-scrollbar-track": {
						backgroundColor: "transparent",
					},
				}}
			>
				<Table stickyHeader>
					<TableHead sx={{ bgcolor: "action.hover" }}>
						<TableRow>
							<TableCell
								padding="checkbox"
								sx={{ paddingX: 3 }}
							>
								<Checkbox
									indeterminate={someVisibleSelected}
									checked={allVisibleSelected}
									onChange={handleSelectAll}
									size="small"
								/>
							</TableCell>
							<TableCell sx={{ fontWeight: 600 }}>
								{t("campaigns.columns.name")}
							</TableCell>
							{visibleColumns.includes("status") && (
								<TableCell sx={{ fontWeight: 600 }}>
									{t("campaigns.columns.status")}
								</TableCell>
							)}
							{visibleColumns.includes("contacts") && (
								<TableCell sx={{ fontWeight: 600 }}>
									{t("campaigns.columns.contacts")}
								</TableCell>
							)}
							{visibleColumns.includes("tags") && (
								<TableCell sx={{ fontWeight: 600 }}>
									{t("campaigns.columns.tags")}
								</TableCell>
							)}
							{visibleColumns.includes("timestamps") && (
								<TableCell sx={{ fontWeight: 600 }}>
									{t("campaigns.columns.timestamps")}
								</TableCell>
							)}
							{visibleColumns.includes("stats") && (
								<TableCell sx={{ fontWeight: 600 }}>
									{t("campaigns.columns.stats")}
								</TableCell>
							)}
							<TableCell
								sx={{ fontWeight: 600, paddingX: 3 }}
								align="right"
							>
								{t("campaigns.columns.actions")}
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody sx={{ opacity: loading ? 0.5 : 1 }}>
						{loading && (
							<Box
								sx={{
									position: "absolute",
									top: "50%",
									left: "50%",
									transform: "translate(-50%, -50%)",
									zIndex: 10,
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
									gap: 1,
								}}
							>
								<CircularProgress
									size={40}
									thickness={4}
								/>
								<Typography
									variant="caption"
									sx={{ fontWeight: 600, color: "text.secondary" }}
								>
									{t("campaigns.loading_data")}
								</Typography>
							</Box>
						)}
						{!loading && visibleCampaigns.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={visibleColumns.length + 2} // +2 for checkbox and action columns
									sx={{ textAlign: "center", py: 10 }}
								>
									<Typography
										variant="body2"
										color="text.secondary"
									>
										{t("campaigns.no_results")}
									</Typography>
								</TableCell>
							</TableRow>
						) : (
							visibleCampaigns.map((campaign) => {
								const isSelected = selectedRows.includes(campaign.slug);
								const isDisabledStart =
									campaign.status === "running" ||
									campaign.status === "cancelled" ||
									campaign.status === "finished";
								const isDisabledStop =
									campaign.status === "draft" ||
									campaign.status === "finished" ||
									campaign.status === "scheduled";
								const isDisabledAnalytics =
									campaign.status === "draft" ||
									campaign.status === "running" ||
									campaign.status === "scheduled";

								return (
									<TableRow
										key={campaign.slug}
										hover
										selected={isSelected}
										sx={{ cursor: "pointer" }}
										onClick={(e) => {
											navigate(`/campaigns/${campaign.slug}`);
										}}
									>
										<TableCell
											padding="checkbox"
											sx={{ paddingX: 3 }}
										>
											<Checkbox
												checked={isSelected}
												onClick={(e) => {
													e.stopPropagation();
												}}
												onChange={(e) => {
													handleSelectRow(e, campaign.slug);
												}}
												size="small"
											/>
										</TableCell>
										<TableCell>
											<Box>
												<Typography
													variant="body2"
													sx={{ fontWeight: 600, color: "brand.primary.600" }}
												>
													{campaign.name}
												</Typography>
												<Typography
													variant="caption"
													color="text.secondary"
													sx={{ display: "block", color: "neutral.black.60" }}
												>
													{campaign.description}
												</Typography>
											</Box>
										</TableCell>
										{visibleColumns.includes("status") && (
											<TableCell>
												<Chip
													label={
														<Stack
															direction="row"
															spacing={0.5}
															alignItems="center"
														>
															<Typography
																variant="body2"
																color={
																	campaign.status === "draft"
																		? "neutral.black.100"
																		: "white"
																}
																sx={{ fontWeight: 600 }}
															>
																{t(`campaigns.status.${campaign.status}`)}
															</Typography>
															{campaign.status === "running" && (
																<Typography
																	variant="body2"
																	color="white"
																>
																	<RefreshOutlined fontSize="small" />
																</Typography>
															)}
														</Stack>
													}
													size="small"
													sx={{
														...getStatusStyles(campaign.status),
														fontWeight: 500,
														borderRadius: "4px",
													}}
												/>
											</TableCell>
										)}
										{visibleColumns.includes("contacts") && (
											<TableCell>
												{campaign.subscribers &&
													campaign.subscribers.length > 0 && (
														<Stack
															direction="row"
															spacing={1}
															flexWrap="wrap"
														>
															{campaign.subscribers
																.slice(0, 2)
																.map((sub: any, idx: number) => (
																	<Chip
																		key={idx}
																		label={sub.name || sub.id}
																		size="small"
																		variant="outlined"
																	/>
																))}
															{campaign.subscribers.length > 2 && (
																<Chip
																	label={`+${campaign.subscribers.length - 2}`}
																	size="small"
																	variant="outlined"
																/>
															)}
														</Stack>
													)}
											</TableCell>
										)}

										{visibleColumns.includes("tags") && (
											<TableCell>
												<Stack
													direction="row"
													spacing={0.5}
												>
													{campaign.tags?.slice(0, 2).map((tag: any) => (
														<Chip
															key={tag.slug || tag}
															label={tag.title || tag}
															size="small"
															variant="outlined"
															sx={{
																borderRadius: "4px",
																height: 20,
																fontSize: "0.65rem",
																backgroundColor: "neutral.black.10",
																color: "neutral.black.80",
																border: "none",
															}}
														/>
													))}
													{campaign.tags && campaign.tags.length > 2 && (
														<Typography
															variant="caption"
															color="neutral.black.80"
														>
															+{campaign.tags.length - 2}
														</Typography>
													)}
												</Stack>
											</TableCell>
										)}
										{visibleColumns.includes("timestamps") && (
											<TableCell>
												<Stack>
													<Typography
														variant="caption"
														color="text.primary"
													>
														Create:{" "}
														{campaign.date_created
															? new Date(
																	campaign.date_created,
																).toLocaleDateString()
															: "-"}
													</Typography>
													<Typography
														variant="caption"
														color="text.secondary"
													>
														Update:{" "}
														{campaign.date_updated
															? new Date(
																	campaign.date_updated,
																).toLocaleDateString()
															: "-"}
													</Typography>
												</Stack>
											</TableCell>
										)}
										{visibleColumns.includes("stats") && (
											<TableCell>
												<Box
													sx={{
														display: "grid",
														gridTemplateColumns: "1fr 1fr",
														gap: 1,
														fontSize: "0.75rem",
														color: "neutral.black.60",
													}}
												>
													<Box
														display="flex"
														flexDirection="row"
														gap={1}
													>
														{t("campaigns.stats_lbl.views")}
														<Typography
															variant="body2"
															color="neutral.black.80"
														>
															{campaign.stats?.opened.toLocaleString()}
														</Typography>
													</Box>
													<Box
														display="flex"
														flexDirection="row"
														gap={1}
													>
														{t("campaigns.stats_lbl.clicks")}
														<Typography
															variant="body2"
															color="neutral.black.80"
														>
															{campaign.stats?.clicked.toLocaleString()}
														</Typography>
													</Box>
													<Box
														display="flex"
														flexDirection="row"
														gap={1}
													>
														{t("campaigns.stats_lbl.sent")}
														<Typography
															variant="body2"
															color="neutral.black.80"
														>
															{campaign.stats?.sent}/{campaign.stats?.total}
														</Typography>
													</Box>
													<Box
														display="flex"
														flexDirection="row"
														gap={1}
													>
														{t("campaigns.stats_lbl.bounces")}
														<Typography
															variant="body2"
															color="neutral.black.80"
														>
															{campaign.stats?.bounced}
														</Typography>
													</Box>
												</Box>
											</TableCell>
										)}
										<TableCell
											align="right"
											sx={{ paddingX: 3 }}
										>
											<Stack
												direction="row"
												spacing={0.5}
												justifyContent="flex-end"
												onClick={(e) => e.stopPropagation()}
											>
												<Tooltip title={t("campaigns.start")}>
													<span>
														<IconButton
															size="small"
															onClick={(e) =>
																handleAction(e, "start", campaign.slug)
															}
															disabled={isDisabledStart}
														>
															<RocketLaunchOutlined
																fontSize="small"
																sx={{
																	color: isDisabledStart
																		? "neutral.black.20"
																		: "neutral.black.60",
																	"&:hover": { color: "primary.main" },
																}}
															/>
														</IconButton>
													</span>
												</Tooltip>
												<Tooltip title={t("campaigns.stop")}>
													<span>
														<IconButton
															size="small"
															onClick={(e) =>
																handleAction(e, "stop", campaign.slug)
															}
															disabled={isDisabledStop}
															sx={{
																"&:hover": { backgroundColor: "error.50" },
															}}
														>
															<Block
																fontSize="small"
																sx={{
																	color: isDisabledStop
																		? "neutral.black.20"
																		: "neutral.black.60",
																	"&:hover": { color: "error.600" },
																}}
															/>
														</IconButton>
													</span>
												</Tooltip>
												<Tooltip title={t("campaigns.preview")}>
													<IconButton
														size="small"
														onClick={(e) =>
															handleAction(e, "analytics", campaign.slug)
														}
													>
														<PreviewOutlined fontSize="small" />
													</IconButton>
												</Tooltip>
												<IconButton
													size="small"
													onClick={(e) =>
														handleMenuOpen(e, campaign.slug, campaign)
													}
												>
													<MoreHoriz fontSize="small" />
												</IconButton>
											</Stack>
										</TableCell>
										<Menu
											anchorEl={anchorEl}
											open={Boolean(anchorEl)}
											onClose={handleMenuClose}
											onClick={(e) => e.stopPropagation()}
										>
											<MenuItem
												onClick={() => {
													selectedId && duplicateCampaign(selectedId);
													handleMenuClose();
												}}
											>
												<ContentCopy
													sx={{
														mr: 1,
														fontSize: 20,
														color: "neutral.black.60",
													}}
												/>{" "}
												{t("campaigns.duplicate")}
											</MenuItem>
											<MenuItem
												onClick={() => {
													navigate(`/campaigns/${selectedId}`);
													handleMenuClose();
												}}
												sx={{
													color: isDisabledAnalytics
														? "neutral.black.20"
														: "neutral.black.60",
												}}
												disabled={isDisabledAnalytics}
											>
												<LeaderboardOutlined
													sx={{
														mr: 1,
														fontSize: 20,
														color: isDisabledAnalytics
															? "neutral.black.20"
															: "neutral.black.60",
													}}
												/>{" "}
												{t("campaigns.analytics")}
											</MenuItem>
											<MenuItem
												onClick={() => {
													selectedId && deleteCampaign(selectedId);
													handleMenuClose();
												}}
												sx={{
													color:
														menuCampaign?.status === "running"
															? "neutral.black.20"
															: "error.600",
												}}
												disabled={menuCampaign?.status === "running"}
											>
												<DeleteOutlined
													sx={{
														mr: 1,
														fontSize: 20,
														color:
															menuCampaign?.status === "running"
																? "neutral.black.20"
																: "error.600",
													}}
												/>{" "}
												{t("common.delete")}
											</MenuItem>
										</Menu>
									</TableRow>
								);
							})
						)}
					</TableBody>
				</Table>
			</TableContainer>
			<Box
				ref={paginationRef}
				display="flex"
				justifyContent="space-between"
				alignItems="center"
				sx={{
					backgroundColor: "background.paper",
					borderTop: "1px solid",
					borderColor: "divider",
					paddingY: 1,
					paddingX: 3,
					flexShrink: 0,
					// boxShadow: "0 -2px 10px rgba(0,0,0,0.05)",
				}}
			>
				{/* Rows per page */}
				<Stack
					direction="row"
					alignItems="center"
				>
					<Typography
						variant="body2"
						sx={{ marginTop: 0 }}
					>
						{t("campaigns.rows_per_page")}
					</Typography>
					<Select
						size="small"
						value={rowsPerPage}
						onChange={(e) => {
							setRowsPerPage(Number(e.target.value));
							setPage(1); // reset về page 1
						}}
						sx={{
							m: 0,
							p: 0,
							"& .MuiOutlinedInput-notchedOutline": {
								border: "none",
							},
							"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
								border: "none", // Removes the border when focused
							},
							// Optionally, remove box shadow on focus
							boxShadow: "none",
						}}
					>
						{[10, 25, 50].map((size) => (
							<MenuItem
								key={size}
								value={size}
							>
								{size}
							</MenuItem>
						))}
					</Select>
				</Stack>

				{/* Pagination */}
				<Pagination
					count={Math.ceil(campaigns.length / rowsPerPage)}
					page={page}
					onChange={(_, value) => setPage(value)}
					boundaryCount={2}
					sx={{ m: 0 }}
				/>
			</Box>
		</Box>
	);
}
