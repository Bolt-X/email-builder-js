import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import { Campaign } from "../types";

interface CampaignListCalendarProps {
	campaigns: Campaign[];
}

export default function CampaignListCalendar({
	campaigns,
}: CampaignListCalendarProps) {
	// Placeholder for calendar view
	// Will be implemented with a calendar library in the future
	return (
		<Paper sx={{ p: 3, minHeight: 400 }}>
			<Typography variant="h6" gutterBottom>
				Calendar View
			</Typography>
			<Typography color="text.secondary">
				Calendar view will be implemented here. This will show campaigns
				scheduled by date.
			</Typography>
			<Box mt={2}>
				{campaigns
					.filter((c) => c.scheduleAt)
					.map((campaign) => (
						<Box
							key={campaign.id}
							sx={{ mb: 1, p: 1, bgcolor: "grey.100", borderRadius: 1 }}
						>
							<Typography variant="body2">
								{new Date(campaign.scheduleAt!).toLocaleDateString()}:{" "}
								{campaign.name}
							</Typography>
						</Box>
					))}
			</Box>
		</Paper>
	);
}
