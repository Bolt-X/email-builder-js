import {
	Add,
	ArrowBackIosNew,
	ContentCopy,
	Delete,
	DriveFileMove,
	FileUploadOutlined,
	GetApp,
	Search,
	Settings,
} from "@mui/icons-material";
import {
	Box,
	Button,
	Checkbox,
	Divider,
	FormControlLabel,
	FormGroup,
	IconButton,
	InputAdornment,
	Paper,
	Popover,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useGetContactListById } from "../../../hooks/useContact";
import { setVisibleColumns, useVisibleColumns } from "../store";
import { useSegments } from "../stores/segment.store";
import ContactTable from "./ContactTable";
import CreateContactModal from "./CreateContactModal";
import ImportContactsModal from "./ImportContactsModal";
import MoveOrAddListModal from "./MoveOrAddListModal";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

export default function ContactListDetailPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { t } = useTranslation();

	const [filter, setFilter] = useState({
		from: undefined,
		to: undefined,
		status: [],
		tags: [],
		segments: [],
	});
	// const contactLists = useContactLists();
	const { data: contactListData } = useGetContactListById(id, {
		from: "",
		to: "",
		status: "",
		tags: [],
		segments: [],
	});

	const visibleColumns = useVisibleColumns();

	const segments = useSegments();

	const [searchQuery, setSearchQuery] = useState("");
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(25);
	const [selectedContacts, setSelectedContacts] = useState<(string | number)[]>(
		[],
	);
	const [dateAnchorEl, setDateAnchorEl] = useState<null | HTMLElement>(null);
	const [columnsAnchorEl, setColumnsAnchorEl] = useState<null | HTMLElement>(
		null,
	);
	const [statusAnchorEl, setStatusAnchorEl] = useState<null | HTMLElement>(
		null,
	);
	const [tagAnchorEl, setTagAnchorEl] = useState<null | HTMLElement>(null);
	const [segmentAnchorEl, setSegmentAnchorEl] = useState<null | HTMLElement>(
		null,
	);

	const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [selectedSegments, setSelectedSegments] = useState<(string | number)[]>(
		[],
	);

	const [importModalOpen, setImportModalOpen] = useState(false);
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [editingContact, setEditingContact] = useState<any>(null);
	const [moveModalOpen, setMoveModalOpen] = useState(false);
	const [moveModalType, setMoveModalType] = useState<"move" | "add">("move");

	const availableColumns = [
		{ key: "email", label: t("contacts.email") },
		{ key: "first_name", label: t("common.first_name") },
		{ key: "last_name", label: t("common.last_name") },
		{ key: "status", label: t("common.status") },
		{ key: "date_created", label: t("common.date_created") },
		{ key: "action", label: t("common.actions") },
	];

	const handleColumnToggle = (columnKey: string) => {
		if (visibleColumns.includes(columnKey)) {
			setVisibleColumns(visibleColumns.filter((k) => k !== columnKey));
		} else {
			setVisibleColumns([...visibleColumns, columnKey]);
		}
	};

	// const contactList = contactListData.find(
	// 	(list) => String(list.slug) === String(id),
	// );

	// const contactsInList = contactList?.subscribers || [];

	// const filteredContacts = contactsInList.filter((contact) => {
	// 	// 1. Search Query
	// 	const query = searchQuery.toLowerCase();
	// 	const matchesSearch =
	// 		!searchQuery ||
	// 		contact.email.toLowerCase().includes(query) ||
	// 		contact.first_name?.toLowerCase().includes(query) ||
	// 		contact.last_name?.toLowerCase().includes(query);

	// 	// 2. Status Filter
	// 	const matchesStatus =
	// 		selectedStatus.length === 0 || selectedStatus.includes(contact.status);

	// 	// 3. Tag Filter (Subscribers in schema don't have tags field directly, skipping for now)
	// 	const matchesTags = true;

	// 	// 4. Segment Filter
	// 	const matchesSegment = true;

	// 	return matchesSearch && matchesStatus && matchesTags && matchesSegment;
	// });

	// Get unique tags (skipping as model changed)
	const allTags: string[] = [];
	const statusOptions = ["enabled", "blocklisted", "duplicate"];

	// Pagination logic
	const totalContacts = contactListData?.subscribers?.length;
	const totalPages = Math.ceil(totalContacts / rowsPerPage);
	const paginatedContacts = contactListData?.subscribers?.slice(
		page * rowsPerPage,
		(page + 1) * rowsPerPage,
	);

	useEffect(() => {
		setPage(0);
	}, [searchQuery]);

	// useEffect(() => {
	// 	fetchContactLists();
	// 	fetchContacts();
	// 	fetchSegments();
	// }, []);

	const handleBack = () => {
		navigate("/contacts");
	};

	const handleSelectOne = (id: string | number) => {
		setSelectedContacts((prev) =>
			prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
		);
	};

	const handleSelectAll = () => {
		setSelectedContacts(contactListData?.subscribers?.map((c) => c.id) || []);
	};

	const handleClearSelection = () => {
		setSelectedContacts([]);
	};

	const handleMoveSuccess = () => {
		// Refresh data sau khi move thành công
		setSelectedContacts([]);
	};

	const handleDownloadSelected = async () => {
		if (selectedContacts.length === 0) return;

		try {
			// Lấy thông tin contacts được chọn
			const selectedContactData =
				contactListData?.subscribers?.filter((c) =>
					selectedContacts.includes(c.id!),
				) || [];

			// Tạo CSV content
			const headers = [
				"Email",
				"First Name",
				"Last Name",
				"Status",
				"Date Created",
				"Date Updated",
			];
			const rows = selectedContactData.map((contact) => {
				return [
					contact.email || "",
					contact.first_name || "",
					contact.last_name || "",
					contact.status || "",
					contact.date_created
						? new Date(contact.date_created).toLocaleString()
						: "",
					contact.date_updated
						? new Date(contact.date_updated).toLocaleString()
						: "",
				];
			});

			// Escape CSV values
			const escapeCSV = (value: string | undefined | null): string => {
				const strValue = value?.toString() || "";
				if (
					strValue.includes(",") ||
					strValue.includes('"') ||
					strValue.includes("\n")
				) {
					return `"${strValue.replace(/"/g, '""')}"`;
				}
				return strValue;
			};

			// Tạo CSV string
			const csvContent = [
				headers.map(escapeCSV).join(","),
				...rows.map((row) => row.map(escapeCSV).join(",")),
			].join("\n");

			// Tạo BOM để hỗ trợ UTF-8 trong Excel
			const BOM = "\uFEFF";
			const blob = new Blob([BOM + csvContent], {
				type: "text/csv;charset=utf-8;",
			});

			// Tạo link download
			const link = document.createElement("a");
			const url = URL.createObjectURL(blob);
			link.setAttribute("href", url);
			link.setAttribute("download", `contacts_${Date.now()}.csv`);

			link.style.visibility = "hidden";
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

			// Cleanup
			URL.revokeObjectURL(url);
		} catch (error) {
			console.error("Failed to download contacts:", error);
		}
	};

	if (!contactListData) {
		return (
			<Box sx={{ p: 4, textAlign: "center" }}>
				<Typography variant="h6">Contact list not found</Typography>
				<Button
					onClick={handleBack}
					sx={{ mt: 2 }}
				>
					Back to contacts
				</Button>
			</Box>
		);
	}

	return (
		<Box>
			{/* Title and Action Buttons */}
			<Stack
				direction="row"
				justifyContent="space-between"
				alignItems="center"
				sx={{
					px: 3,
					py: 2,
					height: 64,
					bgcolor: "background.paper",
					borderBottom: 1,
					borderColor: "divider",
				}}
			>
				<Stack
					direction="row"
					spacing={2}
					alignItems="center"
				>
					<IconButton
						onClick={handleBack}
						size="small"
						sx={{ color: "text.primary" }}
					>
						<ArrowBackIosNew sx={{ fontSize: 18 }} />
					</IconButton>
					<Typography
						variant="h4"
						sx={{ fontWeight: 600, color: "text.primary" }}
					>
						{contactListData?.name}
					</Typography>
				</Stack>

				<Stack
					direction="row"
					spacing={1.5}
				>
					<Button
						variant="outlined"
						startIcon={<Add />}
						onClick={() => {
							setEditingContact(null);
							setCreateModalOpen(true);
						}}
						sx={{
							textTransform: "none",
							fontWeight: 600,
							borderRadius: "8px",
							px: 2.5,
							height: 40,
							borderColor: "#E5E7EB",
							color: "text.primary",
							"&:hover": { bgcolor: "#F9FAFB", borderColor: "#D1D5DB" },
						}}
					>
						Create a contact
					</Button>
					<Button
						variant="contained"
						startIcon={<FileUploadOutlined />}
						onClick={() => setImportModalOpen(true)}
						sx={{
							textTransform: "none",
							fontWeight: 600,
							borderRadius: "8px",
							px: 2.5,
							height: 40,
							boxShadow: "none",
							"&:hover": { boxShadow: "none" },
						}}
					>
						Import contacts
					</Button>
				</Stack>
			</Stack>

			{/* Filters Toolbar */}
			<Stack
				direction="row"
				justifyContent="space-between"
				alignItems="center"
				sx={{ px: 3, py: 2 }}
			>
				<Stack
					direction="row"
					spacing={1.5}
				>
					<TextField
						size="small"
						placeholder="Search"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<Search sx={{ color: "text.secondary", fontSize: 20 }} />
								</InputAdornment>
							),
						}}
						sx={{
							width: 300,
							"& .MuiOutlinedInput-root": {
								borderRadius: "6px",
								bgcolor: "background.paper",
								height: 40,
								"& fieldset": { borderColor: "rgba(0, 0, 0, 0.12)" },
							},
						}}
					/>

					{/* Segment Filter */}
					{/* <Button
						variant="outlined"
						size="small"
						onClick={(e) => setSegmentAnchorEl(e.currentTarget)}
						sx={{
							height: 40,
							textTransform: "none",
							color: "text.primary",
							borderColor: "rgba(0,0, 0, 0.12)",
							borderRadius: "6px",
							px: 2,
							minWidth: 100,
							fontWeight: 400,
							fontSize: "0.875rem",
							justifyContent: "space-between",
						}}
					>
						Segment
						<Typography sx={{ fontSize: 10, ml: 1, fontWeight: 900 }}>
							▼
						</Typography>
					</Button>
					<Popover
						open={Boolean(segmentAnchorEl)}
						anchorEl={segmentAnchorEl}
						onClose={() => setSegmentAnchorEl(null)}
						anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
					>
						<Box sx={{ p: 2, minWidth: 200 }}>
							<Typography
								variant="subtitle2"
								sx={{ mb: 1.5, fontWeight: 700 }}
							>
								Filter by Segment
							</Typography>
							<FormGroup>
								{segments.map((s) => (
									<FormControlLabel
										key={s.id}
										control={
											<Checkbox
												checked={selectedSegments.includes(s.id)}
												onChange={() => {
													setSelectedSegments((prev) =>
														prev.includes(s.id)
															? prev.filter((id) => id !== s.id)
															: [...prev, s.id],
													);
												}}
												size="small"
											/>
										}
										label={<Typography variant="body2">{s.name}</Typography>}
									/>
								))}
							</FormGroup>
						</Box>
					</Popover> */}

					{/* Status Filter */}
					<Button
						variant="outlined"
						size="small"
						onClick={(e) => setStatusAnchorEl(e.currentTarget)}
						sx={{
							height: 40,
							textTransform: "none",
							color: "text.primary",
							borderColor: "rgba(0,0, 0, 0.12)",
							borderRadius: "6px",
							px: 2,
							minWidth: 100,
							fontWeight: 400,
							fontSize: "0.875rem",
							justifyContent: "space-between",
						}}
					>
						Status
						<Typography sx={{ fontSize: 10, ml: 1, fontWeight: 900 }}>
							▼
						</Typography>
					</Button>
					<Popover
						open={Boolean(statusAnchorEl)}
						anchorEl={statusAnchorEl}
						onClose={() => setStatusAnchorEl(null)}
						anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
					>
						<Box sx={{ p: 2, minWidth: 200 }}>
							<Typography
								variant="subtitle2"
								sx={{ mb: 1.5, fontWeight: 700 }}
							>
								Filter by Status
							</Typography>
							<FormGroup>
								{statusOptions.map((status) => (
									<FormControlLabel
										key={status}
										control={
											<Checkbox
												checked={selectedStatus.includes(status)}
												onChange={() => {
													setSelectedStatus((prev) =>
														prev.includes(status)
															? prev.filter((s) => s !== status)
															: [...prev, status],
													);
												}}
												size="small"
											/>
										}
										label={
											<Typography
												variant="body2"
												sx={{ textTransform: "capitalize" }}
											>
												{status}
											</Typography>
										}
									/>
								))}
							</FormGroup>
						</Box>
					</Popover>

					{/* Tag Filter */}
					<Button
						variant="outlined"
						size="small"
						onClick={(e) => setTagAnchorEl(e.currentTarget)}
						sx={{
							height: 40,
							textTransform: "none",
							color: "text.primary",
							borderColor: "rgba(0,0, 0, 0.12)",
							borderRadius: "6px",
							px: 2,
							minWidth: 100,
							fontWeight: 400,
							fontSize: "0.875rem",
							justifyContent: "space-between",
						}}
					>
						Tag
						<Typography sx={{ fontSize: 10, ml: 1, fontWeight: 900 }}>
							▼
						</Typography>
					</Button>
					<Popover
						open={Boolean(tagAnchorEl)}
						anchorEl={tagAnchorEl}
						onClose={() => setTagAnchorEl(null)}
						anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
					>
						<Box sx={{ p: 2, minWidth: 200 }}>
							<Typography
								variant="subtitle2"
								sx={{ mb: 1.5, fontWeight: 700 }}
							>
								Filter by Tag
							</Typography>
							<FormGroup>
								{allTags.length === 0 && (
									<Typography
										variant="caption"
										color="text.secondary"
									>
										No tags found
									</Typography>
								)}
								{allTags.map((tag) => (
									<FormControlLabel
										key={tag}
										control={
											<Checkbox
												checked={selectedTags.includes(tag)}
												onChange={() => {
													setSelectedTags((prev) =>
														prev.includes(tag)
															? prev.filter((t) => t !== tag)
															: [...prev, tag],
													);
												}}
												size="small"
											/>
										}
										label={<Typography variant="body2">{tag}</Typography>}
									/>
								))}
							</FormGroup>
						</Box>
					</Popover>

					{/* Date Filter */}
					<Button
						variant="outlined"
						size="small"
						onClick={(e) => setDateAnchorEl(e.currentTarget)}
						sx={{
							height: 40,
							textTransform: "none",
							color: "text.primary",
							borderColor: "rgba(0, 0, 0, 0.12)",
							borderRadius: "6px",
							px: 2,
							minWidth: 140,
							fontWeight: 400,
							fontSize: "0.875rem",
							justifyContent: "space-between",
						}}
					>
						Date created
						<Typography sx={{ fontSize: 10, ml: 1, fontWeight: 900 }}>
							▼
						</Typography>
					</Button>
					<Stack
						direction="row"
						spacing={1}
						justifyContent="flex-end"
						sx={{ mt: 1 }}
					>
						<Button
							size="small"
							onClick={() =>
								setFilter({ ...filter, from: undefined, to: undefined })
							}
						>
							Clear
						</Button>
						<Button
							size="small"
							variant="contained"
							onClick={() =>
								setFilter({
									...filter,
									from: filter.from
										? dayjs(filter.from).toISOString()
										: undefined,
									to: filter.to ? dayjs(filter.to).toISOString() : undefined,
								})
							}
						>
							Apply
						</Button>
					</Stack>
				</Stack>

				<Button
					variant="outlined"
					size="small"
					startIcon={<Settings fontSize="small" />}
					onClick={(e) => setColumnsAnchorEl(e.currentTarget)}
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
					{t("common.columns") || "Columns"}
				</Button>
			</Stack>

			{/* Batch Actions Menu */}
			{selectedContacts.length > 0 && (
				<Paper
					elevation={0}
					sx={{
						bgcolor: "primary.main",
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
								{selectedContacts.length} item
								{selectedContacts.length > 1 ? "s" : ""} selected
							</Typography>
							<Typography
								variant="body2"
								sx={{
									cursor: "pointer",
									textDecoration: "underline",
									fontWeight: 600,
								}}
								onClick={handleSelectAll}
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
								startIcon={<DriveFileMove />}
								sx={{ textTransform: "none", fontWeight: 600 }}
								onClick={() => {
									setMoveModalType("move");
									setMoveModalOpen(true);
								}}
							>
								Move to list
							</Button>
							<Button
								variant="text"
								color="inherit"
								startIcon={<ContentCopy />}
								sx={{ textTransform: "none", fontWeight: 600 }}
								onClick={() => {
									setMoveModalType("add");
									setMoveModalOpen(true);
								}}
							>
								Add to list
							</Button>
							<Button
								variant="text"
								color="inherit"
								startIcon={<GetApp />}
								sx={{ textTransform: "none", fontWeight: 600 }}
								onClick={handleDownloadSelected}
							>
								Download
							</Button>
							<Button
								variant="text"
								color="inherit"
								startIcon={<Delete />}
								sx={{ textTransform: "none", fontWeight: 600 }}
								onClick={() => {
									// TODO: Implement delete
									console.log("Delete:", selectedContacts);
								}}
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
								onClick={handleClearSelection}
							>
								Cancel
							</Typography>
						</Stack>
					</Stack>
				</Paper>
			)}

			{/* Table area */}
			<ContactTable
				contacts={paginatedContacts}
				selectedContacts={selectedContacts}
				onSelectOne={handleSelectOne}
				onSelectAll={handleSelectAll}
				onClearSelection={handleClearSelection}
				visibleColumns={visibleColumns}
				total={totalContacts}
				page={page}
				rowsPerPage={rowsPerPage}
				onPageChange={(p) => setPage(p)}
				onRowsPerPageChange={(r) => {
					setRowsPerPage(r);
					setPage(0);
				}}
				onEdit={(contact) => {
					setEditingContact(contact);
					setCreateModalOpen(true);
				}}
			/>

			{/* Date Popover */}
			<Popover
				open={Boolean(dateAnchorEl)}
				anchorEl={dateAnchorEl}
				onClose={() => setDateAnchorEl(null)}
				anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
				transformOrigin={{ vertical: "top", horizontal: "left" }}
			>
				<Box sx={{ p: 2, width: 280 }}>
					<Typography
						variant="subtitle2"
						sx={{ mb: 2, fontWeight: 700 }}
					>
						{t("campaigns.date_created")}
					</Typography>
					<Stack spacing={2}>
						<LocalizationProvider dateAdapter={AdapterDayjs}>
							<DatePicker
								label="From"
								slotProps={{
									textField: {
										size: "small",
										InputLabelProps: {
											shrink: true,
										},
									},
								}}
								format="DD/MM/YYYY"
								value={filter.from ? dayjs(filter.from) : null}
								onChange={(value) =>
									setFilter({
										...filter,
										from: value ? value.toISOString() : undefined,
									})
								}
								disableFuture
							/>
						</LocalizationProvider>
						<LocalizationProvider dateAdapter={AdapterDayjs}>
							<DatePicker
								label="To"
								slotProps={{
									textField: {
										size: "small",
										InputLabelProps: {
											shrink: true,
										},
									},
								}}
								format="DD/MM/YYYY"
								value={filter.to ? dayjs(filter.to) : null}
								onChange={(value) =>
									setFilter({
										...filter,
										to: value ? value.toISOString() : undefined,
									})
								}
								disableFuture
							/>
						</LocalizationProvider>
					</Stack>
				</Box>
			</Popover>

			{/* Columns Popover */}
			<Popover
				open={Boolean(columnsAnchorEl)}
				anchorEl={columnsAnchorEl}
				onClose={() => setColumnsAnchorEl(null)}
				anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
				transformOrigin={{ vertical: "top", horizontal: "right" }}
			>
				<Box sx={{ p: 2, minWidth: 200 }}>
					<Typography
						variant="subtitle2"
						sx={{ mb: 1.5, fontWeight: 700 }}
					>
						{t("contacts.column_visibility")}
					</Typography>
					<FormGroup>
						{availableColumns.map((col) => (
							<FormControlLabel
								key={col.key}
								control={
									<Checkbox
										checked={visibleColumns.includes(col.key)}
										onChange={() => handleColumnToggle(col.key)}
										size="small"
									/>
								}
								label={<Typography variant="body2">{col.label}</Typography>}
							/>
						))}
					</FormGroup>
				</Box>
			</Popover>

			<ImportContactsModal
				open={importModalOpen}
				onClose={() => setImportModalOpen(false)}
				contactListSlug={id}
			/>

			<CreateContactModal
				open={createModalOpen}
				onClose={() => {
					setCreateModalOpen(false);
					setEditingContact(null);
				}}
				initialData={editingContact}
			/>

			<MoveOrAddListModal
				open={moveModalOpen}
				onClose={() => setMoveModalOpen(false)}
				type={moveModalType}
				contactIds={selectedContacts}
				oldListId={id}
				onSuccess={handleMoveSuccess}
			/>
		</Box>
	);
}
