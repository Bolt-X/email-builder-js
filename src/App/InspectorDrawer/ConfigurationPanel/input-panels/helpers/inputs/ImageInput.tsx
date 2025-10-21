import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import LinkIcon from "@mui/icons-material/Link";
import { Box, Button, IconButton, Tab, Tabs } from "@mui/material";
import { useState } from "react";
import TextInput from "./TextInput";

import { ImagePropsSchema } from "@usewaypoint/block-image";

type Props = {
	label: string;
	defaultValue: string;
	onChange: (value: string) => void;
};

const ImageInput = ({ label, defaultValue, onChange }: Props) => {
	const [tab, setTab] = useState(0);

	const handleUpload = async (file: File) => {
		console.log("🚀 ~ handleUpload ~ handleUpload:", handleUpload);
		const formData = new FormData();
		formData.append("file", file);

		// Upload qua API
		const res = await fetch("/api/upload", {
			method: "POST",
			body: formData,
		});
		const { url } = await res.json();
		const backgroundImageValue = `url(${url})`;
		onChange(backgroundImageValue);
	};

	const handleClear = () => {
		const clearImageValue = "";
		onChange(clearImageValue);
	};
	return (
		<>
			{/* Tabs */}
			<Tabs
				value={tab}
				onChange={(_, v) => setTab(v)}
				aria-label="image source tabs"
				sx={{
					borderBottom: 1,
					borderColor: "divider",
					minHeight: 32, // giảm chiều cao chung của Tabs
					"& .MuiTab-root": {
						minHeight: 32, // giảm chiều cao của Tab
						paddingY: 0.5, // chỉnh lại padding top/bottom
					},
				}}
			>
				<Tab
					icon={<CloudUploadIcon fontSize="small" />}
					iconPosition="start"
					label="Upload"
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
					}}
				>
					{defaultValue ? (
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
								onChange={(e) => {
									const file = e.target.files?.[0];
									if (file) handleUpload(file);
								}}
							/>
						</Button>
					) : (
						<Box>
							<img
								src={defaultValue}
								alt="preview"
								style={{ maxWidth: "100%", marginBottom: 8 }}
							/>
							<IconButton
								color="error"
								onClick={handleClear}
							>
								<DeleteIcon />
							</IconButton>
						</Box>
					)}
				</Box>
			)}

			{/* URL tab */}
			{tab === 1 && (
				<Box mt={2}>
					<TextInput
						label="Image URL"
						defaultValue={defaultValue}
						onChange={(v) => {
							const url = v.trim().length === 0 ? null : v.trim();
							const backgroundImageValue = `url(${url})`;
							onChange(backgroundImageValue);
						}}
					/>
				</Box>
			)}
		</>
	);
};

export default ImageInput;
