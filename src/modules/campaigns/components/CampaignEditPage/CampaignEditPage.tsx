import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
	Box,
	Grid,
	CircularProgress,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	TextField,
	Snackbar,
	Alert,
} from "@mui/material";
import {
	fetchCampaignById,
	updateCampaignMetadataAction,
	useCurrentCampaign,
	useCampaignsLoading,
	setCurrentCampaign,
	useAutosaveState,
	setDirty,
} from "../../stores/campaign.metadata.store";
import {
	fetchCampaignTemplate,
	saveCampaignTemplate,
	useCampaignTemplateEditor,
	setEditorJson,
	setHtml,
} from "../../stores/campaign.template.store";
import {
	fetchCampaignMedia,
	setCampaignMedia,
} from "../../stores/campaign.media.store";
import { sendTestEmail, startCampaign } from "../../service";
import { useDocument } from "../../../../documents/editor/EditorContext";
import { renderToStaticMarkup } from "@usewaypoint/email-builder";
import CampaignHeader from "./CampaignHeader";
import CampaignSettingsForm from "./CampaignSettingsForm";
import CampaignPreviewPanel from "./CampaignPreviewPanel";
import TemplatePanel from "../../../../App/TemplatePanel/index";
import InspectorDrawer from "../../../../App/InspectorDrawer/index";

// Autosave interval in milliseconds
const AUTOSAVE_INTERVAL = 30000; // 30 seconds

export default function CampaignEditPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const campaign = useCurrentCampaign();
	const loading = useCampaignsLoading();
	const autosaveState = useAutosaveState();
	const { html, dirty: templateDirty } = useCampaignTemplateEditor();
	const document = useDocument();

	const [testEmailDialogOpen, setTestEmailDialogOpen] = useState(false);
	const [testEmailValue, setTestEmailValue] = useState("");
	const [snackbar, setSnackbar] = useState<{
		open: boolean;
		message: string;
		severity: "success" | "error" | "info" | "warning";
	}>({
		open: false,
		message: "",
		severity: "info",
	});

	// Load campaign data
	useEffect(() => {
		if (id) {
			fetchCampaignById(id).then(() => {
				// After loading campaign, load its template and media
				fetchCampaignTemplate(id);
				fetchCampaignMedia(id);
				setCampaignMedia(id);
			});
		}

		return () => {
			setCurrentCampaign(null);
			setCampaignMedia(null);
		};
	}, [id]);

	// Autosave effect
	useEffect(() => {
		if (!id || !campaign || !autosaveState.enabled) return;

		const autosaveInterval = setInterval(async () => {
			try {
				if (autosaveState.isDirty || templateDirty) {
					await handleAutosave();
				}
			} catch (error) {
				console.error("Autosave failed:", error);
			}
		}, AUTOSAVE_INTERVAL);

		return () => clearInterval(autosaveInterval);
	}, [id, campaign, autosaveState.isDirty, templateDirty, autosaveState.enabled]);

	// Listen to document changes for template
	useEffect(() => {
		if (document) {
			setEditorJson(document);
			// Generate HTML from document
			try {
				const generatedHtml = renderToStaticMarkup(document, "root");
				setHtml(generatedHtml);
			} catch (error) {
				console.error("Error generating HTML:", error);
			}
		}
	}, [document]);

	// Handle campaign metadata changes
	const handleCampaignChange = useCallback(
		async (updates: Partial<typeof campaign>) => {
			if (!id || !campaign) return;

			setDirty(true);
			try {
				await updateCampaignMetadataAction(id, updates);
			} catch (error: any) {
				setSnackbar({
					open: true,
					message: error.message || "Failed to update campaign",
					severity: "error",
				});
			}
		},
		[id, campaign]
	);

	// Autosave handler
	const handleAutosave = useCallback(async () => {
		if (!id || !campaign) return;

		try {
			// Save campaign metadata if dirty
			if (autosaveState.isDirty) {
				await updateCampaignMetadataAction(id, campaign);
			}

			// Save template if dirty
			if (templateDirty && document) {
				const generatedHtml = renderToStaticMarkup(document, "root");
				await saveCampaignTemplate(id, document, generatedHtml);
			}

			setSnackbar({
				open: true,
				message: "Auto-saved",
				severity: "success",
			});
		} catch (error: any) {
			console.error("Autosave failed:", error);
		}
	}, [id, campaign, autosaveState.isDirty, templateDirty, document]);

	// Handle send test email
	const handleSendTestEmail = useCallback(async () => {
		if (!id || !testEmailValue) return;

		try {
			await sendTestEmail(id, [testEmailValue]);
			setSnackbar({
				open: true,
				message: "Test email sent successfully",
				severity: "success",
			});
			setTestEmailDialogOpen(false);
			setTestEmailValue("");
		} catch (error: any) {
			setSnackbar({
				open: true,
				message: error.message || "Failed to send test email",
				severity: "error",
			});
		}
	}, [id, testEmailValue]);

	// Handle start campaign
	const handleStartCampaign = useCallback(async () => {
		if (!id || !campaign) return;

		// Validate required fields
		if (!campaign.name || !campaign.subject || !campaign.fromAddress || !campaign.recipients || campaign.recipients.length === 0) {
			setSnackbar({
				open: true,
				message: "Please fill in all required fields",
				severity: "warning",
			});
			return;
		}

		// Save everything first
		await handleAutosave();

		try {
			const sendNow = campaign.sendTime === "now";
			await startCampaign(id, sendNow);
			setSnackbar({
				open: true,
				message: sendNow
					? "Campaign started successfully"
					: "Campaign scheduled successfully",
				severity: "success",
			});
			// Refresh campaign data
			await fetchCampaignById(id);
		} catch (error: any) {
			setSnackbar({
				open: true,
				message: error.message || "Failed to start campaign",
				severity: "error",
			});
		}
	}, [id, campaign, handleAutosave]);

	if (loading || !campaign) {
		return (
			<Box
				display="flex"
				justifyContent="center"
				alignItems="center"
				minHeight="400px"
			>
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
			{/* Header */}
			<CampaignHeader
				campaign={campaign}
				onSendTest={() => setTestEmailDialogOpen(true)}
				onStartCampaign={handleStartCampaign}
				onSave={handleAutosave}
			/>

			{/* Main Content */}
			<Box sx={{ flex: 1, display: "flex", overflow: "hidden" }}>
				{/* Left Panel: Settings Form */}
				<Box
					sx={{
						width: 400,
						overflowY: "auto",
						borderRight: 1,
						borderColor: "divider",
						backgroundColor: "background.paper",
					}}
				>
					<CampaignSettingsForm
						campaign={campaign}
						onChange={handleCampaignChange}
					/>
				</Box>

				{/* Center Panel: Email Builder */}
				<Box
					sx={{
						flex: 1,
						display: "flex",
						flexDirection: "column",
						overflow: "hidden",
						position: "relative",
					}}
				>
					<TemplatePanel />
					<InspectorDrawer />
				</Box>

				{/* Right Panel: Preview */}
				<Box
					sx={{
						width: 450,
						overflow: "hidden",
						backgroundColor: "background.paper",
						display: "flex",
						flexDirection: "column",
					}}
				>
					<CampaignPreviewPanel campaignId={id!} />
				</Box>
			</Box>

			{/* Send Test Email Dialog */}
			<Dialog
				open={testEmailDialogOpen}
				onClose={() => setTestEmailDialogOpen(false)}
			>
				<DialogTitle>Send Test Email</DialogTitle>
				<DialogContent>
					<TextField
						autoFocus
						margin="dense"
						label="Email address"
						type="email"
						fullWidth
						value={testEmailValue}
						onChange={(e) => setTestEmailValue(e.target.value)}
						variant="outlined"
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setTestEmailDialogOpen(false)}>Cancel</Button>
					<Button
						onClick={handleSendTestEmail}
						variant="contained"
						disabled={!testEmailValue}
					>
						Send
					</Button>
				</DialogActions>
			</Dialog>

			{/* Snackbar for notifications */}
			<Snackbar
				open={snackbar.open}
				autoHideDuration={4000}
				onClose={() =>
					setSnackbar((prev) => ({ ...prev, open: false }))
				}
				anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
			>
				<Alert
					onClose={() =>
						setSnackbar((prev) => ({ ...prev, open: false }))
					}
					severity={snackbar.severity}
					sx={{ width: "100%" }}
				>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</Box>
	);
}
