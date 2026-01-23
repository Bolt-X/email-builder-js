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
import ModalCreateContactList from "./ModalCreateOrEdit";

export default function ContactListPage() {
	const contactLists = useContactLists();

	const [formDrawerOpen, setFormDrawerOpen] = useState(false);
	const [formMode, setFormMode] = useState<"create" | "edit">("create");
	const [editingList, setEditingList] = useState<ContactList | null>(null);
	const [openModal, setOpenModal] = useState(false);

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
		setOpenModal(true);
		setEditingList(list)
	};

	return (
		<Box sx={{ p: 0 }}>
			{/* Page Title & Actions */}
			<ModalCreateContactList open={openModal} onClose={() => setOpenModal(false)} dataContactList={editingList} />
			<Stack
				direction="row"
				justifyContent="space-between"
				alignItems="center"
				sx={{ px: 3, py: "20px", bgcolor: "white" }}
			>
				<Typography
					variant="h4"
					sx={{ fontWeight: 600, color: "text.primary" }}
				>
					Contact list
				</Typography>

				<Button
					variant="contained"
					startIcon={<Add />}
					onClick={() => setOpenModal(true)}
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
			</Stack>

			{/* Content */}
			<ContactListTable
				formDrawerOpen={formDrawerOpen}
				setFormDrawerOpen={setFormDrawerOpen}
				formMode={formMode}
				setFormMode={setFormMode}
				editingList={editingList}
				setEditingList={setEditingList}
				onEdit={handleEdit}
			/>
		</Box>
	);
}
