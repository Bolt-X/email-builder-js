import React, { useState } from "react";
import {
	Box,
	Button,
	TextField,
	Typography,
	Paper,
	CircularProgress,
	Alert,
	IconButton,
	InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../contexts/auth";

export default function LoginPage() {
	const { t } = useTranslation();
	const theme = useTheme();
	const isDark = theme.palette.mode === "dark";
	const navigate = useNavigate();
	const login = useAuthStore((s) => s.login);

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setLoading(true);
		try {
			await login(email, password);
			navigate("/");
		} catch (err: any) {
			setError(err?.errors?.[0]?.message || t("login.error_invalid"));
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box
			sx={{
				position: "relative",
				height: "100vh",
				width: "100%",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				overflow: "hidden",
			}}
		>
			<Box
				sx={{
					position: "absolute",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					backgroundImage:
						"url(/assets/images/campaigns_list_page_screenshot.png)",
					backgroundSize: "cover",
					backgroundPosition: "center",
					filter: "blur(10px)",
					transform: "scale(1.1)", // scale up slightly to hide blurred edges
					zIndex: -1,
					"&::after": {
						content: '""',
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						bgcolor: isDark ? "rgba(0, 0, 0, 0.6)" : "rgba(0, 0, 0, 0.2)", // Darker overlay in dark mode
					},
				}}
			/>
			<Paper
				elevation={4}
				sx={{
					p: 4,
					borderRadius: 3,
					width: "100%",
					maxWidth: 400,
					textAlign: "center",
				}}
			>
				<Typography
					variant="h5"
					sx={{ mb: 3, fontWeight: 600 }}
				>
					{t("login.title")}
				</Typography>

				{error && (
					<Alert
						severity="error"
						sx={{ mb: 2 }}
					>
						{error}
					</Alert>
				)}

				<form onSubmit={handleSubmit}>
					<TextField
						label={t("login.email")}
						type="email"
						autoComplete="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						fullWidth
						required
						sx={{ mb: 2 }}
					/>
					<TextField
						label={t("login.password")}
						type={showPassword ? "text" : "password"}
						autoComplete="current-password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						fullWidth
						required
						sx={{ mb: 3 }}
						InputProps={{
							endAdornment: (
								<InputAdornment position="end">
									<IconButton onClick={() => setShowPassword((prev) => !prev)}>
										{showPassword ? (
											<VisibilityOff fontSize="small" />
										) : (
											<Visibility fontSize="small" />
										)}
									</IconButton>
								</InputAdornment>
							),
						}}
					/>

					<Button
						type="submit"
						variant="contained"
						color="primary"
						fullWidth
						disabled={loading}
						sx={{ py: 1.2 }}
					>
						{loading ? (
							<CircularProgress
								size={24}
								color="inherit"
							/>
						) : (
							t("login.submit")
						)}
					</Button>
				</form>
			</Paper>
		</Box>
	);
}
