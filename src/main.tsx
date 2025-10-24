import React from "react";
import ReactDOM from "react-dom/client";
import "./main.css";

import { CssBaseline, ThemeProvider } from "@mui/material";

import App from "./App";
import theme from "./theme";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import MainLayout from "./components/layouts";
import TemplateDetailPage from "./App/TemplateDetailPage";
import CampaignListPage from "./App/CampaignListPage";
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
						<Route
							path="/"
							element={<MainLayout />}
						>
							<Route
								index
								element={<App />}
							/>
							{/* chi tiết template */}
							<Route
								path="templates/:id"
								element={<TemplateDetailPage />}
							/>

							{/* Danh sách campaign */}
							<Route
								path="campaigns"
								element={<CampaignListPage />}
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
