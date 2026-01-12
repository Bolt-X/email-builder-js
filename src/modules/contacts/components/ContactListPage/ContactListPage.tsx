import React, { useEffect, useState } from "react";
import { Box, Tabs, Tab, Badge, Stack } from "@mui/material";
import { useContactLists, fetchContactLists } from "../../stores/contactList.store";
import { useSegments, fetchSegments } from "../../stores/segment.store";
import ContactListTable from "./ContactListTable";
import SegmentsTable from "./SegmentsTable";

type TabValue = "contacts" | "segments";

export default function ContactListPage() {
	const [activeTab, setActiveTab] = useState<TabValue>("contacts");
	const contactLists = useContactLists();
	const segments = useSegments();

	useEffect(() => {
		fetchContactLists();
		fetchSegments();
	}, []);

	const handleTabChange = (_: React.SyntheticEvent, newValue: TabValue) => {
		setActiveTab(newValue);
	};

	return (
		<Box>
			{/* Tabs */}
			<Tabs
				value={activeTab}
				onChange={handleTabChange}
				sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
			>
				<Tab
					label={
						<Badge
							badgeContent={contactLists.length}
							color="primary"
						>
							Contacts
						</Badge>
					}
					value="contacts"
				/>
				<Tab
					label="Segments"
					value="segments"
				/>
			</Tabs>

			{/* Page Title */}
			<Stack
				direction="row"
				justifyContent="space-between"
				alignItems="center"
				mb={3}
			>
				{activeTab === "contacts" ? (
					<>
						<h2>Contact list</h2>
					</>
				) : (
					<>
						<h2>Segments</h2>
					</>
				)}
			</Stack>

			{/* Content */}
			{activeTab === "contacts" ? (
				<ContactListTable />
			) : (
				<SegmentsTable />
			)}
		</Box>
	);
}
