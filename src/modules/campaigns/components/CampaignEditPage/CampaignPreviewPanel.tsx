import React, { useState } from "react";
import {
	Box,
	Stack,
	ToggleButton,
	ToggleButtonGroup,
	Typography,
	Paper,
} from "@mui/material";
import {
	MonitorOutlined,
	PhoneIphoneOutlined,
} from "@mui/icons-material";
import { useCampaignTemplateEditor } from "../../stores/campaign.template.store";

type PreviewMode = "desktop" | "mobile";

interface CampaignPreviewPanelProps {
	campaignId: string | number;
}

export default function CampaignPreviewPanel({
	campaignId,
}: CampaignPreviewPanelProps) {
	const [previewMode, setPreviewMode] = useState<PreviewMode>("desktop");
	const { html } = useCampaignTemplateEditor();

	const handleModeChange = (
		event: React.MouseEvent<HTMLElement>,
		newMode: PreviewMode | null
	) => {
		if (newMode !== null) {
			setPreviewMode(newMode);
		}
	};

	// Render HTML preview
	const renderPreview = () => {
		if (!html) {
			return (
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						height: "100%",
						minHeight: "400px",
					}}
				>
					<Typography variant="body2" color="text.secondary">
						No template content yet. Start building your email.
					</Typography>
				</Box>
			);
		}

		return (
			<Box
				sx={{
					width: "100%",
					height: "100%",
					overflow: "auto",
					bgcolor: "grey.100",
					display: "flex",
					justifyContent: "center",
					p: 2,
				}}
			>
				<Paper
					elevation={0}
					sx={{
						width: previewMode === "desktop" ? "100%" : "375px",
						maxWidth: previewMode === "desktop" ? "600px" : "375px",
						height: "fit-content",
						bgcolor: "white",
						boxShadow: 2,
					}}
				>
					<Box
						dangerouslySetInnerHTML={{ __html: html }}
						sx={{
							width: "100%",
							"& img": {
								maxWidth: "100%",
								height: "auto",
							},
						}}
					/>
				</Paper>
			</Box>
		);
	};

	return (
		<Box
			sx={{
				height: "100%",
				display: "flex",
				flexDirection: "column",
				borderLeft: 1,
				borderColor: "divider",
			}}
		>
			{/* Preview Header */}
			<Box
				sx={{
					p: 2,
					borderBottom: 1,
					borderColor: "divider",
					backgroundColor: "background.paper",
				}}
			>
				<Stack
					direction="row"
					justifyContent="space-between"
					alignItems="center"
				>
					<Typography variant="subtitle1">Preview</Typography>
					<ToggleButtonGroup
						value={previewMode}
						exclusive
						onChange={handleModeChange}
						size="small"
					>
						<ToggleButton value="desktop">
							<MonitorOutlined fontSize="small" />
						</ToggleButton>
						<ToggleButton value="mobile">
							<PhoneIphoneOutlined fontSize="small" />
						</ToggleButton>
					</ToggleButtonGroup>
				</Stack>
			</Box>

			{/* Preview Content */}
			<Box
				sx={{
					flex: 1,
					overflow: "auto",
				}}
			>
				{renderPreview()}
			</Box>
		</Box>
	);
}
