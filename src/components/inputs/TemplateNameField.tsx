import React, { useEffect, useState } from "react";
import { TextField, Typography, Box, IconButton } from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import {
	setCurrentTemplate,
	useCurrentTemplate,
} from "../../contexts/templates";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";

export default function TemplateNameField() {
	const currentTemplate = useCurrentTemplate();
	console.log(
		"🚀 ~ TemplateNameField ~ currentTemplate:",
		currentTemplate
	);
	const [editing, setEditing] = useState(false);
	const [name, setName] = useState("Untitled");

	const handleToggle = () => setEditing(true);

	const handleBlur = () => {
		setEditing(false);
		// TODO: gọi API update template name ở đây
		setCurrentTemplate({ name: name });
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter") {
			e.currentTarget.blur();
		}
	};

	const sharedStyles = {
		fontSize: 14,
		lineHeight: 1.43,
		fontWeight: 400,
		color: "inherit",
	};

	useEffect(() => {
		if (currentTemplate?.name) setName(currentTemplate?.name);
	}, [currentTemplate?.name]);

	if (editing) {
		return (
			<TextField
				size="small"
				variant="outlined"
				value={name}
				onChange={(e) => setName(e.target.value)}
				onBlur={handleBlur}
				onKeyDown={handleKeyDown}
				autoFocus
				InputProps={{
					sx: {
						py: 0.65,
						px: 0, // bỏ padding ngang
					},
				}}
				sx={{
					minWidth: 150,
					display: "flex",
					alignItems: "center",
					minHeight: 32,
					"& fieldset": { border: "none" }, // bỏ border
					"& .MuiOutlinedInput-root": {
						paddingX: 0, // bỏ padding X
					},
					"& .MuiOutlinedInput-root.Mui-focused fieldset": {
						border: "none",
					},
					"& .MuiOutlinedInput-root:hover fieldset": {
						border: "none",
					},
					"& .MuiOutlinedInput-input": {
						paddingX: 0, // xoá padding text input
					},
				}}
			/>
		);
	}

	return (
		<Box
			sx={{
				display: "flex",
				alignItems: "center",
				gap: 0.5,
				minHeight: 32,
				cursor: "pointer",
			}}
			onClick={handleToggle}
		>
			<Typography
				sx={{
					...sharedStyles,
					py: 0.75, // Padding để match với input, căn giữa theo chiều dọc
					whiteSpace: "nowrap",
					overflow: "hidden",
					textOverflow: "ellipsis",
					flex: 1,
				}}
			>
				{name}
			</Typography>
			<IconButton
				size="small"
				sx={{ p: 1 }}
			>
				<DriveFileRenameOutlineIcon fontSize="inherit" />
			</IconButton>
		</Box>
	);
}
