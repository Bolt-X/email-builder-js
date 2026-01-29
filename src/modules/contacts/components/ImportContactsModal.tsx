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
	Autocomplete,
} from "@mui/material";
import {
	Close,
	CloudUploadOutlined,
	DeleteOutline,
	Search,
	East,
} from "@mui/icons-material";
import { useGetAllTags } from "../../../hooks/useTags";
import ModalCreateTag from "../../tags/ModalCreateTag";
import { importContacts } from "../service";

interface ImportContactsModalProps {
	open: boolean;
	onClose: () => void;
	contactListSlug?: string; // Slug của contact list để import vào
}

const steps = ["Initialise", "Mapping columns", "Confirm"];

export default function ImportContactsModal({
	open,
	onClose,
	contactListSlug,
}: ImportContactsModalProps) {
	const { data: tags } = useGetAllTags();
	const [activeStep, setActiveStep] = useState(0);
	const [selectedTags, setSelectedTags] = useState<any[]>([]);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [isImporting, setIsImporting] = useState(false);
	const [importResult, setImportResult] = useState<{
		success: number;
		failed: number;
		errors: Array<{ row: number; email: string; error: string }>;
	} | null>(null);

	const handleNext = () => setActiveStep((prev) => prev + 1);
	const handleBack = () => setActiveStep((prev) => prev - 1);

	const renderStepContent = (step: number) => {
		switch (step) {
			case 0:
				return (
					<StepInitialise
						selectedTags={selectedTags}
						setSelectedTags={setSelectedTags}
						selectedFile={selectedFile}
						setSelectedFile={setSelectedFile}
						contactListSlug={contactListSlug}
					/>
				);
			case 1:
				return <StepConfirm result={importResult} />;
			case 2:
				return <StepConfirm result={importResult} />;
			default:
				return null;
		}
	};

	const handleImport = async () => {
		if (!selectedFile || !contactListSlug) {
			return;
		}

		setIsImporting(true);
		try {
			const result = await importContacts({
				file: selectedFile,
				contactListSlug,
				status: "subscribed", // Có thể lấy từ form
				updateExisting: true, // Có thể lấy từ form
			});
			setImportResult(result);
			setActiveStep(2); // Chuyển sang step confirm
		} catch (error: any) {
			console.error("Import error:", error);
			alert(error.message || "Failed to import contacts");
		} finally {
			setIsImporting(false);
		}
	};

	const handleClose = () => {
		setSelectedFile(null);
		setImportResult(null);
		setActiveStep(0);
		onClose();
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
					onClick={handleClose}
					disabled={isImporting}
					sx={{
						textTransform: "none",
						color: "text.primary",
						fontWeight: 600,
					}}
				>
					{activeStep === 2 ? "Close" : "Cancel"}
				</Button>
				{activeStep === 0 && (
					<Button
						variant="contained"
						onClick={handleNext}
						disabled={!selectedFile || isImporting}
						sx={{
							textTransform: "none",
							fontWeight: 600,
							px: 4,
							borderRadius: "8px",
							boxShadow: "none",
							"&:hover": { boxShadow: "none" },
						}}
					>
						Continue
					</Button>
				)}
				{activeStep === 1 && (
					<Button
						variant="contained"
						onClick={handleImport}
						disabled={!selectedFile || isImporting}
						sx={{
							textTransform: "none",
							fontWeight: 600,
							px: 4,
							borderRadius: "8px",
							boxShadow: "none",
							"&:hover": { boxShadow: "none" },
						}}
					>
						{isImporting ? "Importing..." : "Import"}
					</Button>
				)}
			</DialogActions>
		</Dialog>
	);
}

function StepInitialise({
	selectedTags,
	setSelectedTags,
	selectedFile,
	setSelectedFile,
	contactListSlug,
}: {
	selectedTags: any[];
	setSelectedTags: (tags: any[]) => void;
	selectedFile: File | null;
	setSelectedFile: (file: File | null) => void;
	contactListSlug?: string;
}) {
	const { data: tags } = useGetAllTags();
	const [addTagModalOpen, setAddTagModalOpen] = useState(false);
	const fileInputRef = React.useRef<HTMLInputElement>(null);

	const handleSelectTags = (tags: any[]) => {
		setSelectedTags(tags);
	};

	const handleAddTag = () => {
		setAddTagModalOpen(true);
	};

	const handleRemoveTag = (id: string) => {
		setSelectedTags(selectedTags.filter((tag) => tag.slug !== id));
	};

	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			setSelectedFile(file);
		}
	};

	const handleFileClick = () => {
		fileInputRef.current?.click();
	};

	const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		const file = event.dataTransfer.files[0];
		if (file) {
			setSelectedFile(file);
		}
	};

	const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
	};

	return (
		<Stack spacing={3}>
			<ModalCreateTag
				open={addTagModalOpen}
				onClose={() => setAddTagModalOpen(false)}
			/>
			<Stack
				direction="row"
				spacing={2}
			>
				{/* <FormControl
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
				</FormControl> */}
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
				<input
					ref={fileInputRef}
					type="file"
					accept=".csv,.txt,.xlsx,.xls"
					onChange={handleFileSelect}
					style={{ display: "none" }}
				/>
				<Box
					onClick={handleFileClick}
					onDrop={handleDrop}
					onDragOver={handleDragOver}
					sx={{
						border: "1px dashed #E5E7EB",
						borderRadius: "8px",
						p: 4,
						textAlign: "center",
						bgcolor: "#FAFBFC",
						cursor: "pointer",
						"&:hover": {
							bgcolor: "#F3F4F6",
							borderColor: "#2563EB",
						},
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
					<Typography color="text.secondary">
						Example file: <a href="/assets/sample_file/subscribers_sample.xlsx" target="_blank" rel="noopener noreferrer" style={{ color: "#2563EB", fontWeight: 600 }}>Download</a>
					</Typography>
				</Box>
				{selectedFile && (
					<Box
						sx={{
							mt: 2,
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
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
								}}
							>
								<CloudUploadOutlined sx={{ fontSize: 20, color: "text.secondary" }} />
							</Box>
							<Box>
								<Typography
									variant="body2"
									sx={{ fontWeight: 600 }}
								>
									{selectedFile.name}
								</Typography>
								<Typography
									variant="caption"
									color="text.secondary"
								>
									{(selectedFile.size / 1024).toFixed(2)} KB
								</Typography>
							</Box>
						</Stack>
						<IconButton
							size="small"
							onClick={() => setSelectedFile(null)}
						>
							<Close fontSize="small" />
						</IconButton>
					</Box>
				)}
			</Box>

			{/* <Box
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
			</Box> */}

			<Box>
				<Typography
					variant="body2"
					sx={{ mb: 1, fontWeight: 600 }}
				>
					Tags
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
						value={selectedTags}
						onChange={(_, newValue) =>
							handleSelectTags(newValue)
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
								placeholder="Choose tags"
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
						{selectedTags.map((tag) => (
							<Chip
								key={tag.slug}
								label={tag.title}
								onDelete={() => handleRemoveTag(tag.slug)}
							/>
						))}
					</Box>
				</FormControl>
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

// function StepMapping() {
// 	return (
// 		<Box>
// 			<TableContainer sx={{ maxHeight: 400 }}>
// 				<Table
// 					stickyHeader
// 					size="small"
// 				>
// 					<TableHead>
// 						<TableRow
// 							sx={{
// 								"& th": {
// 									bgcolor: "#F9FAFB",
// 									fontWeight: 700,
// 									color: "text.secondary",
// 									borderBottom: "1px solid #E5E7EB",
// 								},
// 							}}
// 						>
// 							<TableCell>Import</TableCell>
// 							<TableCell>File Column</TableCell>
// 							<TableCell></TableCell>
// 							<TableCell>Added column</TableCell>
// 							<TableCell>Data type</TableCell>
// 						</TableRow>
// 					</TableHead>
// 					<TableBody>
// 						{mockColumns.map((col, i) => (
// 							<TableRow key={i}>
// 								<TableCell padding="checkbox">
// 									<Checkbox
// 										size="small"
// 										checked={col.checked}
// 									/>
// 								</TableCell>
// 								<TableCell>
// 									<TextField
// 										size="small"
// 										value={col.file}
// 										disabled
// 										sx={{
// 											bgcolor: "#F9FAFB",
// 											"& .MuiOutlinedInput-root": { borderRadius: "6px" },
// 										}}
// 									/>
// 								</TableCell>
// 								<TableCell>
// 									<East sx={{ color: "text.secondary", fontSize: 18 }} />
// 								</TableCell>
// 								<TableCell>
// 									<Select
// 										fullWidth
// 										size="small"
// 										value={col.match}
// 										sx={{ borderRadius: "6px" }}
// 									>
// 										<MenuItem value={col.match}>{col.match}</MenuItem>
// 									</Select>
// 								</TableCell>
// 								<TableCell>
// 									<Typography
// 										variant="body2"
// 										color="text.secondary"
// 									>
// 										{col.type}
// 									</Typography>
// 								</TableCell>
// 							</TableRow>
// 						))}
// 					</TableBody>
// 				</Table>
// 			</TableContainer>
// 			<Typography
// 				variant="body2"
// 				sx={{ mt: 2, color: "primary.main", fontWeight: 600 }}
// 			>
// 				8/17 columns will be imported.
// 			</Typography>
// 		</Box>
// 	);
// }

function StepConfirm({ result }: { result: { success: number; failed: number; errors: Array<{ row: number; email: string; error: string }> } | null }) {
	return (
		<Box>
			{result ? (
				<>
					<Typography
						variant="body2"
						sx={{ mb: 1 }}
					>
						<span style={{ fontWeight: 700, color: "#2563EB" }}>{result.success}</span> contacts
						have been successfully imported.
					</Typography>
					{result.failed > 0 && (
						<Typography
							variant="body2"
							sx={{ mb: 3 }}
						>
							<span style={{ fontWeight: 700, color: "#DC2626" }}>{result.failed}</span> contacts
							failed to import.
							{result.errors.length > 0 && (
								<Box sx={{ mt: 2, p: 2, bgcolor: "#FEF2F2", borderRadius: "8px" }}>
									<Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
										Errors:
									</Typography>
									{result.errors.slice(0, 5).map((error, index) => (
										<Typography key={index} variant="caption" display="block" sx={{ mb: 0.5 }}>
											Row {error.row}: {error.email} - {error.error}
										</Typography>
									))}
									{result.errors.length > 5 && (
										<Typography variant="caption" color="text.secondary">
											... and {result.errors.length - 5} more errors
										</Typography>
									)}
								</Box>
							)}
						</Typography>
					)}
				</>
			) : (
				<>
					<Typography
						variant="body2"
						sx={{ mb: 1 }}
					>
						Review your import settings before proceeding.
					</Typography>
				</>
			)}

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
