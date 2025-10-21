import React, { useState } from "react";
import {
	Box,
	Tabs,
	Tab,
	Button,
	Typography,
	IconButton,
	Stack,
	ToggleButton,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import LinkIcon from "@mui/icons-material/Link";
import DeleteIcon from "@mui/icons-material/Delete";

import { ImageProps, ImagePropsSchema } from "@usewaypoint/block-image";
import BaseSidebarPanel from "./helpers/BaseSidebarPanel";
import TextInput from "./helpers/inputs/TextInput";
import {
	VerticalAlignTopOutlined,
	VerticalAlignCenterOutlined,
	VerticalAlignBottomOutlined,
} from "@mui/icons-material";
import RadioGroupInput from "./helpers/inputs/RadioGroupInput";
import TextDimensionInput from "./helpers/inputs/TextDimensionInput";
import MultiStylePropertyPanel from "./helpers/style-inputs/MultiStylePropertyPanel";
import { uploadImage } from "../../../../services/files";

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

	const updateData = (d: unknown) => {
		const res = ImagePropsSchema.safeParse(d);
		if (res.success) {
			setData(res.data);
		}
	};

	const handleUpload = async (file: File) => {
		const formData = new FormData();
		formData.append("file", file);

		// Upload API (tùy bạn triển khai)
		const res = await uploadImage(formData);
		const url = assetURL + res?.id;
		updateData({ ...data, props: { ...data.props, url } });
	};

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
					{!data.props?.url ? (
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
								src={data.props.url}
								alt="preview"
								style={{ maxWidth: "100%", marginBottom: 8 }}
							/>
							<IconButton
								color="error"
								onClick={() =>
									updateData({ ...data, props: { ...data.props, url: null } })
								}
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
