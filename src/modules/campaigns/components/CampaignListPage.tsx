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
import { getAllCampaigns } from "../../../services/campaign";
import { useGetAllCampaigns } from "../../../hooks/useCampaigns";

export default function CampaignListPage() {
	const navigate = useNavigate();
	// const campaigns = useCampaigns();
	// const loading = useCampaignsLoading();
	const filters = useCampaignFilters();
	const viewMode = useCampaignViewMode();
	const [createDrawerOpen, setCreateDrawerOpen] = useState(false);

	const { data: campaigns, isLoading: loading } = useGetAllCampaigns();

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
	}, [
		searchQuery,
		statusFilter,
		contactListFilter,
		tagsFilter,
		dateRangeFilter,
	]);

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

	// if (loading && campaigns.length === 0) {
	// 	return (
	// 		<Box
	// 			display="flex"
	// 			justifyContent="center"
	// 			alignItems="center"
	// 			minHeight="400px"
	// 		>
	// 			<CircularProgress />
	// 		</Box>
	// 	);
	// }

	const hasFilters = Boolean(
		searchQuery ||
			statusFilter.length > 0 ||
			contactListFilter ||
			tagsFilter.length > 0 ||
			dateRangeFilter,
	);

	const isTrulyEmpty = campaigns?.length === 0 && !loading && !hasFilters;
	const isFilteredEmpty = campaigns?.length === 0 && !loading && hasFilters;

	// ... existing imports

	return (
		<Box>
			<Stack
				direction="row"
				justifyContent="space-between"
				alignItems="center"
				sx={{ px: 3, py: "20px", bgcolor: "white" }}
			>
				<Typography variant="h4">Campaigns</Typography>
				<Button
					variant="contained"
					startIcon={<Add />}
					onClick={() => navigate("/campaigns/new")}
					sx={{
						borderRadius: 10,
						textTransform: "none",
						px: 3,
						height: 44,
						fontWeight: 700,
					}}
				>
					Create Campaign
				</Button>
			</Stack>

			<Stack spacing={2}>
				{/* Filters - Always show if NOT truly empty */}
				{!isTrulyEmpty && <CampaignFilters />}

				{/* Actions Toolbar - Hide if empty or filtered empty */}
				{!isTrulyEmpty && !isFilteredEmpty && <CampaignActionsToolbar />}

				{/* Campaign List - Only show if NOT empty */}
				{!isTrulyEmpty &&
					!isFilteredEmpty &&
					(viewMode === "table" ? (
						<CampaignListTable
							campaigns={campaigns ?? []}
							loading={loading}
						/>
					) : (
						<CampaignListCalendar campaigns={campaigns ?? []} />
					))}

				{/* No Results Found (Filtered Empty) */}
				{isFilteredEmpty && (
					<Box
						display="flex"
						flexDirection="column"
						alignItems="center"
						justifyContent="center"
						minHeight="40vh"
						textAlign="center"
						sx={{
							bgcolor: "background.paper",
							borderRadius: 2,
							p: 4,
							border: "1px solid",
							borderColor: "divider",
						}}
						mt={[0, "0rem !important"]}
					>
						<Typography
							variant="h6"
							sx={{ fontWeight: 600, mb: 1 }}
						>
							No campaigns found
						</Typography>
						<Typography
							variant="body2"
							color="text.secondary"
							sx={{ mb: 3 }}
						>
							Try adjusting your search or filters to find what you're looking
							for.
						</Typography>
						<Button
							variant="outlined"
							onClick={() =>
								import("../stores/campaign.metadata.store").then((m) =>
									m.clearFilters(),
								)
							}
						>
							Clear all filters
						</Button>
					</Box>
				)}

				{/* Truly Empty State (No campaigns at all) */}
				{isTrulyEmpty && (
					<Box
						display="flex"
						flexDirection="column"
						alignItems="center"
						justifyContent="center"
						minHeight="60vh"
						textAlign="center"
						mt={[0, "0rem !important"]}
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
								mb: 3,
							}}
							mt={[0, "0rem !important"]}
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
							Click on "Create campaign" and start designing your first email
							campaign.
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
