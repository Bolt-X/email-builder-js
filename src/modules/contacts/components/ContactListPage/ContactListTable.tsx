import {
	Campaign,
	ContentCopy,
	Delete,
	Edit,
	GetApp,
	MoreVert,
	PostAdd,
	Search,
	Settings,
	Send,
} from "@mui/icons-material";
import {
	Box,
	Button,
	Checkbox,
	Divider,
	FormControlLabel,
	IconButton,
	InputAdornment,
	Menu,
	MenuItem,
	Paper,
	Popover,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TablePagination,
	TableRow,
	TextField,
	Toolbar,
	Tooltip,
	Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	useDeleteContactList,
	useGetAllContactLists,
} from "../../../../hooks/useContactLists";
import {
	clearSelection,
	exportContactListAction,
	selectAllContactLists,
	setPage,
	setRowsPerPage,
	setSearchQuery,
	setSort,
	toggleContactListEnabled,
	toggleSelectContactList,
	useContactListFilters,
	useContactListPagination,
	useSelectedContactLists,
	useVisibleColumns,
	setVisibleColumns,
} from "../../stores/contactList.store";
import { ContactList } from "../../types";
import { downloadContactListAsCSV } from "../../service";
import { useTranslation } from "react-i18next";
import ModalCustomDelete from "../base/ModalCustomDelete";
import ModalDuplicate from "./ModalDuplicate";
import CampaignSelectorModal from "../CampaignSelectorModal";

interface ContactListTableProps {
	formDrawerOpen: boolean;
	setFormDrawerOpen: (open: boolean) => void;
	formMode: "create" | "edit";
	setFormMode: (mode: "create" | "edit") => void;
	editingList: ContactList | null;
	setEditingList: (list: ContactList | null) => void;
	onEdit: (list: ContactList) => void;
}

export default function ContactListTable({
	formDrawerOpen,
	setFormDrawerOpen,
	formMode,
	setFormMode,
	editingList,
	setEditingList,
	onEdit,
}: ContactListTableProps) {
	const { mutateAsync: deleteContactList, isPending: isDeleting } =
		useDeleteContactList();
	const navigate = useNavigate();
	const { t } = useTranslation();
	const visibleColumns = useVisibleColumns();
	const [startDate, setStartDate] = useState<undefined | string>(undefined);
	const [endDate, setEndDate] = useState<undefined | string>(undefined);

	const { searchQuery, sortBy, sortOrder } = useContactListFilters();
	const { page: currentPage, rowsPerPage: currentRowsPerPage } =
		useContactListPagination();
	const selectedIds = useSelectedContactLists();

	const [dateAnchorEl, setDateAnchorEl] = useState<HTMLButtonElement | null>(
		null,
	);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [openModalDuplicate, setOpenModalDuplicate] = useState(false);
	const [openCampaignSelector, setOpenCampaignSelector] = useState(false);
	const [campaignSelected, setCampaignSelected] = useState<string | null>(null);
	const [filtered, setFiltered] = useState({
		from: undefined,
		to: undefined,
		searchText: undefined,
	});

	const [confirmDelete, setConfirmDelete] = useState(false);

	const handleFiltered = () => {
		setFiltered({
			from: startDate,
			to: endDate,
			searchText: searchQuery,
		});
		setDateAnchorEl(null);
	};

	const handleClearFilter = () => {
		setFiltered({
			from: undefined,
			to: undefined,
			searchText: undefined,
		});
		setStartDate(undefined);
		setEndDate(undefined);
		setDateAnchorEl(null);
	};

	const { data: contactLists, refetch } = useGetAllContactLists(
		filtered.from,
		filtered.to,
		filtered.searchText,
	);

	const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, id: string) => {
		setAnchorEl(event.currentTarget);
		setSelectedId(id);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
		// setSelectedId(null);
	};

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(e.target.value);
	};

	const handleSortChange = (newSortBy: typeof sortBy) => {
		setSort(newSortBy);
	};

	const handleEditAction = () => {
		if (selectedId) {
			const list = contactLists?.find((l) => l.slug === selectedId);
			if (list) {
				onEdit(list);
			}
		}
		handleMenuClose();
	};

	const handleDuplicate = async () => {
		if (selectedId) {
			handleMenuClose();
			setOpenModalDuplicate(true);
		}
	};

	const handleSendCampaign = (selectedId?: string) => {
		setCampaignSelected(selectedId || null);
		setOpenCampaignSelector(true);
	};

	const handleCampaignSelect = (campaignSlug: string) => {
		const queryParams = new URLSearchParams();
		if (selectedIds.length > 0) {
			queryParams.set("contact-list", selectedIds.join(","));
		}
		if (campaignSelected) {
			queryParams.set("contact-list", campaignSelected);
		}
		navigate(`/campaigns/${campaignSlug}?${queryParams.toString()}`);
	};

	const handleDelete = async () => {
		try {
			if (selectedIds.length > 0) {
				await deleteContactList(selectedIds as string[]);
			} else {
				await deleteContactList([selectedId as string]);
			}
			clearSelection();
		} catch (error) {
			console.error("Failed to delete contact list:", error);
		} finally {
			handleMenuClose();
			setConfirmDelete(false);
		}
	};

	const handleToggleEnabled = async () => {
		if (selectedId) {
			try {
				await toggleContactListEnabled(selectedId);
				handleMenuClose();
			} catch (error) {
				console.error("Failed to toggle enabled:", error);
			}
		}
	};

	const handleExport = async () => {
		if (selectedId) {
			try {
				await exportContactListAction(selectedId);
				handleMenuClose();
			} catch (error) {
				console.error("Failed to export list:", error);
			}
		}
	};

	const handleColumnToggle = (column: string) => {
		if (visibleColumns.includes(column)) {
			setVisibleColumns(visibleColumns.filter((c) => c !== column));
		} else {
			setVisibleColumns([...visibleColumns, column]);
		}
	};

	const selectedList = contactLists?.find((l) => l.slug === selectedId);
	const isAllSelected =
		contactLists?.length > 0 && selectedIds.length === contactLists?.length;
	const isIndeterminate =
		selectedIds.length > 0 && selectedIds.length < contactLists?.length;

	const [columnAnchorEl, setColumnAnchorEl] = useState<null | HTMLElement>(
		null,
	);

	const isBatchMode = selectedIds.length > 0;

	const handleDownload = async () => {
		if (selectedIds.length > 0) {
			try {
				// Download từng file CSV cho mỗi contact list được chọn
				for (const slug of selectedIds) {
					await downloadContactListAsCSV(slug as string);
					// Thêm delay nhỏ giữa các lần download để tránh browser block
					await new Promise((resolve) => setTimeout(resolve, 300));
				}
			} catch (error) {
				console.error("Failed to download contact lists:", error);
			}
		}
	};

	return (
		<>
			<ModalDuplicate
				open={openModalDuplicate}
				onClose={() => {
					setOpenModalDuplicate(false);
					setSelectedId(null);
				}}
				slug={selectedId}
			/>
			<CampaignSelectorModal
				open={openCampaignSelector}
				onClose={() => setOpenCampaignSelector(false)}
				onSelect={handleCampaignSelect}
			/>
			<ModalCustomDelete
				open={confirmDelete}
				isPending={isDeleting}
				onClose={() => setConfirmDelete(false)}
				onOk={handleDelete}
				title="Delete Contact List"
				content={
					<Typography>
						Are you sure you want to delete{" "}
						{selectedIds.length > 1
							? `${selectedIds.length} items`
							: "this item"}
						? You won't be able to undo this action.
					</Typography>
				}
			/>
			{/* Toolbar / Batch Action Bar */}
			<Paper
				elevation={0}
				sx={{
					bgcolor: isBatchMode ? "primary.main" : "background.paper",
					borderBottom: 1,
					borderColor: "divider",
					borderRadius: 0,
					overflow: "hidden",
					minHeight: 80,
					display: "flex",
					alignItems: "center",
					transition: "all 0.3s ease",
				}}
			>
				{isBatchMode ? (
					<Stack
						direction="row"
						alignItems="center"
						sx={{ width: "100%", px: 3, color: "white" }}
						justifyContent="space-between"
					>
						<Stack
							direction="row"
							spacing={3}
							alignItems="center"
						>
							<Typography
								variant="body2"
								sx={{ fontWeight: 600 }}
							>
								{selectedIds.length} item{selectedIds.length > 1 ? "s" : ""}{" "}
								selected
							</Typography>
							<Typography
								variant="body2"
								sx={{
									cursor: "pointer",
									textDecoration: "underline",
									fontWeight: 600,
								}}
								onClick={selectAllContactLists}
							>
								Select all
							</Typography>
						</Stack>

						<Stack
							direction="row"
							spacing={2}
							alignItems="center"
						>
							<Button
								variant="text"
								color="inherit"
								startIcon={<Send />}
								sx={{ textTransform: "none", fontWeight: 600 }}
								onClick={() => handleSendCampaign(selectedId)}
							>
								{t("contacts.send_campaign", "Send Campaign")}
							</Button>
							<Button
								variant="text"
								color="inherit"
								startIcon={<GetApp />}
								sx={{ textTransform: "none", fontWeight: 600 }}
								onClick={handleDownload}
							>
								Download
							</Button>
							<Button
								variant="text"
								color="inherit"
								startIcon={<Delete />}
								sx={{ textTransform: "none", fontWeight: 600 }}
								onClick={() => setConfirmDelete(true)}
							>
								Delete
							</Button>
							<Divider
								orientation="vertical"
								flexItem
								sx={{ borderColor: "rgba(255,255,255,0.3)", my: 2, mx: 1 }}
							/>
							<Typography
								variant="body2"
								sx={{ cursor: "pointer", fontWeight: 600 }}
								onClick={clearSelection}
							>
								Cancel
							</Typography>
						</Stack>
					</Stack>
				) : (
					<Toolbar
						sx={{
							px: 3,
							width: "100%",
							justifyContent: "space-between",
						}}
					>
						<Stack
							direction="row"
							spacing={2}
							alignItems="center"
						>
							{/* Search */}
							<TextField
								size="small"
								placeholder="Search"
								value={searchQuery}
								onChange={handleSearchChange}
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<Search sx={{ color: "text.secondary", fontSize: 20 }} />
										</InputAdornment>
									),
								}}
								sx={{
									width: 320,
									"& .MuiOutlinedInput-root": {
										borderRadius: "6px",
										bgcolor: "background.paper",
										height: 40,
										"& fieldset": {
											borderColor: "rgba(0, 0, 0, 0.12)",
										},
									},
								}}
							/>

							{/* Date Created Filter Popover */}
							<Button
								variant="outlined"
								size="small"
								onClick={(e) => setDateAnchorEl(e.currentTarget)}
								sx={{
									height: 40,
									textTransform: "none",
									color: "text.primary",
									borderColor: "divider",
									bgcolor: "background.paper",
									borderRadius: "6px",
									px: 2,
									minWidth: 140,
									fontWeight: 400,
									fontSize: "0.875rem",
									justifyContent: "space-between",
									"&:hover": {
										borderColor: "rgba(0, 0, 0, 0.24)",
										bgcolor: "rgba(0, 0, 0, 0.04)",
									},
								}}
							>
								Date created
								<Typography
									sx={{
										fontSize: 10,
										ml: 1,
										color: "text.primary",
										fontWeight: 900,
									}}
								>
									▼
								</Typography>
							</Button>
							<Popover
								open={Boolean(dateAnchorEl)}
								anchorEl={dateAnchorEl}
								onClose={() => setDateAnchorEl(null)}
								anchorOrigin={{
									vertical: "bottom",
									horizontal: "left",
								}}
								PaperProps={{ sx: { p: 2, width: 300 } }}
							>
								<Typography
									variant="subtitle2"
									sx={{ mb: 2, fontWeight: 700 }}
								>
									Filter by date created
								</Typography>
								<Stack spacing={2}>
									<TextField
										label="From"
										type="date"
										size="small"
										fullWidth
										InputLabelProps={{ shrink: true }}
										value={startDate === undefined ? "" : startDate}
										onChange={(e) => setStartDate(e.target.value)}
									/>
									<TextField
										label="To"
										type="date"
										size="small"
										fullWidth
										InputLabelProps={{ shrink: true }}
										value={endDate === undefined ? "" : endDate}
										onChange={(e) => setEndDate(e.target.value)}
									/>
								</Stack>
							</Popover>
							<Stack
								direction="row"
								spacing={1}
								justifyContent="flex-end"
							>
								<Button
									size="small"
									onClick={handleClearFilter}
								>
									Clear
								</Button>
								<Button
									size="small"
									variant="contained"
									onClick={handleFiltered}
								>
									Apply
								</Button>
							</Stack>
						</Stack>

						<Stack
							direction="row"
							spacing={1}
						>
							<Button
								variant="outlined"
								size="small"
								startIcon={<Settings fontSize="small" />}
								onClick={(e) => setColumnAnchorEl(e.currentTarget)}
								sx={{
									borderRadius: 20,
									textTransform: "none",
									color: "text.primary",
									borderColor: "divider",
									px: 2,
									height: 40,
									fontWeight: 600,
									"&:hover": {
										borderColor: "primary.main",
										backgroundColor: "action.hover",
									},
								}}
							>
								{t("contacts.columns_title") || "Columns"}
							</Button>
						</Stack>
					</Toolbar>
				)}
			</Paper>

			{/* Table */}
			<Box
				sx={{
					p: 0,
					height: "100%", // 64 (header) + 80 (filter)
					position: "relative",
					flex: 1,
				}}
			>
				<TableContainer
					component={Paper}
					elevation={0}
					sx={{
						height: "100%",
						overflow: "auto",
						border: "none",
						borderRadius: 0,
						flex: 1,
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
										indeterminate={isIndeterminate}
										checked={isAllSelected}
										onChange={(e) => {
											if (e.target.checked) {
												selectAllContactLists();
											} else {
												clearSelection();
											}
										}}
										sx={{
											color: isBatchMode ? "primary.main" : "text.disabled",
											"&.Mui-checked, &.MuiCheckbox-indeterminate": {
												color: "primary.main",
											},
										}}
									/>
								</TableCell>
								<TableCell
									sx={{
										fontWeight: 700,
										color: "text.secondary",
										cursor: "pointer",
										"&:hover": { color: "primary.main" },
									}}
									onClick={() => handleSortChange("name")}
								>
									<Stack
										direction="row"
										alignItems="center"
										spacing={0.5}
									>
										{t("common.name")}
										<IconButton
											size="small"
											sx={{
												p: 0.5,
												color:
													sortBy === "name" ? "primary.main" : "text.disabled",
											}}
										>
											<Typography sx={{ fontSize: 12, fontWeight: 900 }}>
												{sortBy === "name"
													? sortOrder === "asc"
														? "↑"
														: "↓"
													: "↕"}
											</Typography>
										</IconButton>
									</Stack>
								</TableCell>
								{visibleColumns.includes("description") && (
									<TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>
										{t("common.description")}
									</TableCell>
								)}
								{visibleColumns.includes("contactCount") && (
									<TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>
										{t("contacts.list_title")}{" "}
										{/* or another label for members */}
									</TableCell>
								)}
								{visibleColumns.includes("date_created") && (
									<TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>
										{t("campaigns.date_created")}
									</TableCell>
								)}
								<TableCell
									sx={{ fontWeight: 700, color: "text.secondary", paddingX: 3 }}
									align="right"
								>
									{t("common.actions")}
								</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{contactLists?.map((list) => {
								const isSelected = selectedIds.includes(list.slug);
								return (
									<TableRow
										key={list.slug}
										hover
										selected={isSelected}
										sx={{
											cursor: "pointer",
											"&:hover": {
												backgroundColor: "action.hover",
											},
										}}
										onClick={() => navigate(`/contacts/${list.slug}`)}
									>
										<TableCell
											padding="checkbox"
											onClick={(e) => e.stopPropagation()}
											sx={{ paddingX: 3 }}
										>
											<Checkbox
												checked={isSelected}
												onChange={() => toggleSelectContactList(list.slug)}
											/>
										</TableCell>
										<TableCell>
											<Stack
												direction="row"
												alignItems="center"
												spacing={1}
											>
												<Typography
													variant="body2"
													sx={{
														fontWeight: 700,
														color: "primary.main",
														textTransform: "uppercase",
														letterSpacing: "0.02em",
													}}
												>
													{list.name}
												</Typography>
												{list.is_default && (
													<Box
														sx={{
															bgcolor: "action.selected",
															color: "primary.main",
															px: 1.2,
															py: 0.4,
															borderRadius: "6px",
															fontSize: "0.75rem",
															fontWeight: 600,
															lineHeight: 1,
														}}
													>
														{t("contacts.default") || "Default"}
													</Box>
												)}
											</Stack>
										</TableCell>
										{visibleColumns.includes("description") && (
											<TableCell>
												<Typography
													variant="body2"
													color="text.secondary"
													sx={{
														maxWidth: 300,
														whiteSpace: "nowrap",
														overflow: "hidden",
														textOverflow: "ellipsis",
													}}
												>
													{/* {list.description} */}
												</Typography>
											</TableCell>
										)}
										{visibleColumns.includes("contactCount") && (
											<TableCell>
												<Typography variant="body2">
													{list.contactCount.toLocaleString()}
												</Typography>
											</TableCell>
										)}
										{visibleColumns.includes("date_created") && (
											<TableCell>
												<Typography
													variant="body2"
													color="text.secondary"
												>
													{list.date_created
														? new Date(list.date_created).toLocaleDateString(
															"en-GB",
															{
																day: "2-digit",
																month: "2-digit",
																year: "numeric",
															},
														)
														: "25/10/2025"}
												</Typography>
											</TableCell>
										)}
										<TableCell
											align="right"
											onClick={(e) => e.stopPropagation()}
											sx={{ paddingX: 3 }}
										>
											<Stack
												direction="row"
												spacing={1}
												justifyContent="flex-end"
											>
												<Tooltip title={t("sidebar.campaigns")}>
													<IconButton
														size="small"
														sx={{ color: "#666" }}
														onClick={() => handleSendCampaign(list.slug)}
													>
														<Campaign fontSize="small" />
													</IconButton>
												</Tooltip>
												<Tooltip title={t("contacts.add_contact")}>
													<IconButton
														size="small"
														sx={{ color: "#666" }}
													>
														<PostAdd fontSize="small" />
													</IconButton>
												</Tooltip>
												<IconButton
													size="small"
													onClick={(e) => handleMenuOpen(e, list.slug)}
													sx={{ color: "#666" }}
												>
													<MoreVert fontSize="small" />
												</IconButton>
											</Stack>
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</TableContainer>
				<Box
					sx={{
						bgcolor: "background.paper",
						borderTop: "1px solid",
						borderColor: "divider",
						p: 0,
						flexShrink: 0,
					}}
				>
					<TablePagination
						rowsPerPageOptions={[10, 25, 50, 100]}
						component="div"
						count={contactLists?.length}
						rowsPerPage={currentRowsPerPage}
						page={currentPage}
						onPageChange={(_, p) => setPage(p)}
						onRowsPerPageChange={(e) =>
							setRowsPerPage(parseInt(e.target.value, 10))
						}
						sx={{ px: 3 }}
					/>
				</Box>
			</Box>

			{/* Action Menu */}
			<Menu
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={handleMenuClose}
			>
				<MenuItem onClick={handleEditAction}>
					<Edit sx={{ mr: 1 }} />
					Edit list
				</MenuItem>
				<MenuItem onClick={handleDuplicate}>
					<ContentCopy sx={{ mr: 1 }} />
					Duplicate list
				</MenuItem>
				<MenuItem
					onClick={() => setConfirmDelete(true)}
					sx={{ color: "error.main" }}
					disabled={selectedList?.is_default}
				>
					<Delete sx={{ mr: 1 }} />
					Delete list
				</MenuItem>
			</Menu>

			{/* Column Config Popover (Placeholder) */}
			<Popover
				open={Boolean(columnAnchorEl)}
				anchorEl={columnAnchorEl}
				onClose={() => setColumnAnchorEl(null)}
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "right",
				}}
				transformOrigin={{
					vertical: "top",
					horizontal: "right",
				}}
				PaperProps={{ sx: { p: 2, width: 200 } }}
			>
				<Typography
					variant="subtitle2"
					sx={{ mb: 1, fontWeight: 700 }}
				>
					{t("contacts.column_visibility") || "Column Visibility"}
				</Typography>
				<Stack spacing={1}>
					<FormControlLabel
						control={
							<Checkbox
								checked
								disabled
								size="small"
							/>
						}
						label={<Typography variant="body2">{t("common.name")}</Typography>}
					/>
					<FormControlLabel
						control={
							<Checkbox
								size="small"
								checked={visibleColumns.includes("description")}
								onChange={() => handleColumnToggle("description")}
							/>
						}
						label={
							<Typography variant="body2">{t("common.description")}</Typography>
						}
					/>
					<FormControlLabel
						control={
							<Checkbox
								size="small"
								checked={visibleColumns.includes("contactCount")}
								onChange={() => handleColumnToggle("contactCount")}
							/>
						}
						label={
							<Typography variant="body2">
								{t("contacts.list_title")}
							</Typography>
						}
					/>
					<FormControlLabel
						control={
							<Checkbox
								size="small"
								checked={visibleColumns.includes("date_created")}
								onChange={() => handleColumnToggle("date_created")}
							/>
						}
						label={
							<Typography variant="body2">
								{t("contacts.filter_by_date")}
							</Typography>
						}
					/>
				</Stack>
			</Popover>
		</>
	);
}
