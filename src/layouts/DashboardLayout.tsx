import React, { useState, useEffect } from "react";
import {
	Box,
	CSSObject,
	Drawer as MuiDrawer,
	IconButton,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Theme,
	Toolbar,
	styled,
	useTheme,
	useMediaQuery,
	Tooltip,
	Collapse,
	Avatar,
	Divider,
	Typography,
	Stack,
	Popover,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
	Button,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import {
	BarChart as DashboardIcon,
	Campaign as CampaignsIcon,
	Group as ContactsIcon,
	Settings as SettingsIcon,
	Add as AddIcon,
	NotificationsNone as NotificationsIcon,
	MarkEmailRead as SolutionIcon,
	KeyboardDoubleArrowLeft as ChevronLeft,
	KeyboardDoubleArrowRight as ChevronRight,
	ExpandLess,
	ExpandMore,
	Logout,
	Check as CheckIcon,
	MenuBook as ToggleIcon,
	PersonAdd,
} from "@mui/icons-material";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../contexts/auth";
import GlobalToast from "../components/GlobalToast";

const DRAWER_WIDTH = 272;
const COLLAPSED_WIDTH = 80;

const openedMixin = (theme: Theme): CSSObject => ({
	width: DRAWER_WIDTH,
	transition: theme.transitions.create("width", {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.enteringScreen,
	}),
	overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
	transition: theme.transitions.create("width", {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.leavingScreen,
	}),
	overflowX: "hidden",
	width: COLLAPSED_WIDTH,
	[theme.breakpoints.up("sm")]: {
		width: COLLAPSED_WIDTH,
	},
});

const Drawer = styled(MuiDrawer, {
	shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
	width: DRAWER_WIDTH,
	flexShrink: 0,
	whiteSpace: "nowrap",
	boxSizing: "border-box",
	...(open && {
		...openedMixin(theme),
		"& .MuiDrawer-paper": openedMixin(theme),
	}),
	...(!open && {
		...closedMixin(theme),
		"& .MuiDrawer-paper": closedMixin(theme),
	}),
	"& .MuiDrawer-paper": {
		backgroundColor: theme.palette.background.paper,
		borderRight: `1px solid ${theme.palette.divider}`,
		...(open ? openedMixin(theme) : closedMixin(theme)),
		"&::-webkit-scrollbar": {
			display: "none",
		},
	},
}));

export default function DashboardLayout() {
	const { t } = useTranslation();

	const navigationItems = [
		{
			label: t("sidebar.dashboard"),
			icon: <DashboardIcon />,
			path: "/",
		},
		{
			label: t("sidebar.campaigns"),
			icon: <CampaignsIcon />,
			path: "/campaigns",
			children: [
				{
					label: t("sidebar.all_campaigns"),
					path: "/campaigns",
				},
				{
					label: t("sidebar.templates"),
					path: "/templates",
				},
				{
					label: t("sidebar.media"),
					path: "/media",
				},
			],
		},
		{
			label: t("sidebar.contacts"),
			icon: <ContactsIcon />,
			path: "/contacts",
			children: [
				{
					label: t("sidebar.all_contacts"),
					path: "/contacts",
				},
				{
					label: t("sidebar.segments"),
					path: "/segments",
				},
			],
		},
		{
			label: t("sidebar.settings"),
			icon: <SettingsIcon />,
			path: "/settings",
		},
	];

	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("md"));
	const [open, setOpen] = useState(true);
	const [mobileOpen, setMobileOpen] = useState(false);
	const [loggingOut, setLoggingOut] = useState(false);
	// State to track open menus (e.g. Campaigns)
	const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
		Contacts: true,
	});
	const [solutionOpen, setSolutionOpen] = useState(true);
	const [profileAnchorEl, setProfileAnchorEl] = useState<HTMLElement | null>(
		null,
	);
	const navigate = useNavigate();
	const location = useLocation();
	const {
		user,
		restoreSession,
		logout: performLogout,
	} = useAuthStore((s) => ({
		user: s.user,
		restoreSession: s.restoreSession,
		logout: s.logout,
	}));
	const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

	const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
		setProfileAnchorEl(event.currentTarget);
	};

	const handleProfileClose = () => {
		setProfileAnchorEl(null);
	};

	const profileOpen = Boolean(profileAnchorEl);

	useEffect(() => {
		if (!user) {
			restoreSession();
		}
	}, [user, restoreSession]);

	const userFullName = user
		? (user.first_name || "") + " " + (user.last_name || "")
		: "BoltX Digital";
	const userFirstLetter =
		userFullName === "BoltX Digital"
			? "BO"
			: userFullName.trim().charAt(0) || "B";

	const handleDrawerToggle = () => {
		if (isMobile) {
			setMobileOpen(!mobileOpen);
		} else {
			setOpen(!open);
		}
	};

	const handleMenuClick = (
		label: string,
		path: string,
		hasChildren: boolean,
	) => {
		if (hasChildren) {
			if (!open && !isMobile) {
				setOpen(true);
				setOpenMenus((prev) => ({ ...prev, [label]: true }));
			} else {
				setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
			}
		} else {
			handleNavigation(path);
		}
	};

	const handleNavigation = (path: string) => {
		navigate(path);
		if (isMobile) {
			setMobileOpen(false);
		}
	};

	const isChildActive = (item: any) => {
		if (item.children) {
			return item.children.some((child: any) =>
				location.pathname.startsWith(child.path),
			);
		}
		return false;
	};

	const drawerContent = (
		<Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
			<Toolbar
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: open ? "space-between" : "center",
					px: 2,
					minHeight: 80,
				}}
			>
				{open && (
					<Stack
						direction="row"
						alignItems="center"
						spacing={1}
						sx={{ flexGrow: 1 }}
					>
						<img
							alt="logo-boltx"
							src="/assets/logo/Logo BoltX primary.svg"
							style={{ height: 40 }}
						/>
					</Stack>
				)}
				<IconButton
					onClick={handleDrawerToggle}
					sx={{ color: "text.secondary" }}
				>
					{open ? <ChevronLeft /> : <ChevronRight />}
				</IconButton>
			</Toolbar>

			<Box
				sx={{
					px: open ? 3 : 1,
					mb: 2.5,
					display: "flex",
					justifyContent: "center",
				}}
			>
				{open ? (
					<ListItemButton
						onClick={() => navigate("/campaigns/new")}
						sx={{
							bgcolor: "action.hover",
							borderRadius: 10,
							py: 1.5,
							width: "100%",
							justifyContent: "center",
							alignItems: "center",
							"&:hover": { bgcolor: "action.selected" },
						}}
					>
						<ListItemIcon sx={{ minWidth: 0, mr: 1, color: "text.primary" }}>
							<AddIcon />
						</ListItemIcon>
						<ListItemText
							primary={t("sidebar.create")}
							primaryTypographyProps={{
								fontWeight: 700,
								color: "text.primary",
							}}
							sx={{
								maxWidth: "fit-content",
								display: "inline-block",
								mt: 0.75,
							}}
						/>
					</ListItemButton>
				) : (
					<IconButton
						onClick={() => navigate("/campaigns/new")}
						sx={{
							bgcolor: "action.hover",
							width: 54,
							height: 54,
							mx: "auto",
							display: "flex",
							"&:hover": { bgcolor: "action.selected" },
						}}
					>
						<AddIcon />
					</IconButton>
				)}
			</Box>

			<Divider sx={{ mx: 1.5, mb: 2, opacity: 0.5 }} />

			<Box sx={{ flexGrow: 1, mt: 2 }}>
				<List>
					{navigationItems.map((item) => {
						const hasChildren = !!item.children;
						const isMenuOpen = openMenus[item.label];

						let isActive = false;
						if (item.path === "/") {
							isActive = location.pathname === "/";
						} else {
							isActive =
								location.pathname === item.path ||
								location.pathname.startsWith(item.path + "/");
						}

						return (
							<React.Fragment key={item.label}>
								<ListItem
									disablePadding
									sx={{ display: "block" }}
								>
									<Tooltip
										title={!open ? item.label : ""}
										placement="right"
									>
										<ListItemButton
											onClick={() =>
												handleMenuClick(item.label, item.path, hasChildren)
											}
											sx={{
												minHeight: 52,
												justifyContent: open ? "initial" : "center",
												px: open ? 1.5 : 3,
												mx: open ? 1 : 0.5,
												borderRadius: 2,
												color: isActive ? "primary.main" : "text.secondary",
												"&.Mui-selected": {
													backgroundColor: "transparent",
													color: "primary.main",
													"& .MuiListItemIcon-root": {
														color: "primary.main",
													},
												},
												"&:hover": {
													backgroundColor: "rgba(0, 0, 0, 0.04)",
												},
											}}
											selected={isActive && !hasChildren}
										>
											<ListItemIcon
												sx={{
													minWidth: 0,
													mr: open ? 1.5 : "auto",
													justifyContent: "center",
													color: isActive ? "primary.main" : "text.secondary",
												}}
											>
												{item.icon}
											</ListItemIcon>
											<ListItemText
												primary={item.label}
												sx={{ opacity: open ? 1 : 0 }}
												primaryTypographyProps={{
													fontWeight: isActive ? 700 : 500,
												}}
											/>
											{hasChildren &&
												open &&
												(isMenuOpen ? <ExpandLess /> : <ExpandMore />)}
										</ListItemButton>
									</Tooltip>
								</ListItem>
								{hasChildren && open && (
									<Collapse
										in={isMenuOpen}
										timeout="auto"
										unmountOnExit
									>
										<List
											component="div"
											disablePadding
										>
											{item.children.map((child) => {
												const isChildActive = location.pathname === child.path;

												return (
													<ListItemButton
														key={child.label}
														sx={{
															pl: 8,
															mr: 1.5,
															borderRadius: 2,
															mb: 0.5,
															color: isChildActive
																? "primary.main"
																: "text.secondary",
															"&.Mui-selected": {
																bgcolor: "transparent",
																color: "primary.main",
																fontWeight: "bold",
															},
														}}
														selected={isChildActive}
														onClick={() => handleNavigation(child.path)}
													>
														<ListItemText
															primary={child.label}
															primaryTypographyProps={{
																fontSize: "0.9rem",
																fontWeight: isChildActive ? 600 : 400,
															}}
														/>
													</ListItemButton>
												);
											})}
										</List>
									</Collapse>
								)}
							</React.Fragment>
						);
					})}
				</List>
			</Box>

			{/* Solution Card & User Profile pushed to bottom */}
			<Box sx={{ mt: "auto", p: 1.5 }}>
				{/* Solution Card */}
				{open ? (
					<Box sx={{ mb: 3 }}>
						<Box
							sx={{
								p: 1.5,
								borderRadius: 2,
								bgcolor: "background.paper",
								border: "1px solid",
								borderColor: "divider",
								position: "relative",
							}}
						>
							<Box
								sx={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "flex-start",
									mb: solutionOpen ? 1 : 0,
									cursor: "pointer",
								}}
								onClick={() => setSolutionOpen(!solutionOpen)}
							>
								<Box
									sx={{
										bgcolor: "background.default",
										p: 0.5,
										borderRadius: 1,
										boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
										display: "flex",
									}}
								>
									<SolutionIcon sx={{ color: "#ef4444", fontSize: 20 }} />
								</Box>
								{solutionOpen ? (
									<ExpandLess sx={{ color: "text.secondary", fontSize: 20 }} />
								) : (
									<ExpandMore sx={{ color: "text.secondary", fontSize: 20 }} />
								)}
							</Box>
							<Collapse
								in={solutionOpen}
								timeout="auto"
								unmountOnExit
							>
								<Typography
									variant="subtitle2"
									noWrap={true}
									sx={{ fontWeight: 700, mb: 1.5, lineHeight: 1.2, mt: 1 }}
								>
									{t("sidebar.solution_title")}
								</Typography>
								<Stack spacing={0.8}>
									{[
										t("sidebar.solution_step1"),
										t("sidebar.solution_step2"),
										t("sidebar.solution_step3"),
										t("sidebar.solution_step4"),
									].map((text, i) => (
										<Stack
											key={i}
											direction="row"
											spacing={1}
											alignItems="flex-start"
										>
											<CheckIcon
												sx={{ color: "success.main", fontSize: 14, mt: 0.3 }}
											/>
											<Typography
												variant="caption"
												color="text.secondary"
												noWrap={true}
												sx={{ lineHeight: 1.3 }}
											>
												{text}
											</Typography>
										</Stack>
									))}
								</Stack>
								<Typography
									variant="caption"
									component="a"
									href="#"
									sx={{
										display: "block",
										mt: 1.5,
										color: "primary.main",
										fontWeight: 600,
										textDecoration: "none",
									}}
								>
									{t("sidebar.learn_more")}
								</Typography>
							</Collapse>
						</Box>
					</Box>
				) : (
					<Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
						<Box
							sx={{
								bgcolor: "background.paper",
								p: 1,
								borderRadius: 1.5,
								boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
								display: "flex",
								border: "1px solid",
								borderColor: "divider",
							}}
						>
							<SolutionIcon sx={{ color: "#ef4444" }} />
						</Box>
					</Box>
				)}
				<Divider sx={{ mb: 1, opacity: 0.5 }} />
			</Box>

			{/* User Profile Section moved to bottom Box with margin auto */}
			<Box sx={{ p: 1.5, mb: 1 }}>
				<Stack
					direction="row"
					alignItems="center"
					justifyContent={open ? "space-between" : "center"}
					sx={{
						px: 1.5,
						py: 1,
						bgcolor: "action.hover",
						borderRadius: 2,
						cursor: "pointer",
					}}
					onClick={handleProfileClick}
				>
					<Stack
						direction="row"
						spacing={1.5}
						alignItems="center"
						justifyContent={open ? "start" : "center"}
						sx={{ flexGrow: 1, minWidth: 0 }}
					>
						<Avatar
							sx={{
								width: 40,
								height: 40,
								bgcolor: "#f97316",
								fontSize: "1rem",
								fontWeight: 600,
							}}
						>
							{userFirstLetter}
						</Avatar>
						{open && (
							<Box sx={{ minWidth: 0 }}>
								<Typography
									variant="subtitle2"
									sx={{
										fontWeight: 700,
										overflow: "hidden",
										textOverflow: "ellipsis",
										whiteSpace: "nowrap",
										color: "text.primary",
									}}
								>
									{userFullName}
								</Typography>
							</Box>
						)}
					</Stack>
					{open && (
						<Box sx={{ position: "relative" }}>
							<NotificationsIcon />
							{/* Red dot */}
							<Box
								sx={{
									position: "absolute",
									top: 2,
									right: 2,
									width: 8,
									height: 8,
									bgcolor: "error.main",
									borderRadius: "50%",
									border: "2px solid white",
								}}
							/>
						</Box>
					)}
				</Stack>
			</Box>
		</Box>
	);

	return (
		<Box sx={{ display: "flex", height: "100vh" }}>
			{/* Mobile Drawer */}
			{isMobile && (
				<MuiDrawer
					variant="temporary"
					open={mobileOpen}
					onClose={handleDrawerToggle}
					ModalProps={{
						keepMounted: true, // Better open performance on mobile.
					}}
					sx={{
						display: { xs: "block", md: "none" },
						"& .MuiDrawer-paper": {
							boxSizing: "border-box",
							width: DRAWER_WIDTH,
						},
					}}
				>
					{drawerContent}
				</MuiDrawer>
			)}

			{/* Desktop Drawer */}
			{!isMobile && (
				<Drawer
					variant="permanent"
					open={open}
				>
					{drawerContent}
				</Drawer>
			)}

			<Box
				component="main"
				sx={{
					flexGrow: 1,
					minWidth: 0, // Prevents flex child from overflowing
					// p:
					// 	location.pathname.includes("/templates/") ||
					// 	(location.pathname.includes("/campaigns/") &&
					// 		location.pathname.includes("/templates/"))
					// 		? 0
					// 		: 3,
					height: "100vh",
					overflow: "auto",
					display: "flex",
					flexDirection: "column",
				}}
			>
				<Outlet />
			</Box>
			<GlobalToast />
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
				<DialogActions sx={{ p: 2, py: 2 }}>
					<Button
						onClick={() => setLogoutDialogOpen(false)}
						color="inherit"
					>
						{t("common.cancel")}
					</Button>
					<Button
						onClick={() => {
							setLogoutDialogOpen(false);
							performLogout();
						}}
						variant="contained"
						color="error"
						autoFocus
					>
						{t("login.logout")}
					</Button>
				</DialogActions>
			</Dialog>
			<Popover
				open={profileOpen}
				anchorEl={profileAnchorEl}
				onClose={handleProfileClose}
				anchorOrigin={{
					vertical: "top",
					horizontal: "left",
				}}
				transformOrigin={{
					vertical: "bottom",
					horizontal: "left",
				}}
				PaperProps={{
					sx: {
						width: 320,
						mt: -1,
						borderRadius: 2,
						boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
						border: "1px solid",
						borderColor: "divider",
					},
				}}
			>
				<Box sx={{ p: 2 }}>
					{/* Main Account Info */}
					<Stack
						direction="row"
						spacing={2}
						alignItems="center"
						sx={{ mb: 2 }}
					>
						<Avatar
							sx={{
								width: 48,
								height: 48,
								bgcolor: "#f97316",
								fontSize: "1.2rem",
								fontWeight: 600,
							}}
						>
							{user ? userFirstLetter : "RH"}
						</Avatar>
						<Box sx={{ flexGrow: 1, minWidth: 0 }}>
							<Typography
								variant="subtitle1"
								sx={{ fontWeight: 700, lineHeight: 1.2 }}
							>
								{user ? userFullName : "MKT Ramond Holdings"}
							</Typography>
							<Typography
								variant="caption"
								color="text.secondary"
								sx={{ display: "block" }}
							>
								{user?.email || "phuctd@f1eco.com"}
							</Typography>
						</Box>
					</Stack>

					{/* Sign Out */}
					<ListItemButton
						onClick={() => {
							handleProfileClose();
							setLogoutDialogOpen(true);
						}}
						sx={{
							borderRadius: 1.5,
							mb: 1,
							color: "text.primary",
						}}
					>
						<ListItemIcon sx={{ minWidth: 32, mr: 1, color: "inherit" }}>
							<Logout fontSize="small" />
						</ListItemIcon>
						<ListItemText
							primary={t("login.logout")}
							primaryTypographyProps={{ variant: "body2", fontWeight: 600 }}
						/>
					</ListItemButton>

					<Divider sx={{ my: 1.5 }} />

					{/* Other Accounts */}
					<Stack spacing={0.5}>
						{[
							{
								name: "HR Finra",
								email: "phuctd@f1eco.com",
								initials: "FI",
							},
							{
								name: "HR Bolt Holdings",
								email: "thuydh@boltholdings.com.vn",
								initials: "FI",
							},
							{
								name: "Môi giới UPSC",
								email: "thanhnt@upsc.com.vn",
								initials: "FI",
							},
							{
								name: "Môi giới Bất Động Sản",
								email: "kiennt@boltx.com.vn",
								initials: "FI",
							},
						].map((acc, idx) => (
							<ListItemButton
								key={idx}
								sx={{ borderRadius: 1.5 }}
							>
								<ListItemIcon sx={{ minWidth: 32, mr: 1 }}>
									<Avatar
										sx={{
											width: 32,
											height: 32,
											fontSize: "0.75rem",
											bgcolor: "rgba(249, 115, 22, 0.15)",
											color: "#f97316",
										}}
									>
										{acc.initials}
									</Avatar>
								</ListItemIcon>
								<Box sx={{ minWidth: 0 }}>
									<Typography
										variant="body2"
										sx={{ fontWeight: 700, lineHeight: 1.2 }}
									>
										{acc.name}
									</Typography>
									<Typography
										variant="caption"
										color="text.secondary"
									>
										{acc.email}
									</Typography>
								</Box>
							</ListItemButton>
						))}
					</Stack>

					{/* Add Account */}
					<ListItemButton sx={{ mt: 1, borderRadius: 1.5 }}>
						<ListItemIcon sx={{ minWidth: 32, mr: 1, color: "primary.main" }}>
							<PersonAdd fontSize="small" />
						</ListItemIcon>
						<ListItemText
							primary="Add another account"
							primaryTypographyProps={{
								variant: "body2",
								fontWeight: 700,
								color: "primary.main",
							}}
						/>
					</ListItemButton>
				</Box>
			</Popover>
		</Box>
	);
}
