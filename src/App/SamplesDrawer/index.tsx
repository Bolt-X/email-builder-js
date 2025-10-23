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
	ControlPointDuplicate,
	ContentCopy,
	DriveFileRenameOutlineOutlined,
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
import TemplateSidebarList from "./TemplateSidebarList";
import { useSamplesDrawerWidth } from "../../hooks/useSamplesDrawerWidth";

export default function SamplesDrawer() {
	const navigate = useNavigate();
	const templates = useTemplates();
	const samplesDrawerOpen = useSamplesDrawerOpen();
	const SAMPLES_DRAWER_WIDTH = useSamplesDrawerWidth();

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

	const handleRenameTemplate = async () => {
		try {
		} catch (error) {}
	};

	const handleDuplicateTemplate = async () => {
		try {
		} catch (error) {}
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

					<TemplateSidebarList />
				</List>
			</Stack>

			{/* Footer */}
			<Stack spacing={2}>
				{/* Main Section */}
				<Stack spacing={1}>
					{/* <ListItemButton sx={{ py: 0.75, px: 2 }}>
						<ListItemText primary="Dashboard" />
					</ListItemButton> */}
					{/* <ListItemButton sx={{ py: 0.75, px: 2 }}>
						<ListItemText primary="List" />
					</ListItemButton> */}
					{/* <ListItemButton sx={{ py: 0.75, px: 2 }}>
						<ListItemText primary="Subscribers" />
					</ListItemButton> */}
					{/* <ListItemButton sx={{ py: 0.75, px: 2 }}>
						<ListItemText
							primary="Campaigns"
							onClick={() => navigate("/campaigns")}
						/>
					</ListItemButton> */}
				</Stack>
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
