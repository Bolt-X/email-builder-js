import React, { useEffect, useState } from "react";
import { Snackbar, Box, Typography, Slide, SlideProps } from "@mui/material";
import { RocketLaunch } from "@mui/icons-material";
import { useMessage, setMessage } from "../contexts";

function SlideTransition(props: SlideProps) {
	return (
		<Slide
			{...props}
			direction="up"
		/>
	);
}

export default function GlobalToast() {
	const message = useMessage();
	const [open, setOpen] = useState(false);

	useEffect(() => {
		if (message) {
			setOpen(true);
		}
	}, [message]);

	const handleClose = (
		event?: React.SyntheticEvent | Event,
		reason?: string,
	) => {
		if (reason === "clickaway") {
			return;
		}
		setOpen(false);
		// Delay clearing message to allow animation to finish
		setTimeout(() => {
			setMessage(null); // Type error here likely if expecting string, but null usually works for clean up or empty string
		}, 300);
	};

	if (!message) return null;

	// Determine style based on message content
	let bgcolor = "#212121"; // Default dark
	let statusText = "Notification";

	if (
		message.toLowerCase().includes("running") ||
		message.toLowerCase().includes("đang chạy")
	) {
		bgcolor = "#1976d2"; // Blue
		statusText = "Running";
	} else if (
		message.toLowerCase().includes("finished") ||
		message.toLowerCase().includes("hoàn thành")
	) {
		bgcolor = "#2e7d32"; // Green
		statusText = "Finished";
	} else if (
		message.toLowerCase().includes("canceled") ||
		message.toLowerCase().includes("cancelled") ||
		message.toLowerCase().includes("đã hủy")
	) {
		bgcolor = "#d32f2f"; // Red
		statusText = "Canceled";
	} else if (
		message.toLowerCase().includes("success") ||
		message.toLowerCase().includes("thành công")
	) {
		bgcolor = "#2e7d32"; // Green for general success
	} else if (
		message.toLowerCase().includes("error") ||
		message.toLowerCase().includes("failed") ||
		message.toLowerCase().includes("lỗi") ||
		message.toLowerCase().includes("thất bại")
	) {
		bgcolor = "#d32f2f"; // Red for errors
	}

	return (
		<Snackbar
			open={open}
			autoHideDuration={4000}
			onClose={handleClose}
			TransitionComponent={SlideTransition}
			anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
		>
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					bgcolor: bgcolor,
					color: "white",
					px: 3,
					py: 1.5,
					borderRadius: "8px",
					boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
					minWidth: "300px",
				}}
			>
				<RocketLaunch sx={{ mr: 2, fontSize: 24 }} />
				<Typography
					variant="body1"
					sx={{ fontWeight: 600, fontSize: "0.95rem" }}
				>
					{message}
				</Typography>
			</Box>
		</Snackbar>
	);
}
