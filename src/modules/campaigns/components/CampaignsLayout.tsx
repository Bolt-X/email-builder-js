import React, { useState, useEffect } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

export default function CampaignsLayout() {
	const navigate = useNavigate();
	const location = useLocation();
	const [value, setValue] = useState(0);

	// Determine active tab based on current path
	useEffect(() => {
		if (location.pathname.includes("/templates")) {
			setValue(1);
		} else if (location.pathname.includes("/media")) {
			setValue(2);
		} else {
			setValue(0);
		}
	}, [location.pathname]);

	const handleChange = (event: React.SyntheticEvent, newValue: number) => {
		setValue(newValue);
		switch (newValue) {
			case 0:
				navigate("/campaigns");
				break;
			case 1:
				navigate("/campaigns/templates");
				break;
			case 2:
				navigate("/campaigns/media");
				break;
			default:
				break;
		}
	};

	return (
		<Box sx={{ width: "100%" }}>
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
			<Outlet />
		</Box>
	);
}
