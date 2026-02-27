import React, { useState } from "react";
import {
	Box,
	Typography,
	Stack,
	Tabs,
	Tab,
	Paper,
	FormLabel,
	RadioGroup,
	FormControlLabel,
	Radio,
	Select,
	MenuItem,
	Divider,
	Switch,
	Grid,
	IconButton,
} from "@mui/material";
import {
	PaletteOutlined,
	LanguageOutlined,
	MonitorOutlined,
	DarkModeOutlined,
	LightModeOutlined,
	ArrowBack,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useSettingsStore, ThemeMode, Language } from "../store";

interface TabPanelProps {
	children?: React.ReactNode;
	index: number;
	value: number;
}

function CustomTabPanel(props: TabPanelProps) {
	const { children, value, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`settings-tabpanel-${index}`}
			aria-labelledby={`settings-tab-${index}`}
			{...other}
		>
			{value === index && <Box sx={{ py: 4 }}>{children}</Box>}
		</div>
	);
}

export default function SettingsPage() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState(0);
	const {
		themeMode,
		setThemeMode,
		language,
		setLanguage,
		displayDensity,
		setDisplayDensity,
		timeFormat,
		setTimeFormat,
		dateFormat,
		setDateFormat,
		sidebarCollapsed,
		setSidebarCollapsed,
	} = useSettingsStore();

	const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
		setActiveTab(newValue);
	};

	return (
		<Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
			{/* Header - Styled like Campaign Pages */}
			<Stack
				direction="row"
				alignItems="center"
				justifyContent="space-between"
				spacing={2}
				sx={{
					px: 3,
					py: 2,
					height: 64,
					backgroundColor: "background.paper",
					borderBottom: 1,
					borderColor: "divider",
					position: "sticky",
					top: 0,
					zIndex: 10,
				}}
			>
				<Typography
					variant="h4"
					sx={{ fontWeight: 600, color: "text.primary" }}
				>
					{t("settings.title")}
				</Typography>
			</Stack>

			{/* Main Content Area */}
			<Grid
				container
				spacing={0}
				sx={{ height: "calc(100vh - 64px)" }}
			>
				{/* Left Sidebar Tabs */}
				<Grid
					item
					xs={12}
					md={2}
					sx={{
						borderRight: "1px solid",
						borderColor: "divider",
						bgcolor: "background.paper",
					}}
				>
					<Tabs
						orientation="vertical"
						value={activeTab}
						onChange={handleTabChange}
						sx={{
							marginTop: 2,
							"& .MuiTab-root": {
								alignItems: "flex-start",
								textAlign: "left",
								justifyContent: "flex-start",
								px: 3,
								py: 1.5,
								minHeight: 48,
								textTransform: "none",
								fontWeight: 500,
								fontSize: "0.9rem",
								color: "text.secondary",
								borderRight: "2px solid transparent",
								"&.Mui-selected": {
									color: "primary.main",
									bgcolor: "primary.main" + "08",
									fontWeight: 600,
								},
							},
							"& .MuiTabs-indicator": {
								right: 0,
								left: "auto",
								width: 3,
								backgroundColor: "primary.main",
								borderRadius: "4px 0 0 4px",
							},
						}}
					>
						<Tab
							icon={<PaletteOutlined sx={{ mr: 1.5, fontSize: 20 }} />}
							iconPosition="start"
							label={t("settings.appearance")}
						/>
						<Tab
							icon={<LanguageOutlined sx={{ mr: 1.5, fontSize: 20 }} />}
							iconPosition="start"
							label={t("settings.language_regional")}
						/>
					</Tabs>
				</Grid>

				{/* Right Content Panels */}
				<Grid
					item
					xs={12}
					md={10}
					sx={{
						height: "100%",
						overflow: "auto",
						p: { xs: 3, md: 6 },
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
					}}
				>
					<Box sx={{ maxWidth: 800, width: "100%" }}>
						<Box sx={{ mb: 4 }}>
							<Typography
								variant="h4"
								sx={{ fontWeight: 800, mb: 1 }}
							>
								{activeTab === 0
									? t("settings.appearance")
									: t("settings.language_regional")}
							</Typography>
							<Typography
								variant="body1"
								color="text.secondary"
							>
								{t("settings.subtitle")}
							</Typography>
						</Box>

						<Paper
							elevation={0}
							sx={{
								p: 4,
								borderRadius: 4,
								border: "1px solid",
								borderColor: "divider",
								bgcolor: "background.paper",
							}}
						>
							{/* Appearance Tab Content */}
							<CustomTabPanel
								value={activeTab}
								index={0}
							>
								<Stack spacing={5}>
									{/* Theme Section */}
									<Box>
										<Typography
											variant="subtitle1"
											sx={{ fontWeight: 800, mb: 2.5 }}
										>
											{t("settings.theme_mode")}
										</Typography>
										<Grid
											container
											spacing={2}
										>
											{[
												{
													label: t("settings.light"),
													value: "light",
													icon: <LightModeOutlined />,
												},
												{
													label: t("settings.dark"),
													value: "dark",
													icon: <DarkModeOutlined />,
												},
												{
													label: t("settings.system"),
													value: "system",
													icon: <MonitorOutlined />,
												},
											].map((mode) => (
												<Grid
													item
													xs={4}
													key={mode.value}
												>
													<Box
														onClick={() =>
															setThemeMode(mode.value as ThemeMode)
														}
														sx={{
															p: 2.5,
															borderRadius: 3,
															border: "2px solid",
															borderColor:
																themeMode === mode.value
																	? "primary.main"
																	: "divider",
															bgcolor:
																themeMode === mode.value
																	? "primary.main" + "08"
																	: "background.default",
															display: "flex",
															flexDirection: "column",
															alignItems: "center",
															gap: 1.5,
															cursor: "pointer",
															transition: "all 0.2s ease",
															"&:hover": {
																borderColor: "primary.main",
																transform: "translateY(-2px)",
															},
														}}
													>
														<Box
															sx={{
																color:
																	themeMode === mode.value
																		? "primary.main"
																		: "text.secondary",
															}}
														>
															{React.cloneElement(
																mode.icon as React.ReactElement,
																{
																	sx: { fontSize: 24 },
																},
															)}
														</Box>
														<Typography
															variant="body2"
															sx={{ fontWeight: 700 }}
														>
															{mode.label}
														</Typography>
													</Box>
												</Grid>
											))}
										</Grid>
									</Box>

									<Divider />

									{/* Density Section */}
									<Stack
										direction="row"
										justifyContent="space-between"
										alignItems="center"
									>
										<Box>
											<Typography
												variant="subtitle1"
												sx={{ fontWeight: 800 }}
											>
												{t("settings.density")}
											</Typography>
											<Typography
												variant="body2"
												color="text.secondary"
											>
												Adjust the information density of the interface
											</Typography>
										</Box>
										<Select
											size="small"
											value={displayDensity}
											onChange={(e) => setDisplayDensity(e.target.value as any)}
											sx={{
												minWidth: 160,
												borderRadius: 2,
												bgcolor: "background.default",
											}}
										>
											<MenuItem value="comfortable">
												{t("settings.comfortable")}
											</MenuItem>
											<MenuItem value="compact">
												{t("settings.compact")}
											</MenuItem>
										</Select>
									</Stack>

									<Divider />

									{/* Sidebar Section */}
									<Stack
										direction="row"
										justifyContent="space-between"
										alignItems="center"
									>
										<Box>
											<Typography
												variant="subtitle1"
												sx={{ fontWeight: 800 }}
											>
												{t("settings.collapse_sidebar")}
											</Typography>
											<Typography
												variant="body2"
												color="text.secondary"
											>
												Start with the navigation menu collapsed
											</Typography>
										</Box>
										<Switch
											checked={sidebarCollapsed}
											onChange={(e) => setSidebarCollapsed(e.target.checked)}
										/>
									</Stack>
								</Stack>
							</CustomTabPanel>

							{/* Language & Regional Tab Content */}
							<CustomTabPanel
								value={activeTab}
								index={1}
							>
								<Stack spacing={5}>
									<Stack
										direction="row"
										justifyContent="space-between"
										alignItems="center"
									>
										<Box>
											<Typography
												variant="subtitle1"
												sx={{ fontWeight: 800 }}
											>
												{t("settings.app_language")}
											</Typography>
											<Typography
												variant="body2"
												color="text.secondary"
											>
												Select the language for the dashboard
											</Typography>
										</Box>
										<Select
											size="small"
											value={language}
											onChange={(e) => setLanguage(e.target.value as Language)}
											sx={{
												minWidth: 160,
												borderRadius: 2,
												bgcolor: "background.default",
											}}
										>
											<MenuItem value="en">English (US)</MenuItem>
											<MenuItem value="vi">Tiếng Việt</MenuItem>
										</Select>
									</Stack>

									<Divider />

									<Stack
										direction="row"
										justifyContent="space-between"
										alignItems="center"
									>
										<Box>
											<Typography
												variant="subtitle1"
												sx={{ fontWeight: 800 }}
											>
												{t("settings.time_format")}
											</Typography>
											<Typography
												variant="body2"
												color="text.secondary"
											>
												Set your preferred time display style
											</Typography>
										</Box>
										<Select
											size="small"
											value={timeFormat}
											onChange={(e) => setTimeFormat(e.target.value as any)}
											sx={{
												minWidth: 160,
												borderRadius: 2,
												bgcolor: "background.default",
											}}
										>
											<MenuItem value="12h">12-hour (AM/PM)</MenuItem>
											<MenuItem value="24h">24-hour</MenuItem>
										</Select>
									</Stack>

									<Divider />

									<Stack
										direction="row"
										justifyContent="space-between"
										alignItems="center"
									>
										<Box>
											<Typography
												variant="subtitle1"
												sx={{ fontWeight: 800 }}
											>
												{t("settings.date_format")}
											</Typography>
											<Typography
												variant="body2"
												color="text.secondary"
											>
												Select your preferred date format
											</Typography>
										</Box>
										<Select
											size="small"
											value={dateFormat}
											onChange={(e) => setDateFormat(e.target.value)}
											sx={{
												minWidth: 160,
												borderRadius: 2,
												bgcolor: "background.default",
											}}
										>
											<MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
											<MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
											<MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
										</Select>
									</Stack>
								</Stack>
							</CustomTabPanel>
						</Paper>
					</Box>
				</Grid>
			</Grid>
		</Box>
	);
}
