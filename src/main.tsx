import React from "react";
import ReactDOM from "react-dom/client";

import { CssBaseline, ThemeProvider } from "@mui/material";

import App from "./App";
import theme from "./theme";
import { BrowserRouter, Routes, Route } from "react-router";

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<BrowserRouter>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<Routes>
					<Route
						path="/"
						element={<App />}
					/>
				</Routes>
			</ThemeProvider>
		</BrowserRouter>
	</React.StrictMode>
);
