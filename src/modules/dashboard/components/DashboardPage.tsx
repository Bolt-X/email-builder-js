import React from "react";
import { Box, Typography, Stack, Grid, CircularProgress } from "@mui/material";
import {
	Email,
	People,
	BarChart as BarChartIcon,
	TrendingUp,
} from "@mui/icons-material";
import { useGetAllCampaigns } from "../../../hooks/useCampaigns";
import { useGetAllContactLists } from "../../../hooks/useContactLists";
import StatCard from "./StatCard";
import PerformanceChart from "./PerformanceChart";
import RecentCampaignsTable from "./RecentCampaignsTable";
import QuickActions from "./QuickActions";

export default function DashboardPage() {
	const { data: campaigns, isLoading: campaignsLoading } = useGetAllCampaigns();
	const { data: contactLists, isLoading: listsLoading } =
		useGetAllContactLists();

	if (campaignsLoading || listsLoading) {
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

	const allCampaigns = campaigns || [];
	const allContactLists = contactLists || [];

	// Calculate Stats
	const totalContacts = allContactLists.reduce(
		(sum, list: any) => sum + (list.contactCount || 0),
		0,
	);
	const activeCampaigns = allCampaigns.filter(
		(c) => c.status === "running" || c.status === "scheduled",
	).length;

	const sentCampaigns = allCampaigns.filter((c) => (c.sent || 0) > 0);
	const totalSent = sentCampaigns.reduce((sum, c) => sum + (c.sent || 0), 0);
	const totalViews = sentCampaigns.reduce((sum, c) => sum + (c.views || 0), 0);
	const totalClicks = sentCampaigns.reduce(
		(sum, c) => sum + (c.clicks || 0),
		0,
	);

	const avgOpenRate = totalSent > 0 ? (totalViews / totalSent) * 100 : 0;
	const avgClickRate = totalSent > 0 ? (totalClicks / totalSent) * 100 : 0;

	// Prepare chart data (last 7 campaigns)
	const chartData = [...allCampaigns]
		.filter((c) => c.status !== "draft")
		.reverse()
		.slice(-7)
		.map((c) => ({
			name: c.name.length > 15 ? c.name.substring(0, 12) + "..." : c.name,
			sent: c.sent || 0,
			opened: c.views || 0,
			clicked: c.clicks || 0,
		}));

	return (
		<Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: "#f8f9fa", minHeight: "100vh" }}>
			<Stack
				direction="row"
				justifyContent="space-between"
				alignItems="center"
				sx={{ mb: { xs: 2, md: 4 } }}
			>
				<Typography
					variant="h4"
					sx={{
						fontWeight: 700,
						color: "text.primary",
						fontSize: { xs: "1.75rem", md: "2.125rem" },
					}}
				>
					Dashboard
				</Typography>
			</Stack>

			<Grid
				container
				spacing={3}
			>
				{/* KPI Cards */}
				<Grid
					item
					xs={12}
					sm={6}
					md={3}
				>
					<StatCard
						title="Total Contacts"
						value={totalContacts.toLocaleString()}
						icon={<People />}
						color="#4f46e5"
						tendency={{ value: "12%", label: "vs last month", isUp: true }}
					/>
				</Grid>
				<Grid
					item
					xs={12}
					sm={6}
					md={3}
				>
					<StatCard
						title="Active Campaigns"
						value={activeCampaigns}
						icon={<Email />}
						color="#0ea5e9"
					/>
				</Grid>
				<Grid
					item
					xs={12}
					sm={6}
					md={3}
				>
					<StatCard
						title="Avg. Open Rate"
						value={`${avgOpenRate.toFixed(1)}%`}
						icon={<TrendingUp />}
						color="#10b981"
						tendency={{ value: "4.3%", label: "vs last week", isUp: true }}
					/>
				</Grid>
				<Grid
					item
					xs={12}
					sm={6}
					md={3}
				>
					<StatCard
						title="Avg. Click Rate"
						value={`${avgClickRate.toFixed(1)}%`}
						icon={<BarChartIcon />}
						color="#f59e0b"
						tendency={{ value: "1.2%", label: "vs last week", isUp: false }}
					/>
				</Grid>

				{/* Middle Row */}
				<Grid
					item
					xs={12}
					md={8}
				>
					<PerformanceChart data={chartData} />
				</Grid>
				<Grid
					item
					xs={12}
					md={4}
				>
					<QuickActions />
				</Grid>

				{/* Bottom Row */}
				<Grid
					item
					xs={12}
				>
					<RecentCampaignsTable campaigns={allCampaigns} />
				</Grid>
			</Grid>
		</Box>
	);
}
