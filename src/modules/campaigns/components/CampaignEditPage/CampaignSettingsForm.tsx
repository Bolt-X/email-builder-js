import React, { useEffect, useState } from "react";
import {
	Box,
	TextField,
	FormControl,
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
	FormHelperText,
} from "@mui/material";
import { useLocation, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Campaign, SubscriberSelection, SubscriberType } from "../../types";
import SubscriberSelector from "../../../contacts/components/SubscriberSelector";
import { useGetAllTemplates } from "../../../../hooks/useTemplates";
import { useGetAllTags } from "../../../../hooks/useTags";
import ModalCreateTag from "../../../tags/ModalCreateTag";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

interface CampaignSettingsFormProps {
	campaign: Campaign;
	onChange: (updates: Partial<Campaign>) => void;
	onFormReady?: (form: ReturnType<typeof useForm>) => void;
}

export default function CampaignSettingsForm({
	campaign,
	onChange,
	onFormReady,
}: CampaignSettingsFormProps) {
	const { t } = useTranslation();
	const { data: templates } = useGetAllTemplates();
	const { data: tags } = useGetAllTags();
	const [addTagModalOpen, setAddTagModalOpen] = useState(false);

	const schemaCampaignSettings = React.useMemo(
		() =>
			yup.object().shape({
				name: yup.string().required(
					t("common.validation.required", {
						field: t("campaigns.form.name_label"),
					}),
				),
				subject: yup.string().required(
					t("common.validation.required", {
						field: t("campaigns.form.subject_label"),
					}),
				),
				fromAddress: yup.string().required(
					t("common.validation.required", {
						field: t("campaigns.form.from_address_label"),
					}),
				),
				template: yup.number().required(
					t("common.validation.required", {
						field: t("campaigns.form.template_label"),
					}),
				),
				date_scheduled: yup.string().nullable().notRequired(),
				subscribers: yup
					.array()
					.of(
						yup.object().shape({
							id: yup
								.string()
								.required(t("common.validation.required", { field: "ID" })),
							type: yup
								.string()
								.required(t("common.validation.required", { field: "Type" })),
							name: yup
								.string()
								.required(
									t("common.validation.required", { field: t("common.name") }),
								),
						}),
					)
					.min(
						1,
						t("common.validation.at_least_one", {
							field: t("campaigns.form.to_label"),
						}),
					),
				tags: yup
					.array()
					.of(
						yup.object().shape({
							slug: yup.string().required(t("common.validation.required", { field: "Tag" })),
							title: yup.string().required(t("common.validation.required", { field: "Tag" })),
						}),
					),
				sendTime: yup
					.string()
					.required(t("common.validation.required", { field: "Send Type" })),
				description: yup.string().nullable().notRequired(),
			}),
		[t],
	);

	const form = useForm({
		resolver: yupResolver(schemaCampaignSettings) as any,
		defaultValues: campaign as any,
	});

	useEffect(() => {
		form.reset(campaign as any);
	}, [campaign]);

	useEffect(() => {
		if (onFormReady) {
			onFormReady(form);
		}
	}, [form, onFormReady]);

	const handleSubscribersChange = (subscribers: SubscriberSelection[]) => {
		onChange({ subscribers });
	};

	// Handle pre-selection from ContactListPage navigation
	const location = useLocation();
	const [searchParams] = useSearchParams();

	useEffect(() => {
		let preselectedSlugs: string[] = [];

		// Check state first (legacy support)
		if (location.state && (location.state as any).preselectedContactLists) {
			preselectedSlugs = (location.state as any)
				.preselectedContactLists as string[];
		}
		// Check query params
		else if (searchParams.get("contact-list")) {
			preselectedSlugs = searchParams.get("contact-list")?.split(",") || [];
		}

		if (preselectedSlugs.length > 0) {
			const newSelections = preselectedSlugs.map((slug) => ({
				type: "list" as SubscriberType,
				id: slug,
				name: slug, // Use slug as name fallback since we don't have the real name here
			}));
			// Always apply selection if query param is present, reflecting user intent from "Send Campaign" action
			onChange({ subscribers: newSelections });
		}
	}, [location.state, searchParams]);

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

	const handleScheduledAtChange = (value: dayjs.Dayjs | null) => {
		if (value) {
			onChange({ date_scheduled: value.toISOString() });
		} else {
			onChange({ date_scheduled: undefined });
		}
	};

	return (
		<Box sx={{ px: 6, py: 3 }}>
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
						value={campaign.name || ""}
						error={!!form.formState.errors.name}
						helperText={form.formState.errors.name?.message as string}
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
						{t("campaigns.form.subject_label")}{" "}
						<span style={{ color: "red" }}>*</span>
					</Typography>
					<TextField
						fullWidth
						placeholder={t("campaigns.form.subject_placeholder")}
						variant="outlined"
						error={!!form.formState.errors.subject}
						helperText={form.formState.errors.subject?.message as string}
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
						{t("campaigns.form.description_label")}
					</Typography>
					<TextField
						fullWidth
						placeholder={t("campaigns.form.description_placeholder")}
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
						{t("campaigns.form.from_address_label")}{" "}
						<span style={{ color: "red" }}>*</span>
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
							error={!!form.formState.errors.fromAddress}
						>
							<MenuItem value="BoltX Digital <norereply@boltxmail.com>">
								BoltX Digital &lt;norereply@boltxmail.com&gt;
							</MenuItem>
							<MenuItem value="BoltX Worker <norereply@boltxworker.com>">
								BoltX Worker &lt;norereply@boltxworker.com&gt;
							</MenuItem>
						</Select>
						{form.formState.errors.fromAddress && (
							<FormHelperText error>
								{form.formState.errors.fromAddress?.message as string}
							</FormHelperText>
						)}
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
							value={templates?.find((t) => t.id === campaign.template) || null}
							onChange={(_, newValue) =>
								onChange({ template: newValue?.id as number })
							}
							renderTags={() => null}
							renderInput={(params) => (
								<TextField
									{...params}
									variant="outlined"
									placeholder={t("campaigns.form.template_placeholder")}
									size="small"
									error={!!form.formState.errors.template}
								/>
							)}
						/>
						{form.formState.errors.template && (
							<FormHelperText error>
								{form.formState.errors.template?.message as string}
							</FormHelperText>
						)}
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
						value={campaign.subscribers || []}
						onChange={handleSubscribersChange}
						required
						error={!!form.formState.errors.subscribers}
						helperText={form.formState.errors.subscribers?.message as string}
					/>
				</Box>

				{/* Tags */}
				<Divider sx={{ my: 1 }} />
				<Box>
					<ModalCreateTag
						open={addTagModalOpen}
						onClose={() => setAddTagModalOpen(false)}
					/>
					<Typography
						variant="subtitle2"
						sx={{ mb: 1 }}
					>
						{t("campaigns.form.tags_label")}{" "}
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
							value={campaign.tags || []}
							onChange={(_, newValue) => handleTagsChange(newValue)}
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
												? "action.selected"
												: "background.paper",
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
												? "action.selected"
												: "background.paper",
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
					{campaign.sendTime === "schedule" && (
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
									value={campaign.date_scheduled ? dayjs(campaign.date_scheduled) : null}
									onChange={(value) => handleScheduledAtChange(value)}
									slotProps={{
										textField: {
											size: "small",
											sx: { borderRadius: "8px" },
											fullWidth: true,
										},
									}}
									format="DD/MM/YYYY HH:mm"
									disablePast
								/>
							</LocalizationProvider>
						</Box>
					)}
				</Box>
			</Stack>
		</Box>
	);
}
