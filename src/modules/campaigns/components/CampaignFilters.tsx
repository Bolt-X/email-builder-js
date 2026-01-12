import React from "react";
import {
	Box,
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Chip,
	Stack,
	Button,
	ToggleButton,
	ToggleButtonGroup,
	Paper,
	Typography,
} from "@mui/material";
import {
	FilterList,
	ViewList,
	CalendarMonth,
} from "@mui/icons-material";
import {
	useCampaignFilters,
	useCampaignViewMode,
	setSearchQuery,
	setStatusFilter,
	setContactListFilter,
	setTagsFilter,
	setDateRangeFilter,
	setViewMode,
	clearFilters,
} from "../store";
import { CampaignStatus } from "../types";

const statusOptions: CampaignStatus[] = [
	"draft",
	"scheduled",
	"sending",
	"completed",
	"cancelled",
];

export default function CampaignFilters() {
	const filters = useCampaignFilters();
	const viewMode = useCampaignViewMode();

	return (
		<Paper sx={{ p: 2 }}>
			<Stack spacing={2}>
				<Stack
					direction="row"
					justifyContent="space-between"
					alignItems="center"
				>
					<Stack
						direction="row"
						alignItems="center"
						spacing={1}
					>
						<FilterList />
						<Typography variant="h6">Filters</Typography>
					</Stack>
					<ToggleButtonGroup
						value={viewMode}
						exclusive
						onChange={(_, newMode) => {
							if (newMode) setViewMode(newMode);
						}}
						size="small"
					>
						<ToggleButton value="table">
							<ViewList sx={{ mr: 1 }} />
							Table
						</ToggleButton>
						<ToggleButton value="calendar">
							<CalendarMonth sx={{ mr: 1 }} />
							Calendar
						</ToggleButton>
					</ToggleButtonGroup>
				</Stack>

				<Stack
					direction="row"
					spacing={2}
					flexWrap="wrap"
				>
					{/* Search */}
					<TextField
						label="Search"
						variant="outlined"
						size="small"
						value={filters.searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						sx={{ minWidth: 200 }}
					/>

					{/* Status Filter */}
					<FormControl
						size="small"
						sx={{ minWidth: 150 }}
					>
						<InputLabel>Status</InputLabel>
						<Select
							multiple
							value={filters.statusFilter}
							onChange={(e) =>
								setStatusFilter(e.target.value as CampaignStatus[])
							}
							renderValue={(selected) => (
								<Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
									{selected.map((value) => (
										<Chip
											key={value}
											label={value}
											size="small"
										/>
									))}
								</Box>
							)}
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

					{/* Date Range - simplified for now */}
					<TextField
						label="Start Date"
						type="date"
						size="small"
						value={filters.dateRangeFilter?.start || ""}
						onChange={(e) =>
							setDateRangeFilter({
								start: e.target.value,
								end: filters.dateRangeFilter?.end || e.target.value,
							})
						}
						InputLabelProps={{ shrink: true }}
						sx={{ minWidth: 150 }}
					/>
					<TextField
						label="End Date"
						type="date"
						size="small"
						value={filters.dateRangeFilter?.end || ""}
						onChange={(e) =>
							setDateRangeFilter({
								start: filters.dateRangeFilter?.start || e.target.value,
								end: e.target.value,
							})
						}
						InputLabelProps={{ shrink: true }}
						sx={{ minWidth: 150 }}
					/>
				</Stack>

				{/* Active Filters */}
				{(filters.statusFilter.length > 0 ||
					filters.tagsFilter.length > 0 ||
					filters.dateRangeFilter ||
					filters.searchQuery) && (
					<Stack
						direction="row"
						spacing={1}
						alignItems="center"
						flexWrap="wrap"
					>
						<Typography variant="body2">Active filters:</Typography>
						{filters.searchQuery && (
							<Chip
								label={`Search: ${filters.searchQuery}`}
								onDelete={() => setSearchQuery("")}
								size="small"
							/>
						)}
						{filters.statusFilter.map((status) => (
							<Chip
								key={status}
								label={`Status: ${status}`}
								onDelete={() =>
									setStatusFilter(
										filters.statusFilter.filter((s) => s !== status)
									)
								}
								size="small"
							/>
						))}
						<Button
							size="small"
							onClick={clearFilters}
						>
							Clear all
						</Button>
					</Stack>
				)}
			</Stack>
		</Paper>
	);
}
