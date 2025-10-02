import { useMemo, useState } from "react";
import { Button, Snackbar, CircularProgress } from "@mui/material";

import { setDocument, useDocument } from "../../documents/editor/EditorContext";
import { renderToStaticMarkup } from "@usewaypoint/email-builder";
import { createTemplate, updateTemplate } from "../../services/template";
import {
	setCurrentTemplate,
	useCurrentTemplate,
	useFetchTemplates,
} from "../../contexts/templates";
import EMPTY_EMAIL_MESSAGE from "../../getConfiguration/sample/empty-email-message";

export default function ShareButton() {
	const document = useDocument();
	const currentTemplate = useCurrentTemplate();
	const code = useMemo(
		() => renderToStaticMarkup(document, { rootBlockId: "root" }),
		[document]
	);

	const [message, setMessage] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(false);

	const handleCreateTemplate = async () => {
		const templatePayload = {
			name: currentTemplate.name,
			subject: "No Subject",
			body: code,
			settings: JSON.stringify(document),
		};

		const res = await createTemplate(templatePayload);
		return res;
	};

	const handleUpdateTemplate = async () => {
		if (!currentTemplate) return null;
		const templatePayload = {
			name: currentTemplate.name,
			subject: "No Subject",
			body: code,
			settings: JSON.stringify(document),
		};

		const res = await updateTemplate(currentTemplate.id, templatePayload);
		return res;
	};

	// Unified save handler with loading + message handling
	const handleSave = async () => {
		// prevent double clicks
		if (loading) return;

		setLoading(true);
		try {
			const res = currentTemplate?.id
				? await handleUpdateTemplate()
				: await handleCreateTemplate();

			// adjust message based on result shape - try to be generic
			if (res && (res?.id || res?.data)) {
				setMessage(currentTemplate ? "Template updated" : "Template created");
			} else {
				// if the service returns something else, still treat as success
				setMessage("Saved successfully");
			}
		} catch (err: any) {
			// show friendly error
			const errorMessage =
				err?.message || err?.toString?.() || "An error occurred while saving";
			setMessage(`Error: ${errorMessage}`);
			console.error("Save template error:", err);
		} finally {
			setLoading(false);
			useFetchTemplates();
		}
	};

	const onClose = () => {
		setMessage(null);
	};

	return (
		<>
			<Button
				onClick={handleSave}
				variant="contained"
				color="primary"
				sx={{ justifyContent: "center" }}
				disabled={loading}
				startIcon={
					// show small spinner when loading, otherwise no icon
					loading ? (
						<CircularProgress
							size={18}
							thickness={5}
						/>
					) : undefined
				}
			>
				{loading ? (currentTemplate ? "Updating..." : "Saving...") : "Save"}
			</Button>

			<Snackbar
				anchorOrigin={{ vertical: "top", horizontal: "center" }}
				open={message !== null}
				onClose={onClose}
				message={message}
				autoHideDuration={3000}
			/>
		</>
	);
}
