import React, { useEffect, useState } from "react";
import {
	Box,
	Typography,
	Stack,
	Button,
	IconButton,
	TextField,
	InputAdornment,
	Popover,
	Checkbox,
	FormControlLabel,
	FormGroup,
} from "@mui/material";
import {
	ArrowBackIosNew,
	Search,
	Add,
	FileUploadOutlined,
	ViewColumnOutlined,
	Settings,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import {
	useContactLists,
	fetchContactLists,
	fetchContacts,
	useContacts,
} from "../store";
import { useSegments, fetchSegments } from "../stores/segment.store";
import ContactTable from "./ContactTable";
import ImportContactsModal from "./ImportContactsModal";
import CreateContactModal from "./CreateContactModal";

export default function ContactListDetailPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const contactLists = useContactLists();
	const contacts = useContacts();

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

	const [visibleColumns, setVisibleColumns] = useState<string[]>([
		"email",
		"name",
		"status",
		"date_created",
		"action",
	]);

	const availableColumns = [
		{ key: "email", label: "Mail address" },
		{ key: "name", label: "Name" },
		{ key: "status", label: "Status" },
		{ key: "date_created", label: "Date created" },
		{ key: "action", label: "Action" },
	];

	const handleColumnToggle = (columnKey: string) => {
		setVisibleColumns((prev) =>
			prev.includes(columnKey)
				? prev.filter((key) => key !== columnKey)
				: [...prev, columnKey],
		);
	};

	const contactList = contactLists.find(
		(list) => String(list.slug) === String(id),
	);

	const contactsInList = contactList?.subscribers || [];

	const filteredContacts = contactsInList.filter((contact) => {
		// 1. Search Query
		const query = searchQuery.toLowerCase();
		const matchesSearch =
			!searchQuery ||
			contact.email.toLowerCase().includes(query) ||
			contact.name?.toLowerCase().includes(query);

		// 2. Status Filter
		const matchesStatus =
			selectedStatus.length === 0 || selectedStatus.includes(contact.status);

		// 3. Tag Filter (Subscribers in schema don't have tags field directly, skipping for now)
		const matchesTags = true;

		// 4. Segment Filter
		const matchesSegment = true;

		return matchesSearch && matchesStatus && matchesTags && matchesSegment;
	});

	// Get unique tags (skipping as model changed)
	const allTags: string[] = [];
	const statusOptions = ["enabled", "blocklisted", "duplicate"];

	// Pagination logic
	const totalContacts = filteredContacts.length;
	const totalPages = Math.ceil(totalContacts / rowsPerPage);
	const paginatedContacts = filteredContacts.slice(
		page * rowsPerPage,
		(page + 1) * rowsPerPage,
	);

	useEffect(() => {
		setPage(0);
	}, [searchQuery]);

	useEffect(() => {
		fetchContactLists();
		fetchContacts();
		fetchSegments();
	}, []);

	const handleBack = () => {
		navigate("/contacts");
	};

	const handleSelectOne = (id: string | number) => {
		setSelectedContacts((prev) =>
			prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
		);
	};

	const handleSelectAll = () => {
		setSelectedContacts(filteredContacts.map((c) => c.id));
	};

	const handleClearSelection = () => {
		setSelectedContacts([]);
	};

	if (!contactList) {
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
				sx={{ px: 3, py: "20px", bgcolor: "white" }}
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
						sx={{ fontWeight: 800, color: "text.primary" }}
					>
						{contactList.name}
					</Typography>
				</Stack>

				<Stack
					direction="row"
					spacing={1.5}
				>
					<Button
						variant="outlined"
						startIcon={<Add />}
						onClick={() => setCreateModalOpen(true)}
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
								bgcolor: "white",
								height: 40,
								"& fieldset": { borderColor: "rgba(0, 0, 0, 0.12)" },
							},
						}}
					/>

					{/* Segment Filter */}
					<Button
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
					</Popover>

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
				</Stack>

				<Button
					variant="outlined"
					startIcon={<Settings />}
					onClick={(e) => setColumnsAnchorEl(e.currentTarget)}
					sx={{
						borderRadius: 10,
						textTransform: "none",
						color: "text.secondary",
						borderColor: "divider",
						px: 2,
						height: 40,
						fontWeight: 700,
						"&:hover": { bgcolor: "#F9FAFB", borderColor: "#D1D5DB" },
					}}
				>
					Columns
				</Button>
			</Stack>

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
						Filter by Date Created
					</Typography>
					<Stack spacing={2}>
						<TextField
							label="From"
							type="date"
							size="small"
							fullWidth
							InputLabelProps={{ shrink: true }}
						/>
						<TextField
							label="To"
							type="date"
							size="small"
							fullWidth
							InputLabelProps={{ shrink: true }}
						/>
						<Stack
							direction="row"
							spacing={1}
							justifyContent="flex-end"
							sx={{ mt: 1 }}
						>
							<Button
								size="small"
								onClick={() => setDateAnchorEl(null)}
							>
								Clear
							</Button>
							<Button
								size="small"
								variant="contained"
								onClick={() => setDateAnchorEl(null)}
							>
								Apply
							</Button>
						</Stack>
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
						Column Visibility
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
			/>

			<CreateContactModal
				open={createModalOpen}
				onClose={() => setCreateModalOpen(false)}
			/>
		</Box>
	);
}
