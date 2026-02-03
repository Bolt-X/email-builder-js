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
import { importContacts } from "../service";
import { CloudUploadOutlined } from "@mui/icons-material";
import { useGetAllTags } from "../../../hooks/useTags";
import {
	Checkbox,
	FormControlLabel,
	Select,
	MenuItem,
	InputLabel,
} from "@mui/material";

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
		status: "draft",
	});
	const [shouldImport, setShouldImport] = useState(false);
	const [importFile, setImportFile] = useState<File | null>(null);
	const [importStatus, setImportStatus] = useState("subscribed");
	const [importUpdateMode, setImportUpdateMode] = useState("both");

	const fileInputRef = React.useRef<HTMLInputElement>(null);

	// Load contact list data when editing
	useEffect(() => {
		if (mode === "edit" && list) {
			setFormData({
				name: list.name || "",
				status: list.status || "draft",
			});
		} else {
			setFormData({
				name: "",
				status: "draft",
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
				const newList = await createContactListAction({
					name: formData.name!,
					status: formData.status as any,
				});

				if (shouldImport && importFile) {
					await importContacts({
						file: importFile,
						contactListSlug: newList.slug,
						status: importStatus,
						updateExisting: importUpdateMode !== "add", // simplified logic based on "both", "add", "update"
					});
					// Note: importContacts might throw, caught by catch block.
				}
			} else if (list) {
				await updateContactListAction(list.slug, {
					name: formData.name,
					status: formData.status as any,
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

						{/* Status */}
						<TextField
							select
							label="Status"
							required
							fullWidth
							value={formData.status}
							onChange={(e) => handleChange("status", e.target.value)}
							SelectProps={{ native: true }}
						>
							<option value="draft">Draft</option>
							<option value="published">Published</option>
							<option value="archived">Archived</option>
						</TextField>

						{mode === "create" && (
							<Box
								sx={{
									mt: 2,
									border: "1px solid #E5E7EB",
									borderRadius: 2,
									p: 2,
								}}
							>
								<FormControlLabel
									control={
										<Checkbox
											checked={shouldImport}
											onChange={(e) => setShouldImport(e.target.checked)}
										/>
									}
									label="Import subscribers immediately"
								/>
								{shouldImport && (
									<Stack
										spacing={2}
										mt={1}
									>
										<Box
											onClick={() => fileInputRef.current?.click()}
											sx={{
												border: "1px dashed #E5E7EB",
												borderRadius: "8px",
												p: 2,
												textAlign: "center",
												bgcolor: "#FAFBFC",
												cursor: "pointer",
												"&:hover": {
													bgcolor: "#F3F4F6",
													borderColor: "#2563EB",
												},
											}}
										>
											<input
												ref={fileInputRef}
												type="file"
												accept=".csv,.txt,.xlsx,.xls"
												onChange={(e) =>
													setImportFile(e.target.files?.[0] || null)
												}
												style={{ display: "none" }}
											/>
											<CloudUploadOutlined
												sx={{ fontSize: 24, color: "text.secondary", mb: 0.5 }}
											/>
											<Typography
												variant="body2"
												color="text.secondary"
											>
												{importFile ? importFile.name : "Click to upload file"}
											</Typography>
										</Box>

										<TextField
											select
											label="Subscriber Status"
											size="small"
											value={importStatus}
											onChange={(e) => setImportStatus(e.target.value)}
											SelectProps={{ native: true }}
										>
											<option value="subscribed">Subscribed</option>
											<option value="unsubscribed">Unsubscribed</option>
										</TextField>
									</Stack>
								)}
							</Box>
						)}

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
