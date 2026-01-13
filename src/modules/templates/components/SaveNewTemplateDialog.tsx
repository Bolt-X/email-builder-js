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
	const [name, setName] = useState("");
	const [error, setError] = useState("");
	const document = useDocument();
	const navigate = useNavigate();

	const handleSave = async () => {
		if (!name.trim()) {
			setError("Template name is required");
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
			setMessage("Template created successfully!");
			navigate("/templates");
			onClose();
		} catch (err: any) {
			console.error(err);
			setMessage("Error: " + err.message);
		}
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			fullWidth
			maxWidth="xs"
		>
			<DialogTitle>Save New Template</DialogTitle>
			<DialogContent>
				<Box sx={{ mt: 1 }}>
					<Typography
						variant="body2"
						color="text.secondary"
						gutterBottom
					>
						Enter a name for your new email template.
					</Typography>
					<TextField
						autoFocus
						margin="dense"
						label="Template Name"
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
					Cancel
				</Button>
				<Button
					onClick={handleSave}
					variant="contained"
					disabled={!name.trim()}
				>
					Save Template
				</Button>
			</DialogActions>
		</Dialog>
	);
}
