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
import ContactTable from "./ContactTable";
import ImportContactsModal from "./ImportContactsModal";
import CreateContactModal from "./CreateContactModal";

export default function ContactListDetailPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const contactLists = useContactLists();
	const contacts = useContacts();

	const [searchQuery, setSearchQuery] = useState("");
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(25);
	const [selectedContacts, setSelectedContacts] = useState<(string | number)[]>(
		[]
	);
	const [dateAnchorEl, setDateAnchorEl] = useState<null | HTMLElement>(null);
	const [columnsAnchorEl, setColumnsAnchorEl] = useState<null | HTMLElement>(
		null
	);
	const [importModalOpen, setImportModalOpen] = useState(false);
	const [createModalOpen, setCreateModalOpen] = useState(false);

	const [visibleColumns, setVisibleColumns] = useState<string[]>([
		"email",
		"firstName",
		"lastName",
		"address",
		"status",
		"tags",
		"createdAt",
		"action",
	]);

	const availableColumns = [
		{ key: "email", label: "Mail address" },
		{ key: "firstName", label: "First name" },
		{ key: "lastName", label: "Last name" },
		{ key: "address", label: "Address" },
		{ key: "status", label: "Status" },
		{ key: "tags", label: "Tags" },
		{ key: "createdAt", label: "Date created" },
		{ key: "action", label: "Action" },
	];

	const handleColumnToggle = (columnKey: string) => {
		setVisibleColumns((prev) =>
			prev.includes(columnKey)
				? prev.filter((key) => key !== columnKey)
				: [...prev, columnKey]
		);
	};

	const contactList = contactLists.find(
		(list) => String(list.id) === String(id)
	);

	const filteredContacts = contacts.filter((contact) => {
		// Mock: Show all contacts for now regardless of membership
		if (!searchQuery) return true;
		const query = searchQuery.toLowerCase();
		return (
			contact.email.toLowerCase().includes(query) ||
			contact.firstName?.toLowerCase().includes(query) ||
			contact.lastName?.toLowerCase().includes(query)
		);
	});

	// Pagination logic
	const totalContacts = filteredContacts.length;
	const totalPages = Math.ceil(totalContacts / rowsPerPage);
	const paginatedContacts = filteredContacts.slice(
		page * rowsPerPage,
		(page + 1) * rowsPerPage
	);

	useEffect(() => {
		setPage(0);
	}, [searchQuery]);

	useEffect(() => {
		fetchContactLists();
		fetchContacts();
	}, []);

	const handleBack = () => {
		navigate("/contacts");
	};

	const handleSelectOne = (id: string | number) => {
		setSelectedContacts((prev) =>
			prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
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
		<Box sx={{ p: 0 }}>
			{/* Title and Action Buttons */}
			<Stack
				direction="row"
				justifyContent="space-between"
				alignItems="center"
				mb={4}
				mt={2}
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
						variant="h5"
						sx={{ fontWeight: 700 }}
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
				mb={3}
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

					{["Segment", "Status", "Tag"].map((filter) => (
						<Button
							key={filter}
							variant="outlined"
							size="small"
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
							{filter}
							<Typography sx={{ fontSize: 10, ml: 1, fontWeight: 900 }}>
								▼
							</Typography>
						</Button>
					))}

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
