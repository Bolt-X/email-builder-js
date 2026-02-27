import React from "react";
import { Box, Typography, Stack } from "@mui/material";

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	rowsPerPage: number;
	onPageChange: (page: number) => void;
	onRowsPerPageChange: (rows: number) => void;
}

export default function Pagination({
	currentPage,
	totalPages,
	rowsPerPage,
	onPageChange,
	onRowsPerPageChange,
}: PaginationProps) {
	// Simple range generation for demo purposes
	const pages = [];
	for (let i = 1; i <= totalPages; i++) {
		if (i <= 3 || i >= totalPages - 2 || Math.abs(i - currentPage) <= 1) {
			pages.push(i);
		} else if (pages[pages.length - 1] !== "...") {
			pages.push("...");
		}
	}

	return (
		<Stack
			direction="row"
			justifyContent="space-between"
			alignItems="center"
			mt={3}
			color="text.secondary"
		>
			<Stack
				direction="row"
				spacing={1}
				alignItems="center"
			>
				<Typography variant="body2">Rows per page: </Typography>
				<Typography
					variant="body2"
					sx={{
						fontWeight: 600,
						cursor: "pointer",
						display: "flex",
						alignItems: "center",
					}}
					onClick={() => {
						const options = [10, 25, 50, 100];
						const currentIndex = options.indexOf(rowsPerPage);
						const nextIndex = (currentIndex + 1) % options.length;
						onRowsPerPageChange(options[nextIndex]);
					}}
				>
					{rowsPerPage} <span style={{ fontSize: 10, marginLeft: 4 }}>▼</span>
				</Typography>
			</Stack>
			<Stack
				direction="row"
				spacing={1}
			>
				{pages.map((p, i) => (
					<Box
						key={i}
						onClick={() => typeof p === "number" && onPageChange(p - 1)}
						sx={{
							width: 32,
							height: 32,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							borderRadius: "4px",
							bgcolor: p === currentPage + 1 ? "primary.main" : "transparent",
							color: p === currentPage + 1 ? "white" : "text.secondary",
							fontWeight: p === currentPage + 1 ? 700 : 600,
							cursor: p === "..." ? "default" : "pointer",
							"&:hover": {
								bgcolor:
									p === "..."
										? "transparent"
										: p === currentPage + 1
											? "primary.dark"
											: "#F3F4F6",
							},
						}}
					>
						{p}
					</Box>
				))}
			</Stack>
		</Stack>
	);
}
