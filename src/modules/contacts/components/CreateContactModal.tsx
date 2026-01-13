import React, { useState } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	IconButton,
	Typography,
	Stack,
	TextField,
	MenuItem,
	Box,
	Chip,
	Select,
	FormControl,
	Collapse,
} from "@mui/material";
import { Close, Remove, CalendarMonth } from "@mui/icons-material";

interface CreateContactModalProps {
	open: boolean;
	onClose: () => void;
}

export default function CreateContactModal({
	open,
	onClose,
}: CreateContactModalProps) {
	const [formData, setFormData] = useState({
		contacts: "default",
		email: "",
		status: "non-subscribed",
		firstName: "",
		lastName: "",
		address: "",
		city: "Hà Nội",
		district: "Phường Ô Chợ Dừa",
		phone: "",
		birthday: "2003-01-06",
		company: "BoltX",
		tags: [
			"2025",
			"customer",
			"member",
			"admin",
			"guest",
			"superuser",
			"moderator",
			"contributor",
			"viewer",
			"test-campaign",
			"editor",
		],
	});

	const [errors, setErrors] = useState<Record<string, string>>({});
	const [generalOpen, setGeneralOpen] = useState(true);
	const [additionalOpen, setAdditionalOpen] = useState(true);

	const validate = () => {
		const newErrors: Record<string, string> = {};
		if (!formData.email) newErrors.email = "Email is required";
		else if (!/\S+@\S+\.\S+/.test(formData.email))
			newErrors.email = "Invalid email format";

		if (!formData.firstName) newErrors.firstName = "First name is required";
		if (!formData.lastName) newErrors.lastName = "Last name is required";
		if (!formData.address) newErrors.address = "Address is required";
		if (!formData.contacts) newErrors.contacts = "Contact list is required";
		if (!formData.status) newErrors.status = "Marketing status is required";

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleAdd = () => {
		if (validate()) {
			console.log("Adding contact:", formData);
			onClose();
		}
	};

	const handleFieldChange = (field: string, value: any) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		if (errors[field]) {
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors[field];
				return newErrors;
			});
		}
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="md"
			fullWidth
			PaperProps={{
				sx: { borderRadius: "12px", p: 0 },
			}}
		>
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
					onClick={onClose}
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
					<Stack
						spacing={2.5}
						sx={{ p: 3 }}
					>
						<Box sx={{ width: "50%" }}>
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
									Email Address <span style={{ color: "red" }}>*</span>
								</Typography>
								<TextField
									fullWidth
									size="small"
									placeholder="e.g. email@gmail.com"
									value={formData.email}
									onChange={(e) => handleFieldChange("email", e.target.value)}
									error={!!errors.email}
									helperText={errors.email}
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
									value={formData.status}
									onChange={(e) => handleFieldChange("status", e.target.value)}
									error={!!errors.status}
									sx={{ borderRadius: "8px" }}
								>
									<MenuItem value="non-subscribed">Non-subscribed</MenuItem>
									<MenuItem value="subscribed">Subscribed</MenuItem>
								</Select>
								{errors.status && (
									<Typography
										variant="caption"
										color="error"
									>
										{errors.status}
									</Typography>
								)}
							</Box>
						</Stack>

						<Stack
							direction="row"
							spacing={3}
						>
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
									value={formData.firstName}
									onChange={(e) =>
										handleFieldChange("firstName", e.target.value)
									}
									error={!!errors.firstName}
									helperText={errors.firstName}
									sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
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
									value={formData.lastName}
									onChange={(e) =>
										handleFieldChange("lastName", e.target.value)
									}
									error={!!errors.lastName}
									helperText={errors.lastName}
									sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
								/>
							</Box>
						</Stack>

						<Box>
							<Typography
								variant="body2"
								sx={{ mb: 1, fontWeight: 600 }}
							>
								Address <span style={{ color: "red" }}>*</span>
							</Typography>
							<TextField
								fullWidth
								size="small"
								value={formData.address}
								onChange={(e) => handleFieldChange("address", e.target.value)}
								error={!!errors.address}
								helperText={errors.address}
								sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
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
									value={formData.city}
									onChange={(e) => handleFieldChange("city", e.target.value)}
									sx={{ borderRadius: "8px" }}
								>
									<MenuItem value="Hà Nội">Thành phố Hà Nội</MenuItem>
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
									value={formData.district}
									onChange={(e) =>
										handleFieldChange("district", e.target.value)
									}
									sx={{ borderRadius: "8px" }}
								>
									<MenuItem value="Phường Ô Chợ Dừa">Phường Ô Chợ Dừa</MenuItem>
								</Select>
							</Box>
						</Stack>
					</Stack>
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
							<TextField
								fullWidth
								size="small"
								placeholder="Choose tags"
								InputProps={{
									endAdornment: (
										<Typography sx={{ fontSize: 10 }}>▼</Typography>
									),
								}}
								sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
							/>
							<Stack
								direction="row"
								spacing={1}
								flexWrap="wrap"
								mt={1}
								useFlexGap
							>
								{formData.tags.map((tag) => (
									<Chip
										key={tag}
										label={tag}
										size="small"
										onDelete={() => {}}
										sx={{
											bgcolor: "#F3F4F6",
											borderRadius: "4px",
											"& .MuiChip-deleteIcon": { fontSize: 14 },
										}}
									/>
								))}
							</Stack>
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
									Phone Number
								</Typography>
								<TextField
									fullWidth
									size="small"
									value={formData.phone}
									onChange={(e) => handleFieldChange("phone", e.target.value)}
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
									value={formData.birthday}
									onChange={(e) =>
										handleFieldChange("birthday", e.target.value)
									}
									InputProps={{
										endAdornment: (
											<CalendarMonth
												sx={{ color: "text.secondary", fontSize: 20 }}
											/>
										),
									}}
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
								value={formData.company}
								onChange={(e) => handleFieldChange("company", e.target.value)}
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
						onClick={handleAdd}
						sx={{ textTransform: "none", color: "#2196F3", fontWeight: 700 }}
					>
						Save & Add Another
					</Button>
					<Button
						variant="contained"
						onClick={handleAdd}
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
