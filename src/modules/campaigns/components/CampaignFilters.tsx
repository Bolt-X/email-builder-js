import {
	CalendarMonth,
	Search,
	ViewList,
	ViewColumn,
	Settings,
	FilterAlt,
} from "@mui/icons-material";
import {
	Box,
	FormControl,
	InputAdornment,
	InputLabel,
	MenuItem,
	Select,
	Stack,
	TextField,
	ToggleButton,
	ToggleButtonGroup,
	IconButton,
	Button,
	Popover,
	Checkbox,
	FormControlLabel,
	Typography,
} from "@mui/material";
import { useState, useEffect } from "react";
import {
	setSearchQuery,
	setStatusFilter,
	setContactListFilter,
	setTagsFilter,
	setDateRangeFilter,
	setViewMode,
	setVisibleColumns,
	clearFilters,
	useCampaignFilters,
	useCampaignViewMode,
	useVisibleColumns,
} from "../stores/campaign.metadata.store";
import { CampaignStatus } from "../types";

const statusOptions: CampaignStatus[] = [
	"draft",
	"scheduled",
	"running",
	"finished",
	"cancelled",
];

import { useGetAllContactLists } from "../../../hooks/useContactLists";
import { useGetAllTags } from "../../../hooks/useTags";

export default function CampaignFilters({ disabled }: { disabled?: boolean }) {
	const { data: contactLists = [] } = useGetAllContactLists();
	const { data: allTags = [] } = useGetAllTags();
	const filters = useCampaignFilters();
	const viewMode = useCampaignViewMode();
	const visibleColumns = useVisibleColumns();

	// Support for date range popover
	const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
	// Column config popover
	const [columnAnchorEl, setColumnAnchorEl] =
		useState<HTMLButtonElement | null>(null);

	const handleColumnToggle = (column: string) => {
		const newColumns = visibleColumns.includes(column)
			? visibleColumns.filter((c) => c !== column)
			: [...visibleColumns, column];
		setVisibleColumns(newColumns);
	};

	// Local state for filters to support "Apply on Click"
	const [localSearch, setLocalSearch] = useState(filters.searchQuery);
	const [localStatus, setLocalStatus] = useState<CampaignStatus[]>(
		filters.statusFilter,
	);
	const [localContacts, setLocalContacts] = useState<string | number | null>(
		filters.contactListFilter,
	);
	const [localTags, setLocalTags] = useState<string[]>(filters.tagsFilter);
	const [localDate, setLocalDate] = useState<{
		start: string;
		end: string;
	} | null>(filters.dateRangeFilter);

	const handleSearch = () => {
		setSearchQuery(localSearch);
		setStatusFilter(localStatus);
		setContactListFilter(localContacts);
		setTagsFilter(localTags);
		setDateRangeFilter(localDate);
	};

	const handleClear = () => {
		clearFilters();
		setLocalSearch("");
		setLocalStatus([]);
		setLocalContacts(null);
		setLocalTags([]);
		setLocalDate(null);
	};

	// Sync local state when store is cleared or changed externally
	useEffect(() => {
		setLocalSearch(filters.searchQuery);
		setLocalStatus(filters.statusFilter || []);
		setLocalContacts(filters.contactListFilter);
		setLocalTags(filters.tagsFilter || []);
		setLocalDate(filters.dateRangeFilter);
	}, [filters]);

	const handleDateClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleDateClose = () => {
		setAnchorEl(null);
	};

	const openDate = Boolean(anchorEl);

	const commonSx = {
		borderRadius: "6px",
		backgroundColor: "background.paper",
		"& .MuiOutlinedInput-root": {
			borderRadius: "6px",
		},
		"& fieldset": {
			borderColor: "rgba(0, 0, 0, 0.12)",
		},
	};

	return (
		<Box
			sx={{ borderBottom: "1px solid #e0e0e0", pb: 2, bgcolor: "white" }}
			mt={[0, "0rem !important"]}
		>
			<Stack
				direction="row"
				justifyContent="space-between"
				alignItems="flex-start"
				spacing={2}
				px={3}
			>
				{/* Left Side: Search & Filters */}
				<Stack
					direction="row"
					spacing={1.5}
					alignItems="center"
					flexGrow={1}
					flexWrap="wrap"
					useFlexGap
				>
					{/* Search */}
					<FormControl
						variant="outlined"
						size="small"
					>
						<TextField
							placeholder="Search campaigns..."
							size="small"
							value={localSearch}
							onChange={(e) => setLocalSearch(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									handleSearch();
								}
							}}
							disabled={disabled}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<Search
											fontSize="small"
											color="action"
										/>
									</InputAdornment>
								),
								sx: {
									minWidth: 240,
								},
							}}
							sx={commonSx}
						/>
					</FormControl>

					{/* Status Filter */}
					<FormControl
						size="small"
						sx={{ minWidth: 120, ...commonSx }}
					>
						<InputLabel
							id="status-label"
							shrink={false}
							sx={{
								fontSize: "0.875rem",
								display: localStatus.length > 0 ? "none" : "block",
							}}
						>
							Status
						</InputLabel>
						<Select
							labelId="status-label"
							multiple
							displayEmpty
							value={localStatus}
							onChange={(e) =>
								setLocalStatus(e.target.value as CampaignStatus[])
							}
							disabled={disabled}
							renderValue={(selected) => {
								if (!selected || selected.length === 0) return "";
								return selected.join(", ");
							}}
							sx={{ fontSize: "0.875rem" }}
						>
							{statusOptions.map((status) => (
								<MenuItem
									key={status}
									value={status}
								>
									{status}
								</MenuItem>
							))}
						</Select>
					</FormControl>

					{/* Contacts Filter */}
					<FormControl
						size="small"
						sx={{ minWidth: 140, ...commonSx }}
					>
						<InputLabel
							id="contacts-label"
							shrink={false}
							sx={{
								fontSize: "0.875rem",
								display: localContacts ? "none" : "block",
							}}
						>
							Contacts
						</InputLabel>
						<Select
							labelId="contacts-label"
							displayEmpty
							value={(localContacts ?? "") as any}
							onChange={(e) =>
								setLocalContacts(e.target.value as string | number | null)
							}
							disabled={disabled}
							renderValue={(selected) => {
								if (!selected) return "";
								const contact = contactLists.find(
									(c) => String(c.slug) === String(selected),
								);
								return contact ? contact.name : "";
							}}
							sx={{ fontSize: "0.875rem" }}
						>
							<MenuItem
								key="none"
								value=""
							>
								<em>None</em>
							</MenuItem>
							{contactLists.map((option) => (
								<MenuItem
									key={option.slug}
									value={option.slug}
								>
									{option.name}
								</MenuItem>
							))}
						</Select>
					</FormControl>

					{/* Tags Filter */}
					<FormControl
						size="small"
						sx={{ minWidth: 120, ...commonSx }}
					>
						<InputLabel
							id="tags-label"
							shrink={false}
							sx={{
								fontSize: "0.875rem",
								display: localTags.length > 0 ? "none" : "block",
							}}
						>
							Tags
						</InputLabel>
						<Select
							labelId="tags-label"
							multiple
							displayEmpty
							value={localTags}
							onChange={(e) => setLocalTags(e.target.value as string[])}
							disabled={disabled}
							renderValue={(selected) => {
								if (!selected || selected.length === 0) return "";
								return allTags
									.filter((t) => selected.includes(t.slug))
									.map((t) => t.title)
									.join(", ");
							}}
							sx={{ fontSize: "0.875rem" }}
						>
							{allTags.map((tag) => (
								<MenuItem
									key={tag.slug}
									value={tag.slug}
								>
									{tag.title}
								</MenuItem>
							))}
						</Select>
					</FormControl>

					{/* Date Created Filter - Refined as a button that opens a popover */}
					<Button
						size="small"
						variant="outlined"
						onClick={handleDateClick}
						disabled={disabled}
						sx={{
							...commonSx,
							textTransform: "none",
							color: "text.primary",
							borderColor: "rgba(0,0,0,0.12)",
							px: 2,
							minHeight: 40,
							justifyContent: "flex-start",
							minWidth: 140,
							fontWeight: 400,
							fontSize: "0.875rem",
						}}
					>
						Date created
					</Button>

					<Stack
						direction="row"
						spacing={1}
					>
						<Button
							variant="contained"
							size="small"
							onClick={handleSearch}
							sx={{ height: 40, px: 2, borderRadius: "6px" }}
						>
							Search
						</Button>

						<Button
							variant="text"
							size="small"
							color="inherit"
							onClick={handleClear}
							sx={{
								height: 40,
								textTransform: "none",
								color: "text.secondary",
							}}
						>
							Clear
						</Button>
					</Stack>

					<Popover
						open={openDate}
						anchorEl={anchorEl}
						onClose={handleDateClose}
						anchorOrigin={{
							vertical: "bottom",
							horizontal: "left",
						}}
					>
						<Stack
							p={2}
							spacing={2}
						>
							<TextField
								label="From"
								type="date"
								size="small"
								InputLabelProps={{ shrink: true }}
								value={localDate?.start || ""}
								onChange={(e) =>
									setLocalDate({
										start: e.target.value,
										end: localDate?.end || "",
									})
								}
							/>
							<TextField
								label="To"
								type="date"
								size="small"
								InputLabelProps={{ shrink: true }}
								value={localDate?.end || ""}
								onChange={(e) =>
									setLocalDate({
										start: localDate?.start || "",
										end: e.target.value,
									})
								}
							/>
						</Stack>
					</Popover>
				</Stack>

				{/* Right Side: Columns & View Toggle */}
				<Stack
					direction="row"
					spacing={1}
					alignItems="center"
				>
					<Button
						variant="outlined"
						size="small"
						startIcon={<Settings fontSize="small" />}
						disabled={disabled}
						onClick={(e) => setColumnAnchorEl(e.currentTarget)}
						sx={{
							borderRadius: 20,
							textTransform: "none",
							color: "#555",
							borderColor: "#e0e0e0",
							px: 2,
							height: 40,
							fontWeight: 600,
							"&:hover": {
								borderColor: "#ccc",
								backgroundColor: "rgba(0,0,0,0.02)",
							},
						}}
					>
						Columns
					</Button>
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
					>
						<Box
							sx={{ p: 2, minWidth: 200 }}
							mt={[0, "0rem !important"]}
						>
							<Stack spacing={1}>
								<FormControlLabel
									control={
										<Checkbox
											checked
											disabled
											size="small"
										/>
									}
									label={<Typography variant="body2">Name</Typography>}
								/>
								<FormControlLabel
									control={
										<Checkbox
											checked={visibleColumns.includes("status")}
											onChange={() => handleColumnToggle("status")}
											size="small"
										/>
									}
									label={<Typography variant="body2">Status</Typography>}
								/>
								<FormControlLabel
									control={
										<Checkbox
											checked={visibleColumns.includes("contacts")}
											onChange={() => handleColumnToggle("contacts")}
											size="small"
										/>
									}
									label={<Typography variant="body2">Contacts</Typography>}
								/>
								<FormControlLabel
									control={
										<Checkbox
											checked={visibleColumns.includes("tags")}
											onChange={() => handleColumnToggle("tags")}
											size="small"
										/>
									}
									label={<Typography variant="body2">Tags</Typography>}
								/>
								<FormControlLabel
									control={
										<Checkbox
											checked={visibleColumns.includes("timestamps")}
											onChange={() => handleColumnToggle("timestamps")}
											size="small"
										/>
									}
									label={<Typography variant="body2">Timestamps</Typography>}
								/>
								<FormControlLabel
									control={
										<Checkbox
											checked={visibleColumns.includes("stats")}
											onChange={() => handleColumnToggle("stats")}
											size="small"
										/>
									}
									label={<Typography variant="body2">Stats</Typography>}
								/>
								<FormControlLabel
									control={
										<Checkbox
											checked
											disabled
											size="small"
										/>
									}
									label={<Typography variant="body2">Actions</Typography>}
								/>
							</Stack>
						</Box>
					</Popover>

					<ToggleButtonGroup
						value={viewMode}
						exclusive
						onChange={(_, newMode) => {
							if (newMode) setViewMode(newMode);
						}}
						size="small"
						disabled={disabled}
						sx={{
							backgroundColor: "white",
							borderRadius: 20,
							border: "1px solid #e0e0e0",
							"& .MuiToggleButton-root": {
								borderRadius: 20,
								border: "none",
								height: 40,
								width: 50,
								color: "#555",
								"&.Mui-selected": {
									backgroundColor: "#f2f2f2",
									color: "#000",
								},
								"&:first-of-type": {
									borderTopRightRadius: 0,
									borderBottomRightRadius: 0,
								},
								"&:last-of-type": {
									borderTopLeftRadius: 0,
									borderBottomLeftRadius: 0,
									borderLeft: "1px solid #e0e0e0",
								},
							},
						}}
					>
						<ToggleButton
							value="table"
							size="small"
						>
							<ViewList fontSize="small" />
						</ToggleButton>
						<ToggleButton
							value="calendar"
							size="small"
						>
							<CalendarMonth fontSize="small" />
						</ToggleButton>
					</ToggleButtonGroup>
				</Stack>
			</Stack>
		</Box>
	);
}
