import { Cloud, CloudDone, CloudOff, Sync } from "@mui/icons-material";
import { Box } from "@mui/material";
import { renderToStaticMarkup } from "@usewaypoint/email-builder";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { setMessage } from "../../contexts";
import { useCurrentTemplate } from "../../modules/templates/store";
import { useDocument } from "../../documents/editor/EditorContext";
import {
	createTemplateAction,
	updateTemplateAction,
	fetchTemplates,
} from "../../modules/templates/store";

export default function AutoSaveStatus() {
	const document = useDocument();
	const currentTemplate = useCurrentTemplate();
	const navigate = useNavigate();

	const [initialized, setInitialized] = useState(false);
	const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
	const [timer, setTimer] = useState<any>(null);
	const idRef = useRef<string | number | null>(null);
	const initialDocRef = useRef<string>("");

	const code = useMemo(
		() => renderToStaticMarkup(document, { rootBlockId: "root" }),
		[document]
	);

	const handleCreateTemplate = async () => {
		let newId = "";
		try {
			// Get campaignId from currentTemplate or URL params
			const campaignId =
				currentTemplate?.campaignId ||
				(window.location.pathname.match(/\/campaigns\/(\d+)/)?.[1] || "");
			
			if (!campaignId) {
				throw new Error("Campaign ID is required to create a template");
			}

			const res = await createTemplateAction(campaignId, {
				name: currentTemplate?.name || "Untitled",
				description: "No Subject",
				html: code,
				json: document,
			});
			newId = res.id.toString();
			navigate("/templates/" + newId);
			return res;
		} catch (error) {
			console.error(error);
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
		try {
			const res = currentTemplate?.id
				? await handleUpdateTemplate()
				: await handleCreateTemplate();

			if (res && res.id) {
				setTimeout(() => setStatus("saved"), 500);
				setTimeout(() => setStatus("idle"), 2000);
			}

			if (res?.id && !idRef.current) {
				idRef.current = res.id;
			}
		} catch (err: any) {
			console.error("AutoSave error:", err);
			setMessage("Error: " + err.message);
			setStatus("idle");
		} finally {
			fetchTemplates();
		}
	};

	useEffect(() => {
		if (currentTemplate?.id) {
			idRef.current = currentTemplate.id;
		}
		setInitialized(true);
		initialDocRef.current = JSON.stringify(document);
	}, [currentTemplate?.id]);

	useEffect(() => {
		if (!initialized || !document) return;

		const currentDocString = JSON.stringify(document);
		const hasChanged = currentDocString !== initialDocRef.current;

		if (!hasChanged) return;

		if (timer) clearTimeout(timer);
		setStatus("saving");

		if (!currentTemplate?.id) {
			const newTimer = setTimeout(() => handleSave(), 3000);
			setTimer(newTimer);
			return () => clearTimeout(newTimer);
		}

		if (currentTemplate?.id === idRef.current) {
			const newTimer = setTimeout(() => handleSave(), 3000);
			setTimer(newTimer);
			return () => clearTimeout(newTimer);
		}

		return () => timer && clearTimeout(timer);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [document, code, currentTemplate?.id, initialized]);

	return (
		<Box
			display="flex"
			alignItems="center"
			gap={1}
		>
			<AutoSaveIndicator status={status} />
		</Box>
	);
}

function AutoSaveIndicator({
	status,
}: {
	status: "idle" | "saving" | "saved";
}) {
	// const [dots, setDots] = useState(".");

	// useEffect(() => {
	// 	if (status !== "saving") return;
	// 	const interval = setInterval(() => {
	// 		setDots((prev) => (prev.length >= 3 ? "." : prev + "."));
	// 	}, 500);
	// 	return () => clearInterval(interval);
	// }, [status]);

	return (
		<Box
			display="flex"
			alignItems="center"
			gap={1}
			position="relative"
		>
			{/* IDLE */}
			{status === "idle" && (
				<CloudOff
					color="disabled"
					fontSize="small"
				/>
			)}

			{/* SAVING */}
			{status === "saving" && (
				<Box
					position="relative"
					display="inline-flex"
					alignItems="center"
					justifyContent="center"
				>
					{/* Icon Cloud nền */}
					<Cloud
						color="info"
						fontSize="small"
					/>
					{/* Icon Sync quay tròn nằm giữa */}
					<Sync
						fontSize="inherit"
						sx={{
							color: "white",
							position: "absolute",
							fontSize: "0.75rem",
							animation: "spin 1.5s linear infinite",
							zIndex: 1,
						}}
					/>
				</Box>
			)}

			{/* SAVED */}
			{status === "saved" && (
				<CloudDone
					color="success"
					fontSize="small"
				/>
			)}
		</Box>
	);
}
