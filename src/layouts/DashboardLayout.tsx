import React, { useState } from "react";
import {
	AppBar,
	Box,
	Drawer,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Toolbar,
	Typography,
	useTheme,
	useMediaQuery,
} from "@mui/material";
import {
	Campaign,
	Contacts,
	Analytics,
	Menu as MenuIcon,
} from "@mui/icons-material";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

const DRAWER_WIDTH = 240;

const navigationItems = [
	{
		label: "Campaigns",
		icon: <Campaign />,
		path: "/campaigns",
	},
	{
		label: "Contacts",
		icon: <Contacts />,
		path: "/contacts",
	},
	{
		label: "Analytics",
		icon: <Analytics />,
		path: "/analytics",
	},
];

export default function DashboardLayout() {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("md"));
	const [mobileOpen, setMobileOpen] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();

	const handleDrawerToggle = () => {
		setMobileOpen(!mobileOpen);
	};

	const handleNavigation = (path: string) => {
		navigate(path);
		if (isMobile) {
			setMobileOpen(false);
		}
	};

	const drawer = (
		<Box>
			<Toolbar
				sx={{
					display: "flex",
					alignItems: "center",
					px: 2,
				}}
			>
				<img
					alt="logo-boltx"
					src="/assets/logo/Logo BoltX primary.svg"
					style={{ height: 32 }}
				/>
			</Toolbar>
			<List>
				{navigationItems.map((item) => {
					const isActive = location.pathname.startsWith(item.path);
					return (
						<ListItem
							key={item.path}
							disablePadding
						>
							<ListItemButton
								selected={isActive}
								onClick={() => handleNavigation(item.path)}
								sx={{
									"&.Mui-selected": {
										backgroundColor: "primary.main",
										color: "primary.contrastText",
										"&:hover": {
											backgroundColor: "primary.dark",
										},
										"& .MuiListItemIcon-root": {
											color: "primary.contrastText",
										},
									},
								}}
							>
								<ListItemIcon
									sx={{
										minWidth: 40,
									}}
								>
									{item.icon}
								</ListItemIcon>
								<ListItemText primary={item.label} />
							</ListItemButton>
						</ListItem>
					);
				})}
			</List>
		</Box>
	);

	return (
		<Box sx={{ display: "flex", height: "100vh" }}>
			<AppBar
				position="fixed"
				sx={{
					width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
					ml: { md: `${DRAWER_WIDTH}px` },
					zIndex: theme.zIndex.drawer + 1,
				}}
			>
				<Toolbar>
					{isMobile && (
						<Box
							component="button"
							onClick={handleDrawerToggle}
							sx={{
								mr: 2,
								background: "none",
								border: "none",
								cursor: "pointer",
								color: "inherit",
								display: "flex",
								alignItems: "center",
							}}
						>
							<MenuIcon />
						</Box>
					)}
					<Typography
						variant="h6"
						noWrap
						component="div"
					>
						Email Marketing Platform
					</Typography>
				</Toolbar>
			</AppBar>
			<Box
				component="nav"
				sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
			>
				{/* Mobile drawer */}
				<Drawer
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
					{drawer}
				</Drawer>
				{/* Desktop drawer */}
				<Drawer
					variant="permanent"
					sx={{
						display: { xs: "none", md: "block" },
						"& .MuiDrawer-paper": {
							boxSizing: "border-box",
							width: DRAWER_WIDTH,
						},
					}}
					open
				>
					{drawer}
				</Drawer>
			</Box>
			<Box
				component="main"
				sx={{
					flexGrow: 1,
					p: 3,
					width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
					mt: "64px",
					overflow: "auto",
				}}
			>
				<Outlet />
			</Box>
		</Box>
	);
}
