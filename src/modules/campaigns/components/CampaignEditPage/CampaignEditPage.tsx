import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
	useParams,
	useNavigate,
	useLocation,
	useSearchParams,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
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
import { SubscriberType } from "../../types";
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
	const location = useLocation();
	const [searchParams] = useSearchParams();
	const { t } = useTranslation();
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

				// Re-apply preselected contact lists if present (handling "Send Campaign" flow)
				let preselectedSlugs: string[] = [];
				if (location.state && (location.state as any).preselectedContactLists) {
					preselectedSlugs = (location.state as any)
						.preselectedContactLists as string[];
				} else if (searchParams.get("contact-list")) {
					preselectedSlugs = searchParams.get("contact-list")?.split(",") || [];
				}

				if (preselectedSlugs.length > 0) {
					const newSelections = preselectedSlugs.map((slug) => ({
						type: "list" as SubscriberType,
						id: slug,
						name: slug,
					}));
					updateCurrentCampaign({ subscribers: newSelections });
				}
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
				message: t("campaigns.save_success"),
				severity: "success",
			});
		} catch (error: any) {
			console.error("Save failed:", error);
			setSnackbar({
				open: true,
				message: error.message || t("campaigns.save_failed"),
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
			setMessage(t("campaigns.test_email_sent"));
			setTestEmailDialogOpen(false);
			setTestEmailValue("");
		} catch (error: any) {
			setMessage(error.message || t("campaigns.test_email_failed"));
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
			setMessage(t("campaigns.required_fields_error"));
			return;
		}

		// Save everything first
		await handleSave();

		try {
			const sendNow = campaign.sendTime === "now";
			await startCampaign(id, sendNow);
			setMessage(
				sendNow
					? t("campaigns.running_msg", { name: campaign.name })
					: t("campaigns.scheduled_msg", { name: campaign.name }),
			);
			// Refresh campaign data
			await fetchCampaignById(id);
		} catch (error: any) {
			setMessage(error.message || t("campaigns.start_failed"));
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
				sx={{ height: "calc(100vh - 64px)", overflow: "hidden" }}
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
				<DialogTitle>{t("campaigns.test_email_dialog_title")}</DialogTitle>
				<DialogContent>
					<TextField
						autoFocus
						margin="dense"
						label={t("campaigns.test_email_label")}
						type="email"
						fullWidth
						value={testEmailValue}
						onChange={(e) => setTestEmailValue(e.target.value)}
						variant="outlined"
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setTestEmailDialogOpen(false)}>
						{t("common.cancel")}
					</Button>
					<Button
						onClick={handleSendTestEmail}
						variant="contained"
						disabled={!testEmailValue}
					>
						{t("common.send")}
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
