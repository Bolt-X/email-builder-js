import { Search } from "@mui/icons-material";
import {
	Box,
	FormControl,
	InputAdornment,
	Stack,
	TextField,
} from "@mui/material";

interface TemplateFiltersProps {
	searchQuery: string;
	onSearchChange: (query: string) => void;
	disabled?: boolean;
}

export default function TemplateFilters({
	searchQuery,
	onSearchChange,
	disabled,
}: TemplateFiltersProps) {
	const commonSx = {
		borderRadius: "6px",
		backgroundColor: "background.paper",
		"& .MuiOutlinedInput-root": {
			borderRadius: "6px",
		},
		"& fieldset": {
			borderColor: "rgba(0, 0, 0, 0.12)",
		},
	};

	return (
		<Box
			sx={{ borderBottom: "1px solid #e0e0e0", py: 2, px: 3, bgcolor: "white" }}
		>
			<Stack
				direction="row"
				justifyContent="space-between"
				alignItems="flex-start"
				spacing={2}
			>
				<Stack
					direction="row"
					spacing={1.5}
					alignItems="center"
					flexGrow={1}
				>
					<FormControl
						variant="outlined"
						size="small"
					>
						<TextField
							placeholder="Search templates..."
							size="small"
							value={searchQuery}
							onChange={(e) => onSearchChange(e.target.value)}
							disabled={disabled}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<Search
											fontSize="small"
											color="action"
										/>
									</InputAdornment>
								),
								sx: {
									minWidth: 300,
								},
							}}
							sx={commonSx}
						/>
					</FormControl>
				</Stack>
			</Stack>
		</Box>
	);
}
