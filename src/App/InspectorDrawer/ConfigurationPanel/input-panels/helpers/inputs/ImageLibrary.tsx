import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {
	Box,
	CircularProgress,
	Grid,
	Typography,
	ButtonBase,
	Button,
} from "@mui/material";
import { useEffect, useState } from "react";
import { readDirectusFiles } from "../../../../../../services/files";

type Props = {
	selectedValue?: string | null;
	onSelect: (value: string) => void;
	onClear?: () => void;
};

const assetURL = import.meta.env.VITE_ASSETS_URL;

const ImageLibrary = ({ selectedValue, onSelect, onClear }: Props) => {
	const [files, setFiles] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const loadFiles = async () => {
			try {
				setLoading(true);
				const res = await readDirectusFiles();
				setFiles(res as any[]);
			} catch (err) {
				console.error(err);
				setError("Failed to load library.");
			} finally {
				setLoading(false);
			}
		};
		loadFiles();
	}, []);

	if (loading) {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
				<CircularProgress size={24} />
			</Box>
		);
	}

	if (error) {
		return (
			<Box sx={{ p: 2 }}>
				<Typography
					color="error"
					variant="caption"
				>
					{error}
				</Typography>
			</Box>
		);
	}

	if (files.length === 0) {
		return (
			<Box sx={{ p: 4, textAlign: "center" }}>
				<Typography
					variant="caption"
					color="text.secondary"
				>
					No images found in library.
				</Typography>
			</Box>
		);
	}

	return (
		<Box sx={{ mt: 2, maxHeight: 400, overflowY: "auto", p: 1, width: "100%" }}>
			{onClear && (
				<Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
					<Button
						color="error"
						size="small"
						onClick={onClear}
						disabled={!selectedValue}
						sx={{ fontSize: 10 }}
					>
						Clear selection
					</Button>
				</Box>
			)}
			<Grid
				container
				spacing={1}
			>
				{files
					.filter((f) => f.type?.startsWith("image/"))
					.map((file) => {
						const url = assetURL + file.id;
						const isSelected = selectedValue === url;

						return (
							<Grid
								item
								xs={4}
								key={file.id}
							>
								<ButtonBase
									onClick={() => onSelect(url)}
									sx={{
										width: "100%",
										paddingTop: "100%",
										position: "relative",
										borderRadius: 1,
										overflow: "hidden",
										border: "2px solid",
										borderColor: isSelected ? "primary.main" : "divider",
										"&:hover": {
											borderColor: "primary.main",
										},
									}}
								>
									<img
										src={`${assetURL}${file.id}?width=100&height=100&fit=cover`}
										alt={file.title}
										style={{
											position: "absolute",
											top: 0,
											left: 0,
											width: "100%",
											height: "100%",
											objectFit: "cover",
											opacity: isSelected ? 0.7 : 1,
										}}
									/>
									{isSelected && (
										<CheckCircleIcon
											color="primary"
											sx={{
												position: "absolute",
												top: 4,
												right: 4,
												fontSize: 20,
												bgcolor: "white",
												borderRadius: "50%",
											}}
										/>
									)}
								</ButtonBase>
							</Grid>
						);
					})}
			</Grid>
		</Box>
	);
};

export default ImageLibrary;
