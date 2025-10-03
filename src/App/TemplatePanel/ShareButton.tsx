import { Button, CircularProgress, Snackbar } from "@mui/material";
import { useMemo, useState } from "react";

import { renderToStaticMarkup } from "@usewaypoint/email-builder";
import { setMessage, useMessage } from "../../contexts";
import {
	useCurrentTemplate,
	useFetchTemplates,
} from "../../contexts/templates";
import { useDocument } from "../../documents/editor/EditorContext";
import { createTemplate, updateTemplate } from "../../services/template";
import { useNavigate } from "react-router-dom";

export default function ShareButton() {
	const document = useDocument();
	const message = useMessage();
	const navigate = useNavigate();
	const currentTemplate = useCurrentTemplate();
	const code = useMemo(
		() => renderToStaticMarkup(document, { rootBlockId: "root" }),
		[document]
	);

	const [loading, setLoading] = useState<boolean>(false);

	const handleCreateTemplate = async () => {
		let newId = "";
		try {
			const templatePayload = {
				name: currentTemplate?.name || "Untitled",
				subject: "No Subject",
				body: code,
				settings: JSON.stringify(document),
			};

			const res = await createTemplate(templatePayload);
			newId = res.id;
		} catch (error) {
		} finally {
			navigate("/templates/" + newId);
		}
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
