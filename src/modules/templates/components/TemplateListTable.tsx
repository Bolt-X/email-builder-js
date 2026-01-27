import React, { useState } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	IconButton,
	Box,
	Menu,
	MenuItem,
	Checkbox,
	Typography,
	Stack,
	Tooltip,
	TablePagination,
} from "@mui/material";
import {
	Edit,
	Delete,
	ContentCopy,
	MoreHoriz,
	VisibilityOutlined,
} from "@mui/icons-material";
import { Template } from "../types";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
	deleteTemplateAction,
	duplicateTemplateAction,
	useVisibleColumns,
} from "../store";

interface TemplateListTableProps {
	templates: Template[];
}

export default function TemplateListTable({
	templates,
}: TemplateListTableProps) {
	const navigate = useNavigate();
	const { t } = useTranslation();
	const visibleColumns = useVisibleColumns();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [selectedId, setSelectedId] = useState<string | number | null>(null);
	const [selectedRows, setSelectedRows] = useState<(string | number)[]>([]);

	// Pagination state
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);

	// Reset page when templates list changes (filters applied)
	React.useEffect(() => {
		setPage(0);
	}, [templates]);

	const handleMenuOpen = (
		event: React.MouseEvent<HTMLElement>,
		id: string | number,
	) => {
		event.stopPropagation();
		setAnchorEl(event.currentTarget);
		setSelectedId(id);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
		setSelectedId(null);
	};

	const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.checked) {
			setSelectedRows(templates.map((t) => t.id));
		} else {
			setSelectedRows([]);
		}
	};

	const handleSelectRow = (
		event: React.ChangeEvent<HTMLInputElement>,
		id: string | number,
	) => {
		event.stopPropagation();
		if (event.target.checked) {
			setSelectedRows((prev) => [...prev, id]);
		} else {
			setSelectedRows((prev) => prev.filter((rowId) => rowId !== id));
		}
	};

	const handleDelete = async () => {
		if (selectedId) {
			if (window.confirm(t("templates.confirm_delete"))) {
				await deleteTemplateAction(selectedId);
			}
			handleMenuClose();
		}
	};

	const handleDuplicate = async () => {
		if (selectedId) {
			await duplicateTemplateAction(selectedId);
			handleMenuClose();
		}
	};

	const handleChangePage = (event: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const paginatedTemplates = templates.slice(
		page * rowsPerPage,
		page * rowsPerPage + rowsPerPage,
	);

	return (
		<>
			<Box
				sx={{
					p: 0,
					height: "calc(100vh - 144px)", // 64 (header) + 80 (filter)
					position: "relative",
				}}
			>
				<TableContainer
					component={Paper}
					elevation={0}
					sx={{
						height: "100%",
						overflow: "auto",
						border: "none",
						borderRadius: 0,
					}}
				>
					<Table stickyHeader>
						<TableHead sx={{ bgcolor: "action.hover" }}>
							<TableRow>
								<TableCell
									padding="checkbox"
									sx={{ paddingX: 3 }}
								>
									<Checkbox
										indeterminate={
											selectedRows.length > 0 &&
											selectedRows.length < templates.length
										}
										checked={
											templates.length > 0 &&
											selectedRows.length === templates.length
										}
										onChange={handleSelectAll}
										size="small"
									/>
								</TableCell>
								<TableCell sx={{ fontWeight: 600 }}>
									{t("templates.columns.name")}
								</TableCell>
								{visibleColumns.includes("context") && (
									<TableCell sx={{ fontWeight: 600 }}>
										{t("templates.columns.context")}
									</TableCell>
								)}
								{visibleColumns.includes("timestamps") && (
									<TableCell sx={{ fontWeight: 600 }}>
										{t("templates.columns.timestamps")}
									</TableCell>
								)}
								<TableCell
									sx={{ fontWeight: 600, paddingX: 3 }}
									align="right"
								>
									{t("templates.columns.actions")}
								</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{paginatedTemplates.map((template) => {
								const isSelected = selectedRows.includes(template.id);
								return (
									<TableRow
										key={template.id}
										hover
										selected={isSelected}
										sx={{ cursor: "pointer" }}
										onClick={() => navigate(`/templates/${template.id}`)}
									>
										<TableCell
											padding="checkbox"
											onClick={(e) => e.stopPropagation()}
											sx={{ paddingX: 3 }}
										>
											<Checkbox
												checked={isSelected}
												onChange={(e) => handleSelectRow(e, template.id)}
												size="small"
											/>
										</TableCell>
										<TableCell>
											<Box sx={{ display: "flex", alignItems: "center" }}>
												{template.thumbnail && (
													<Box
														component="img"
														src={template.thumbnail}
														sx={{
															width: 40,
															height: 40,
															borderRadius: 1,
															mr: 2,
															objectFit: "cover",
															border: "1px solid",
															borderColor: "divider",
														}}
													/>
												)}
												<Box>
													<Typography
														variant="body2"
														sx={{ fontWeight: 600, color: "primary.main" }}
													>
														{template.name}
													</Typography>
													<Typography
														variant="caption"
														color="text.secondary"
														sx={{ display: "block" }}
													>
														{template.description || "No description"}
													</Typography>
												</Box>
											</Box>
										</TableCell>
										{visibleColumns.includes("context") && (
											<TableCell>
												<Typography
													variant="body2"
													color="text.secondary"
												>
													{template.campaignId || "Global"}
												</Typography>
											</TableCell>
										)}
										{visibleColumns.includes("timestamps") && (
											<TableCell>
												<Box
													sx={{ fontSize: "0.75rem", color: "text.secondary" }}
												>
													<Box>
														{t("common.created_at")}{" "}
														{template.createdAt
															? new Date(
																	template.createdAt,
																).toLocaleDateString()
															: "-"}
													</Box>
													<Box>
														{t("common.updated_at")}{" "}
														{template.updatedAt
															? new Date(
																	template.updatedAt,
																).toLocaleDateString()
															: "-"}
													</Box>
												</Box>
											</TableCell>
										)}
										<TableCell
											align="right"
											sx={{ paddingX: 3 }}
										>
											<Stack
												direction="row"
												spacing={0.5}
												justifyContent="flex-end"
											>
												<Tooltip title={t("templates.actions.view_preview")}>
													<IconButton size="small">
														<VisibilityOutlined fontSize="small" />
													</IconButton>
												</Tooltip>
												<Tooltip title={t("templates.actions.edit_legacy")}>
													<IconButton
														size="small"
														onClick={(e) => {
															e.stopPropagation();
															navigate(`/templates/${template.id}`);
														}}
													>
														<Edit
															fontSize="small"
															color="primary"
														/>
													</IconButton>
												</Tooltip>
												<IconButton
													size="small"
													onClick={(e) => handleMenuOpen(e, template.id)}
												>
													<MoreHoriz fontSize="small" />
												</IconButton>
											</Stack>
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</TableContainer>
				<Box
					sx={{
						bgcolor: "background.paper",
						borderTop: "1px solid",
						borderColor: "divider",
						p: 0,
						flexShrink: 0,
					}}
				>
					<TablePagination
						rowsPerPageOptions={[10, 25, 50]}
						component="div"
						count={templates.length}
						rowsPerPage={rowsPerPage}
						page={page}
						onPageChange={handleChangePage}
						onRowsPerPageChange={handleChangeRowsPerPage}
						sx={{ px: 3 }}
					/>
				</Box>
			</Box>

			<Menu
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={handleMenuClose}
			>
				<MenuItem
					onClick={() => {
						selectedId && navigate(`/templates/${selectedId}`);
						handleMenuClose();
					}}
				>
					<Edit sx={{ mr: 1, fontSize: 20 }} /> {t("common.edit")}
				</MenuItem>
				<MenuItem onClick={handleDuplicate}>
					<ContentCopy sx={{ mr: 1, fontSize: 20 }} /> {t("common.duplicate")}
				</MenuItem>
				<MenuItem
					onClick={handleDelete}
					sx={{ color: "error.main" }}
				>
					<Delete sx={{ mr: 1, fontSize: 20 }} /> {t("common.delete")}
				</MenuItem>
			</Menu>
		</>
	);
}
