import React from "react";
import ReactDOM from "react-dom/client";
import "./main.css";

import { CssBaseline, ThemeProvider } from "@mui/material";

import App from "./App";
import theme from "./theme";
import { BrowserRouter, Routes, Route } from "react-router";
import MainLayout from "./components/layouts";
import TemplateDetailPage from "./App/TemplateDetailPage";
import CampaignListPage from "./App/CampaignListPage";

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<BrowserRouter>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<Routes>
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
				</Routes>
			</ThemeProvider>
		</BrowserRouter>
	</React.StrictMode>
);
