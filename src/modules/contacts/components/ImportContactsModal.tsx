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
	Checkbox,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Chip,
	InputAdornment,
	Select,
	FormControl,
	InputLabel,
} from "@mui/material";
import {
	Close,
	CloudUploadOutlined,
	DeleteOutline,
	Search,
	East,
} from "@mui/icons-material";

interface ImportContactsModalProps {
	open: boolean;
	onClose: () => void;
}

const steps = ["Initialise", "Mapping columns", "Confirm"];

export default function ImportContactsModal({
	open,
	onClose,
}: ImportContactsModalProps) {
	const [activeStep, setActiveStep] = useState(0);

	const handleNext = () => setActiveStep((prev) => prev + 1);
	const handleBack = () => setActiveStep((prev) => prev - 1);

	const renderStepContent = (step: number) => {
		switch (step) {
			case 0:
				return <StepInitialise />;
			case 1:
				return <StepMapping />;
			case 2:
				return <StepConfirm />;
			default:
				return null;
		}
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="md"
			fullWidth
			PaperProps={{
				sx: { borderRadius: "12px", p: 1 },
			}}
		>
			<DialogTitle
				sx={{
					m: 0,
					p: 2,
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
				}}
			>
				<Typography
					variant="h6"
					sx={{ fontWeight: 700 }}
				>
					{activeStep === 2
						? "Review and complete your import"
						: "Import contacts"}
				</Typography>
				<IconButton
					onClick={onClose}
					size="small"
					sx={{ color: "text.secondary" }}
				>
					<Close />
				</IconButton>
			</DialogTitle>

			<DialogContent sx={{ p: 2 }}>
				{renderStepContent(activeStep)}
			</DialogContent>

			<DialogActions sx={{ p: 2, justifyContent: "flex-end", gap: 1 }}>
				<Button
					onClick={activeStep === 0 ? onClose : handleBack}
					sx={{
						textTransform: "none",
						color: "text.primary",
						fontWeight: 600,
					}}
				>
					Cancel
				</Button>
				<Button
					variant="contained"
					onClick={activeStep === 2 ? onClose : handleNext}
					sx={{
						textTransform: "none",
						fontWeight: 600,
						px: 4,
						borderRadius: "8px",
						boxShadow: "none",
						"&:hover": { boxShadow: "none" },
					}}
				>
					{activeStep === 2 ? "Import" : "Continue"}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

function StepInitialise() {
	return (
		<Stack spacing={3}>
			<Stack
				direction="row"
				spacing={2}
			>
				<FormControl
					fullWidth
					size="small"
				>
					<Typography
						variant="body2"
						sx={{ mb: 1, fontWeight: 600 }}
					>
						Contact list <span style={{ color: "red" }}>*</span>
					</Typography>
					<Select
						defaultValue="default"
						sx={{ borderRadius: "8px" }}
					>
						<MenuItem value="default">Default list</MenuItem>
					</Select>
				</FormControl>
				<FormControl
					fullWidth
					size="small"
				>
					<Typography
						variant="body2"
						sx={{ mb: 1, fontWeight: 600 }}
					>
						Email marketing status <span style={{ color: "red" }}>*</span>
					</Typography>
					<Select
						defaultValue="non"
						sx={{ borderRadius: "8px" }}
					>
						<MenuItem value="non">Non-subscribed</MenuItem>
						<MenuItem value="sub">Subscribed</MenuItem>
					</Select>
				</FormControl>
			</Stack>

			<FormControl
				fullWidth
				size="small"
			>
				<Typography
					variant="body2"
					sx={{ mb: 1, fontWeight: 600 }}
				>
					What should we do with contact information?{" "}
					<span style={{ color: "red" }}>*</span>
				</Typography>
				<Select
					defaultValue="both"
					sx={{ borderRadius: "8px" }}
				>
					<MenuItem value="both">Add and update existing</MenuItem>
					<MenuItem value="add">Only add new</MenuItem>
					<MenuItem value="update">Only update existing</MenuItem>
				</Select>
			</FormControl>

			<Box>
				<Typography
					variant="body2"
					sx={{ mb: 1, fontWeight: 600 }}
				>
					Upload a file <span style={{ color: "red" }}>*</span>
				</Typography>
				<Box
					sx={{
						border: "1px dashed #E5E7EB",
						borderRadius: "8px",
						p: 4,
						textAlign: "center",
						bgcolor: "#FAFBFC",
					}}
				>
					<CloudUploadOutlined
						sx={{ fontSize: 32, color: "text.secondary", mb: 1 }}
					/>
					<Typography variant="body2">
						Drag and drop or{" "}
						<span
							style={{ color: "#2563EB", cursor: "pointer", fontWeight: 600 }}
						>
							Select a file
						</span>
					</Typography>
					<Typography
						variant="caption"
						color="text.secondary"
					>
						Max file size: 200 MB (CSV, TXT), 50 MB (XLSX)
					</Typography>
				</Box>
			</Box>

			<Box
				sx={{
					p: 2,
					border: "1px solid #E5E7EB",
					borderRadius: "8px",
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
				}}
			>
				<Stack
					direction="row"
					spacing={2}
					alignItems="center"
				>
					<Box
						sx={{
							width: 40,
							height: 40,
							bgcolor: "#F3F4F6",
							borderRadius: "4px",
						}}
					/>
					<Box>
						<Typography
							variant="body2"
							sx={{ fontWeight: 600 }}
						>
							MOCK_DATA.csv
						</Typography>
						<Typography
							variant="caption"
							color="text.secondary"
						>
							79.5kb
						</Typography>
					</Box>
				</Stack>
				<IconButton size="small">
					<Close fontSize="small" />
				</IconButton>
			</Box>

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
						endAdornment: <Typography sx={{ fontSize: 10 }}>▼</Typography>,
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
					{[
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
					].map((tag) => (
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
		</Stack>
	);
}

const mockColumns = [
	{ file: "id", match: "id", type: "Number", checked: false },
	{
		file: "email_address",
		match: "email_address",
		type: "Email",
		checked: true,
	},
	{ file: "first_name", match: "first_name", type: "Text", checked: true },
	{ file: "last_name", match: "last_name", type: "Text", checked: true },
	{ file: "address", match: "address", type: "Address", checked: true },
	{ file: "Phone_number", match: "Phone_number", type: "Text", checked: true },
	{ file: "Company", match: "Company", type: "Text", checked: true },
	{ file: "Birthday", match: "Birthday", type: "Calendar", checked: true },
	{ file: "Tags", match: "Tags", type: "Tags", checked: true },
	{ file: "Company", match: "Company", type: "Text", checked: true },
];

function StepMapping() {
	return (
		<Box>
			<TableContainer sx={{ maxHeight: 400 }}>
				<Table
					stickyHeader
					size="small"
				>
					<TableHead>
						<TableRow
							sx={{
								"& th": {
									bgcolor: "#F9FAFB",
									fontWeight: 700,
									color: "text.secondary",
									borderBottom: "1px solid #E5E7EB",
								},
							}}
						>
							<TableCell>Import</TableCell>
							<TableCell>File Column</TableCell>
							<TableCell></TableCell>
							<TableCell>Added column</TableCell>
							<TableCell>Data type</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{mockColumns.map((col, i) => (
							<TableRow key={i}>
								<TableCell padding="checkbox">
									<Checkbox
										size="small"
										checked={col.checked}
									/>
								</TableCell>
								<TableCell>
									<TextField
										size="small"
										value={col.file}
										disabled
										sx={{
											bgcolor: "#F9FAFB",
											"& .MuiOutlinedInput-root": { borderRadius: "6px" },
										}}
									/>
								</TableCell>
								<TableCell>
									<East sx={{ color: "text.secondary", fontSize: 18 }} />
								</TableCell>
								<TableCell>
									<Select
										fullWidth
										size="small"
										value={col.match}
										sx={{ borderRadius: "6px" }}
									>
										<MenuItem value={col.match}>{col.match}</MenuItem>
									</Select>
								</TableCell>
								<TableCell>
									<Typography
										variant="body2"
										color="text.secondary"
									>
										{col.type}
									</Typography>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
			<Typography
				variant="body2"
				sx={{ mt: 2, color: "primary.main", fontWeight: 600 }}
			>
				8/17 columns will be imported.
			</Typography>
		</Box>
	);
}

function StepConfirm() {
	return (
		<Box>
			<Typography
				variant="body2"
				sx={{ mb: 1 }}
			>
				<span style={{ fontWeight: 700, color: "#2563EB" }}>8</span> contacts
				will be updated or added to your{" "}
				<span style={{ fontWeight: 700 }}>"Default list"</span> contacts.
			</Typography>
			<Typography
				variant="body2"
				sx={{ mb: 3 }}
			>
				<span style={{ fontWeight: 700, color: "#DC2626" }}>2</span> error
				contacts need to be solve{" "}
				<Button
					size="small"
					sx={{
						textTransform: "none",
						color: "#2563EB",
						fontWeight: 700,
						p: 0,
						minWidth: "auto",
						ml: 1,
					}}
				>
					Download error file
				</Button>
			</Typography>

			<Stack spacing={2}>
				{[
					{ label: "Imported from", value: "File upload" },
					{ label: "Email marketing status", value: "Subscribed" },
					{ label: "Update existing contacts", value: "Yes" },
					{ label: "Tagged", value: "2025, Customer, Member" },
				].map((item, i) => (
					<Stack
						key={i}
						direction="row"
						spacing={2}
						alignItems="flex-start"
					>
						<Box
							sx={{
								width: 6,
								height: 6,
								bgcolor: "text.primary",
								borderRadius: "50%",
								mt: 1,
							}}
						/>
						<Typography variant="body2">
							<span style={{ fontWeight: 700 }}>{item.label}:</span>{" "}
							{item.value}
						</Typography>
					</Stack>
				))}
			</Stack>
		</Box>
	);
}
