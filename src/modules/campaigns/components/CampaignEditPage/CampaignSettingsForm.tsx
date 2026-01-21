import React, { useEffect, useState } from "react";
import {
	Box,
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Stack,
	Chip,
	Typography,
	Button,
	Divider,
	Autocomplete,
	RadioGroup,
	FormControlLabel,
	Radio,
} from "@mui/material";
import { Campaign, SubscriberSelection, SubscriberType } from "../../types";
import SubscriberSelector from "../../../contacts/components/SubscriberSelector";
import { useGetAllTemplates } from "../../../../hooks/useTemplates";
import { useGetAllTags } from "../../../../hooks/useTags";
import ModalCreateTag from "../../../tags/ModalCreateTag";

interface CampaignSettingsFormProps {
	campaign: Campaign;
	onChange: (updates: Partial<Campaign>) => void;
}

export default function CampaignSettingsForm({
	campaign,
	onChange,
}: CampaignSettingsFormProps) {
	const { data: templates } = useGetAllTemplates();
	const { data: tags } = useGetAllTags();
	const [addTagModalOpen, setAddTagModalOpen] = useState(false);

	const handleSubscribersChange = (subscribers: SubscriberSelection[]) => {
		onChange({ subscribers });
	};

	const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		onChange({ name: e.target.value });
	};

	const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		onChange({ subject: e.target.value });
	};

	const handleFromAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		onChange({ fromAddress: e.target.value });
	};

	const handleTagsChange = (newTags: any[]) => {
		onChange({ tags: newTags });
	};

	const handleRemoveTag = (id: string) => {
		const updatedTags = (campaign.tags || []).filter(
			(tag: any) => (tag.slug || tag) !== id,
		);
		onChange({ tags: updatedTags });
	};

	const handleAddTag = () => {
		setAddTagModalOpen(true);
	};

	const handleSendTimeChange = (sendTime: "now" | "schedule") => {
		onChange({ sendTime });
	};

	const handleScheduledAtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		if (value) {
			// Convert local datetime to ISO string
			const date = new Date(value);
			onChange({ date_scheduled: date.toISOString() });
		} else {
			onChange({ date_scheduled: undefined });
		}
	};

	const getLocalDateTimeString = (isoString?: string) => {
		if (!isoString) return "";
		const date = new Date(isoString);
		// Format as YYYY-MM-DDTHH:mm for datetime-local input
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		const hours = String(date.getHours()).padStart(2, "0");
		const minutes = String(date.getMinutes()).padStart(2, "0");
		return `${year}-${month}-${day}T${hours}:${minutes}`;
	};

	return (
		<Box sx={{ p: 3 }}>
			<Stack spacing={3}>
				{/* Campaign Name */}
				<Box>
					<Typography
						variant="subtitle2"
						sx={{ mb: 1 }}
					>
						Campaign name <span style={{ color: "red" }}>*</span>
					</Typography>
					<TextField
						fullWidth
						placeholder="Enter your campaign name"
						variant="outlined"
						size="small"
						value={campaign.name || ""}
						onChange={handleNameChange}
						required
					/>
				</Box>

				{/* Subject */}
				<Box>
					<Typography
						variant="subtitle2"
						sx={{ mb: 1 }}
					>
						Subject <span style={{ color: "red" }}>*</span>
					</Typography>
					<TextField
						fullWidth
						placeholder="How do you want to stand out in the recipient's inbox?"
						variant="outlined"
						size="small"
						value={campaign.subject || ""}
						onChange={handleSubjectChange}
						required
					/>
				</Box>

				{/* Description */}
				<Box>
					<Typography
						variant="subtitle2"
						sx={{ mb: 1 }}
					>
						Description
					</Typography>
					<TextField
						fullWidth
						placeholder="Enter your campaign description"
						variant="outlined"
						size="small"
						value={campaign.description || ""}
						onChange={(e) => onChange({ description: e.target.value })}
						multiline
						rows={3}
					/>
				</Box>

				{/* From Address */}
				<Box>
					<Typography
						variant="subtitle2"
						sx={{ mb: 1 }}
					>
						From address <span style={{ color: "red" }}>*</span>
					</Typography>
					<FormControl
						fullWidth
						size="small"
					>
						<Select
							value={campaign.fromAddress || ""}
							onChange={(e) =>
								onChange({ fromAddress: e.target.value as string })
							}
						>
							<MenuItem value="BoltX Digital <norereply@boltxmail.com>">
								BoltX Digital &lt;norereply@boltxmail.com&gt;
							</MenuItem>
							<MenuItem value="BoltX Worker <norereply@boltxworker.com>">
								BoltX Worker &lt;norereply@boltxworker.com&gt;
							</MenuItem>
						</Select>
					</FormControl>
				</Box>

				{/* Template */}
				<Box>
					<Typography
						variant="subtitle2"
						sx={{ mb: 1 }}
					>
						Template <span style={{ color: "red" }}>*</span>
					</Typography>
					<FormControl
						fullWidth
						size="small"
					>
						<Autocomplete
							size="small"
							options={templates ?? []}
							getOptionLabel={(option) => option.name}
							value={templates?.find((t) => t.id === campaign.template) || null}
							onChange={(_, newValue) =>
								onChange({ template: newValue?.id as number })
							}
							renderInput={(params) => (
								<TextField
									{...params}
									variant="outlined"
									placeholder="Choose template"
									size="small"
								/>
							)}
						/>
					</FormControl>
				</Box>

				<Divider sx={{ my: 1 }} />

				{/* To lists or segments */}
				<Box>
					<Typography
						variant="subtitle2"
						sx={{ mb: 1 }}
					>
						To lists or segments <span style={{ color: "red" }}>*</span>
					</Typography>
					<SubscriberSelector
						value={campaign.subscribers || []}
						onChange={handleSubscribersChange}
						required
					/>
				</Box>

				<Divider sx={{ my: 1 }} />

				{/* Tags */}
				<Box>
					<ModalCreateTag
						open={addTagModalOpen}
						onClose={() => setAddTagModalOpen(false)}
					/>
					<Typography
						variant="subtitle2"
						sx={{ mb: 1 }}
					>
						Tags <span style={{ color: "red" }}>*</span>
					</Typography>
					<FormControl
						fullWidth
						size="small"
					>
						<Autocomplete
							multiple
							size="small"
							options={tags ?? []}
							getOptionLabel={(option) => option.title || option}
							isOptionEqualToValue={(option, value) => {
								const optionSlug = option?.slug || option;
								const valueSlug = value?.slug || value;
								return optionSlug === valueSlug;
							}}
							value={campaign.tags || []}
							onChange={(_, newValue) => handleTagsChange(newValue)}
							renderTags={() => null}
							noOptionsText={
								<div style={{ padding: 16, textAlign: "center" }}>
									<Typography>No tags found</Typography>
									<Button
										onClick={handleAddTag}
										variant="outlined"
										size="small"
										sx={{ mt: 1 }}
									>
										Add new tag
									</Button>
								</div>
							}
							renderInput={(params) => (
								<TextField
									{...params}
									variant="outlined"
									placeholder="Select tags"
								/>
							)}
						/>
						<Box
							display="flex"
							flexDirection={"row"}
							gap={1}
							flexWrap="wrap"
							mt={1}
						>
							{(campaign.tags || []).map((tag: any) => (
								<Chip
									key={tag.slug || tag}
									label={tag.title || tag}
									onDelete={() => handleRemoveTag(tag.slug || tag)}
									size="small"
								/>
							))}
						</Box>
					</FormControl>
				</Box>

				<Divider sx={{ my: 1 }} />

				{/* Send time */}
				<Box sx={{ width: "100%" }}>
					<Typography
						variant="subtitle2"
						sx={{ mb: 1 }}
					>
						When would you like to send the campaign?
					</Typography>
					<RadioGroup
						row
						value={campaign.sendTime || "now"}
						onChange={(e) =>
							handleSendTimeChange(e.target.value as "now" | "schedule")
						}
						sx={{
							gap: 2,
							width: "100%",
							display: "flex",
							flexWrap: "nowrap",
							flexDirection: { xs: "column", sm: "row" },
							"& .MuiFormControlLabel-root": {
								flex: "1 1 0",
								margin: 0,
								width: "100%",
							},
							"& .MuiFormControlLabel-label": {
								flexGrow: 1,
								width: "100%",
							},
						}}
					>
						<FormControlLabel
							value="now"
							control={<Radio sx={{ display: "none" }} />}
							label={
								<Box
									sx={{
										display: "flex",
										alignItems: "center",
										gap: 1.5,
										border: "1px solid",
										borderColor:
											campaign.sendTime === "now" ? "primary.main" : "divider",
										p: 1.5,
										px: 2,
										borderRadius: 1,
										cursor: "pointer",
										width: "100%",
										boxSizing: "border-box",
										bgcolor:
											campaign.sendTime === "now"
												? "rgba(25, 118, 210, 0.04)"
												: "grey.50",
										"&:hover": {
											borderColor: "primary.main",
										},
									}}
								>
									<Radio
										checked={campaign.sendTime === "now"}
										sx={{
											p: 0,
											"& .MuiSvgIcon-root": {
												fontSize: 20,
											},
										}}
									/>
									<Typography
										variant="body2"
										sx={{ userSelect: "none", fontWeight: 500 }}
									>
										Send now
									</Typography>
								</Box>
							}
							sx={{ m: 0, flex: "1 1 0", width: "100%" }}
						/>
						<FormControlLabel
							value="schedule"
							control={<Radio sx={{ display: "none" }} />}
							label={
								<Box
									sx={{
										display: "flex",
										alignItems: "center",
										gap: 1.5,
										border: "1px solid",
										borderColor:
											campaign.sendTime === "schedule"
												? "primary.main"
												: "divider",
										p: 1.5,
										px: 2,
										borderRadius: 1,
										cursor: "pointer",
										width: "100%",
										boxSizing: "border-box",
										bgcolor:
											campaign.sendTime === "schedule"
												? "rgba(25, 118, 210, 0.04)"
												: "grey.50",
										"&:hover": {
											borderColor: "primary.main",
										},
									}}
								>
									<Radio
										checked={campaign.sendTime === "schedule"}
										sx={{
											p: 0,
											"& .MuiSvgIcon-root": {
												fontSize: 20,
											},
										}}
									/>
									<Typography
										variant="body2"
										sx={{ userSelect: "none", fontWeight: 500 }}
									>
										Schedule for later
									</Typography>
								</Box>
							}
							sx={{ m: 0, flex: "1 1 0", width: "100%" }}
						/>
					</RadioGroup>
					{campaign.sendTime === "schedule" && (
						<Box mt={2}>
							<Typography
								variant="subtitle2"
								sx={{ mb: 1 }}
							>
								Date & time <span style={{ color: "red" }}>*</span>
							</Typography>
							<TextField
								type="datetime-local"
								value={getLocalDateTimeString(campaign.date_scheduled)}
								onChange={handleScheduledAtChange}
								fullWidth
								size="small"
								required
								sx={{
									"& .MuiOutlinedInput-root": {
										bgcolor: "grey.50",
									},
								}}
							/>
						</Box>
					)}
				</Box>
			</Stack>
		</Box>
	);
}
