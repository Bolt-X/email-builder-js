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
import ContactListDetailPage from "./modules/contacts/components/ContactListDetailPage";
import AnalyticsDashboard from "./modules/analytics/components/AnalyticsDashboard";
import AuthLayout from "./components/layouts/AuthLayout";
import LoginPage from "./App/LoginPage";
import PrivateRoute from "./components/PrivateRoute";
import NotFoundPage from "./App/NotFoundPage";

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
							{/* Campaign routes */}
							<Route
								path="campaigns"
								element={<CampaignListPage />}
							/>
							{/* Campaign Edit Page */}
							<Route
								path="campaigns/:id"
								element={<CampaignEditPage />}
							/>
							{/* Template editing from campaign context */}
							<Route
								path="campaigns/:campaignId/templates/:templateId"
								element={<TemplateDetailPage />}
							/>
							{/* Contacts routes */}
							<Route
								path="contacts"
								element={<ContactListPage />}
							/>
							<Route
								path="contacts/lists/:id"
								element={<ContactListDetailPage />}
							/>
							{/* Analytics route */}
							<Route
								path="analytics"
								element={<AnalyticsDashboard />}
							/>
							{/* Default redirect to campaigns */}
							<Route
								index
								element={
									<Navigate
										to="/campaigns"
										replace
									/>
								}
							/>
						</Route>

						{/* Legacy template routes - keep for backward compatibility */}
						<Route
							path="/legacy"
							element={<MainLayout />}
						>
							<Route
								index
								element={<App />}
							/>
							<Route
								path="templates/:id"
								element={<TemplateDetailPage />}
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
