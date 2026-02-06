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
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from "react";
import {
	useCreateCampaign,
	useUpdateCampaign,
} from "../../../../hooks/useCampaigns";
import { useGetAllTags } from "../../../../hooks/useTags";
import ModalCreateTag from "../../../tags/ModalCreateTag";
import { useGetAllTemplates } from "../../../../hooks/useTemplates";
import { sendTestEmail } from "../../service";
import { Snackbar, Alert } from "@mui/material";
import SubscriberSelector from "../../../contacts/components/SubscriberSelector";
import { SubscriberSelection } from "../../types";
import { setMessage } from "../../../../contexts";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

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

const formCampaignSchema = yup.object().shape({
	name: yup.string().required("Name is required"),
	subject: yup.string().required("Subject is required"),
	fromAddress: yup.string().required("From address is required"),
	tags: yup.array().of(yup.string()).required("Tags are required"),
	sendType: yup.string().required("Send type is required"),
	description: yup.string().nullable().notRequired(),
	template: yup.number().nullable().notRequired(),
	scheduledAt: yup.string().nullable().notRequired(),
	subscribers: yup.array().of(yup.object().shape({
		id: yup.string().required("Subscriber ID is required"),
		type: yup.string().required("Subscriber type is required"),
		name: yup.string().required("Subscriber name is required"),
	})).required("Subscribers are required"),
});

export default function CampaignCreatePage() {
	const { t } = useTranslation();
	const navigate = useNavigate();

	const form = useForm({
		resolver: yupResolver(formCampaignSchema),
	});

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
	const mutateUpdate = useUpdateCampaign();
	const location = useLocation();

	useEffect(() => {
		const params = new URLSearchParams(location.search);
		const dateParam = params.get("date");
		if (dateParam) {
			// Pre-fill date and set type to schedule
			// Format for datetime-local is YYYY-MM-DDTHH:mm
			// We append a default time 09:00
			setValues((prev) => ({
				...prev,
				sendType: "schedule",
				scheduledAt: `${dateParam}T09:00`,
			}));
		}
	}, [location]);
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

	const handleSubmit = async (data: any, isRunning?: boolean) => {
		setSubmitting(true);
		try {
			const res = await mutateCreate.mutateAsync({
				name: data.name,
				subject: data.subject,
				fromAddress: data.fromAddress,
				status: status || "draft",
				subscribers: data.subscribers,
				tags: data.tags,
				sendTime: data.sendType === "now" ? "now" : "schedule",
				date_scheduled:
					data.sendType === "schedule"
						? new Date(data.scheduledAt || "").toISOString()
						: undefined,
				date_updated: new Date().toISOString(),
				description: data.description,
				template: data.template,
				slug: data.name.toLowerCase().replace(/ /g, "-") + "-" + Date.now(), // Generate a basic slug
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
			setMessage(t("campaigns.test_email_sent"));
			setTestEmailDialogOpen(false);
			setTestEmailValue("");
		} catch (error: any) {
			setMessage(error.message || t("campaigns.test_email_failed"));
		}
	};

	useEffect(() => {
		form.setValue("sendType", values.sendType || "now");
	}, [values.sendType]);

	return (
		<Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
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
				sx={{
					px: 3,
					py: 2,
					height: 64,
					backgroundColor: "background.paper",
					borderBottom: 1,
					borderColor: "divider",
					mb: 3,
				}}
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
						{values.name || t("campaigns.new_campaign")}
					</Typography>
					<Chip
						label={t("campaigns.status.draft")}
						size="small"
						sx={{
							backgroundColor: "action.hover",
							color: "text.secondary",
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
						{t("campaigns.send_test_email")}
					</Button>
					<Button
						variant="outlined"
						onClick={form.handleSubmit((data) => handleSubmit(data, false))}
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
						{t("common.save")}
					</Button>
					<Button
						variant="contained"
						onClick={form.handleSubmit((data) => handleSubmit(data, true))}
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
						{values.sendType === "schedule"
							? t("campaigns.schedule")
							: t("campaigns.start")}{" "}
						{t("sidebar.campaigns").toLowerCase()}
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
									{t("campaigns.form.name_label")}{" "}
									<span style={{ color: "red" }}>*</span>
								</Typography>
								<TextField
									fullWidth
									placeholder={t("campaigns.form.name_placeholder")}
									variant="outlined"
									size="small"
									{...form.register("name")}
									error={!!form.formState.errors.name}
									helperText={form.formState.errors.name?.message as string}
								/>
							</Box>

							{/* Subject */}
							<Box>
								<Typography
									variant="subtitle2"
									sx={{ mb: 1 }}
								>
									{t("campaigns.form.subject_label")}{" "}
									<span style={{ color: "red" }}>*</span>
								</Typography>
								<TextField
									fullWidth
									placeholder={t("campaigns.form.subject_placeholder")}
									variant="outlined"
									size="small"
									{...form.register("subject")}
									error={!!form.formState.errors.subject}
									helperText={form.formState.errors.subject?.message as string}
								/>
							</Box>

							{/* Description */}
							<Box>
								<Typography
									variant="subtitle2"
									sx={{ mb: 1 }}
								>
									{t("campaigns.form.description_label")}
								</Typography>
								<TextField
									fullWidth
									placeholder={t("campaigns.form.description_placeholder")}
									variant="outlined"
									size="small"
									{...form.register("description")}
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
									{t("campaigns.form.from_address_label")}{" "}
									<span style={{ color: "red" }}>*</span>
								</Typography>
								<FormControl
									fullWidth
									size="small"
								>
									<Select
										{...form.register("fromAddress")}
										error={!!form.formState.errors.fromAddress}
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
									{t("campaigns.form.template_label")}{" "}
									<span style={{ color: "red" }}>*</span>
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
										{...form.register("template")}
										renderTags={() => null}
										renderInput={(params) => (
											<TextField
												{...params}
												variant="outlined"
												placeholder={t("campaigns.form.template_placeholder")}
												size="small"
												error={!!form.formState.errors.template}
												helperText={form.formState.errors.template?.message as string}
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
									{t("campaigns.form.to_label")}{" "}
									<span style={{ color: "red" }}>*</span>
								</Typography>
								<SubscriberSelector
									value={values.subscribers || []}
									onChange={handleSubscribersChange}
									required
									form={form}
								/>
							</Box>

							<Divider sx={{ my: 1 }} />

							{/* Tags */}
							<Box>
								<Typography
									variant="subtitle2"
									sx={{ mb: 1 }}
								>
									{t("campaigns.form.tags_label")}{" "}
									<span style={{ color: "red" }}>*</span>
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
										{...form.register("tags")}
										onChange={(_, newValue) =>
											setValues({ ...values, tags: newValue })
										}
										renderTags={() => null}
										noOptionsText={
											<div style={{ padding: 16, textAlign: "center" }}>
												<Typography>{t("campaigns.form.no_tags")}</Typography>
												<Button
													onClick={handleAddTag}
													variant="outlined"
													size="small"
												>
													{t("campaigns.form.add_tag")}
												</Button>
											</div>
										}
										renderInput={(params) => (
											<TextField
												{...params}
												variant="outlined"
												placeholder={t("campaigns.form.tags_placeholder")}
												error={!!form.formState.errors.tags}
												helperText={form.formState.errors.tags?.message as string}
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
									{t("campaigns.form.send_time_label")}
								</Typography>
								<RadioGroup
									row
									value={values.sendType || "now"}
									onChange={(e) => setValues({ ...values, sendType: e.target.value as "now" | "schedule" })}
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
															? "action.selected"
															: "background.paper",
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
													{t("campaigns.form.send_now")}
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
															? "action.selected"
															: "background.paper",
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
													{t("campaigns.form.schedule_later")}
												</Typography>
											</Box>
										}
										sx={{ m: 0, flex: "1 1 0", width: "100%" }}
									/>
								</RadioGroup>
								{form.watch("sendType") === "schedule" && (
									<Box mt={2}>
										<Typography
											variant="subtitle2"
											sx={{ mb: 1 }}
										>
											{t("campaigns.form.date_time_label")}{" "}
											<span style={{ color: "red" }}>*</span>
										</Typography>
										<LocalizationProvider dateAdapter={AdapterDayjs}>
											<DateTimePicker
												slotProps={{
													textField: {
														size: "small",
														sx: { borderRadius: "8px" },
														fullWidth: true,
														InputLabelProps: {
															shrink: true
														}
													}
												}}
												format="DD/MM/YYYY HH:mm"
												value={values.scheduledAt ? dayjs(values.scheduledAt) : null}
												onChange={(value) => {
													setValues({ ...values, scheduledAt: value ? value.toISOString() : null });
												}}
											// disableFuture
											// label={t("campaigns.form.date_time_label")}
											/>
										</LocalizationProvider>
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
							bgcolor: "background.default",
							borderLeft: 1,
							borderColor: "divider",
						}}
					>
						<Box
							sx={{
								p: 2,
								borderBottom: 1,
								borderColor: "divider",
								bgcolor: "background.paper",
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
									{t("campaigns.preview").toUpperCase()}
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
										bgcolor: "background.paper",
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
											bgcolor: "action.hover",
										}}
									>
										<Typography
											variant="caption"
											color="text.secondary"
											display="block"
										>
											{t("campaigns.form.subject_label")}:{" "}
											<strong>{previewData.subject}</strong>
										</Typography>
										<Typography
											variant="caption"
											color="text.secondary"
										>
											{t("campaigns.form.from_address_label")}:{" "}
											{previewData.fromAddress}
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
													{t("campaigns.select_template_preview")}
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
				<DialogTitle>{t("campaigns.test_email_dialog_title")}</DialogTitle>
				<DialogContent sx={{ minWidth: "400px" }}>
					<Box sx={{ mt: 1 }}>
						<TextField
							fullWidth
							label={t("campaigns.test_email_recipient")}
							placeholder={t("campaigns.test_email_placeholder")}
							value={testEmailValue}
							onChange={(e) => setTestEmailValue(e.target.value)}
						/>
					</Box>
				</DialogContent>
				<DialogActions sx={{ p: 2 }}>
					<Button onClick={() => setTestEmailDialogOpen(false)}>
						{t("common.cancel")}
					</Button>
					<Button
						variant="contained"
						onClick={handleSendTestEmail}
						disabled={!testEmailValue}
						sx={{ borderRadius: "100px", px: 4 }}
					>
						{t("common.send")}
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
