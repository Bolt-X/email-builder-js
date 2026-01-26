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
	updateCurrentCampaign,
	useAutosaveState,
	setDirty,
} from "../../stores/campaign.metadata.store";
import {
	fetchCampaignTemplate,
	saveCampaignTemplate,
	useCampaignTemplateEditor,
	setEditorJson,
	setHtml,
	fetchTemplateById,
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
import { setMessage } from "../../../../contexts";
import CampaignPreviewPanel from "./CampaignPreviewPanel";

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
				// After loading campaign, load its media
				fetchCampaignMedia(id);
				setCampaignMedia(id);
			});
		}

		return () => {
			setCurrentCampaign(null);
			setCampaignMedia(null);
		};
	}, [id]);

	// Load template content when campaign's selected template changes
	useEffect(() => {
		if (campaign?.template) {
			fetchTemplateById(campaign.template);
		}
	}, [campaign?.template]);

	// Removed autosave effect per user request

	// Listen to document changes for template
	useEffect(() => {
		if (document) {
			setEditorJson(document);
			// Generate HTML from document
			try {
				const generatedHtml = renderToStaticMarkup(document as any, {
					rootBlockId: "root",
				});
				setHtml(generatedHtml);
			} catch (error) {
				console.error("Error generating HTML:", error);
			}
		}
	}, [document]);

	// Handle campaign metadata changes
	const handleCampaignChange = useCallback(
		(updates: Partial<typeof campaign>) => {
			if (!id || !campaign) return;
			updateCurrentCampaign(updates);
		},
		[id, campaign],
	);

	// Manual save handler
	const handleSave = useCallback(async () => {
		if (!id || !campaign) return;

		try {
			// Save campaign metadata if dirty
			if (autosaveState.isDirty) {
				await updateCampaignMetadataAction(id, campaign);
			}

			// Save template if dirty
			if (templateDirty && document) {
				const generatedHtml = renderToStaticMarkup(document as any, {
					rootBlockId: "root",
				});
				await saveCampaignTemplate(id, document, generatedHtml);
			}

			setSnackbar({
				open: true,
				message: "Campaign saved successfully",
				severity: "success",
			});
		} catch (error: any) {
			console.error("Save failed:", error);
			setSnackbar({
				open: true,
				message: error.message || "Failed to save campaign",
				severity: "error",
			});
		}
	}, [id, campaign, autosaveState.isDirty, templateDirty, document]);

	// Handle send test email
	const handleSendTestEmail = useCallback(async () => {
		if (!id || !testEmailValue || !campaign) return;

		try {
			await sendTestEmail({
				to: testEmailValue,
				subject: campaign.subject || "No Subject",
				template: html,
			});
			setMessage("Test email sent successfully");
			setTestEmailDialogOpen(false);
			setTestEmailValue("");
		} catch (error: any) {
			setMessage(error.message || "Failed to send test email");
		}
	}, [id, testEmailValue, campaign, html]);

	// Handle start campaign
	const handleStartCampaign = useCallback(async () => {
		if (!id || !campaign) return;

		// Validate required fields
		const hasRecipients =
			(campaign.subscribers && campaign.subscribers.length > 0) ||
			(campaign.contact_lists && campaign.contact_lists.length > 0);
		if (
			!campaign.name ||
			!campaign.subject ||
			!campaign.fromAddress ||
			!hasRecipients
		) {
			setMessage("Please fill in all required fields");
			return;
		}

		// Save everything first
		await handleSave();

		try {
			const sendNow = campaign.sendTime === "now";
			await startCampaign(id, sendNow);
			setMessage(
				sendNow
					? `“${campaign.name}” is running`
					: `“${campaign.name}” is scheduled`,
			);
			// Refresh campaign data
			await fetchCampaignById(id);
		} catch (error: any) {
			setMessage(error.message || "Failed to start campaign");
		}
	}, [id, campaign, handleSave]);

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
		<Box
			sx={{
				height: "100vh",
				display: "flex",
				flexDirection: "column",
				bgcolor: "background.default",
			}}
		>
			{/* Header */}
			<CampaignHeader
				campaign={campaign}
				onSendTest={() => setTestEmailDialogOpen(true)}
				onStartCampaign={handleStartCampaign}
				onSave={handleSave}
			/>

			{/* Main Content */}
			<Grid
				container
				spacing={0}
				sx={{ height: "calc(100vh - 80px)", overflow: "hidden" }}
			>
				{/* Left Panel: Settings Form */}
				<Grid
					item
					xs={12}
					md={6}
					sx={{
						height: "100%",
						overflowY: "auto",
						borderRight: 1,
						borderColor: "divider",
					}}
				>
					<CampaignSettingsForm
						campaign={campaign}
						onChange={handleCampaignChange}
					/>
				</Grid>

				{/* Right Panel: Preview */}
				<Grid
					item
					xs={12}
					md={6}
					sx={{
						height: "100%",
						overflow: "hidden",
						bgcolor: "background.default",
					}}
				>
					<CampaignPreviewPanel campaignId={id!} />
				</Grid>
			</Grid>

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
				onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
				anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
			>
				<Alert
					onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
					severity={snackbar.severity}
					sx={{ width: "100%" }}
				>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</Box>
	);
}
