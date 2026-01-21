import {
	Autocomplete,
	Box,
	Button,
	Chip,
	FormControl,
	FormControlLabel,
	Grid,
	IconButton,
	MenuItem,
	Paper,
	Radio,
	RadioGroup,
	ToggleButton,
	ToggleButtonGroup,
	Select,
	Stack,
	TextField,
	Typography,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Divider,
} from "@mui/material";
import {
	ArrowBack,
	MonitorOutlined,
	PhoneIphoneOutlined,
} from "@mui/icons-material";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateCampaign, useUpdateCampaign } from "../../../../hooks/useCampaigns";
import { useGetAllTags } from "../../../../hooks/useTags";
import ModalCreateTag from "../../../tags/ModalCreateTag";
import { useGetAllTemplates } from "../../../../hooks/useTemplates";
import { sendTestEmail } from "../../service";
import { Snackbar, Alert } from "@mui/material";
import SubscriberSelector from "../../../contacts/components/SubscriberSelector";
import { SubscriberSelection } from "../../types";

interface CampaignFormValues {
	name: string;
	subject: string;
	fromAddress: string;
	tags: any[];
	sendType: "now" | "schedule";
	description: string;
	template: number | null;
	scheduledAt: string | null;
	subscribers: SubscriberSelection[];
}

export default function CampaignCreatePage() {
	const navigate = useNavigate();

	const { data: tags } = useGetAllTags();
	const { data: templates } = useGetAllTemplates();

	const [addTagModalOpen, setAddTagModalOpen] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">(
		"desktop",
	);
	const [testEmailDialogOpen, setTestEmailDialogOpen] = useState(false);
	const [testEmailValue, setTestEmailValue] = useState("");
	const [snackbar, setSnackbar] = useState({
		open: false,
		message: "",
		severity: "success" as "success" | "error",
	});
	const [values, setValues] = useState<CampaignFormValues>({
		name: "",
		subject: "",
		fromAddress: "BoltX Digital <norereply@boltxmail.com>",
		tags: [],
		sendType: "now",
		description: "",
		template: null,
		scheduledAt: null,
		subscribers: [],
	});
	const mutateCreate = useCreateCampaign();
	const mutateUpdate = useUpdateCampaign()
	const handleChange = (prop: keyof CampaignFormValues) => (event: any) => {
		setValues({ ...values, [prop]: event.target.value });
	};

	const handleScheduledAtChange = (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		setValues({ ...values, scheduledAt: event.target.value });
	};

	const handleSubscribersChange = (subscribers: SubscriberSelection[]) => {
		setValues((prev) => ({ ...prev, subscribers }));
	};

	const handleSubmit = async (e?: React.FormEvent, isRunning?: boolean) => {
		if (e) e.preventDefault();
		setSubmitting(true);
		try {
			const res = await mutateCreate.mutateAsync({
				name: values.name,
				subject: values.subject,
				fromAddress: values.fromAddress,
				status: status || "draft",
				subscribers: values.subscribers,
				tags: values.tags,
				sendTime: values.sendType === "now" ? "now" : "schedule",
				date_scheduled:
					values.sendType === "schedule"
						? new Date(values.scheduledAt || "").toISOString()
						: undefined,
				date_updated: new Date().toISOString(),
				description: values.description,
				template: values.template,
				slug: values.name.toLowerCase().replace(/ /g, "-") + "-" + Date.now(), // Generate a basic slug
			});
			console.log("Campaign created:", res);
			if (isRunning) {
				mutateUpdate.mutateAsync({
					slug: res.slug,
					payload: { status: "running" },
				});
			}
		} catch (error) {
			console.error("Failed to create campaign:", error);
		} finally {
			setSubmitting(false);
			navigate(`/campaigns`);
		}
	};

	const previewData = {
		name: values.name || "Untitled Campaign",
		subject: values.subject || "No Subject",
		fromAddress: values.fromAddress,
		status: "draft",
		tags: values.tags,
		sendTime: values.sendType === "now" ? "now" : "schedule",
		selectedTemplate: templates?.find((t) => t.id === values.template),
	};

	const handleRemoveTag = (id: string) => {
		setValues({
			...values,
			tags: values.tags.filter((tag) => tag.slug !== id),
		});
	};

	const handleAddTag = () => {
		setAddTagModalOpen(true);
	};

	const handleSendTestEmail = async () => {
		if (!testEmailValue || !values.template) return;

		const selectedTemplate = templates?.find((t) => t.id === values.template);
		if (!selectedTemplate) return;

		try {
			await sendTestEmail({
				to: testEmailValue,
				subject: values.subject || "No Subject",
				template: selectedTemplate.html,
			});
			setSnackbar({
				open: true,
				message: "Test email sent successfully",
				severity: "success",
			});
			setTestEmailDialogOpen(false);
			setTestEmailValue("");
		} catch (error: any) {
			setSnackbar({
				open: true,
				message: error.message || "Failed to send test email",
				severity: "error",
			});
		}
	};

	return (
		<Box bgcolor="white">
			<ModalCreateTag
				open={addTagModalOpen}
				onClose={() => setAddTagModalOpen(false)}
			/>
			{/* Header */}
			<Stack
				direction="row"
				alignItems="center"
				justifyContent="space-between"
				spacing={2}
				mb={3}
				py={2}
				borderBottom={1}
				borderColor="divider"
				sx={{ px: 3, backgroundColor: "background.paper" }}
			>
				<Stack
					direction="row"
					alignItems="center"
					spacing={2}
				>
					<IconButton
						onClick={() => navigate("/campaigns")}
						sx={{ color: "text.primary" }}
					>
						<ArrowBack />
					</IconButton>
					<Typography
						variant="h5"
						fontWeight="bold"
					>
						{values.name || "New campaign"}
					</Typography>
					<Chip
						label="Draft"
						size="small"
						sx={{
							backgroundColor: "neutral.black.10",
							color: "neutral.black.100",
							fontWeight: "500",
							textTransform: "capitalize",
						}}
					/>
				</Stack>

				<Stack
					direction="row"
					alignItems="center"
					spacing={2}
				>
					<Button
						variant="text"
						onClick={() => setTestEmailDialogOpen(true)}
						disabled={!values.template}
						sx={{
							textTransform: "none",
							fontWeight: 600,
							borderRadius: "100px",
							px: 3,
							color: "primary.main",
							"&:hover": {
								textDecoration: "underline",
								bgcolor: "transparent",
							},
						}}
					>
						Send test email
					</Button>
					<Button
						variant="outlined"
						onClick={(e) => handleSubmit(e, false)}
						disabled={submitting}
						sx={{
							borderRadius: "100px",
							px: 4,
							py: 1,
							textTransform: "none",
							fontWeight: 600,
							borderWidth: 1.5,
							borderColor: "primary.main",
							color: "primary.main",
							"&:hover": {
								borderWidth: 1.5,
								bgcolor: "rgba(25, 118, 210, 0.04)",
							},
						}}
					>
						Save
					</Button>
					<Button
						variant="contained"
						onClick={(e) => handleSubmit(e, true)}
						disabled={submitting}
						sx={{
							borderRadius: "100px",
							px: 4,
							py: 1,
							textTransform: "none",
							fontWeight: 600,
							boxShadow: "none",
							border: "1.5px solid",
							borderColor: "primary.main",
							bgcolor: "primary.main",
							"&:hover": {
								boxShadow: "none",
								bgcolor: "primary.dark",
								borderColor: "primary.dark",
							},
						}}
					>
						{values.sendType === "schedule" ? "Schedule" : "Start"} campaign
					</Button>
				</Stack>
			</Stack>

			<Grid
				container
				spacing={4}
				sx={{ height: "calc(100vh - 120px)", overflow: "hidden" }}
			>
				<Grid
					item
					xs={12}
					md={6}
					sx={{ height: "100%", overflowY: "auto" }}
				>
					<form
						onSubmit={handleSubmit}
						className="px-6"
					>
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
									value={values.description}
									onChange={handleChange("description")}
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
										isOptionEqualToValue={(option, value) =>
											option.id === value.id
										}
										value={
											templates?.find(
												(template) => template.id === values.template,
											) || null
										}
										onChange={(_, newValue) =>
											setValues({ ...values, template: newValue?.id as number })
										}
										renderTags={() => null}
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

							{/* To lists or segments */}
							<Divider sx={{ my: 1 }} />
							<Box>
								<Typography
									variant="subtitle2"
									sx={{ mb: 1 }}
								>
									To lists or segments <span style={{ color: "red" }}>*</span>
								</Typography>
								<SubscriberSelector
									value={values.subscribers || []}
									onChange={handleSubscribersChange}
									required
								/>
							</Box>

							<Divider sx={{ my: 1 }} />

							{/* Tags */}
							<Box>
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
										getOptionLabel={(option) => option.title}
										isOptionEqualToValue={(option, value) => {
											const optionSlug = option?.slug || option;
											const valueSlug = value?.slug || value;
											return optionSlug === valueSlug;
										}}
										value={values.tags}
										onChange={(_, newValue) =>
											setValues({ ...values, tags: newValue })
										}
										renderTags={() => null}
										noOptionsText={
											<div style={{ padding: 16, textAlign: "center" }}>
												<Typography>No tags found</Typography>
												<Button
													onClick={handleAddTag}
													variant="outlined"
													size="small"
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
										{values.tags.map((tag) => (
											<Chip
												key={tag.slug}
												label={tag.title}
												onDelete={() => handleRemoveTag(tag.slug)}
											/>
										))}
									</Box>
								</FormControl>
							</Box>

							{/* Send Time */}
							<Box sx={{ width: "100%" }}>
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
														values.sendType === "now"
															? "primary.main"
															: "divider",
													p: 1.5,
													px: 2,
													borderRadius: 1,
													cursor: "pointer",
													width: "100%",
													boxSizing: "border-box",
													bgcolor:
														values.sendType === "now"
															? "rgba(25, 118, 210, 0.04)"
															: "grey.50",
													"&:hover": {
														borderColor: "primary.main",
													},
												}}
											>
												<Radio
													checked={values.sendType === "now"}
													sx={{
														p: 0,
														"& .MuiSvgIcon-root": {
															fontSize: 20,
														},
													}}
												/>
												<Typography
													variant="body2"
													sx={{
														color: "text.primary",
														userSelect: "none",
														fontWeight: 500,
													}}
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
														values.sendType === "schedule"
															? "primary.main"
															: "divider",
													p: 1.5,
													px: 2,
													borderRadius: 1,
													cursor: "pointer",
													width: "100%",
													boxSizing: "border-box",
													bgcolor:
														values.sendType === "schedule"
															? "rgba(25, 118, 210, 0.04)"
															: "grey.50",
													"&:hover": {
														borderColor: "primary.main",
													},
												}}
											>
												<Radio
													checked={values.sendType === "schedule"}
													sx={{
														p: 0,
														"& .MuiSvgIcon-root": {
															fontSize: 20,
														},
													}}
												/>
												<Typography
													variant="body2"
													sx={{
														color: "text.primary",
														userSelect: "none",
														fontWeight: 500,
													}}
												>
													Schedule for later
												</Typography>
											</Box>
										}
										sx={{ m: 0, flex: "1 1 0", width: "100%" }}
									/>
								</RadioGroup>
								{values.sendType === "schedule" && (
									<Box mt={2}>
										<Typography
											variant="subtitle2"
											sx={{ mb: 1 }}
										>
											Date & time <span style={{ color: "red" }}>*</span>
										</Typography>
										<TextField
											type="datetime-local"
											value={values.scheduledAt}
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
					</form>
				</Grid>

				{/* Preview Panel - Right Side */}
				<Grid
					item
					xs={12}
					md={6}
					sx={{ height: "100%", display: "flex", flexDirection: "column" }}
				>
					<Box
						sx={{
							display: "flex",
							flexDirection: "column",
							height: "100%",
							bgcolor: "grey.50",
							borderLeft: 1,
							borderColor: "divider",
						}}
					>
						<Box
							sx={{
								p: 2,
								borderBottom: 1,
								borderColor: "divider",
								bgcolor: "white",
							}}
						>
							<Stack
								direction="row"
								justifyContent="space-between"
								alignItems="center"
							>
								<Typography
									variant="subtitle2"
									color="text.secondary"
								>
									PREVIEW
								</Typography>
								<ToggleButtonGroup
									value={previewMode}
									exclusive
									onChange={(_, mode) => mode && setPreviewMode(mode)}
									size="small"
								>
									<ToggleButton value="desktop">
										<MonitorOutlined fontSize="small" />
									</ToggleButton>
									<ToggleButton value="mobile">
										<PhoneIphoneOutlined fontSize="small" />
									</ToggleButton>
								</ToggleButtonGroup>
							</Stack>
						</Box>

						<Box
							sx={{
								flex: 1,
								overflow: "auto",
								p: 2,
								display: "flex",
								justifyContent: "center",
							}}
						>
							<Box
								sx={{
									width: "100%",
									maxWidth: previewMode === "mobile" ? "375px" : "100%",
									transition: "all 0.3s ease",
								}}
							>
								<Paper
									elevation={0}
									sx={{
										bgcolor: "white",
										borderRadius: 1,
										boxShadow: 2,
										overflow: "hidden",
										minHeight: "500px",
										display: "flex",
										flexDirection: "column",
									}}
								>
									{/* Fake Browser/Email Header */}
									<Box
										sx={{
											p: 2,
											borderBottom: 1,
											borderColor: "divider",
											bgcolor: "#f8f9fa",
										}}
									>
										<Typography
											variant="caption"
											color="text.secondary"
											display="block"
										>
											Subject: <strong>{previewData.subject}</strong>
										</Typography>
										<Typography
											variant="caption"
											color="text.secondary"
										>
											From: {previewData.fromAddress}
										</Typography>
									</Box>

									{/* Content */}
									<Box sx={{ flex: 1, overflow: "auto" }}>
										{previewData.selectedTemplate?.html ? (
											<Box
												dangerouslySetInnerHTML={{
													__html: previewData.selectedTemplate.html,
												}}
												sx={{
													width: "100%",
													"& img": { maxWidth: "100%", height: "auto" },
												}}
											/>
										) : (
											<Box
												sx={{
													p: 4,
													textAlign: "center",
													color: "text.secondary",
												}}
											>
												<Typography variant="body2">
													Please select a template to see the preview
												</Typography>
											</Box>
										)}
									</Box>
								</Paper>
							</Box>
						</Box>
					</Box>
				</Grid>
			</Grid>
			{/* Test Email Dialog */}
			<Dialog
				open={testEmailDialogOpen}
				onClose={() => setTestEmailDialogOpen(false)}
			>
				<DialogTitle>Send Test Email</DialogTitle>
				<DialogContent sx={{ minWidth: "400px" }}>
					<Box sx={{ mt: 1 }}>
						<TextField
							fullWidth
							label="Recipient Email"
							placeholder="Enter email address"
							value={testEmailValue}
							onChange={(e) => setTestEmailValue(e.target.value)}
						/>
					</Box>
				</DialogContent>
				<DialogActions sx={{ p: 2 }}>
					<Button onClick={() => setTestEmailDialogOpen(false)}>Cancel</Button>
					<Button
						variant="contained"
						onClick={handleSendTestEmail}
						disabled={!testEmailValue}
						sx={{ borderRadius: "100px", px: 4 }}
					>
						Send
					</Button>
				</DialogActions>
			</Dialog>

			<Snackbar
				open={snackbar.open}
				autoHideDuration={4000}
				onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
				anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
			>
				<Alert
					onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
					severity={snackbar.severity}
					sx={{ width: "100%" }}
				>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</Box>
	);
}
