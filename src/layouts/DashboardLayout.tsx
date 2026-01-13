import React, { useState } from "react";
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
} from "@mui/material";
import {
	SpaceDashboardOutlined,
	SendOutlined,
	TopicOutlined,
	ImageOutlined,
	PeopleAltOutlined,
	SettingsOutlined,
	ChevronLeft,
	ChevronRight,
	Menu as MenuIcon,
	ExpandLess,
	ExpandMore,
} from "@mui/icons-material";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

const DRAWER_WIDTH = 240;
const COLLAPSED_WIDTH = 65; // Adjust based on design

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
}));

const navigationItems = [
	{
		label: "Dashboard",
		icon: <SpaceDashboardOutlined />,
		path: "/",
	},
	{
		label: "Campaigns",
		icon: <SendOutlined />,
		path: "/campaigns",
		children: [
			{
				label: "All Campaigns",
				path: "/campaigns",
			},
			{
				label: "Templates",
				path: "/templates", // Keeping global route for now, but linked here
			},
			{
				label: "Media",
				path: "/media",
			},
		],
	},
	{
		label: "Contacts",
		icon: <PeopleAltOutlined />,
		path: "/contacts",
	},
	{
		label: "Settings",
		icon: <SettingsOutlined />,
		path: "/settings",
	},
];

export default function DashboardLayout() {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("md"));
	const [open, setOpen] = useState(true);
	const [mobileOpen, setMobileOpen] = useState(false);
	// State to track open menus (e.g. Campaigns)
	const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
		Campaigns: true, // Default open or closed? Let's default open for visibility
	});
	const navigate = useNavigate();
	const location = useLocation();

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
		hasChildren: boolean
	) => {
		if (hasChildren) {
			// If collapsed, open sidebar first
			if (!open && !isMobile) {
				setOpen(true);
				// Add delay before opening menu? No, instantaneous is better.
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
				location.pathname.startsWith(child.path)
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
					px: [1],
					minHeight: 64,
				}}
			>
				{open && (
					<img
						alt="logo-boltx"
						src="/assets/logo/Logo BoltX primary.svg"
						style={{ height: 32, marginLeft: 12 }}
					/>
				)}
				{!open && (
					<img
						alt="logo-boltx-small"
						src="/assets/logo/Logo BoltX primary.svg" // Replace with icon only logo if available
						style={{ height: 32 }}
					/>
				)}
				{!isMobile && open && (
					<IconButton onClick={handleDrawerToggle}>
						<ChevronLeft />
					</IconButton>
				)}
			</Toolbar>

			<Box sx={{ flexGrow: 1, mt: 2 }}>
				<List>
					{navigationItems.map((item) => {
						const hasChildren = !!item.children;
						const isMenuOpen = openMenus[item.label];

						// Active Check
						let isActive = false;
						if (item.path === "/") {
							isActive = location.pathname === "/";
						} else {
							// If it has children, checking if parent path starts matches might be weak if children paths are different (e.g. templates)
							// Check item path matches OR any child matches
							isActive =
								location.pathname.startsWith(item.path) ||
								(hasChildren && isChildActive(item));
						}

						// Special check for Campaigns parent when exactly on campaigns list
						// If we are on /campaigns, both "Campaigns" parent and "All Campaigns" child match.

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
											selected={isActive && !hasChildren} // Only highlight parent if no children, OR if we want parent highlight when child active? Usually parent is highlighted too. Let's try highlighting parent if any child active or itself active.
											// Actually, if child active, parent styling might differ.
											// Let's stick to standard behavior: Parent highlighted if itself or child active.
											onClick={() =>
												handleMenuClick(item.label, item.path, hasChildren)
											}
											sx={{
												minHeight: 48,
												justifyContent: open ? "initial" : "center",
												px: 2.5,
												mx: 1.5,
												borderRadius: 2,
												mb: 0.5,
												"&.Mui-selected": {
													backgroundColor: "primary.main",
													color: "primary.contrastText",
													"&:hover": {
														backgroundColor: "primary.dark",
													},
													"& .MuiListItemIcon-root": {
														color: "primary.contrastText",
													},
													// Reset text color for expand icon
													"& .MuiSvgIcon-root": {
														color: "primary.contrastText",
													},
												},
												// Handle parent active state visually distinct?
												...(hasChildren &&
													isActive && {
														backgroundColor: "rgba(0, 0, 0, 0.04)",
														"&.Mui-selected": {
															backgroundColor: "rgba(0, 0, 0, 0.08)",
															color: "primary.main",
															"& .MuiListItemIcon-root": {
																color: "primary.main",
															},
															"& .MuiSvgIcon-root": {
																color: "primary.main",
															},
														},
													}),
											}}
										>
											<ListItemIcon
												sx={{
													minWidth: 0,
													mr: open ? 2 : "auto",
													justifyContent: "center",
													color: isActive ? "inherit" : "text.secondary",
												}}
											>
												{item.icon}
											</ListItemIcon>
											<ListItemText
												primary={item.label}
												sx={{ opacity: open ? 1 : 0 }}
												primaryTypographyProps={{
													fontWeight: isActive ? 600 : 400,
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
												const isChildActive =
													location.pathname === child.path ||
													(child.path !== "/" &&
														location.pathname.startsWith(child.path) &&
														child.path !== "/campaigns");
												// Refined active check:
												// If child.path is /campaigns, only active if exactly /campaigns or /campaigns/new etc?
												// Note: /campaigns is also parent path.
												// Let's use simple startsWith but careful with overlaps.
												const isSelected =
													location.pathname === child.path ||
													(location.pathname.startsWith(child.path) &&
														child.path !== "/campaigns" &&
														child.path !== "/");

												// Special override for "All Campaigns" (/campaigns) vs "Templates" (/templates)
												const isDeepActive = location.pathname.startsWith(
													child.path
												);

												return (
													<ListItemButton
														key={child.label}
														sx={{
															pl: 6,
															ml: 3.5,
															mr: 1.5,
															borderRadius: 2,
															mb: 0.5,
															"&.Mui-selected": {
																bgcolor: "primary.main",
																color: "primary.contrastText",
																fontWeight: "bold",
																"&:hover": {
																	backgroundColor: "primary.dark",
																},
															},
														}}
														selected={isDeepActive}
														onClick={() => handleNavigation(child.path)}
													>
														<ListItemText primary={child.label} />
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

			{/* Toggle button for desktop at bottom if preferred, or use the one in header */}
			{!isMobile && !open && (
				<Box sx={{ display: "flex", justifyContent: "center", p: 1 }}>
					<IconButton onClick={handleDrawerToggle}>
						<ChevronRight />
					</IconButton>
				</Box>
			)}
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
					p:
						location.pathname.includes("/templates/") ||
						(location.pathname.includes("/campaigns/") &&
							location.pathname.includes("/templates/"))
							? 0
							: 3,
					width: {
						md: `calc(100% - ${open ? DRAWER_WIDTH : COLLAPSED_WIDTH}px)`,
					},
					height: "100vh",
					overflow: "auto",
					display: "flex",
					flexDirection: "column",
					transition: theme.transitions.create("width", {
						easing: theme.transitions.easing.sharp,
						duration: theme.transitions.duration.enteringScreen,
					}),
				}}
			>
				<Outlet />
			</Box>
		</Box>
	);
}
