import React, { useEffect, useState } from "react";
import {
	Drawer,
	Box,
	Typography,
	TextField,
	Button,
	Stack,
	IconButton,
	Divider,
	Autocomplete,
	Chip,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { ContactList } from "../types";
import {
	createContactListAction,
	updateContactListAction,
	fetchContactLists,
} from "../stores/contactList.store";

interface ContactListFormDrawerProps {
	open: boolean;
	onClose: () => void;
	mode?: "create" | "edit";
	list?: ContactList;
}

export default function ContactListFormDrawer({
	open,
	onClose,
	mode = "create",
	list,
}: ContactListFormDrawerProps) {
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState<Partial<ContactList>>({
		name: "",
		description: "",
		contactIds: [],
		isDefault: false,
		isEnabled: true,
		tags: [],
	});

	// Load contact list data when editing
	useEffect(() => {
		if (mode === "edit" && list) {
			setFormData({
				name: list.name || "",
				description: list.description || "",
				contactIds: list.contactIds || [],
				isDefault: list.isDefault || false,
				isEnabled: list.isEnabled !== false,
				tags: list.tags || [],
			});
		} else {
			setFormData({
				name: "",
				description: "",
				contactIds: [],
				isDefault: false,
				isEnabled: true,
				tags: [],
			});
		}
	}, [mode, list, open]);

	useEffect(() => {
		if (open) {
			fetchContactLists();
		}
	}, [open]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			if (mode === "create") {
				await createContactListAction({
					name: formData.name!,
					description: formData.description,
					isDefault: false,
					isEnabled: formData.isEnabled !== false,
					contactIds: formData.contactIds || [],
					tags: formData.tags || [],
				});
			} else if (list) {
				await updateContactListAction(list.id, {
					name: formData.name,
					description: formData.description,
					isEnabled: formData.isEnabled,
					contactIds: formData.contactIds,
					tags: formData.tags,
				});
			}
			await fetchContactLists();
			onClose();
		} catch (error: any) {
			console.error("Error saving contact list:", error);
			alert("Error saving contact list: " + error.message);
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (field: keyof ContactList, value: any) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	return (
		<Drawer
			anchor="right"
			open={open}
			onClose={onClose}
			PaperProps={{
				sx: {
					width: { xs: "100%", sm: 500, md: 600 },
				},
			}}
		>
			<Box sx={{ p: 3, height: "100%", overflow: "auto" }}>
				{/* Header */}
				<Stack
					direction="row"
					justifyContent="space-between"
					alignItems="center"
					mb={3}
				>
					<Typography variant="h5">
						{mode === "create" ? "Create Contact List" : "Edit Contact List"}
					</Typography>
					<IconButton onClick={onClose}>
						<Close />
					</IconButton>
				</Stack>

				<Divider sx={{ mb: 3 }} />

				{/* Form */}
				<form onSubmit={handleSubmit}>
					<Stack spacing={3}>
						{/* Contact List Name */}
						<TextField
							label="Contact List Name"
							required
							fullWidth
							value={formData.name}
							onChange={(e) => handleChange("name", e.target.value)}
							placeholder="Enter contact list name"
						/>

						{/* Description */}
						<TextField
							label="Description"
							fullWidth
							multiline
							rows={3}
							value={formData.description || ""}
							onChange={(e) => handleChange("description", e.target.value)}
							placeholder="Enter contact list description"
						/>

						{/* Tags */}
						<Autocomplete
							multiple
							options={[]}
							freeSolo
							value={formData.tags || []}
							onChange={(_, newValue) => handleChange("tags", newValue)}
							renderTags={(value, getTagProps) =>
								value.map((option, index) => (
									<Chip
										variant="outlined"
										label={option}
										{...getTagProps({ index })}
										key={index}
									/>
								))
							}
							renderInput={(params) => (
								<TextField
									{...params}
									label="Tags"
									placeholder="Add tags"
								/>
							)}
						/>

						{/* Action Buttons */}
						<Stack
							direction="row"
							spacing={2}
							justifyContent="flex-end"
							sx={{ mt: 4 }}
						>
							<Button
								variant="outlined"
								onClick={onClose}
								disabled={loading}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								variant="contained"
								disabled={loading || !formData.name}
							>
								{mode === "create" ? "Create" : "Save"} Contact List
							</Button>
						</Stack>
					</Stack>
				</form>
			</Box>
		</Drawer>
	);
}
