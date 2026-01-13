import React, { useEffect, useState } from "react";
import {
	Box,
	Tabs,
	Tab,
	Badge,
	Stack,
	Typography,
	Button,
} from "@mui/material";
import {
	useContactLists,
	fetchContactLists,
} from "../../stores/contactList.store";
import { useSegments, fetchSegments } from "../../stores/segment.store";
import ContactListTable from "./ContactListTable";
import SegmentsTable from "./SegmentsTable";

import { Add } from "@mui/icons-material";
import { ContactList } from "../../types";

type TabValue = "contacts" | "segments";

export default function ContactListPage({
	tab = "contacts",
}: {
	tab?: TabValue;
}) {
	const contactLists = useContactLists();
	const segments = useSegments();

	const [formDrawerOpen, setFormDrawerOpen] = useState(false);
	const [formMode, setFormMode] = useState<"create" | "edit">("create");
	const [editingList, setEditingList] = useState<ContactList | null>(null);

	useEffect(() => {
		fetchContactLists();
		fetchSegments();
	}, []);

	const handleCreate = () => {
		setFormMode("create");
		setEditingList(null);
		setFormDrawerOpen(true);
	};

	const handleEdit = (list: ContactList) => {
		setFormMode("edit");
		setEditingList(list);
		setFormDrawerOpen(true);
	};

	return (
		<Box sx={{ p: 0 }}>
			{/* Page Title & Actions */}
			<Stack
				direction="row"
				justifyContent="space-between"
				alignItems="center"
				mb={3}
			>
				<Typography
					variant="h5"
					sx={{ fontWeight: 800, color: "text.primary" }}
				>
					{tab === "contacts" ? "Contact list" : "Segments"}
				</Typography>

				{tab === "contacts" && (
					<Button
						variant="contained"
						startIcon={<Add />}
						onClick={handleCreate}
						sx={{
							borderRadius: 10,
							textTransform: "none",
							px: 3,
							height: 44,
							fontWeight: 700,
						}}
					>
						Create list
					</Button>
				)}
			</Stack>

			{/* Content */}
			{tab === "contacts" ? (
				<ContactListTable
					formDrawerOpen={formDrawerOpen}
					setFormDrawerOpen={setFormDrawerOpen}
					formMode={formMode}
					setFormMode={setFormMode}
					editingList={editingList}
					setEditingList={setEditingList}
					onEdit={handleEdit}
				/>
			) : (
				<SegmentsTable />
			)}
		</Box>
	);
}
