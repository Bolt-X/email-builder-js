import { SaveOutlined, Sync } from "@mui/icons-material";
import { Button, Box, CircularProgress } from "@mui/material";
import { renderToStaticMarkup } from "@usewaypoint/email-builder";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { setMessage } from "../../contexts";
import { useCurrentTemplate } from "../../modules/templates/store";
import { useDocument } from "../../documents/editor/EditorContext";
import {
	createTemplateAction,
	updateTemplateAction,
	fetchTemplates,
} from "../../modules/templates/store";
import { READER_DICTIONARY } from "../../documents/editor/core";

export default function SaveButton() {
	const { t } = useTranslation();
	const document = useDocument();
	const currentTemplate = useCurrentTemplate();
	const navigate = useNavigate();

	const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

	const code = useMemo(() => {
		const baseCode = renderToStaticMarkup(
			document as any,
			{
				rootBlockId: "root",
				blockConfigurationDictionary: READER_DICTIONARY,
			} as any,
		);
		return baseCode.replace("padding:32px 0", "padding:32px 12px");
	}, [document]);

	const handleCreateTemplate = async () => {
		try {
			const campaignId =
				currentTemplate?.campaignId ||
				window.location.pathname.match(
					/\/campaigns\/(\d+|[a-zA-Z0-9_-]+)/,
				)?.[1] ||
				"default";

			const res = await createTemplateAction(campaignId, {
				name: currentTemplate?.name || t("campaigns.untitled"),
				description: "No Subject",
				html: code,
				json: document,
			});
			const newId = res.id.toString();
			navigate("/templates/" + newId);
			return res;
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const handleUpdateTemplate = async () => {
		if (!currentTemplate?.id) return null;
		const res = await updateTemplateAction(currentTemplate.id, {
			name: currentTemplate.name,
			description: currentTemplate.description,
			html: code,
			json: document,
		});
		return res;
	};

	const handleSave = async () => {
		setStatus("saving");
		try {
			const res = currentTemplate?.id
				? await handleUpdateTemplate()
				: await handleCreateTemplate();

			if (res && (res.id || currentTemplate?.id)) {
				setStatus("saved");
				setMessage(t("templates.save_dialog.success"));
				setTimeout(() => setStatus("idle"), 2000);
			}
		} catch (err: any) {
			console.error("Save error:", err);
			setMessage(t("templates.save_dialog.error") + err.message);
			setStatus("idle");
		} finally {
			fetchTemplates();
		}
	};

	return (
		<Button
			variant="contained"
			size="small"
			startIcon={
				status === "saving" ? <Sync className="spin" /> : <SaveOutlined />
			}
			onClick={handleSave}
			disabled={status === "saving"}
			sx={{
				height: 32,
				alignSelf: "center",
				"& .spin": {
					animation: "spin 1.5s linear infinite",
				},
				"@keyframes spin": {
					"0%": { transform: "rotate(0deg)" },
					"100%": { transform: "rotate(360deg)" },
				},
			}}
		>
			{status === "saving" ? t("common.loading") : t("common.save")}
		</Button>
	);
}
