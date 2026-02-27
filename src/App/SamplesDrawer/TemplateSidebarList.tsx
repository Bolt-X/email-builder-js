import {
	Check,
	ChevronRight,
	Close,
	DriveFileRenameOutlineOutlined,
	ExpandMore,
} from "@mui/icons-material";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
	Button,
	Collapse,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	IconButton,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Menu,
	MenuItem,
	Stack,
	TextField,
} from "@mui/material";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { setMessage } from "../../contexts";
import {
	setCurrentTemplate,
	fetchTemplates,
	useTemplates,
	deleteTemplateAction,
	updateTemplateAction,
	createTemplateAction,
} from "../../modules/templates/store";
import { setDocument } from "../../documents/editor/EditorContext";
import EMPTY_EMAIL_MESSAGE from "../../getConfiguration/sample/empty-email-message";

type Props = {};

const TemplateSidebarList = (props: Props) => {
	const navigate = useNavigate();
	const location = useLocation();
	const templates = useTemplates();
	const checkActiveTemplate = (templateId: number) => {
		return Number(location.pathname.split("/")[2]) === templateId;
	};

	const [openTemplate, setOpenTemplate] = useState(true);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [selectedId, setSelectedId] = useState<number | null>(null);
	const [openConfirm, setOpenConfirm] = useState(false);

	// State rename
	const [renameId, setRenameId] = useState<number | null>(null);
	const [renameValue, setRenameValue] = useState("");

	const handleMenuClose = () => {
		setAnchorEl(null);
		setSelectedId(null);
	};

	const handleMenuOpen = (
		event: React.MouseEvent<HTMLButtonElement>,
		id: number
	) => {
		setAnchorEl(event.currentTarget);
		setSelectedId(id);
	};

	const handleOpenConfirm = () => {
		setOpenConfirm(true);
	};

	const handleCloseConfirm = () => {
		setOpenConfirm(false);
	};

	const handleConfirmDelete = async () => {
		try {
			await deleteTemplateAction(selectedId!);
			setCurrentTemplate(null);
			setDocument(EMPTY_EMAIL_MESSAGE);
			navigate("/");
		} catch (error: any) {
			setMessage(error.message || "Error deleting template");
		} finally {
			setOpenConfirm(false);
			handleMenuClose();
			fetchTemplates();
		}
	};

	// Rename
	const handleRenameTemplate = () => {
		const tpl = templates.find((t) => t.id === selectedId);
		if (tpl) {
			setRenameId(tpl.id);
			setRenameValue(tpl.name);
		}
		handleMenuClose();
	};

	const handleRenameSave = async () => {
		try {
			await updateTemplateAction(renameId!, { name: renameValue });
			setRenameId(null);
			fetchTemplates();
		} catch (error: any) {
			setMessage(error.message || "Error updating template");
		}
	};

	const handleRenameCancel = () => {
		setRenameId(null);
	};

	// Duplicate
	const handleDuplicateTemplate = async () => {
		try {
			const tpl = templates.find((t) => t.id === selectedId);
			if (tpl) {
				await createTemplateAction(tpl.campaignId, {
					name: `${tpl.name} copy`,
					description: tpl.description,
					json: tpl.json,
					html: tpl.html,
					thumbnail: tpl.thumbnail,
				});
				fetchTemplates();
			}
		} catch (error: any) {
			setMessage(error.message || "Error duplicating template");
		} finally {
			handleMenuClose();
		}
	};

	return (
		<>
			<ListItemButton
				onClick={() => setOpenTemplate(!openTemplate)}
				sx={{ py: 0.75, px: 2, color: "#555" }}
			>
				<ListItemText primary="Templates" />
				{openTemplate ? (
					<ExpandMore color="inherit" />
				) : (
					<ChevronRight color="inherit" />
				)}
			</ListItemButton>

			<Collapse
				in={openTemplate}
				timeout="auto"
				unmountOnExit
			>
				<List
					component="div"
					disablePadding
					autoFocus={false}
				>
					{templates &&
						templates.map((template) => {
							const isActive = checkActiveTemplate(template.id);
							return (
								<ListItem
									key={"template_" + template.id}
									disablePadding
									sx={{
										"&:hover .more-btn": {
											opacity: 1,
										},
										background: isActive ? "#DFDFDF90" : "",
									}}
									secondaryAction={
										renameId !== template.id && (
											<IconButton
												edge="end"
												onClick={(e) => handleMenuOpen(e, template.id)}
												className="more-btn"
												sx={{
													opacity: 0,
													transition: "opacity 0.2s",
													"& .MuiSvgIcon-root": { fontSize: 18 },
												}}
											>
												<MoreVertIcon />
											</IconButton>
										)
									}
								>
									{renameId === template.id ? (
										<Stack
											direction="row"
											alignItems="center"
											sx={{ flex: 1, pl: 2 }}
										>
											<TextField
												size="small"
												value={renameValue}
												autoFocus
												onChange={(e) => setRenameValue(e.target.value)}
												fullWidth
												variant="standard"
												error={!renameValue.trim()} // 👈 báo lỗi nếu trống
												helperText={
													!renameValue.trim() ? "This field is required" : ""
												}
												InputProps={{
													sx: {
														px: 0,
														py: 1.06,
														"& .MuiInputBase-input": {
															p: 0,
														},
													},
												}}
												inputProps={{
													onFocus: (e) => e.target.select(), // 👈 select toàn bộ khi focus
												}}
											/>

											<IconButton
												size="small"
												onClick={handleRenameSave}
												color="success"
											>
												<Check fontSize="small" />
											</IconButton>
											<IconButton
												size="small"
												onClick={handleRenameCancel}
												color="error"
											>
												<Close fontSize="small" />
											</IconButton>
										</Stack>
									) : (
										<ListItemButton
											sx={{ py: 0.5, pl: 2 }}
											onClick={() => navigate("/templates/" + template.id)}
										>
											<ListItemText
												primary={template.name}
												title={template.name}
												primaryTypographyProps={{
													sx: {
														maxWidth: "100%",
														overflow: "hidden",
														whiteSpace: "nowrap",
														textOverflow: "ellipsis",
														display: "inline-block",
														verticalAlign: "middle",
													},
												}}
											/>
										</ListItemButton>
									)}
								</ListItem>
							);
						})}
				</List>

				{/* Action Menu */}
				<Menu
					anchorEl={anchorEl}
					open={Boolean(anchorEl)}
					onClose={handleMenuClose}
					slotProps={{
						paper: {
							sx: {
								boxShadow: "0px 2px 12px rgba(0,0,0,0.2)",
								borderRadius: 2,
								overflow: "hidden",
							},
						},
					}}
				>
					<MenuItem onClick={handleRenameTemplate}>
						<ListItemIcon>
							<DriveFileRenameOutlineOutlined fontSize="small" />
						</ListItemIcon>
						Rename
					</MenuItem>
					<MenuItem onClick={handleDuplicateTemplate}>
						<ListItemIcon>
							<ContentCopyOutlinedIcon fontSize="small" />
						</ListItemIcon>
						Duplicate
					</MenuItem>
					<MenuItem
						onClick={handleOpenConfirm}
						sx={{ color: "red" }}
					>
						<ListItemIcon>
							<DeleteOutlineOutlinedIcon
								color="error"
								fontSize="small"
							/>
						</ListItemIcon>
						Delete
					</MenuItem>
				</Menu>

				{/* Popup confirm delete */}
				<Dialog
					open={openConfirm}
					onClose={handleCloseConfirm}
					PaperProps={{
						sx: {
							borderRadius: 2,
						},
					}}
				>
					<DialogTitle>Confirm Deletion</DialogTitle>
					<DialogContent>
						<DialogContentText>
							Are you sure you want to delete this template? This action cannot
							be undone.
						</DialogContentText>
					</DialogContent>
					<DialogActions>
						<Button onClick={handleCloseConfirm}>Cancel</Button>
						<Button
							onClick={handleConfirmDelete}
							color="error"
							variant="contained"
						>
							Delete
						</Button>
					</DialogActions>
				</Dialog>
			</Collapse>
		</>
	);
};

export default TemplateSidebarList;
