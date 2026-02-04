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
	Typography
} from "@mui/material";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import * as yup from "yup";
import { useCreateContact, useGetProvinces } from "../../../hooks/useContact";
import { useGetAllTags } from "../../../hooks/useTags";
import ModalCreateTag from "../../tags/ModalCreateTag";
import { getContactListBySlugWithSubscribers } from "../service";
import { getWardsByProvinceId } from "../../../services/contact";

interface CreateContactModalProps {
	open: boolean;
	onClose: () => void;
}

const formContactSchema = yup.object().shape({
	contact_lists: yup.array().of(yup.number()).required("Contact list is required"),
	email: yup.string().email("Invalid email address").required("Email is required"),
	status: yup.string().required("Status is required"),
	first_name: yup.string().required("First name is required"),
	last_name: yup.string().required("Last name is required"),
	address: yup.string().required("Address is required"),
	phone_number: yup.string().required("Phone is required"),
	province: yup.string().nullable().notRequired(),
	ward: yup.string().nullable().notRequired(),
	birthday: yup.string().nullable().notRequired(),
	company: yup.string().nullable().notRequired(),
	tags: yup.array().of(yup.string()).nullable().notRequired(),
});

export default function CreateContactModal({
	open,
	onClose,
}: CreateContactModalProps) {
	const { id } = useParams();
	const mutateCreateContact = useCreateContact();
	const { data: tags } = useGetAllTags();

	const [contactList, setContactList] = useState<any | null>(null);
	const [addTagModalOpen, setAddTagModalOpen] = useState(false);
	const [wards, setWards] = useState<any[]>([]);

	useEffect(() => {
		const fetchContactList = async () => {
			const res = await getContactListBySlugWithSubscribers(id);
			console.log("res", res);

			setContactList(res[0].id);
		}
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
		if (contactList) {
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
	}, [contactList]);

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
		}
		fetchWards();
	}, [form.watch("province")]);

	const handleSubmit = async (data: any) => {
		try {
			await mutateCreateContact.mutateAsync(data);
		} catch (error) {
			console.error("Failed to create contact:", error);
		}
	}

	const handleSaveAndAdd = async () => {
		try {
			const data = form.getValues();
			delete data.province;
			delete data.contact_lists;
			await handleSubmit({ contact: data, slug: id });
		} catch (error) {
			console.error("Failed to create contact:", error);
		}
		finally {
			form.reset();
		}
	}

	const handleAddContact = async () => {
		try {
			const data = form.getValues();
			delete data.province;
			delete data.contact_lists;
			await handleSubmit({ contact: data, slug: id });
		} catch (error) {
			console.error("Failed to create contact:", error);
		} finally {
			onClose();
			form.reset();
		}
	}

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
					New contact
				</Typography>
				<IconButton
					onClick={() => {
						onClose();
						form.reset();
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
						General information
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
										Email Address <span style={{ color: "red" }}>*</span>
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
										Email marketing status <span style={{ color: "red" }}>*</span>
									</Typography>
									<Select
										fullWidth
										size="small"
										value={form.watch("status") || ""}
										onChange={(e) => {
											form.setValue("status", e.target.value)
										}}
										error={!!form.formState.errors.status}
										sx={{ borderRadius: "8px" }}
										displayEmpty
									>
										<MenuItem value="">
											<em>Select status</em>
										</MenuItem>
										<MenuItem value="subscribed">Subscribed</MenuItem>
										<MenuItem value="non_subscribed">Non subscribed</MenuItem>
										<MenuItem value="unsubscribed">Unsubscribed</MenuItem>
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
							<Stack direction="row" spacing={3} alignItems="cetner">
								<Box sx={{ flex: 1 }}>
									<Typography
										variant="body2"
										sx={{ mb: 1, fontWeight: 600 }}
									>
										First Name <span style={{ color: "red" }}>*</span>
									</Typography>
									<TextField
										fullWidth
										size="small"
										{...form.register("first_name")}
										error={!!form.formState.errors.first_name}
										helperText={form.formState.errors.first_name?.message}
										sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
										placeholder="Enter full name"
									/>
								</Box>
								<Box sx={{ flex: 1 }}>
									<Typography
										variant="body2"
										sx={{ mb: 1, fontWeight: 600 }}
									>
										Last Name <span style={{ color: "red" }}>*</span>
									</Typography>
									<TextField
										fullWidth
										size="small"
										{...form.register("last_name")}
										error={!!form.formState.errors.last_name}
										helperText={form.formState.errors.last_name?.message}
										sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
										placeholder="Enter last name"
									/>
								</Box>

							</Stack>

							<Box>
								<Typography
									variant="body2"
									sx={{ mb: 1, fontWeight: 600 }}
								>
									Address<span style={{ color: "red" }}>*</span>
								</Typography>
								<TextField
									fullWidth
									size="small"
									{...form.register("address")}
									error={!!form.formState.errors.address}
									helperText={form.formState.errors.address?.message}
									sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
									placeholder="Enter address"
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
										City/ Province
									</Typography>
									<Select
										fullWidth
										size="small"
										value={form.watch("province") || ""}
										onChange={(e) => {
											form.setValue("province", e.target.value)
											form.setValue("ward", "") // reset district nếu có
										}}
										displayEmpty
										sx={{ borderRadius: "8px" }}
									>
										<MenuItem value="">
											<em>Select province</em>
										</MenuItem>
										{provinces?.map((province: any) => (
											<MenuItem key={province.slug} value={province.slug}>{province.name}</MenuItem>
										))}
									</Select>
								</Box>
								<Box sx={{ flex: 1 }}>
									<Typography
										variant="body2"
										sx={{ mb: 1, fontWeight: 600 }}
									>
										District
									</Typography>
									<Select
										fullWidth
										size="small"
										value={form.watch("ward") || ""}
										onChange={(e) => {
											form.setValue("ward", e.target.value)
										}}
										displayEmpty
										sx={{ borderRadius: "8px" }}
										disabled={!form.watch("province")}
									>
										<MenuItem value="">
											<em>Select district</em>
										</MenuItem>
										{wards?.map((ward: any) => (
											<MenuItem key={ward.slug} value={ward.slug}>{ward.name}</MenuItem>
										))}
									</Select>
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
						Additional information
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
								Tags
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
								value={form.watch("tags")?.map((v: string) => tags?.find((t: any) => t.slug === v)) || []}
								onChange={(_, newValue) =>
									form.setValue("tags", newValue.map((v: any) => v.slug))
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
								{form.watch("tags")?.map((tag: any) => (
									<Chip
										key={tag}
										label={tag}
										onDelete={() => form.setValue("tags", form.watch("tags")?.filter((t: string) => t !== tag))}
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
									Phone Number <span style={{ color: "red" }}>*</span>
								</Typography>
								<TextField
									fullWidth
									size="small"
									{...form.register("phone_number")}
									error={!!form.formState.errors.phone_number}
									helperText={form.formState.errors.phone_number?.message}
									sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
								/>
							</Box>
							<Box sx={{ flex: 1 }}>
								<Typography
									variant="body2"
									sx={{ mb: 1, fontWeight: 600 }}
								>
									Birthday ℹ️
								</Typography>
								<TextField
									fullWidth
									size="small"
									type="date"
									{...form.register("birthday")}
									// InputProps={{
									// 	endAdornment: (
									// 		<CalendarMonth
									// 			sx={{ color: "text.secondary", fontSize: 20 }}
									// 		/>
									// 	),
									// }}
									sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
								/>
							</Box>
						</Stack>

						<Box>
							<Typography
								variant="body2"
								sx={{ mb: 1, fontWeight: 600 }}
							>
								Company
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
					Cancel
				</Button>
				<Stack
					direction="row"
					spacing={2}
				>
					<Button
						onClick={form.handleSubmit(handleSaveAndAdd)}
						sx={{ textTransform: "none", color: "#2196F3", fontWeight: 700 }}
					>
						Save & Add Another
					</Button>
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
						Add contact
					</Button>
				</Stack>
			</DialogActions>
		</Dialog>
	);
}
