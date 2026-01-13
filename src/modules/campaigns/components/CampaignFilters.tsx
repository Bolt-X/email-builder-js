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
} from "@mui/material";
import { useState } from "react";
import {
	setSearchQuery,
	setStatusFilter,
	setContactListFilter,
	setTagsFilter,
	setDateRangeFilter,
	setViewMode,
	useCampaignFilters,
	useCampaignViewMode,
} from "../store";
import { CampaignStatus } from "../types";

const statusOptions: CampaignStatus[] = [
	"draft",
	"scheduled",
	"sending",
	"completed",
	"cancelled",
];

// Mock options for demonstration
const contactOptions = [
	{ id: 1, name: "Newsletter Members" },
	{ id: 2, name: "VIP Customers" },
	{ id: 3, name: "Product Launch List" },
];

const tagOptions = [
	"Promotion",
	"Product",
	"Newsletter",
	"Announcement",
	"Support",
];

export default function CampaignFilters({ disabled }: { disabled?: boolean }) {
	const filters = useCampaignFilters();
	const viewMode = useCampaignViewMode();

	// Support for date range popover
	const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

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
		<Box sx={{ mb: 3 }}>
			<Stack
				direction="row"
				justifyContent="space-between"
				alignItems="flex-start"
				spacing={2}
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
							value={filters.searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
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
						{!filters.statusFilter?.length && (
							<InputLabel
								id="status-label"
								shrink={false}
								sx={{ fontSize: "0.875rem" }}
							>
								Status
							</InputLabel>
						)}
						<Select
							labelId="status-label"
							multiple
							displayEmpty
							value={filters.statusFilter || []}
							onChange={(e) =>
								setStatusFilter(e.target.value as CampaignStatus[])
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
						{!filters.contactListFilter && (
							<InputLabel
								id="contacts-label"
								shrink={false}
								sx={{ fontSize: "0.875rem" }}
							>
								Contacts
							</InputLabel>
						)}
						<Select
							labelId="contacts-label"
							displayEmpty
							value={filters.contactListFilter || ""}
							onChange={(e) => setContactListFilter(e.target.value)}
							disabled={disabled}
							renderValue={(selected) => {
								if (!selected) return "";
								const contact = contactOptions.find((c) => c.id === selected);
								return contact ? contact.name : "";
							}}
							sx={{ fontSize: "0.875rem" }}
						>
							<MenuItem value="">
								<em>None</em>
							</MenuItem>
							{contactOptions.map((option) => (
								<MenuItem
									key={option.id}
									value={option.id}
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
						{!filters.tagsFilter?.length && (
							<InputLabel
								id="tags-label"
								shrink={false}
								sx={{ fontSize: "0.875rem" }}
							>
								Tags
							</InputLabel>
						)}
						<Select
							labelId="tags-label"
							multiple
							displayEmpty
							value={filters.tagsFilter || []}
							onChange={(e) => setTagsFilter(e.target.value as string[])}
							disabled={disabled}
							renderValue={(selected) => {
								if (!selected || selected.length === 0) return "";
								return selected.join(", ");
							}}
							sx={{ fontSize: "0.875rem" }}
						>
							{tagOptions.map((tag) => (
								<MenuItem
									key={tag}
									value={tag}
								>
									{tag}
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
								value={filters.dateRangeFilter?.start || ""}
								onChange={(e) =>
									setDateRangeFilter({
										start: e.target.value,
										end: filters.dateRangeFilter?.end || "",
									})
								}
							/>
							<TextField
								label="To"
								type="date"
								size="small"
								InputLabelProps={{ shrink: true }}
								value={filters.dateRangeFilter?.end || ""}
								onChange={(e) =>
									setDateRangeFilter({
										start: filters.dateRangeFilter?.start || "",
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
						startIcon={<ViewColumn fontSize="small" />}
						disabled={disabled}
						sx={{
							...commonSx,
							textTransform: "none",
							color: "text.primary",
							px: 1.5,
							minHeight: 40,
						}}
					>
						Columns
					</Button>

					<ToggleButtonGroup
						value={viewMode}
						exclusive
						onChange={(_, newMode) => {
							if (newMode) setViewMode(newMode);
						}}
						size="small"
						disabled={disabled}
						sx={{
							backgroundColor: "background.paper",
							borderRadius: "6px",
							"& .MuiToggleButton-root": {
								borderRadius: "6px",
								border: "1px solid rgba(0,0,0,0.12) !important",
								ml: "-1px !important",
								minHeight: 40,
								px: 1.5,
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
