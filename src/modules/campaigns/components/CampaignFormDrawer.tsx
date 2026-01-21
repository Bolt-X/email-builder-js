import React, { useEffect, useState } from "react";
import {
	Drawer,
	Box,
	Typography,
	TextField,
	Button,
	Stack,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Chip,
	Autocomplete,
	Divider,
	IconButton,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { Campaign, CampaignStatus } from "../types";
import {
	createCampaignAction,
	updateCampaignMetadataAction,
	useCurrentCampaign,
} from "../stores/campaign.metadata.store";
import SubscriberSelector from "../../contacts/components/SubscriberSelector";

interface CampaignFormDrawerProps {
	open: boolean;
	onClose: () => void;
	campaignId?: string | number;
	mode?: "create" | "edit";
}

export default function CampaignFormDrawer({
	open,
	onClose,
	campaignId,
	mode = "create",
}: CampaignFormDrawerProps) {
	interface CampaignFormData extends Partial<Campaign> {
		contactListId?: string | number;
		templateId?: number;
	}

	const currentCampaign = useCurrentCampaign();
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState<CampaignFormData>({
		name: "",
		description: "",
		status: "draft" as CampaignStatus,
		subject: "",
		fromAddress: "",
		subscribers: [],
		tags: [],
		sendTime: "now",
		contactListId: "",
		date_scheduled: "",
	});

	// Load campaign data when editing
	useEffect(() => {
		if (mode === "edit" && currentCampaign) {
			setFormData({
				name: currentCampaign.name || "",
				description: currentCampaign.description || "",
				status: currentCampaign.status || "draft",
				tags: currentCampaign.tags || [],
				// Check if there is a recipient list to populate contactListId
				contactListId:
					currentCampaign.subscribers?.find((r) => r.type === "list")?.id || "",
				date_scheduled: currentCampaign.date_scheduled || "",
				subscribers: currentCampaign.subscribers || [],
			});
		} else if (mode === "create") {
			// Reset form for create mode
			setFormData({
				name: "",
				description: "",
				status: "draft" as CampaignStatus,
				tags: [],
				contactListId: "",
				date_scheduled: "",
				subscribers: [],
			});
		}
	}, [mode, currentCampaign, open]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			if (mode === "create") {
				// Convert contactListId to subscribers format
				const subscribers = formData.contactListId
					? [
							{
								id: formData.contactListId,
								type: "list" as const,
								name: "Contact List",
							},
						]
					: formData.subscribers || [];

				await createCampaignAction({
					name: formData.name!,
					description: formData.description,
					status: formData.status!,
					subject: formData.subject || "",
					fromAddress: formData.fromAddress || "noreply@boltx.com",
					subscribers,
					tags: formData.tags || [],
					sendTime: formData.sendTime || "now",
					date_scheduled: formData.date_scheduled || undefined,
				} as any); // Type assertion needed because action might expect exact Campaign shape but here we provide what we can
			} else if (campaignId) {
				await updateCampaignMetadataAction(campaignId, {
					name: formData.name,
					description: formData.description,
					status: formData.status,
					subject: formData.subject,
					fromAddress: formData.fromAddress,
					subscribers: formData.contactListId
						? [
								{
									id: formData.contactListId,
									type: "list" as const,
									name: "Contact List",
								},
							]
						: formData.subscribers,
					tags: formData.tags,
					sendTime: formData.sendTime,
					date_scheduled: formData.date_scheduled || undefined,
				});
			}
			onClose();
		} catch (error: any) {
			console.error("Error saving campaign:", error);
			alert("Error saving campaign: " + error.message);
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (field: keyof CampaignFormData, value: any) => {
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
						{mode === "create" ? "Create Campaign" : "Edit Campaign"}
					</Typography>
					<IconButton onClick={onClose}>
						<Close />
					</IconButton>
				</Stack>

				<Divider sx={{ mb: 3 }} />

				{/* Form */}
				<form onSubmit={handleSubmit}>
					<Stack spacing={3}>
						{/* Campaign Name */}
						<TextField
							label="Campaign Name"
							required
							fullWidth
							value={formData.name}
							onChange={(e) => handleChange("name", e.target.value)}
							placeholder="Enter campaign name"
						/>

						{/* Description */}
						<TextField
							label="Description"
							fullWidth
							multiline
							rows={3}
							value={formData.description || ""}
							onChange={(e) => handleChange("description", e.target.value)}
							placeholder="Enter campaign description"
						/>

						{/* Status */}
						<FormControl fullWidth>
							<InputLabel>Status</InputLabel>
							<Select
								value={formData.status || "draft"}
								onChange={(e) =>
									handleChange("status", e.target.value as CampaignStatus)
								}
								label="Status"
							>
								<MenuItem value="draft">Draft</MenuItem>
								<MenuItem value="scheduled">Scheduled</MenuItem>
								<MenuItem value="sending">Sending</MenuItem>
								<MenuItem value="completed">Completed</MenuItem>
								<MenuItem value="cancelled">Cancelled</MenuItem>
							</Select>
						</FormControl>

						{/* Subscriber Selection */}
						<SubscriberSelector
							value={formData.subscribers || []}
							onChange={(subscribers) =>
								handleChange("subscribers", subscribers)
							}
							required
						/>

						{/* Tags */}
						<Autocomplete
							multiple
							freeSolo
							options={[]}
							value={formData.tags || []}
							onChange={(_, newValue) => {
								handleChange(
									"tags",
									newValue.map((v) => (typeof v === "string" ? v : v)),
								);
							}}
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
									placeholder="Add tags (press Enter)"
								/>
							)}
						/>

						{/* Schedule Date */}
						<TextField
							label="Schedule Date & Time"
							type="datetime-local"
							fullWidth
							value={
								formData.date_scheduled
									? new Date(formData.date_scheduled).toISOString().slice(0, 16)
									: ""
							}
							onChange={(e) => {
								const dateValue = e.target.value
									? new Date(e.target.value).toISOString()
									: "";
								handleChange("date_scheduled", dateValue);
							}}
							InputLabelProps={{ shrink: true }}
							helperText="Leave empty to send immediately"
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
								disabled={loading || !formData.name || !formData.contactListId}
							>
								{mode === "create" ? "Create" : "Save"} Campaign
							</Button>
						</Stack>
					</Stack>
				</form>
			</Box>
		</Drawer>
	);
}
