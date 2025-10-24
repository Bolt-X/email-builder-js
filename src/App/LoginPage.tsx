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
import { useAuthStore } from "../contexts/auth";

export default function LoginPage() {
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
			setError(err?.errors?.[0]?.message || "Incorrect login credentials!");
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
				alignItems: "center",
				justifyContent: "center",
			}}
		>
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
					Login
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
						label="Email"
						type="email"
						autoComplete="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						fullWidth
						required
						sx={{ mb: 2 }}
					/>
					<TextField
						label="Password"
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
							"Submit"
						)}
					</Button>
				</form>
			</Paper>
		</Box>
	);
}
