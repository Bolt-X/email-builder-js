import React, { useState } from "react";
import {
	Avatar,
	Box,
	Button,
	Divider,
	Drawer,
	List,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Menu,
	MenuItem,
	Stack,
	Typography,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
} from "@mui/material";
import { AddBoxOutlined, Logout, Search } from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { setCurrentTemplate } from "../../modules/templates/store";
import {
	resetDocument,
	useSamplesDrawerOpen,
} from "../../documents/editor/EditorContext";
import EMPTY_EMAIL_MESSAGE from "../../getConfiguration/sample/empty-email-message";
import { useSamplesDrawerWidth } from "../../hooks/useSamplesDrawerWidth";
import TemplateSidebarList from "./TemplateSidebarList";
import { useAuthStore } from "../../contexts/auth";
import { toggleSearchModalOpen } from "../../contexts";

export default function SamplesDrawer() {
	const navigate = useNavigate();
	const samplesDrawerOpen = useSamplesDrawerOpen();
	const SAMPLES_DRAWER_WIDTH = useSamplesDrawerWidth();
	const { user, logout } = useAuthStore((s) => ({
		user: s.user,
		logout: s.logout,
	}));
	const { t } = useTranslation();
	const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

	const userFullName = user
		? user.first_name + " " + user.last_name
		: "Unknown user";
	const userFirstLetter = userFullName.charAt(0);

	// menu state
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const menuOpen = Boolean(anchorEl);

	const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
	};

	const handleLogout = () => {
		handleMenuClose();
		setLogoutDialogOpen(true);
	};

	const performLogout = () => {
		setLogoutDialogOpen(false);
		logout();
		navigate("/auth/login", { replace: true });
	};

	return (
		<>
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
				{/* --- Top Section --- */}
				<Stack spacing={2}>
					{/* Header */}
					<Stack
						direction="row"
						alignItems="center"
						spacing={1}
						sx={{ pl: 2, py: 1 }}
					>
						<img
							alt="logo-boltx"
							src="/assets/logo/Logo BoltX primary.svg"
						/>
					</Stack>

					{/* Menu items */}
					<List sx={{ pt: 0 }}>
						<ListItemButton
							sx={{ py: 0.75, px: 2 }}
							onClick={() => {
								navigate("/");
								resetDocument(EMPTY_EMAIL_MESSAGE);
								setCurrentTemplate(null);
							}}
						>
							<ListItemIcon sx={{ minWidth: 32 }}>
								<AddBoxOutlined fontSize="small" />
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

						<Divider />

						<TemplateSidebarList />
					</List>
				</Stack>

				{/* --- Footer --- */}
				<Stack spacing={2}>
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
							The modern way to create and deliver your emails.
						</Typography>
						<Button
							size="small"
							sx={{ mt: 1 }}
						>
							Learn more
						</Button>
					</Box>

					<Divider />

					{/* User info + menu */}
					<Stack
						direction="row"
						alignItems="center"
						spacing={1}
						sx={{
							cursor: "pointer",
							padding: "4px",
							borderRadius: "4px",
							background: "#EEE",
							":hover": {
								background: "#DDD",
							},
						}}
						onClick={handleMenuOpen}
					>
						<Avatar sx={{ width: 32, height: 32, background: "#0079CC" }}>
							{userFirstLetter}
						</Avatar>
						<Typography variant="body1">{userFullName}</Typography>
					</Stack>

					{/* Popup Menu */}
					<Menu
						anchorEl={anchorEl}
						open={menuOpen}
						onClose={handleMenuClose}
						anchorOrigin={{
							vertical: "top",
							horizontal: "center",
						}}
						transformOrigin={{
							vertical: "bottom",
							horizontal: "right",
						}}
						slotProps={{
							paper: {
								sx: {
									width: "280px",
									borderRadius: "4px",
									boxShadow: "0px 8px 10px #AAA",
								},
							},
						}}
					>
						<MenuItem
							onClick={handleLogout}
							sx={{
								display: "flex",
								gap: "12px",
							}}
						>
							<Logout
								fontSize="small"
								color="action"
							/>{" "}
							<Typography variant="body1">Log out</Typography>
						</MenuItem>
					</Menu>
				</Stack>
			</Drawer>

			<Dialog
				open={logoutDialogOpen}
				onClose={() => setLogoutDialogOpen(false)}
			>
				<DialogTitle>{t("login.logout_confirm_title")}</DialogTitle>
				<DialogContent>
					<DialogContentText>
						{t("login.logout_confirm_desc")}
					</DialogContentText>
				</DialogContent>
				<DialogActions sx={{ p: 2, pt: 0 }}>
					<Button
						onClick={() => setLogoutDialogOpen(false)}
						color="inherit"
					>
						{t("common.cancel")}
					</Button>
					<Button
						onClick={performLogout}
						variant="contained"
						color="error"
						autoFocus
					>
						{t("login.logout")}
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}
