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
import { Campaign, Recipient, RecipientType } from "../../types";
import RecipientSelector from "../../../contacts/components/RecipientSelector";

interface CampaignSettingsFormProps {
	campaign: Campaign;
	onChange: (updates: Partial<Campaign>) => void;
}

export default function CampaignSettingsForm({
	campaign,
	onChange,
}: CampaignSettingsFormProps) {
	const handleRecipientsChange = (recipients: Recipient[]) => {
		onChange({ recipients });
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

	const handleTagsChange = (tags: string[]) => {
		onChange({ tags });
	};

	const handleSendTimeChange = (sendTime: "now" | "schedule") => {
		onChange({ sendTime });
	};

	const handleScheduledAtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		if (value) {
			// Convert local datetime to ISO string
			const date = new Date(value);
			onChange({ scheduledAt: date.toISOString() });
		} else {
			onChange({ scheduledAt: undefined });
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
				<TextField
					label="Campaign name"
					value={campaign.name || ""}
					onChange={handleNameChange}
					fullWidth
					required
				/>

				{/* Subject */}
				<TextField
					label="Subject"
					value={campaign.subject || ""}
					onChange={handleSubjectChange}
					fullWidth
					required
					placeholder="Enter email subject line"
				/>

				{/* From Address */}
				<FormControl fullWidth required>
					<InputLabel>From address</InputLabel>
					<Select
						value={campaign.fromAddress || ""}
						onChange={(e) => onChange({ fromAddress: e.target.value })}
						label="From address"
					>
						<MenuItem value="noreply@boltx.com">noreply@boltx.com</MenuItem>
						<MenuItem value="support@boltx.com">support@boltx.com</MenuItem>
						<MenuItem value="newsletter@boltx.com">newsletter@boltx.com</MenuItem>
						{/* TODO: Load from sender identities config */}
					</Select>
				</FormControl>

				<Divider />

				{/* To lists or segments */}
				<Box>
					<Typography variant="subtitle1" mb={2}>
						To lists or segments
					</Typography>
					<RecipientSelector
						value={campaign.recipients || []}
						onChange={handleRecipientsChange}
						required
					/>
				</Box>

				<Divider />

				{/* Tags */}
				<Autocomplete
					multiple
					options={[]}
					freeSolo
					value={campaign.tags || []}
					onChange={(_, newValue) => handleTagsChange(newValue)}
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

				<Divider />

				{/* Send time */}
				<Box>
					<Typography variant="subtitle1" mb={2}>
						Send time
					</Typography>
					<RadioGroup
						value={campaign.sendTime || "now"}
						onChange={(e) =>
							handleSendTimeChange(e.target.value as "now" | "schedule")
						}
					>
						<FormControlLabel
							value="now"
							control={<Radio />}
							label="Send now"
						/>
						<FormControlLabel
							value="schedule"
							control={<Radio />}
							label="Schedule for later"
						/>
					</RadioGroup>
					{campaign.sendTime === "schedule" && (
						<Box mt={2}>
							<TextField
								label="Schedule date & time"
								type="datetime-local"
								value={getLocalDateTimeString(campaign.scheduledAt)}
								onChange={handleScheduledAtChange}
								fullWidth
								required
								InputLabelProps={{
									shrink: true,
								}}
							/>
						</Box>
					)}
				</Box>
			</Stack>
		</Box>
	);
}
