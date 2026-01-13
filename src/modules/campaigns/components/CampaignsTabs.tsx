import React from "react";
import { Box, Tabs, Tab } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

export default function CampaignsTabs() {
	const navigate = useNavigate();
	const location = useLocation();

	// Determine active tab based on current path
    // We match exact paths or sub-paths if appropriate
	let value = 0;
	if (location.pathname.startsWith("/templates")) {
		value = 1;
	} else if (location.pathname.startsWith("/media")) {
		value = 2;
	} else {
        // Default to campaigns (0)
		value = 0;
	}

	const handleChange = (event: React.SyntheticEvent, newValue: number) => {
		switch (newValue) {
			case 0:
				navigate("/campaigns");
				break;
			case 1:
				navigate("/templates");
				break;
			case 2:
				navigate("/media");
				break;
			default:
				break;
		}
	};

	return (
		<Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
			<Tabs
				value={value}
				onChange={handleChange}
				aria-label="campaign tabs"
			>
				<Tab label="Campaigns" />
				<Tab label="Templates" />
				<Tab label="Media" />
			</Tabs>
		</Box>
	);
}
