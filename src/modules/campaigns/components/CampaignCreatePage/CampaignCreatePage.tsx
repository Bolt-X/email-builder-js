import React, { useState } from "react";
import {
	Box,
	Button,
	TextField,
	Typography,
	Stack,
	Select,
	MenuItem,
	FormControl,
	Radio,
	RadioGroup,
	FormControlLabel,
	Grid,
	Paper,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { createCampaignAction } from "../../stores/campaign.metadata.store";

interface CampaignFormValues {
	name: string;
	subject: string;
	fromAddress: string;
	tags: string[];
	sendType: "now" | "later";
}

export default function CampaignCreatePage() {
	const navigate = useNavigate();
	const [submitting, setSubmitting] = useState(false);
	const [values, setValues] = useState<CampaignFormValues>({
		name: "",
		subject: "",
		fromAddress: "BoltX Digital <norereply@boltxmail.com>",
		tags: [],
		sendType: "now",
	});

	const handleChange = (prop: keyof CampaignFormValues) => (event: any) => {
		setValues({ ...values, [prop]: event.target.value });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitting(true);
		try {
			// Mock save to data.json simulation (via store)
			// Ensure all required fields of Campaign type are present
			const newCampaign = await createCampaignAction({
				name: values.name,
				subject: values.subject,
				fromAddress: values.fromAddress,
				status: "draft",
				recipients: [],
				tags: values.tags,
				sendTime: values.sendType === "now" ? "now" : "schedule",
				scheduledAt:
					values.sendType === "later" ? new Date().toISOString() : undefined,
				lastEditedAt: new Date().toISOString(),
			});

			// Redirect to campaign edit page for preview
			navigate(`/campaigns/${newCampaign.id}`);
		} catch (error) {
			console.error("Failed to create campaign:", error);
		} finally {
			setSubmitting(false);
		}
	};

	const previewData = {
		name: values.name || "Untitled Campaign",
		subject: values.subject || "No Subject",
		fromAddress: values.fromAddress,
		status: "draft",
		tags: values.tags,
		sendTime: values.sendType === "now" ? "now" : "schedule",
	};

	return (
		<Box>
			{/* Header / Breadcrumbs */}
			<Stack
				direction="row"
				alignItems="center"
				spacing={2}
				mb={3}
			>
				<Button
					startIcon={<ArrowBack />}
					onClick={() => navigate("/campaigns")}
					sx={{ color: "text.primary" }}
				>
					Back
				</Button>
				<Typography
					variant="h5"
					fontWeight="bold"
				>
					New campaign
				</Typography>
				<Box
					sx={{
						bgcolor: "grey.200",
						px: 1,
						borderRadius: 1,
						fontSize: "0.75rem",
						fontWeight: "medium",
					}}
				>
					Draft
				</Box>
			</Stack>

			<Grid
				container
				spacing={4}
			>
				<Grid
					item
					xs={12}
					md={8}
				>
					<form onSubmit={handleSubmit}>
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
									value={values.name}
									onChange={handleChange("name")}
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
									value={values.subject}
									onChange={handleChange("subject")}
									required
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
										value={values.fromAddress}
										onChange={handleChange("fromAddress")}
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

							{/* Tags */}
							<Box>
								<Typography
									variant="subtitle2"
									sx={{ mb: 1 }}
								>
									Choose tags
								</Typography>
								<FormControl
									fullWidth
									size="small"
								>
									<Select
										displayEmpty
										value={values.tags}
										onChange={(e) =>
											setValues({ ...values, tags: e.target.value as string[] })
										}
										multiple
										renderValue={(selected) => {
											if (selected.length === 0) {
												return (
													<Typography color="text.secondary">
														Select tags...
													</Typography>
												);
											}
											return selected.join(", ");
										}}
									>
										<MenuItem value="newsletter">Newsletter</MenuItem>
										<MenuItem value="promotion">Promotion</MenuItem>
									</Select>
								</FormControl>
							</Box>

							{/* Send Time */}
							<Box>
								<Typography
									variant="subtitle2"
									sx={{ mb: 1 }}
								>
									When would you like to send the campaign?
								</Typography>
								<RadioGroup
									row
									value={values.sendType}
									onChange={handleChange("sendType")}
								>
									<FormControlLabel
										value="now"
										control={<Radio />}
										label={
											<Box
												sx={{
													border:
														values.sendType === "now"
															? "1px solid #1976d2"
															: "1px solid #e0e0e0",
													p: 1,
													px: 2,
													borderRadius: 1,
												}}
											>
												Send now
											</Box>
										}
										sx={{ mr: 2 }}
									/>
									<FormControlLabel
										value="later"
										control={<Radio />}
										label={
											<Box
												sx={{
													border:
														values.sendType === "later"
															? "1px solid #1976d2"
															: "1px solid #e0e0e0",
													p: 1,
													px: 2,
													borderRadius: 1,
												}}
											>
												Schedule for later
											</Box>
										}
									/>
								</RadioGroup>
							</Box>

							<Box>
								<Button
									type="submit"
									variant="contained"
									disabled={submitting}
									sx={{ borderRadius: 100, px: 4 }}
								>
									{submitting ? "Saving..." : "Save & Continue"}
								</Button>
							</Box>
						</Stack>
					</form>
				</Grid>

				{/* Preview Panel - Right Side */}
				<Grid
					item
					xs={12}
					md={4}
				>
					<Paper
						elevation={0}
						sx={{
							p: 2,
							bgcolor: "grey.50",
							height: "100%",
							minHeight: 400,
							borderLeft: 1,
							borderColor: "divider",
						}}
					>
						<Typography
							variant="subtitle2"
							color="text.secondary"
							gutterBottom
						>
							PREVIEW
						</Typography>

						{/* Mock Email Preview */}
						<Box
							sx={{
								bgcolor: "white",
								p: 2,
								borderRadius: 1,
								boxShadow: 1,
								mb: 3,
							}}
						>
							<Typography
								variant="caption"
								color="text.secondary"
							>
								Subject:
							</Typography>
							<Typography
								variant="body2"
								fontWeight="bold"
								sx={{ mb: 1 }}
							>
								{previewData.subject}
							</Typography>

							<Typography
								variant="caption"
								color="text.secondary"
							>
								From:
							</Typography>
							<Typography
								variant="body2"
								sx={{ mb: 2 }}
							>
								{previewData.fromAddress}
							</Typography>

							<Box sx={{ borderTop: 1, borderColor: "divider", pt: 2 }}>
								<img
									src="http://localhost:3845/assets/679b03a7df399888084497cd7ade7df2361e5116.png"
									alt="Banner"
									style={{ width: "100%", marginBottom: 10, borderRadius: 4 }}
								/>
								<Typography
									variant="h6"
									color="primary"
									fontWeight="bold"
								>
									{previewData.name.toUpperCase()}
								</Typography>
								<Typography
									variant="body2"
									sx={{ mt: 1 }}
								>
									Kính gửi: Toàn thể cộng sự...
								</Typography>
							</Box>
						</Box>

						{/* Dummy Data JSON Preview */}
						<Typography
							variant="subtitle2"
							color="text.secondary"
							gutterBottom
						>
							DUMMY DATA (JSON)
						</Typography>
						<Box
							sx={{
								bgcolor: "#1e1e1e",
								p: 1.5,
								borderRadius: 1,
								overflow: "auto",
								maxHeight: 200,
								fontSize: "0.7rem",
							}}
						>
							<pre style={{ color: "#d4d4d4", margin: 0 }}>
								{JSON.stringify(previewData, null, 2)}
							</pre>
						</Box>
						<Typography
							variant="caption"
							color="text.secondary"
							sx={{ fontStyle: "italic", mt: 1, display: "block" }}
						>
							* This data will be saved to simulated JSON storage
						</Typography>
					</Paper>
				</Grid>
			</Grid>
		</Box>
	);
}
