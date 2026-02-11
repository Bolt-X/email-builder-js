import { yupResolver } from "@hookform/resolvers/yup";
import { CalendarMonth, Close, Remove } from "@mui/icons-material";
import {
	Autocomplete,
	Box,
	Button,
	Chip,
	Collapse,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	IconButton,
	MenuItem,
	Select,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import * as yup from "yup";
import {
	useCreateContact,
	useGetProvinces,
	useUpdateContact,
} from "../../../hooks/useContact";
import { useGetAllTags } from "../../../hooks/useTags";
import ModalCreateTag from "../../tags/ModalCreateTag";
import { getContactListBySlugWithSubscribers } from "../service";
import { getWardsByProvinceId } from "../../../services/contact";
import { DatePicker } from "@mui/x-date-pickers";

import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

interface CreateContactModalProps {
	open: boolean;
	onClose: () => void;
	initialData?: any;
}

export default function CreateContactModal({
	open,
	onClose,
	initialData,
}: CreateContactModalProps) {
	const { t } = useTranslation();

	const formContactSchema = useMemo(
		() =>
			yup.object().shape({
				contact_lists: yup
					.array()
					.of(yup.number())
					.required(
						t("common.validation.required", {
							field: t("contacts.contact_list"),
						}),
					),
				email: yup
					.string()
					.email(t("common.validation.invalid_email"))
					.required(
						t("common.validation.required", { field: t("contacts.email") }),
					),
				status: yup
					.string()
					.required(
						t("common.validation.required", { field: t("common.status") }),
					),
				first_name: yup
					.string()
					.required(
						t("common.validation.required", { field: t("common.first_name") }),
					),
				last_name: yup
					.string()
					.required(
						t("common.validation.required", { field: t("common.last_name") }),
					),
				address: yup
					.string()
					.required(
						t("common.validation.required", { field: t("contacts.address") }),
					),
				phone_number: yup.string().nullable().notRequired(),
				province: yup.string().nullable().notRequired(),
				ward: yup.string().nullable().notRequired(),
				birthday: yup.string().nullable().notRequired(),
				company: yup.string().nullable().notRequired(),
				tags: yup.array().of(yup.string()).nullable().notRequired(),
			}),
		[t],
	);
	const { id } = useParams();
	const mutateCreateContact = useCreateContact();
	const mutateUpdateContact = useUpdateContact();
	const { data: tags } = useGetAllTags();

	const [contactList, setContactList] = useState<any | null>(null);
	const [addTagModalOpen, setAddTagModalOpen] = useState(false);
	const [wards, setWards] = useState<any[]>([]);

	useEffect(() => {
		const fetchContactList = async () => {
			const res = await getContactListBySlugWithSubscribers(id);
			console.log("res", res);

			setContactList(res[0].id);
		};
		fetchContactList();
	}, [id]);

	const form = useForm({
		resolver: yupResolver(formContactSchema),
		defaultValues: {
			contact_lists: [contactList || ""],
			email: "",
			status: "subscribed",
			first_name: "",
			last_name: "",
			address: "",
			phone_number: "",
		},
	});

	useEffect(() => {
		if (initialData) {
			form.reset({
				contact_lists: initialData.contact_lists || [],
				email: initialData.email || "",
				status: initialData.status || "subscribed",
				first_name: initialData.first_name || "",
				last_name: initialData.last_name || "",
				address: initialData.address || "",
				phone_number: initialData.phone_number || "",
				province: initialData.province || "",
				ward: initialData.ward || "",
				birthday: initialData.birthday || null,
				company: initialData.company || "",
				tags: initialData.tags || [],
			});
		} else if (contactList) {
			form.reset({
				contact_lists: [contactList],
				email: "",
				status: "subscribed",
				first_name: "",
				last_name: "",
				address: "",
				phone_number: "",
			});
		}
	}, [contactList, initialData]);

	const { data: provinces } = useGetProvinces();

	const [generalOpen, setGeneralOpen] = useState(true);
	const [additionalOpen, setAdditionalOpen] = useState(true);

	const handleAddTag = () => {
		setAddTagModalOpen(true);
	};

	useEffect(() => {
		const fetchWards = async () => {
			if (form.watch("province")) {
				const res = await getWardsByProvinceId(form.watch("province"));
				setWards(res);
			}
		};
		fetchWards();
	}, [form.watch("province")]);

	const handleSubmit = async (data: any) => {
		try {
			if (initialData) {
				await mutateUpdateContact.mutateAsync({
					id: initialData.id,
					contact: data,
				});
			} else {
				await mutateCreateContact.mutateAsync(data);
			}
		} catch (error) {
			console.error("Failed to save contact:", error);
		}
	};

	const handleSaveAndAdd = async () => {
		try {
			const data = form.getValues();
			delete data.province;
			delete data.contact_lists;
			await handleSubmit({ contact: data, slug: id });
			if (!initialData) {
				form.reset();
			}
		} catch (error) {
			console.error("Failed to create contact:", error);
		}
	};

	const handleAddContact = async () => {
		try {
			const data = form.getValues();
			delete data.province;
			delete data.contact_lists;
			await handleSubmit({ contact: data, slug: id });
			onClose();
			if (!initialData) {
				form.reset();
			}
		} catch (error) {
			console.error("Failed to create contact:", error);
		}
	};

	return (
		<Dialog
			open={open}
			// onClose={onClose}
			maxWidth="md"
			fullWidth
			PaperProps={{
				sx: { borderRadius: "12px", p: 0 },
			}}
			disableEscapeKeyDown
		>
			<ModalCreateTag
				open={addTagModalOpen}
				onClose={() => setAddTagModalOpen(false)}
			/>
			<DialogTitle
				sx={{
					m: 0,
					p: 2,
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					borderBottom: "1px solid #E5E7EB",
				}}
			>
				<Typography
					variant="h6"
					sx={{ fontWeight: 700 }}
				>
					{initialData ? t("contacts.edit_contact") : t("contacts.new_contact")}
				</Typography>
				<IconButton
					onClick={() => {
						onClose();
						if (!initialData) form.reset();
					}}
					size="small"
					sx={{ color: "text.secondary" }}
				>
					<Close />
				</IconButton>
			</DialogTitle>

			<DialogContent sx={{ p: 0 }}>
				{/* General Information Section */}
				<Box
					sx={{
						bgcolor: "#2196F3",
						p: 1,
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						cursor: "pointer",
					}}
					onClick={() => setGeneralOpen(!generalOpen)}
				>
					<Typography sx={{ color: "white", fontWeight: 600, ml: 1 }}>
						{t("contacts.general_info")}
					</Typography>
					<IconButton
						size="small"
						sx={{ color: "white" }}
					>
						<Remove />
					</IconButton>
				</Box>

				<Collapse in={generalOpen}>
					<ModalCreateTag
						open={addTagModalOpen}
						onClose={() => setAddTagModalOpen(false)}
					/>
					<form onSubmit={(e) => e.preventDefault()}>
						<Stack
							spacing={2.5}
							sx={{ p: 3 }}
						>
							{/* <Box sx={{ width: "50%" }}>
							<Typography
								variant="body2"
								sx={{ mb: 1, fontWeight: 600 }}
							>
								Contacts <span style={{ color: "red" }}>*</span>
							</Typography>
							<Select
								fullWidth
								size="small"
								value={formData.contacts}
								onChange={(e) => handleFieldChange("contacts", e.target.value)}
								error={!!errors.contacts}
								sx={{ borderRadius: "8px" }}
							>
								<MenuItem value="default">Default list</MenuItem>
							</Select>
							{errors.contacts && (
								<Typography
									variant="caption"
									color="error"
								>
									{errors.contacts}
								</Typography>
							)}
						</Box> */}

							<Stack
								direction="row"
								spacing={3}
								alignItems="flex-start"
							>
								<Box sx={{ flex: 1 }}>
									<Typography
										variant="body2"
										sx={{ mb: 1, fontWeight: 600 }}
									>
										{t("contacts.email")}{" "}
										<span style={{ color: "red" }}>*</span>
									</Typography>
									<TextField
										fullWidth
										size="small"
										placeholder="e.g. email@gmail.com"
										{...form.register("email")}
										error={!!form.formState.errors.email}
										helperText={form.formState.errors.email?.message}
										sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
									/>
								</Box>
								<Box sx={{ flex: 1 }}>
									<Typography
										variant="body2"
										sx={{ mb: 1, fontWeight: 600 }}
									>
										{t("contacts.email_marketing_status")}{" "}
										<span style={{ color: "red" }}>*</span>
									</Typography>
									<Select
										fullWidth
										size="small"
										value={form.watch("status") || ""}
										onChange={(e) => {
											form.setValue("status", e.target.value);
										}}
										error={!!form.formState.errors.status}
										sx={{ borderRadius: "8px" }}
										displayEmpty
									>
										<MenuItem value="">
											<em>{t("contacts.select_status")}</em>
										</MenuItem>
										<MenuItem value="subscribed">
											{t("contacts.status.subscribed")}
										</MenuItem>
										<MenuItem value="non_subscribed">
											{t("contacts.status.non_subscribed")}
										</MenuItem>
										<MenuItem value="unsubscribed">
											{t("contacts.status.unsubscribed")}
										</MenuItem>
									</Select>
									{form.formState.errors.status && (
										<Typography
											variant="caption"
											color="error"
										>
											{form.formState.errors.status?.message}
										</Typography>
									)}
								</Box>
							</Stack>
							<Stack
								direction="row"
								spacing={3}
								alignItems="cetner"
							>
								<Box sx={{ flex: 1 }}>
									<Typography
										variant="body2"
										sx={{ mb: 1, fontWeight: 600 }}
									>
										{t("common.first_name")}{" "}
										<span style={{ color: "red" }}>*</span>
									</Typography>
									<TextField
										fullWidth
										size="small"
										{...form.register("first_name")}
										error={!!form.formState.errors.first_name}
										helperText={form.formState.errors.first_name?.message}
										sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
										placeholder={t("contacts.enter_full_name")}
									/>
								</Box>
								<Box sx={{ flex: 1 }}>
									<Typography
										variant="body2"
										sx={{ mb: 1, fontWeight: 600 }}
									>
										{t("common.last_name")}{" "}
										<span style={{ color: "red" }}>*</span>
									</Typography>
									<TextField
										fullWidth
										size="small"
										{...form.register("last_name")}
										error={!!form.formState.errors.last_name}
										helperText={form.formState.errors.last_name?.message}
										sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
										placeholder={t("contacts.enter_last_name")}
									/>
								</Box>
							</Stack>

							<Box>
								<Typography
									variant="body2"
									sx={{ mb: 1, fontWeight: 600 }}
								>
									{t("contacts.address")}
									<span style={{ color: "red" }}>*</span>
								</Typography>
								<TextField
									fullWidth
									size="small"
									{...form.register("address")}
									error={!!form.formState.errors.address}
									helperText={form.formState.errors.address?.message}
									sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
									placeholder={t("contacts.enter_address")}
								/>
							</Box>

							<Stack
								direction="row"
								spacing={3}
							>
								<Box sx={{ flex: 1 }}>
									<Typography
										variant="body2"
										sx={{ mb: 1, fontWeight: 600 }}
									>
										{t("contacts.province")}
									</Typography>
									<Autocomplete
										fullWidth
										size="small"
										options={provinces ?? []}
										getOptionLabel={(option) => option.name}
										isOptionEqualToValue={(option, value) =>
											option.slug === value.slug
										}
										value={
											provinces?.find(
												(p: any) => p.slug === form.watch("province"),
											) || null
										}
										onChange={(_, newValue) => {
											form.setValue("province", newValue?.slug || "");
											form.setValue("ward", ""); // reset district
										}}
										renderInput={(params) => (
											<TextField
												{...params}
												placeholder={t("contacts.select_province")}
												sx={{
													"& .MuiOutlinedInput-root": { borderRadius: "8px" },
												}}
											/>
										)}
									/>
								</Box>
								<Box sx={{ flex: 1 }}>
									<Typography
										variant="body2"
										sx={{ mb: 1, fontWeight: 600 }}
									>
										{t("contacts.district")}
									</Typography>
									<Autocomplete
										fullWidth
										size="small"
										options={wards ?? []}
										getOptionLabel={(option) => option.name}
										isOptionEqualToValue={(option, value) =>
											option.slug === value.slug
										}
										value={
											wards?.find((w: any) => w.slug === form.watch("ward")) ||
											null
										}
										onChange={(_, newValue) => {
											form.setValue("ward", newValue?.slug || "");
										}}
										disabled={!form.watch("province")}
										renderInput={(params) => (
											<TextField
												{...params}
												placeholder={t("contacts.select_district")}
												sx={{
													"& .MuiOutlinedInput-root": { borderRadius: "8px" },
												}}
											/>
										)}
									/>
								</Box>
							</Stack>
						</Stack>
					</form>
				</Collapse>

				{/* Additional Information Section */}
				<Box
					sx={{
						bgcolor: "#2196F3",
						p: 1,
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						cursor: "pointer",
					}}
					onClick={() => setAdditionalOpen(!additionalOpen)}
				>
					<Typography sx={{ color: "white", fontWeight: 600, ml: 1 }}>
						{t("contacts.additional_info")}
					</Typography>
					<IconButton
						size="small"
						sx={{ color: "white" }}
					>
						<Remove />
					</IconButton>
				</Box>

				<Collapse in={additionalOpen}>
					<Stack
						spacing={2.5}
						sx={{ p: 3 }}
					>
						<Box>
							<Typography
								variant="body2"
								sx={{ mb: 1, fontWeight: 600 }}
							>
								{t("contacts.tags")}
							</Typography>
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
								value={
									form
										.watch("tags")
										?.map((v: string) =>
											tags?.find((t: any) => t.slug === v),
										) || []
								}
								onChange={(_, newValue) =>
									form.setValue(
										"tags",
										newValue.map((v: any) => v.slug),
									)
								}
								renderTags={() => null}
								noOptionsText={
									<div style={{ padding: 16, textAlign: "center" }}>
										<Typography>{t("contacts.no_tags_found")}</Typography>
										<Button
											onClick={handleAddTag}
											variant="outlined"
											size="small"
										>
											{t("contacts.add_new_tag")}
										</Button>
									</div>
								}
								renderInput={(params) => (
									<TextField
										{...params}
										variant="outlined"
										placeholder={t("contacts.select_tags")}
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
								{form.watch("tags")?.map((tag: any) => (
									<Chip
										key={tag}
										label={tag}
										onDelete={() =>
											form.setValue(
												"tags",
												form.watch("tags")?.filter((t: string) => t !== tag),
											)
										}
									/>
								))}
							</Box>
						</Box>

						<Stack
							direction="row"
							spacing={3}
						>
							<Box sx={{ flex: 1 }}>
								<Typography
									variant="body2"
									sx={{ mb: 1, fontWeight: 600 }}
								>
									{t("contacts.phone_number")}{" "}
								</Typography>
								<TextField
									fullWidth
									size="small"
									{...form.register("phone_number")}
									sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
								/>
							</Box>
							<Box sx={{ flex: 1 }}>
								<Typography
									variant="body2"
									sx={{ mb: 1, fontWeight: 600 }}
								>
									{t("contacts.birthday")}
								</Typography>
								<LocalizationProvider dateAdapter={AdapterDayjs}>
									<DatePicker
										slotProps={{
											textField: {
												size: "small",
												sx: { borderRadius: "8px" },
												fullWidth: true,
											},
										}}
										format="DD/MM/YYYY"
										value={
											form.watch("birthday")
												? dayjs(form.watch("birthday"))
												: null
										}
										onChange={(value) => {
											form.setValue(
												"birthday",
												value ? value.toISOString() : null,
											);
										}}
										disableFuture
									/>
								</LocalizationProvider>
							</Box>
						</Stack>

						<Box>
							<Typography
								variant="body2"
								sx={{ mb: 1, fontWeight: 600 }}
							>
								{t("contacts.company")}
							</Typography>
							<TextField
								fullWidth
								size="small"
								{...form.register("company")}
								sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
							/>
						</Box>
					</Stack>
				</Collapse>
			</DialogContent>

			<DialogActions
				sx={{
					p: 2.5,
					px: 3,
					borderTop: "1px solid #E5E7EB",
					justifyContent: "space-between",
				}}
			>
				<Button
					onClick={onClose}
					sx={{ textTransform: "none", color: "text.primary", fontWeight: 700 }}
				>
					{t("common.cancel")}
				</Button>
				<Stack
					direction="row"
					spacing={2}
				>
					{!initialData && (
						<Button
							onClick={form.handleSubmit(handleSaveAndAdd)}
							sx={{ textTransform: "none", color: "#2196F3", fontWeight: 700 }}
						>
							{t("contacts.save_and_add_another")}
						</Button>
					)}
					<Button
						variant="contained"
						onClick={form.handleSubmit(handleAddContact)}
						sx={{
							textTransform: "none",
							fontWeight: 700,
							px: 4,
							borderRadius: "10px",
							boxShadow: "none",
							"& .MuiButton-root": { bgcolor: "#2196F3" },
							"&:hover": { boxShadow: "none" },
						}}
					>
						{initialData ? t("common.save") : t("contacts.add_contact")}
					</Button>
				</Stack>
			</DialogActions>
		</Dialog>
	);
}
