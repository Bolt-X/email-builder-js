import React, { useEffect, useMemo, useState } from "react";
import {
	Box,
	Button,
	CircularProgress,
	Stack,
	Typography,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
	useCampaigns,
	useCampaignsLoading,
	useCampaignFilters,
	useCampaignViewMode,
	fetchCampaigns,
} from "../stores/campaign.metadata.store";
import CampaignListTable from "./CampaignListTable";
import CampaignListCalendar from "./CampaignListCalendar";
import CampaignFilters from "./CampaignFilters";
import CampaignActionsToolbar from "./CampaignActionsToolbar";
import CampaignFormDrawer from "./CampaignFormDrawer";

export default function CampaignListPage() {
	const navigate = useNavigate();
	const campaigns = useCampaigns();
	const loading = useCampaignsLoading();
	const filters = useCampaignFilters();
	const viewMode = useCampaignViewMode();
	const [createDrawerOpen, setCreateDrawerOpen] = useState(false);

	// Build filter object from store state
	// Destructure to get stable primitive values for dependencies
	const {
		searchQuery,
		statusFilter,
		contactListFilter,
		tagsFilter,
		dateRangeFilter,
	} = filters;

	const filterObject = useMemo(() => {
		const filter: any = {};
		if (searchQuery) filter.searchQuery = searchQuery;
		if (statusFilter.length > 0) filter.status = statusFilter;
		if (contactListFilter) filter.contactListId = contactListFilter;
		if (tagsFilter.length > 0) filter.tags = tagsFilter;
		if (dateRangeFilter) filter.dateRange = dateRangeFilter;
		return Object.keys(filter).length > 0 ? filter : undefined;
	}, [searchQuery, statusFilter, contactListFilter, tagsFilter, dateRangeFilter]);

	useEffect(() => {
		fetchCampaigns(filterObject);
	}, [filterObject]);

	const handleCreateCampaign = () => {
		setCreateDrawerOpen(true);
	};

	const handleCloseDrawer = () => {
		setCreateDrawerOpen(false);
		// Refresh campaigns list
		fetchCampaigns(filterObject);
	};

	if (loading && campaigns.length === 0) {
		return (
			<Box
				display="flex"
				justifyContent="center"
				alignItems="center"
				minHeight="400px"
			>
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Box>
			<Stack
				direction="row"
				justifyContent="space-between"
				alignItems="center"
				mb={3}
			>
				<Typography variant="h4">Campaigns</Typography>
				<Button
					variant="contained"
					startIcon={<Add />}
					onClick={handleCreateCampaign}
				>
					Create Campaign
				</Button>
			</Stack>

			<Stack spacing={2}>
				{/* Filters */}
				<CampaignFilters />

				{/* Actions Toolbar */}
				<CampaignActionsToolbar />

				{/* Campaign List */}
				{viewMode === "table" ? (
					<CampaignListTable campaigns={campaigns} />
				) : (
					<CampaignListCalendar campaigns={campaigns} />
				)}

				{/* Empty State */}
				{campaigns.length === 0 && !loading && (
					<Box
						textAlign="center"
						py={8}
					>
						<Typography
							variant="h6"
							color="text.secondary"
							mb={2}
						>
							No campaigns found
						</Typography>
						<Button
							variant="outlined"
							onClick={handleCreateCampaign}
						>
							Create your first campaign
						</Button>
					</Box>
				)}
			</Stack>

			{/* Create Campaign Drawer */}
			<CampaignFormDrawer
				open={createDrawerOpen}
				onClose={handleCloseDrawer}
				mode="create"
			/>
		</Box>
	);
}
