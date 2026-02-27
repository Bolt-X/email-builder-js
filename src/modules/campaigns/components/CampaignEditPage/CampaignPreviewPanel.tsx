import React, { useState } from "react";
import {
	Box,
	Stack,
	ToggleButton,
	ToggleButtonGroup,
	Typography,
	Paper,
} from "@mui/material";
import { MonitorOutlined, PhoneIphoneOutlined } from "@mui/icons-material";
import { useCampaignTemplateEditor } from "../../stores/campaign.template.store";
import { useCurrentCampaign } from "../../stores/campaign.metadata.store";
import { useTranslation } from "react-i18next";

type PreviewMode = "desktop" | "mobile";

interface CampaignPreviewPanelProps {
	campaignId: string | number;
}

export default function CampaignPreviewPanel({
	campaignId,
}: CampaignPreviewPanelProps) {
	const { t } = useTranslation();
	const [previewMode, setPreviewMode] = useState<PreviewMode>("desktop");
	const { html } = useCampaignTemplateEditor();
	const campaign = useCurrentCampaign();

	const handleModeChange = (
		event: React.MouseEvent<HTMLElement>,
		newMode: PreviewMode | null,
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
					<Typography
						variant="body2"
						color="text.secondary"
					>
						{t("campaigns.no_results")}
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
					bgcolor: "background.default",
					display: "flex",
					justifyContent: "center",
					p: 2,
				}}
			>
				<Paper
					elevation={0}
					sx={{
						width: previewMode === "desktop" ? "100%" : "375px",
						maxWidth: previewMode === "desktop" ? "100%" : "375px",
						height: "fit-content",
						bgcolor: "background.paper",
						boxShadow: 2,
						overflow: "hidden",
						transition: "all 0.3s ease",
					}}
				>
					{/* Fake Browser/Email Header */}
					<Box
						sx={{
							p: 2,
							borderBottom: 1,
							borderColor: "divider",
							bgcolor: "action.hover",
						}}
					>
						<Typography
							variant="caption"
							color="text.secondary"
							display="block"
						>
							{t("campaigns.form.subject_label")}:{" "}
							<strong>
								{campaign?.subject || t("campaigns.form.subject_placeholder")}
							</strong>
						</Typography>
						<Typography
							variant="caption"
							color="text.secondary"
						>
							{t("campaigns.form.from_address_label")}:{" "}
							{campaign?.fromAddress || t("common.no_results")}
						</Typography>
					</Box>
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
					<Typography variant="subtitle1">{t("campaigns.preview")}</Typography>
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
