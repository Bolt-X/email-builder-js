import React, { useState } from "react";

import {
	Avatar,
	Box,
	Button,
	Collapse,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Divider,
	Drawer,
	IconButton,
	Link,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Menu,
	MenuItem,
	Stack,
	Typography,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";
import MenuIcon from "@mui/icons-material/Menu";
import {
	Search,
	DescriptionOutlined,
	HistoryOutlined,
	ExpandLess,
	ExpandMore,
	EditOutlined,
	AddBox,
} from "@mui/icons-material";
import {
	setMessage,
	toggleDrawerNoteOpen,
	toggleSearchModalOpen,
} from "../../contexts";
import {
	setDocument,
	useSamplesDrawerOpen,
} from "../../documents/editor/EditorContext";
import {
	setCurrentTemplate,
	useFetchTemplates,
	useTemplates,
} from "../../contexts/templates";
import { useNavigate } from "react-router-dom";
import EMPTY_EMAIL_MESSAGE from "../../getConfiguration/sample/empty-email-message";
import { deleteTemplate } from "../../services/template";

export const SAMPLES_DRAWER_WIDTH = 320;

export default function SamplesDrawer() {
	const navigate = useNavigate();
	const templates = useTemplates();
	const samplesDrawerOpen = useSamplesDrawerOpen();
	const [openTemplate, setOpenTemplate] = React.useState(true);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [selectedId, setSelectedId] = useState<number | null>(null);
	const [openConfirm, setOpenConfirm] = useState(false);

	const handleOpenConfirm = () => {
		setOpenConfirm(true);
	};

	const handleCloseConfirm = () => {
		setOpenConfirm(false);
	};

	const handleMenuOpen = (
		event: React.MouseEvent<HTMLButtonElement>,
		id: number
	) => {
		setAnchorEl(event.currentTarget);
		setSelectedId(id);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
		setSelectedId(null);
	};

	const handleConfirmDelete = async () => {
		try {
			await deleteTemplate(selectedId);
			setCurrentTemplate(null);
			setDocument(EMPTY_EMAIL_MESSAGE);
			// TODO: tạm thời redirect về trang Home
			navigate("/");
		} catch (error) {
			setMessage(error);
		} finally {
			setOpenConfirm(false);
			handleMenuClose();
			useFetchTemplates();
		}
	};

	return (
		<Drawer
			variant="persistent"
			anchor="left"
			open={samplesDrawerOpen}
			sx={{
				width: samplesDrawerOpen ? SAMPLES_DRAWER_WIDTH : 0,
				"& .MuiDrawer-paper": {
					width: SAMPLES_DRAWER_WIDTH,
					boxSizing: "border-box",
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between",
					p: 2,
				},
			}}
		>
			{/* Top Section */}
			<Stack spacing={2}>
				{/* Header */}
				<Stack
					direction="row"
					alignItems="center"
					spacing={1}
					sx={{ pl: 2, py: 1 }} // căn trái và padding gọn
				>
					<MenuIcon fontSize="small" />
					<Typography
						variant="subtitle1"
						fontWeight="bold"
					>
						MailBolter
					</Typography>
				</Stack>

				{/* Menu items */}
				<List sx={{ pt: 0 }}>
					<ListItemButton
						sx={{ py: 0.75, px: 2 }}
						onClick={() => {
							navigate("/");
							setDocument(EMPTY_EMAIL_MESSAGE);
							setCurrentTemplate(null);
						}}
					>
						<ListItemIcon sx={{ minWidth: 32 }}>
							<AddBox fontSize="small" />
						</ListItemIcon>
						<ListItemText primary="New template" />
					</ListItemButton>
					<ListItemButton sx={{ py: 0.75, px: 2 }}>
						<ListItemIcon sx={{ minWidth: 32 }}>
							<Search fontSize="small" />
						</ListItemIcon>
						<ListItemText
							primary="Search"
							onClick={toggleSearchModalOpen}
						/>
					</ListItemButton>

					<ListItemButton sx={{ py: 0.75, px: 2 }}>
						<ListItemIcon sx={{ minWidth: 32 }}>
							<DescriptionOutlined fontSize="small" />
						</ListItemIcon>
						<ListItemText
							primary="Notes"
							onClick={toggleDrawerNoteOpen}
						/>
					</ListItemButton>

					<ListItemButton sx={{ py: 0.75, px: 2 }}>
						<ListItemIcon sx={{ minWidth: 32 }}>
							<HistoryOutlined fontSize="small" />
						</ListItemIcon>
						<ListItemText primary="History" />
					</ListItemButton>

					<Divider />

					<ListItemButton
						onClick={() => setOpenTemplate(!openTemplate)}
						sx={{ py: 0.75, px: 2 }}
					>
						<ListItemText primary="Templates" />
						{openTemplate ? <ExpandLess /> : <ExpandMore />}
					</ListItemButton>

					<Collapse
						in={openTemplate}
						timeout="auto"
						unmountOnExit
					>
						<List
							component="div"
							disablePadding
						>
							{templates &&
								templates.map((template) => (
									<ListItem
										key={"template_" + template.id}
										disablePadding
										sx={{
											"&:hover .more-btn": {
												opacity: 1,
											},
										}}
										secondaryAction={
											<IconButton
												edge="end"
												onClick={(e) => handleMenuOpen(e, template.id)}
												className="more-btn"
												sx={{
													opacity: 0,
													transition: "opacity 0.2s",
													"& .MuiSvgIcon-root": { fontSize: 18 }, // nhỏ hơn mặc định
												}}
											>
												<MoreVertIcon />
											</IconButton>
										}
									>
										<ListItemButton
											sx={{ py: 0.5, pl: 4 }}
											onClick={() => navigate("/templates/" + template.id)}
										>
											<ListItemText primary={template.name} />
										</ListItemButton>
									</ListItem>
								))}
						</List>
						{/* Action Menu */}
						<Menu
							anchorEl={anchorEl}
							open={Boolean(anchorEl)}
							onClose={handleMenuClose}
							slotProps={{
								paper: {
									sx: {
										boxShadow: "0px 2px 12px rgba(0,0,0,0.2)", // shadow
										borderRadius: 2, // bo góc
										overflow: "hidden",
									},
								},
							}}
						>
							<MenuItem onClick={handleOpenConfirm}>
								<ListItemIcon>
									<DeleteIcon
										color="error"
										fontSize="small"
										sx={{
											mr: 0,
											width: 24,
										}}
									/>
								</ListItemIcon>
								Xóa
							</MenuItem>
						</Menu>

						{/* Popup confirm */}
						<Dialog
							open={openConfirm}
							onClose={handleCloseConfirm}
							PaperProps={{
								sx: {
									borderRadius: 2,
								},
							}}
						>
							<DialogTitle>Xác nhận xóa</DialogTitle>
							<DialogContent>
								<DialogContentText>
									Bạn có chắc chắn muốn xóa template này không? Hành động này
									không thể hoàn tác.
								</DialogContentText>
							</DialogContent>
							<DialogActions>
								<Button onClick={handleCloseConfirm}>Hủy</Button>
								<Button
									onClick={handleConfirmDelete}
									color="error"
									variant="contained"
								>
									Xóa
								</Button>
							</DialogActions>
						</Dialog>
					</Collapse>
				</List>
			</Stack>

			{/* Footer */}
			<Stack spacing={2}>
				{/* Main Section */}
				{/* <Stack spacing={1}>
					<ListItemButton sx={{ py: 0.75, px: 2 }}>
						<ListItemText primary="Dashboard" />
					</ListItemButton>
					<ListItemButton sx={{ py: 0.75, px: 2 }}>
						<ListItemText primary="List" />
					</ListItemButton>
					<ListItemButton sx={{ py: 0.75, px: 2 }}>
						<ListItemText primary="Subscribers" />
					</ListItemButton>
					<ListItemButton sx={{ py: 0.75, px: 2 }}>
						<ListItemText primary="Campaign" />
					</ListItemButton>
				</Stack> */}
				<Divider />

				<Box>
					<Typography
						variant="h6"
						color="primary"
					>
						boltx
					</Typography>
					<Typography
						variant="body2"
						color="text.secondary"
					>
						Giải pháp rút ngắn thời gian soạn và gửi email
					</Typography>
					<Button
						size="small"
						sx={{ mt: 1 }}
					>
						Learn more
					</Button>
				</Box>

				<Divider />

				<Stack
					direction="row"
					alignItems="center"
					spacing={1}
				>
					<Avatar sx={{ width: 32, height: 32 }}>A</Avatar>
					<Typography
						variant="body2"
						fontWeight="medium"
					>
						Account name
					</Typography>
				</Stack>
			</Stack>
		</Drawer>
	);
}
