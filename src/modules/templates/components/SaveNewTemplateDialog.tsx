import React, { useState } from "react";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	TextField,
	Typography,
	Box,
} from "@mui/material";
import { useDocument } from "../../../documents/editor/EditorContext";
import { createTemplateAction } from "../store";
import { renderToStaticMarkup } from "@usewaypoint/email-builder";
import { useNavigate } from "react-router-dom";
import { setMessage } from "../../../contexts";
import { useTranslation } from "react-i18next";

interface SaveNewTemplateDialogProps {
	open: boolean;
	onClose: () => void;
	campaignId: string | number;
}

export default function SaveNewTemplateDialog({
	open,
	onClose,
	campaignId,
}: SaveNewTemplateDialogProps) {
	const { t } = useTranslation();
	const [name, setName] = useState("");
	const [error, setError] = useState("");
	const document = useDocument();
	const navigate = useNavigate();

	const handleSave = async () => {
		if (!name.trim()) {
			setError(t("templates.save_dialog.error_required"));
			return;
		}

		try {
			const html = renderToStaticMarkup(document, { rootBlockId: "root" });
			await createTemplateAction(campaignId, {
				name: name.trim(),
				description: "",
				html,
				json: document,
			});
			setMessage(t("templates.save_dialog.success"));
			navigate("/templates");
			onClose();
		} catch (err: any) {
			console.error(err);
			setMessage(t("templates.save_dialog.error") + err.message);
		}
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			fullWidth
			maxWidth="xs"
		>
			<DialogTitle>{t("templates.save_dialog.title")}</DialogTitle>
			<DialogContent>
				<Box sx={{ mt: 1 }}>
					<Typography
						variant="body2"
						color="text.secondary"
						gutterBottom
					>
						{t("templates.save_dialog.description")}
					</Typography>
					<TextField
						autoFocus
						margin="dense"
						label={t("templates.save_dialog.name_label")}
						fullWidth
						value={name}
						onChange={(e) => {
							setName(e.target.value);
							if (error) setError("");
						}}
						error={!!error}
						helperText={error}
						variant="outlined"
					/>
				</Box>
			</DialogContent>
			<DialogActions sx={{ px: 3, pb: 2 }}>
				<Button
					onClick={onClose}
					color="inherit"
				>
					{t("common.cancel")}
				</Button>
				<Button
					onClick={handleSave}
					variant="contained"
					disabled={!name.trim()}
				>
					{t("templates.save_dialog.save_btn")}
				</Button>
			</DialogActions>
		</Dialog>
	);
}
