import React, { useState } from "react";
import {
	Box,
	Typography,
	Stack,
	Tabs,
	Tab,
	Paper,
	FormControl,
	FormLabel,
	RadioGroup,
	FormControlLabel,
	Radio,
	Select,
	MenuItem,
	Divider,
	Switch,
} from "@mui/material";
import {
	PaletteOutlined,
	LanguageOutlined,
	MonitorOutlined,
	DarkModeOutlined,
	LightModeOutlined,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
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
			{value === index && <Box sx={{ py: 3 }}>{children}</Box>}
		</div>
	);
}

export default function SettingsPage() {
	const { t } = useTranslation();
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
		<Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
			<Box sx={{ mb: 4 }}>
				<Typography
					variant="h4"
					sx={{ fontWeight: 800, mb: 1 }}
				>
					{t("settings.title")}
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
					borderRadius: 4,
					border: "1px solid",
					borderColor: "divider",
					overflow: "hidden",
				}}
			>
				<Box
					sx={{
						borderBottom: 1,
						borderColor: "divider",
						bgcolor: "action.hover",
					}}
				>
					<Tabs
						value={activeTab}
						onChange={handleTabChange}
						aria-label="settings tabs"
						sx={{
							px: 2,
							"& .MuiTab-root": {
								textTransform: "none",
								fontWeight: 700,
								fontSize: "0.95rem",
								minHeight: 64,
							},
						}}
					>
						<Tab
							icon={<PaletteOutlined sx={{ fontSize: 20 }} />}
							iconPosition="start"
							label={t("settings.appearance")}
						/>
						<Tab
							icon={<LanguageOutlined sx={{ fontSize: 20 }} />}
							iconPosition="start"
							label={t("settings.language_regional")}
						/>
					</Tabs>
				</Box>

				<Box sx={{ px: 4 }}>
					{/* Appearance Tab */}
					<CustomTabPanel
						value={activeTab}
						index={0}
					>
						<Stack spacing={4}>
							<Box>
								<FormLabel
									sx={{
										fontWeight: 700,
										color: "text.primary",
										mb: 2,
										display: "block",
									}}
								>
									{t("settings.theme_mode")}
								</FormLabel>
								<RadioGroup
									row
									value={themeMode}
									onChange={(e) => setThemeMode(e.target.value as ThemeMode)}
								>
									<Stack
										direction="row"
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
											<FormControlLabel
												key={mode.value}
												value={mode.value}
												control={<Radio sx={{ display: "none" }} />}
												label={
													<Box
														sx={{
															px: 3,
															py: 2,
															borderRadius: 3,
															border: "2px solid",
															borderColor:
																themeMode === mode.value
																	? "primary.main"
																	: "divider",
															bgcolor:
																themeMode === mode.value
																	? "primary.main" + "08"
																	: "transparent",
															display: "flex",
															flexDirection: "column",
															alignItems: "center",
															gap: 1,
															minWidth: 100,
															cursor: "pointer",
															transition: "all 0.2s",
															"&:hover": { borderColor: "primary.main" },
														}}
													>
														{mode.icon}
														<Typography
															variant="body2"
															sx={{ fontWeight: 600 }}
														>
															{mode.label}
														</Typography>
													</Box>
												}
											/>
										))}
									</Stack>
								</RadioGroup>
							</Box>

							<Divider />

							<Box>
								<Stack
									direction="row"
									justifyContent="space-between"
									alignItems="center"
								>
									<Box>
										<Typography
											variant="body1"
											sx={{ fontWeight: 700 }}
										>
											{t("settings.density")}
										</Typography>
										<Typography
											variant="body2"
											color="text.secondary"
										>
											{t("settings.comfortable")} / {t("settings.compact")}
										</Typography>
									</Box>
									<Select
										size="small"
										value={displayDensity}
										onChange={(e) => setDisplayDensity(e.target.value as any)}
										sx={{ minWidth: 150, borderRadius: 2 }}
									>
										<MenuItem value="comfortable">
											{t("settings.comfortable")}
										</MenuItem>
										<MenuItem value="compact">{t("settings.compact")}</MenuItem>
									</Select>
								</Stack>
							</Box>

							<Divider />

							<Box>
								<Stack
									direction="row"
									justifyContent="space-between"
									alignItems="center"
								>
									<Box>
										<Typography
											variant="body1"
											sx={{ fontWeight: 700 }}
										>
											{t("settings.collapse_sidebar")}
										</Typography>
										<Typography
											variant="body2"
											color="text.secondary"
										>
											{t("settings.collapse_sidebar")}
										</Typography>
									</Box>
									<Switch
										checked={sidebarCollapsed}
										onChange={(e) => setSidebarCollapsed(e.target.checked)}
									/>
								</Stack>
							</Box>
						</Stack>
					</CustomTabPanel>

					{/* Language & Regional Tab */}
					<CustomTabPanel
						value={activeTab}
						index={1}
					>
						<Stack spacing={4}>
							<Box>
								<Stack
									direction="row"
									justifyContent="space-between"
									alignItems="center"
								>
									<Box>
										<Typography
											variant="body1"
											sx={{ fontWeight: 700 }}
										>
											{t("settings.app_language")}
										</Typography>
										<Typography
											variant="body2"
											color="text.secondary"
										>
											{t("settings.app_language")}
										</Typography>
									</Box>
									<Select
										size="small"
										value={language}
										onChange={(e) => setLanguage(e.target.value as Language)}
										sx={{ minWidth: 150, borderRadius: 2 }}
									>
										<MenuItem value="en">English (US)</MenuItem>
										<MenuItem value="vi">Tiếng Việt</MenuItem>
									</Select>
								</Stack>
							</Box>

							<Divider />

							<Box>
								<Stack
									direction="row"
									justifyContent="space-between"
									alignItems="center"
								>
									<Box>
										<Typography
											variant="body1"
											sx={{ fontWeight: 700 }}
										>
											{t("settings.time_format")}
										</Typography>
										<Typography
											variant="body2"
											color="text.secondary"
										>
											{t("settings.time_format")}
										</Typography>
									</Box>
									<Select
										size="small"
										value={timeFormat}
										onChange={(e) => setTimeFormat(e.target.value as any)}
										sx={{ minWidth: 150, borderRadius: 2 }}
									>
										<MenuItem value="12h">12-hour (AM/PM)</MenuItem>
										<MenuItem value="24h">24-hour</MenuItem>
									</Select>
								</Stack>
							</Box>

							<Divider />

							<Box>
								<Stack
									direction="row"
									justifyContent="space-between"
									alignItems="center"
								>
									<Box>
										<Typography
											variant="body1"
											sx={{ fontWeight: 700 }}
										>
											{t("settings.date_format")}
										</Typography>
										<Typography
											variant="body2"
											color="text.secondary"
										>
											{t("settings.date_format")}
										</Typography>
									</Box>
									<Select
										size="small"
										value={dateFormat}
										onChange={(e) => setDateFormat(e.target.value)}
										sx={{ minWidth: 150, borderRadius: 2 }}
									>
										<MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
										<MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
										<MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
									</Select>
								</Stack>
							</Box>
						</Stack>
					</CustomTabPanel>
				</Box>
			</Paper>
		</Box>
	);
}
