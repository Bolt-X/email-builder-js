import React, { useState, useMemo } from "react";
import {
	Box,
	Button,
	Stack,
	TextField,
	InputAdornment,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Chip,
	IconButton,
	Menu,
	MenuItem,
	Checkbox,
	FormControl,
	InputLabel,
	Select,
	Toolbar,
	Typography,
	TablePagination,
	Tooltip,
} from "@mui/material";
import {
	Add,
	MoreVert,
	Edit,
	Delete,
	Search,
	GetApp,
	VolumeOff,
	VolumeUp,
	Settings,
	ContentCopy,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
	useFilteredContactLists,
	useContactListFilters,
	useContactListPagination,
	useSelectedContactLists,
	setSearchQuery,
	setSort,
	setPage,
	setRowsPerPage,
	toggleSelectContactList,
	selectAllContactLists,
	clearSelection,
	deleteContactListAction,
	toggleContactListEnabled,
	exportContactListAction,
	fetchContactLists,
} from "../../stores/contactList.store";
import { duplicateContactList } from "../../service";
import { ContactList } from "../../types";
import ContactListFormDrawer from "../ContactListFormDrawer";

export default function ContactListTable() {
	const navigate = useNavigate();
	const { filtered, total, page, rowsPerPage } = useFilteredContactLists();
	const { searchQuery, sortBy, sortOrder } = useContactListFilters();
	const { page: currentPage, rowsPerPage: currentRowsPerPage } =
		useContactListPagination();
	const selectedIds = useSelectedContactLists();

	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [selectedId, setSelectedId] = useState<string | number | null>(null);
	const [formDrawerOpen, setFormDrawerOpen] = useState(false);
	const [formMode, setFormMode] = useState<"create" | "edit">("create");
	const [editingList, setEditingList] = useState<ContactList | null>(null);

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

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(e.target.value);
	};

	const handleSortChange = (newSortBy: typeof sortBy) => {
		setSort(newSortBy);
	};

	const handleCreate = () => {
		setFormMode("create");
		setEditingList(null);
		setFormDrawerOpen(true);
	};

	const handleEdit = () => {
		if (selectedId) {
			const list = filtered.find((l) => l.id === selectedId);
			if (list) {
				setFormMode("edit");
				setEditingList(list);
				setFormDrawerOpen(true);
			}
		}
		handleMenuClose();
	};

	const handleDuplicate = async () => {
		if (selectedId) {
			try {
				await duplicateContactList(selectedId);
				await fetchContactLists();
				handleMenuClose();
			} catch (error) {
				console.error("Failed to duplicate list:", error);
			}
		}
	};

	const handleDelete = async () => {
		if (selectedId) {
			const list = filtered.find((l) => l.id === selectedId);
			if (list?.isDefault) {
				alert("Cannot delete default list");
				handleMenuClose();
				return;
			}
			if (
				window.confirm(
					"Are you sure you want to delete this contact list?"
			)) {
				try {
					await deleteContactListAction(selectedId);
				} catch (error) {
					console.error("Failed to delete list:", error);
				}
			}
			handleMenuClose();
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

	const selectedList = filtered.find((l) => l.id === selectedId);
	const isAllSelected =
		filtered.length > 0 && selectedIds.length === filtered.length;
	const isIndeterminate =
		selectedIds.length > 0 && selectedIds.length < filtered.length;

	return (
		<>
			{/* Toolbar */}
			<Paper sx={{ mb: 2 }}>
				<Toolbar>
					<Stack
						direction="row"
						spacing={2}
						alignItems="center"
						flex={1}
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
										<Search fontSize="small" />
									</InputAdornment>
								),
							}}
							sx={{ width: 300 }}
						/>

						{/* Sort */}
						<FormControl
							size="small"
							sx={{ minWidth: 150 }}
						>
							<InputLabel>Sort by</InputLabel>
							<Select
								value={sortBy}
								label="Sort by"
								onChange={(e) =>
									handleSortChange(
										e.target.value as typeof sortBy
									)
								}
							>
								<MenuItem value="date_created">Date created</MenuItem>
								<MenuItem value="name">Name</MenuItem>
								<MenuItem value="contact_count">Number of contacts</MenuItem>
								<MenuItem value="last_updated">Last updated</MenuItem>
							</Select>
						</FormControl>
					</Stack>

					<Stack
						direction="row"
						spacing={1}
					>
						<Button
							variant="contained"
							startIcon={<Add />}
							onClick={handleCreate}
						>
							Create list
						</Button>
						<Button
							variant="outlined"
							startIcon={<Settings />}
						>
							Columns
						</Button>
					</Stack>
				</Toolbar>
			</Paper>

			{/* Table */}
			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell padding="checkbox">
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
								/>
							</TableCell>
							<TableCell>
								<Stack
									direction="row"
									alignItems="center"
									spacing={1}
								>
									Name
									{sortBy === "name" && (
										<Typography variant="caption">
											{sortOrder === "asc" ? "↑" : "↓"}
										</Typography>
									)}
								</Stack>
							</TableCell>
							<TableCell>Description</TableCell>
							<TableCell>Number of contacts</TableCell>
							<TableCell>Date created</TableCell>
							<TableCell align="right">Action</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{filtered.map((list) => {
							const isSelected = selectedIds.includes(list.id);
							return (
								<TableRow
									key={list.id}
									hover
									selected={isSelected}
									sx={{
										cursor: "pointer",
										"&:hover": {
											backgroundColor: "action.hover",
										},
									}}
									onClick={() => navigate(`/contacts/lists/${list.id}`)}
								>
									<TableCell
										padding="checkbox"
										onClick={(e) => e.stopPropagation()}
									>
										<Checkbox
											checked={isSelected}
											onChange={() => toggleSelectContactList(list.id)}
										/>
									</TableCell>
									<TableCell>
										<Stack
											direction="row"
											alignItems="center"
											spacing={1}
										>
											<Typography variant="body1">{list.name}</Typography>
											{list.isDefault && (
												<Chip
													label="Default"
													size="small"
													color="primary"
													variant="outlined"
												/>
											)}
										</Stack>
									</TableCell>
									<TableCell>
										<Typography
											variant="body2"
											color="text.secondary"
										>
											{list.description || "-"}
										</Typography>
									</TableCell>
									<TableCell>{list.contactCount}</TableCell>
									<TableCell>
										{list.createdAt
											? new Date(list.createdAt).toLocaleDateString("en-GB", {
													weekday: "short",
													day: "2-digit",
													month: "2-digit",
													year: "numeric",
												})
											: "-"}
									</TableCell>
									<TableCell
										align="right"
										onClick={(e) => e.stopPropagation()}
									>
										<Stack
											direction="row"
											spacing={0.5}
											justifyContent="flex-end"
										>
											<Tooltip
												title={
													list.isEnabled
														? "Disable sending"
														: "Enable sending"
												}
											>
												<IconButton
													size="small"
													onClick={(e) => {
														e.stopPropagation();
														setSelectedId(list.id);
														handleToggleEnabled();
													}}
													disabled={list.isDefault}
												>
													{list.isEnabled ? (
														<VolumeUp fontSize="small" />
													) : (
														<VolumeOff
															fontSize="small"
															color="disabled"
														/>
													)}
												</IconButton>
											</Tooltip>
											<Tooltip title="Export contacts">
												<IconButton
													size="small"
													onClick={(e) => {
														e.stopPropagation();
														setSelectedId(list.id);
														handleExport();
													}}
												>
													<GetApp fontSize="small" />
												</IconButton>
											</Tooltip>
											<IconButton
												size="small"
												onClick={(e) => handleMenuOpen(e, list.id)}
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

			{/* Pagination */}
			<TablePagination
				component="div"
				count={total}
				page={currentPage}
				onPageChange={(_, newPage) => setPage(newPage)}
				rowsPerPage={currentRowsPerPage}
				onRowsPerPageChange={(e) =>
					setRowsPerPage(parseInt(e.target.value, 10))
				}
				rowsPerPageOptions={[10, 25, 50, 100]}
				labelRowsPerPage="Rows per page:"
			/>

			{/* Action Menu */}
			<Menu
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={handleMenuClose}
			>
				<MenuItem onClick={handleEdit}>
					<Edit sx={{ mr: 1 }} />
					Edit list
				</MenuItem>
				<MenuItem onClick={handleDuplicate}>
					<ContentCopy sx={{ mr: 1 }} />
					Duplicate list
				</MenuItem>
				<MenuItem
					onClick={handleDelete}
					sx={{ color: "error.main" }}
					disabled={selectedList?.isDefault}
				>
					<Delete sx={{ mr: 1 }} />
					Delete list
				</MenuItem>
			</Menu>

			{/* Form Drawer */}
			<ContactListFormDrawer
				open={formDrawerOpen}
				onClose={() => {
					setFormDrawerOpen(false);
					setEditingList(null);
				}}
				mode={formMode}
				list={editingList || undefined}
			/>
		</>
	);
}
