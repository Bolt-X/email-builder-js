import React, { useState } from "react";
import {
	Box,
	Button,
	TextField,
	Typography,
	CircularProgress,
	Alert,
	IconButton,
	InputAdornment,
	Stack,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../contexts/auth";
import { useTheme } from "@mui/material/styles";

export default function LoginPage() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const login = useAuthStore((s) => s.login);
	const theme = useTheme();
	const isDark = theme.palette.mode === "dark";

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
				height: "100vh",
				width: "100%",
				display: "flex",
				bgcolor: isDark ? "#000000" : "#ffffff",
				overflow: "hidden",
				position: "relative",
			}}
		>
			{/* Keyframes for Morphing Background */}
			<style>
				{`
          @keyframes move1 {
            0% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30%, 20%) scale(1.1); }
            66% { transform: translate(-10%, 40%) scale(0.9); }
            100% { transform: translate(0, 0) scale(1); }
          }
          @keyframes move2 {
            0% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(-20%, -30%) scale(0.9); }
            66% { transform: translate(40%, -10%) scale(1.2); }
            100% { transform: translate(0, 0) scale(1); }
          }
          @keyframes move3 {
            0% { transform: translate(0, 0) scale(1.1); }
            33% { transform: translate(20%, -40%) scale(1); }
            66% { transform: translate(-30%, -20%) scale(0.9); }
            100% { transform: translate(0, 0) scale(1.1); }
          }
        `}
			</style>

			{/* Left Side - Login Form */}
			<Box
				sx={{
					flex: { xs: 1, md: 0.35 },
					minWidth: { md: 420 },
					bgcolor: isDark ? "#121212" : "white",
					p: { xs: 4, md: 6 },
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between",
					position: "relative",
					zIndex: 10,
					boxShadow: isDark
						? "10px 0 30px rgba(0,0,0,0.5)"
						: "10px 0 30px rgba(0,0,0,0.02)",
				}}
			>
				{/* Top Logo Section */}
				<Box>
					<Stack
						direction="row"
						spacing={1.5}
						alignItems="center"
					>
						<Box
							sx={{
								width: 40,
								height: 40,
								bgcolor: isDark ? "#f97316" : "#111827",
								borderRadius: 1.5,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								color: "white",
								fontWeight: "bold",
								fontSize: "0.8rem",
								boxShadow: "0 4px 12px rgba(249, 115, 22, 0.2)",
							}}
						>
							<img
								src="/assets/logo/Logo BoltX primary.svg"
								alt="Bolt"
								style={{
									width: 24,
									height: 24,
									filter: isDark ? "brightness(0) invert(1)" : "none",
								}}
							/>
						</Box>
						<Box>
							<Typography
								variant="subtitle1"
								sx={{
									fontWeight: 800,
									color: isDark ? "white" : "#111827",
									lineHeight: 1.2,
								}}
							>
								{t("login.platform")}
							</Typography>
							<Typography
								variant="caption"
								sx={{ color: isDark ? "#64748b" : "#94a3b8", fontWeight: 600 }}
							>
								{t("login.app_label")}
							</Typography>
						</Box>
					</Stack>
				</Box>

				{/* Center Form Section */}
				<Box sx={{ maxWidth: 400, width: "100%", mx: "auto" }}>
					<Typography
						variant="h2"
						sx={{
							mb: 4,
							fontWeight: 800,
							color: isDark ? "white" : "#1e293b",
							letterSpacing: "-0.02em",
						}}
					>
						{t("login.title")}
					</Typography>

					{error && (
						<Alert
							severity="error"
							sx={{ mb: 3, borderRadius: 2 }}
						>
							{error}
						</Alert>
					)}

					<form onSubmit={handleSubmit}>
						<Stack spacing={2.5}>
							<Box>
								<TextField
									placeholder={t("login.email")}
									type="email"
									autoComplete="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									fullWidth
									required
									variant="outlined"
									sx={{
										"& .MuiOutlinedInput-root": {
											bgcolor: isDark ? "#1e1e1e" : "#f0f7ff",
											borderRadius: 3,
											"& fieldset": { borderColor: "transparent" },
											"&:hover fieldset": {
												borderColor: isDark ? "#3b82f6" : "#bfdbfe",
											},
											"&.Mui-focused fieldset": { borderColor: "#3b82f6" },
										},
										"& .MuiInputBase-input": {
											py: 2,
											color: isDark ? "white" : "inherit",
										},
									}}
								/>
							</Box>

							<Box>
								<TextField
									placeholder={t("login.password")}
									type={showPassword ? "text" : "password"}
									autoComplete="current-password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									fullWidth
									required
									variant="outlined"
									InputProps={{
										endAdornment: (
											<InputAdornment position="end">
												<IconButton
													onClick={() => setShowPassword((prev) => !prev)}
													edge="end"
												>
													{showPassword ? (
														<VisibilityOff
															fontSize="small"
															sx={{ color: isDark ? "#64748b" : "#94a3b8" }}
														/>
													) : (
														<Visibility
															fontSize="small"
															sx={{ color: isDark ? "#64748b" : "#94a3b8" }}
														/>
													)}
												</IconButton>
											</InputAdornment>
										),
									}}
									sx={{
										"& .MuiOutlinedInput-root": {
											bgcolor: isDark ? "#1e1e1e" : "#f0f7ff",
											borderRadius: 3,
											"& fieldset": { borderColor: "transparent" },
											"&:hover fieldset": {
												borderColor: isDark ? "#3b82f6" : "#bfdbfe",
											},
											"&.Mui-focused fieldset": { borderColor: "#3b82f6" },
										},
										"& .MuiInputBase-input": {
											py: 2,
											color: isDark ? "white" : "inherit",
										},
									}}
								/>
							</Box>

							<Stack
								direction="row"
								justifyContent="space-between"
								alignItems="center"
								sx={{ mt: 1 }}
							>
								<Button
									type="submit"
									variant="contained"
									disabled={loading}
									sx={{
										py: 1.5,
										px: 4,
										bgcolor: "#f97316",
										color: "white",
										borderRadius: 100,
										fontWeight: 800,
										textTransform: "none",
										fontSize: "1rem",
										boxShadow: isDark
											? "0 4px 14px 0 rgba(249, 115, 22, 0.39)"
											: "0 4px 14px 0 rgba(249, 115, 22, 0.2)",
										"&:hover": {
											bgcolor: "#ea580c",
											boxShadow: "0 6px 20px rgba(249, 115, 22, 0.23)",
										},
									}}
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

								<Typography
									variant="body2"
									sx={{
										color: isDark ? "#475569" : "#cbd5e1",
										textDecoration: "none",
										fontWeight: 500,
										cursor: "not-allowed",
									}}
								>
									{t("login.forgot_password")}
								</Typography>
							</Stack>
						</Stack>
					</form>
				</Box>

				{/* Bottom Footer Section */}
				<Box />
			</Box>

			{/* Right Side - Animated Background Decoration */}
			<Box
				sx={{
					flex: { xs: 1 },
					display: { xs: "none", md: "block" },
					background: "#020617", // Deep navy/black background for better contrast
					position: "relative",
					overflow: "hidden",
				}}
			>
				{/* Animated Blobs */}
				<Box
					sx={{
						position: "absolute",
						top: "20%",
						left: "30%",
						width: "500px",
						height: "500px",
						background: "rgba(59, 130, 246, 0.25)", // Vibrant Blue
						borderRadius: "50%",
						filter: "blur(100px)",
						animation: "move1 20s infinite alternate ease-in-out",
						zIndex: 1,
					}}
				/>
				<Box
					sx={{
						position: "absolute",
						bottom: "5%",
						right: "15%",
						width: "650px",
						height: "650px",
						background: "rgba(249, 115, 22, 0.15)", // Vibrant Orange
						borderRadius: "50%",
						filter: "blur(120px)",
						animation: "move2 25s infinite alternate ease-in-out",
						zIndex: 1,
					}}
				/>
				<Box
					sx={{
						position: "absolute",
						top: "-5%",
						right: "-5%",
						width: "450px",
						height: "450px",
						background: "rgba(139, 92, 246, 0.15)", // Vibrant Purple/Violet
						borderRadius: "50%",
						filter: "blur(90px)",
						animation: "move3 15s infinite alternate ease-in-out",
						zIndex: 1,
					}}
				/>

				{/* Overlay Mesh Grid effect */}
				<Box
					sx={{
						position: "absolute",
						inset: 0,
						backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)`,
						backgroundSize: "40px 40px",
						zIndex: 2,
						opacity: 0.5,
					}}
				/>
			</Box>
		</Box>
	);
}
