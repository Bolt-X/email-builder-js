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

	const isEmpty = campaigns.length === 0 && !loading;



// ... existing imports

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
					onClick={() => navigate("/campaigns/new")}
				>
					Create Campaign
				</Button>
			</Stack>

			<Stack spacing={2}>
				{/* Filters - Disabled when empty */}
				<CampaignFilters disabled={isEmpty} />

				{/* Actions Toolbar - Disabled when empty */}
				<CampaignActionsToolbar disabled={isEmpty} />

				{/* Campaign List - Only show if NOT empty */}
				{!isEmpty && (
					viewMode === "table" ? (
						<CampaignListTable campaigns={campaigns} />
					) : (
						<CampaignListCalendar campaigns={campaigns} />
					)
				)}

			{/* Empty State */}
				{isEmpty && (
					<Box
						display="flex"
						flexDirection="column"
						alignItems="center"
						justifyContent="center"
						minHeight="60vh"
						textAlign="center"
					>
						<Box
							mb={2}
							display="flex"
							justifyContent="center"
							alignItems="center"
							sx={{
								width: 64,
								height: 64,
								borderRadius: "50%",
								bgcolor: "grey.100",
								color: "primary.main",
								mb: 3
							}}
						>
							<Add fontSize="large" />
						</Box>
						<Typography
							variant="h6"
							sx={{ fontWeight: 600, mb: 1 }}
						>
							You have not created any email campaigns
						</Typography>
						<Typography
							variant="body1"
							color="text.secondary"
							sx={{ mb: 3 }}
						>
							Click on "Create campaign" and start designing your first email campaign.
						</Typography>
						<Button
							variant="outlined"
							startIcon={<Add />}
							onClick={() => navigate("/campaigns/new")}
							sx={{ borderRadius: 20, px: 3 }}
						>
							Create campaign
						</Button>
					</Box>
				)}
			</Stack>
		</Box>
	);
}
