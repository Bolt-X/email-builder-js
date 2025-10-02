import React, { useRef, useState } from "react";
import { Drawer, IconButton, Stack } from "@mui/material";
import {
	ArrowBack,
	ArrowForward,
	BookmarkBorder,
	Check,
	Menu as MenuIcon,
} from "@mui/icons-material";
import { useDrawerNoteOpen, toggleDrawerNoteOpen } from "../../contexts";
import ToggleTextInput from "../inputs/ToggleTextInput";

const DrawerNote = () => {
	const drawerNoteOpen = useDrawerNoteOpen();

	const [value, setValue] = useState("Nhập nội dung...");

	const [height, setHeight] = useState(400); // chiều cao hiện tại
	const startY = useRef<number | null>(null);
	const startHeight = useRef<number>(400);

	const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
		startY.current = "touches" in e ? e.touches[0].clientY : e.clientY;
		startHeight.current = height;
		document.addEventListener("mousemove", handleDragging as any);
		document.addEventListener("mouseup", handleDragEnd as any);
		document.addEventListener("touchmove", handleDragging as any);
		document.addEventListener("touchend", handleDragEnd as any);
	};

	const handleDragging = (e: MouseEvent | TouchEvent) => {
		if (startY.current == null) return;
		const currentY = "touches" in e ? e.touches[0].clientY : e.clientY;
		const diff = currentY - startY.current;
		const newHeight = Math.max(200, startHeight.current - diff); // min 200px
		setHeight(newHeight);
	};

	const handleDragEnd = (e: MouseEvent | TouchEvent) => {
		document.removeEventListener("mousemove", handleDragging as any);
		document.removeEventListener("mouseup", handleDragEnd as any);
		document.removeEventListener("touchmove", handleDragging as any);
		document.removeEventListener("touchend", handleDragEnd as any);

		// Nếu kéo xuống quá 200px thì đóng drawer
		if (startY.current != null) {
			const endY =
				"changedTouches" in e
					? e.changedTouches[0].clientY
					: (e as MouseEvent).clientY;
			if (endY - startY.current > 200) {
				toggleDrawerNoteOpen();
			}
		}
		startY.current = null;
	};

	return (
		<Drawer
			open={drawerNoteOpen}
			anchor="bottom"
			onClose={toggleDrawerNoteOpen}
			PaperProps={{
				sx: {
					width: "60vw",
					margin: "0 auto",
					borderTopLeftRadius: "16px",
					borderTopRightRadius: "16px",
					height: height,
					overflow: "hidden",
					transition: "height 0.1s ease-out",
				},
			}}
		>
			{/* Handle bar */}
			<div
				onMouseDown={handleDragStart}
				onTouchStart={handleDragStart}
				style={{
					width: 222,
					height: 5,
					background: "#ccc",
					borderRadius: 3,
					margin: "8px auto",
					cursor: "ns-resize",
					touchAction: "none",
				}}
			/>

			{/* Header */}
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "flex-start",
					padding: "0 16px",
				}}
			>
				<IconButton size="small">
					<MenuIcon />
				</IconButton>

				<Stack
					direction="row"
					spacing={1}
					sx={{
						background: "#f9f9f9",
						borderRadius: "9999px",
						padding: "4px 8px",
						boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
					}}
				>
					<IconButton size="small">
						<ArrowBack />
					</IconButton>
					<IconButton size="small">
						<ArrowForward />
					</IconButton>
					<IconButton size="small">
						<BookmarkBorder />
					</IconButton>
					<IconButton size="small">
						<Check />
					</IconButton>
				</Stack>
			</div>

			{/* Body */}
			<div style={{ padding: "16px" }}>
				<h3 style={{ marginBottom: 8 }}>GHI CHÚ</h3>
				<ToggleTextInput
					value={value}
					onChange={setValue}
				/>
			</div>
		</Drawer>
	);
};

export default DrawerNote;
