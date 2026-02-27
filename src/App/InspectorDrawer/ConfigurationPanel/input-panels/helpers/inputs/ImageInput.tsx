import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import LinkIcon from "@mui/icons-material/Link";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import {
	Box,
	Button,
	IconButton,
	Tab,
	Tabs,
	CircularProgress,
	Alert,
	Stack,
	InputLabel,
} from "@mui/material";
import { useState } from "react";
import TextInput from "./TextInput";
import { uploadImageWithProgress } from "../../../../../../services/files";
import ImageLibrary from "./ImageLibrary";

type Props = {
	label: string;
	defaultValue: string;
	onChange: (value: string) => void;
};

const assetURL = import.meta.env.VITE_ASSETS_URL;

const ImageInput = ({ label, defaultValue, onChange }: Props) => {
	const [tab, setTab] = useState(0);
	const [uploading, setUploading] = useState(false);
	const [progress, setProgress] = useState(0);
	const [error, setError] = useState<string | null>(null);
	const [preview, setPreview] = useState<string | null>(null);

	// Xóa ảnh hiện tại
	const handleClear = () => {
		onChange(null);
		setPreview(null);
	};

	// Upload file có theo dõi % tiến trình
	const handleUpload = async (file: File) => {
		setUploading(true);
		setError(null);
		setProgress(0);

		try {
			const res = await uploadImageWithProgress(file, (percent: number) =>
				setProgress(percent),
			);
			const url = assetURL + res?.id;
			onChange(url);
			setPreview(null); // sau khi upload xong thì dùng ảnh chính thức
		} catch (err) {
			console.error(err);
			setError("Upload failed. Please try again!");
		} finally {
			setUploading(false);
		}
	};

	// Xử lý khi người dùng chọn file
	const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const maxSize = 5 * 1024 * 1024; // 5MB
		if (file.size > maxSize) {
			setError("Your file exceeds the 5MB limit. Please upload a smaller one!");
			return;
		}

		setPreview(URL.createObjectURL(file));
		handleUpload(file);
	};

	const imageToShow = preview || defaultValue;

	return (
		<Stack alignItems="flex-start w-full">
			<InputLabel sx={{ mb: 0.5 }}>{label}</InputLabel>
			{/* Tabs */}
			<Tabs
				value={tab}
				onChange={(_, v) => setTab(v)}
				aria-label="image source tabs"
				sx={{
					borderBottom: 1,
					borderColor: "divider",
					minHeight: 32,
					"& .MuiTab-root": {
						minHeight: 32,
						paddingY: 0.5,
						fontSize: 12,
					},
				}}
			>
				<Tab
					icon={<CloudUploadIcon fontSize="small" />}
					iconPosition="start"
					label="Upload"
				/>
				<Tab
					icon={<PhotoLibraryIcon fontSize="small" />}
					iconPosition="start"
					label="Library"
				/>
				<Tab
					icon={<LinkIcon fontSize="small" />}
					iconPosition="start"
					label="URL"
				/>
			</Tabs>

			{/* Upload tab */}
			{tab === 0 && (
				<Box
					mt={2}
					p={2}
					sx={{
						border: "1px dashed #ccc",
						borderRadius: 1,
						textAlign: "center",
						backgroundColor: "#f9fbfc",
						position: "relative",
						width: "100%",
					}}
				>
					{error && (
						<Alert
							severity="error"
							sx={{ mb: 2 }}
							onClose={() => setError(null)}
						>
							{error}
						</Alert>
					)}

					{/* Khi chưa có ảnh */}
					{!imageToShow && !uploading && (
						<Button
							component="label"
							variant="text"
							startIcon={<CloudUploadIcon />}
						>
							Upload image
							<input
								type="file"
								accept="image/*"
								hidden
								onChange={onFileChange}
							/>
						</Button>
					)}

					{/* Khi có ảnh (preview hoặc ảnh chính thức) */}
					{imageToShow && (
						<Box
							sx={{
								position: "relative",
								display: "inline-block",
								width: "100%",
								maxWidth: 300,
							}}
						>
							<img
								src={imageToShow}
								alt="preview"
								style={{
									width: "100%",
									opacity: uploading ? 0.5 : 1,
									borderRadius: 8,
								}}
							/>
							{/* Overlay progress */}
							{uploading && (
								<Box
									sx={{
										position: "absolute",
										top: "50%",
										left: "50%",
										transform: "translate(-50%, -50%)",
										display: "flex",
										flexDirection: "column",
										alignItems: "center",
										justifyContent: "center",
									}}
								>
									<CircularProgress
										variant="determinate"
										value={progress}
										size={60}
										thickness={4}
										color="primary"
									/>
									<Box
										sx={{
											position: "absolute",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											fontWeight: 600,
											color: "#0079CC",
											inset: 0,
											border: "6px solid #0079CC50",
											background: "#FFF",
											borderRadius: "100%",
											zIndex: "-1",
										}}
									>
										{Math.round(progress)}%
									</Box>
								</Box>
							)}

							{/* Nút xóa ảnh */}
							{!uploading && (
								<IconButton
									color="error"
									onClick={handleClear}
									sx={{
										position: "absolute",
										top: 8,
										right: 8,
										background: "rgba(255,255,255,0.7)",
									}}
								>
									<DeleteIcon />
								</IconButton>
							)}
						</Box>
					)}
				</Box>
			)}

			{/* Library tab */}
			{tab === 1 && (
				<ImageLibrary
					selectedValue={defaultValue}
					onSelect={(url) => {
						onChange(url);
					}}
					onClear={handleClear}
				/>
			)}

			{/* URL tab */}
			{tab === 2 && (
				<Box
					mt={2}
					sx={{ width: "100%" }}
				>
					<TextInput
						label={null}
						defaultValue={defaultValue}
						onChange={(v) => {
							const url = v.trim().length === 0 ? null : v.trim();
							onChange(url);
						}}
					/>
				</Box>
			)}
		</Stack>
	);
};

export default ImageInput;
