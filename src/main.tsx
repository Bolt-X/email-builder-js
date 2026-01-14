import React from "react";
import ReactDOM from "react-dom/client";
import "./main.css";

import { CssBaseline, ThemeProvider } from "@mui/material";

import App from "./App";
import theme from "./theme";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import MainLayout from "./components/layouts";
import DashboardLayout from "./layouts/DashboardLayout";
import TemplateDetailPage from "./App/TemplateDetailPage";
import CampaignListPage from "./App/CampaignListPage";
import CampaignEditPage from "./modules/campaigns/components/CampaignEditPage/CampaignEditPage";
import ContactListPage from "./modules/contacts/components/ContactListPage/ContactListPage";
import SegmentsTable from "./modules/contacts/components/ContactListPage/SegmentsTable";
import ContactListDetailPage from "./modules/contacts/components/ContactListDetailPage";
import AnalyticsDashboard from "./modules/analytics/components/AnalyticsDashboard";
import AuthLayout from "./components/layouts/AuthLayout";
import LoginPage from "./App/LoginPage";
import PrivateRoute from "./components/PrivateRoute";
import NotFoundPage from "./App/NotFoundPage";

import DashboardPage from "./modules/dashboard/components/DashboardPage";
import TemplatesPage from "./modules/templates/components/TemplatesPage";
import MediaPage from "./modules/media/components/MediaPage";
import SettingsPage from "./modules/settings/components/SettingsPage";
import CampaignsLayout from "./modules/campaigns/components/CampaignsLayout";
import CampaignCreatePage from "./modules/campaigns/components/CampaignCreatePage/CampaignCreatePage";

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<BrowserRouter>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<Routes>
					<Route element={<PrivateRoute />}>
						{/* Dashboard routes with new layout */}
						<Route
							path="/"
							element={<DashboardLayout />}
						>
							<Route
								index
								element={<DashboardPage />}
							/>

							<Route
								path="media"
								element={<MediaPage />}
							/>

							{/* Campaign routes wrapper with Tabs */}
							<Route
								path="campaigns"
								element={<CampaignListPage />}
							/>
							<Route
								path="campaigns/new"
								element={<CampaignCreatePage />}
							/>
							<Route
								path="campaigns/:id"
								element={<CampaignEditPage />}
							/>
							<Route
								path="templates"
								element={<TemplatesPage />}
							/>
							<Route
								path="templates/:id"
								element={<TemplateDetailPage />}
							/>
							{/* Template editing from campaign context */}
							<Route
								path="campaigns/:campaignId/templates/:templateId"
								element={<TemplateDetailPage />}
							/>

							{/* Contacts routes */}
							<Route path="contacts">
								<Route
									index
									element={<ContactListPage />}
								/>
								<Route
									path=":id"
									element={<ContactListDetailPage />}
								/>
							</Route>
							<Route
								path="segments"
								element={<SegmentsTable />}
							/>
							<Route
								path="settings"
								element={<SettingsPage />}
							/>
							{/* Analytics route */}
							<Route
								path="analytics"
								element={<AnalyticsDashboard />}
							/>
						</Route>

						{/* MainLayout routes can be kept for other purposes or removed if not needed */}
						<Route
							path="/editor-only"
							element={<MainLayout />}
						>
							<Route
								index
								element={<App />}
							/>
						</Route>
					</Route>

					<Route
						path="auth"
						element={<AuthLayout />}
					>
						<Route
							index
							element={
								<Navigate
									to="login"
									replace
								/>
							}
						/>
						<Route
							path="login"
							element={<LoginPage />}
						/>
						{/* <Route
							path="signup"
							element={<SignupPage />}
						/> */}
					</Route>
					<Route
						path="*"
						element={<NotFoundPage />}
					/>
				</Routes>
			</ThemeProvider>
		</BrowserRouter>
	</React.StrictMode>
);
