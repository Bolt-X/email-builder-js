import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import LinkIcon from "@mui/icons-material/Link";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import {
	Alert,
	Box,
	Button,
	IconButton,
	LinearProgress,
	Stack,
	Tab,
	Tabs,
	ToggleButton,
	Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

import {
	VerticalAlignBottomOutlined,
	VerticalAlignCenterOutlined,
	VerticalAlignTopOutlined,
} from "@mui/icons-material";
import { ImageProps, ImagePropsSchema } from "@usewaypoint/block-image";
import { uploadImageWithProgress } from "../../../../services/files";
import BaseSidebarPanel from "./helpers/BaseSidebarPanel";
import RadioGroupInput from "./helpers/inputs/RadioGroupInput";
import TextDimensionInput from "./helpers/inputs/TextDimensionInput";
import TextInput from "./helpers/inputs/TextInput";
import MultiStylePropertyPanel from "./helpers/style-inputs/MultiStylePropertyPanel";
import { CircularProgress } from "@mui/material";
import ImageLibrary from "./helpers/inputs/ImageLibrary";

type ImageSidebarPanelProps = {
	data: ImageProps;
	setData: (v: ImageProps) => void;
};

const assetURL = import.meta.env.VITE_ASSETS_URL;

export default function ImageSidebarPanel({
	data,
	setData,
}: ImageSidebarPanelProps) {
	const [tab, setTab] = useState(0);
	const [uploading, setUploading] = useState(false);
	const [progress, setProgress] = useState(0);
	const [error, setError] = useState(null);
	const [preview, setPreview] = useState<string | null>(null);

	const updateData = (d: unknown) => {
		const res: any = ImagePropsSchema.safeParse(d);

		// Override res with success = true, data = d
		res.success = true;
		res.data = d as any;

		if (res.success) {
			setData(res.data);
		}
	};

	const handleUpload = async (file: File) => {
		setUploading(true);
		setError(null);
		setProgress(0);
		try {
			const res = await uploadImageWithProgress(file, (percent: number) =>
				setProgress(percent),
			);
			const url = assetURL + res?.id;
			updateData({ ...data, props: { ...data.props, url } });
		} catch (err: any) {
			console.error(err);
			setError("Upload failed. Please try again!");
		} finally {
			setUploading(false);
		}
	};

	const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// ✅ Kiểm tra dung lượng tối đa (5MB)
		const maxSize = 5 * 1024 * 1024; // 5MB
		if (file.size > maxSize) {
			setError(
				"Your file exceeds the 5MB limit. Please upload a smaller one!" as any,
			);
			return;
		}
		setPreview(URL.createObjectURL(file));
		handleUpload(file);
	};

	// cleanup URL tạm sau khi component unmount
	useEffect(() => {
		return () => {
			if (preview) URL.revokeObjectURL(preview);
		};
	}, [preview]);

	return (
		<BaseSidebarPanel title="Image block">
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
						overflow: "hidden",
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

					{/* Chưa có ảnh */}
					{!data.props?.url && !preview && (
						<Stack>
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
							<Typography
								variant="caption"
								color="text.secondary"
							>
								Maxium file size: 5MB
							</Typography>
						</Stack>
					)}

					{/* Có preview (đang upload hoặc upload xong) */}
					{(preview || data.props?.url) && (
						<Box sx={{ position: "relative", display: "inline-block" }}>
							<img
								src={preview || data.props?.url || ""}
								alt="preview"
								style={{
									maxWidth: "100%",
									borderRadius: 8,
									opacity: uploading ? 0.3 : 1, // 👈 giảm độ mờ khi đang upload
									transition: "opacity 0.3s ease",
								}}
							/>

							{/* Hiển thị CircularProgress ở giữa */}
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

							{/* Nút xóa ảnh khi upload xong */}
							{!uploading && (
								<IconButton
									color="error"
									size="small"
									sx={{
										position: "absolute",
										top: 8,
										right: 8,
										background: "#fff",
									}}
									onClick={() => {
										updateData({
											...data,
											props: { ...data.props, url: null },
										});
										setPreview(null);
									}}
								>
									<DeleteIcon fontSize="small" />
								</IconButton>
							)}
						</Box>
					)}
				</Box>
			)}

			{/* Library tab */}
			{tab === 1 && (
				<ImageLibrary
					selectedValue={data.props?.url}
					onSelect={(url) => {
						updateData({ ...data, props: { ...data.props, url } });
					}}
					onClear={() => {
						updateData({ ...data, props: { ...data.props, url: null } });
						setPreview(null);
					}}
				/>
			)}

			{/* URL tab */}
			{tab === 2 && (
				<Box mt={2}>
					<TextInput
						label="Image URL"
						defaultValue={data.props?.url ?? ""}
						onChange={(v) => {
							const url = v.trim().length === 0 ? null : v.trim();
							updateData({ ...data, props: { ...data.props, url } });
						}}
					/>
				</Box>
			)}
			<TextInput
				label="Alt text"
				defaultValue={data.props?.alt ?? ""}
				onChange={(alt) =>
					updateData({ ...data, props: { ...data.props, alt } })
				}
			/>
			<TextInput
				label="Click through URL"
				defaultValue={data.props?.linkHref ?? ""}
				onChange={(v) => {
					const linkHref = v.trim().length === 0 ? null : v.trim();
					updateData({ ...data, props: { ...data.props, linkHref } });
				}}
			/>
			<Stack
				direction="row"
				spacing={2}
			>
				<TextDimensionInput
					label="Width"
					defaultValue={data.props?.width}
					onChange={(width) =>
						updateData({ ...data, props: { ...data.props, width } })
					}
				/>
				<TextDimensionInput
					label="Height"
					defaultValue={data.props?.height}
					onChange={(height) =>
						updateData({ ...data, props: { ...data.props, height } })
					}
				/>
			</Stack>

			<RadioGroupInput
				label="Alignment"
				defaultValue={data.props?.contentAlignment ?? "middle"}
				onChange={(contentAlignment) =>
					updateData({ ...data, props: { ...data.props, contentAlignment } })
				}
			>
				<ToggleButton value="top">
					<VerticalAlignTopOutlined fontSize="small" />
				</ToggleButton>
				<ToggleButton value="middle">
					<VerticalAlignCenterOutlined fontSize="small" />
				</ToggleButton>
				<ToggleButton value="bottom">
					<VerticalAlignBottomOutlined fontSize="small" />
				</ToggleButton>
			</RadioGroupInput>

			<MultiStylePropertyPanel
				names={["backgroundColor", "textAlign", "padding"]}
				value={data.style}
				onChange={(style) => updateData({ ...data, style })}
			/>
		</BaseSidebarPanel>
	);
}
