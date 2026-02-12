import React, { useState } from "react";
import { Search, Settings } from "@mui/icons-material";
import {
	Box,
	FormControl,
	InputAdornment,
	Stack,
	TextField,
	Button,
	Popover,
	Checkbox,
	FormControlLabel,
	Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useVisibleColumns, setVisibleColumns } from "../store";

interface TemplateFiltersProps {
	searchQuery: string;
	onSearchChange: (query: string) => void;
	disabled?: boolean;
}

export default function TemplateFilters({
	searchQuery,
	onSearchChange,
	disabled,
}: TemplateFiltersProps) {
	const { t } = useTranslation();
	const visibleColumns = useVisibleColumns();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

	const handleColumnToggle = (column: string) => {
		if (visibleColumns.includes(column)) {
			setVisibleColumns(visibleColumns.filter((c) => c !== column));
		} else {
			setVisibleColumns([...visibleColumns, column]);
		}
	};

	const commonSx = {
		borderRadius: "6px",
		backgroundColor: "background.paper",
		"& .MuiOutlinedInput-root": {
			borderRadius: "6px",
		},
		"& fieldset": {
			borderColor: "rgba(0, 0, 0, 0.12)",
		},
	};

	return (
		<Box
			sx={{
				borderBottom: "1px solid",
				borderColor: "divider",
				py: 2,
				px: 3,
				bgcolor: "background.paper",
				minHeight: 80,
				display: "flex",
				alignItems: "center",
			}}
		>
			<Stack
				direction="row"
				justifyContent="space-between"
				alignItems="center"
				spacing={2}
				sx={{ width: "100%" }}
			>
				<Stack
					direction="row"
					spacing={1.5}
					alignItems="center"
					flexGrow={1}
				>
					<FormControl
						variant="outlined"
						size="small"
					>
						<TextField
							placeholder={t("templates.search_placeholder")}
							size="small"
							value={searchQuery}
							onChange={(e) => onSearchChange(e.target.value)}
							disabled={disabled}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<Search
											fontSize="small"
											color="action"
										/>
									</InputAdornment>
								),
								sx: {
									minWidth: 320,
									height: 40,
								},
							}}
							sx={commonSx}
						/>
					</FormControl>
				</Stack>

				<Stack
					direction="row"
					spacing={1}
					alignItems="center"
				>
					<Button
						variant="outlined"
						size="small"
						startIcon={<Settings fontSize="small" />}
						disabled={disabled}
						onClick={(e) => setAnchorEl(e.currentTarget)}
						sx={{
							borderRadius: 20,
							textTransform: "none",
							color: "text.primary",
							borderColor: "divider",
							px: 2,
							height: 40,
							fontWeight: 600,
							"&:hover": {
								borderColor: "primary.main",
								backgroundColor: "action.hover",
							},
						}}
					>
						{t("templates.columns.title")}
					</Button>
					<Popover
						open={Boolean(anchorEl)}
						anchorEl={anchorEl}
						onClose={() => setAnchorEl(null)}
						anchorOrigin={{
							vertical: "bottom",
							horizontal: "right",
						}}
						transformOrigin={{
							vertical: "top",
							horizontal: "right",
						}}
					>
						<Box sx={{ p: 2, minWidth: 200 }}>
							<Stack spacing={1}>
								<FormControlLabel
									control={
										<Checkbox
											checked
											disabled
											size="small"
										/>
									}
									label={
										<Typography variant="body2">
											{t("templates.columns.name")}
										</Typography>
									}
								/>
								<FormControlLabel
									control={
										<Checkbox
											checked={visibleColumns.includes("user_name")}
											onChange={() => handleColumnToggle("user_name")}
											size="small"
										/>
									}
									label={
										<Typography variant="body2">
											{t("templates.columns.user_name")}
										</Typography>
									}
								/>
								<FormControlLabel
									control={
										<Checkbox
											checked={visibleColumns.includes("context")}
											onChange={() => handleColumnToggle("context")}
											size="small"
										/>
									}
									label={
										<Typography variant="body2">
											{t("templates.columns.context")}
										</Typography>
									}
								/>
								<FormControlLabel
									control={
										<Checkbox
											checked={visibleColumns.includes("timestamps")}
											onChange={() => handleColumnToggle("timestamps")}
											size="small"
										/>
									}
									label={
										<Typography variant="body2">
											{t("templates.columns.timestamps")}
										</Typography>
									}
								/>
							</Stack>
						</Box>
					</Popover>
				</Stack>
			</Stack>
		</Box>
	);
}
