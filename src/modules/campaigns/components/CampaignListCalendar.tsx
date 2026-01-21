import React, { useState, useEffect } from "react";
import {
	Box,
	Typography,
	Paper,
	IconButton,
	Stack,
	Grid,
	Tooltip,
	Button,
} from "@mui/material";
import { ChevronLeft, ChevronRight, CalendarMonth } from "@mui/icons-material";
import { Campaign } from "../types";
import { useNavigate } from "react-router-dom";

interface CampaignListCalendarProps {
	campaigns: any[];
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CampaignListCalendar({
	campaigns,
}: CampaignListCalendarProps) {
	const navigate = useNavigate();
	const [viewDate, setViewDate] = useState(new Date());

	// Calendar calculations
	const year = viewDate.getFullYear();
	const month = viewDate.getMonth();

	const firstDayOfMonth = new Date(year, month, 1).getDay();
	const daysInMonth = new Date(year, month + 1, 0).getDate();

	const monthYearString = viewDate.toLocaleString("default", {
		month: "long",
		year: "numeric",
	});

	const prevMonth = () => {
		setViewDate(new Date(year, month - 1, 1));
	};

	const nextMonth = () => {
		setViewDate(new Date(year, month + 1, 1));
	};

	const goToToday = () => {
		setViewDate(new Date());
	};

	// Generate day cells
	const dayCells = [];
	// Padding for previous month
	for (let i = 0; i < firstDayOfMonth; i++) {
		dayCells.push({ day: null, date: null });
	}
	// Days of current month
	for (let i = 1; i <= daysInMonth; i++) {
		const fullDate = new Date(year, month, i);
		dayCells.push({ day: i, date: fullDate });
	}

	const getCampaignsForDate = (date: Date) => {
		return campaigns.filter((c) => {
			if (!c.date_scheduled && !c.date_created) return false;
			const targetDate = new Date(c.date_scheduled || c.date_created!);
			return (
				targetDate.getFullYear() === date.getFullYear() &&
				targetDate.getMonth() === date.getMonth() &&
				targetDate.getDate() === date.getDate()
			);
		});
	};

	return (
		<Paper
			elevation={0}
			sx={{
				border: "1px solid",
				borderColor: "divider",
				borderRadius: 2,
				overflow: "hidden",
			}}
		>
			{/* Calendar Header */}
			<Box
				sx={{
					p: 2,
					borderBottom: "1px solid",
					borderColor: "divider",
					bgcolor: "white",
				}}
			>
				<Stack
					direction="row"
					justifyContent="space-between"
					alignItems="center"
				>
					<Stack
						direction="row"
						spacing={1}
						alignItems="center"
					>
						<IconButton
							size="small"
							onClick={prevMonth}
							sx={{ border: "1px solid #e0e0e0" }}
						>
							<ChevronLeft />
						</IconButton>
						<Button
							size="small"
							variant="outlined"
							onClick={goToToday}
							sx={{
								borderRadius: 20,
								px: 2,
								height: 34,
								textTransform: "none",
								borderColor: "#e0e0e0",
								color: "text.secondary",
								fontWeight: 600,
							}}
						>
							Today
						</Button>
						<IconButton
							size="small"
							onClick={nextMonth}
							sx={{ border: "1px solid #e0e0e0" }}
						>
							<ChevronRight />
						</IconButton>
					</Stack>
					<Typography
						variant="h5"
						sx={{
							fontWeight: 800,
							color: "text.primary",
							textAlign: "center",
							minWidth: 200,
						}}
					>
						{monthYearString}
					</Typography>
					<Box sx={{ width: 140 }} /> {/* Spacer to center the title */}
				</Stack>
			</Box>

			{/* Day Headers (Matching Reference Image Layout) */}
			<Grid
				container
				sx={{
					bgcolor: "#3DB5AD",
					borderBottom: "1px solid",
					borderColor: "rgba(0,0,0,0.1)",
				}}
			>
				{DAYS.map((day) => (
					<Grid
						item
						xs={12 / 7}
						key={day}
						sx={{
							p: 2,
							textAlign: "center",
							borderRight:
								day !== "Sat" ? "1px solid rgba(255,255,255,0.2)" : "none",
						}}
					>
						<Typography
							variant="subtitle1"
							sx={{
								fontWeight: 700,
								color: "white",
								textTransform: "capitalize",
							}}
						>
							{day}
						</Typography>
					</Grid>
				))}
			</Grid>

			{/* Date Grid */}
			<Grid
				container
				sx={{ minHeight: 600 }}
			>
				{dayCells.map((cell, idx) => {
					const dayCampaigns = cell.date ? getCampaignsForDate(cell.date) : [];
					const isToday =
						cell.date && new Date().toDateString() === cell.date.toDateString();

					return (
						<Grid
							item
							xs={12 / 7}
							key={idx}
							sx={{
								minHeight: 140,
								p: 1.5,
								borderRight: (idx + 1) % 7 !== 0 ? "1px solid" : "none",
								borderBottom: "1px solid",
								borderColor: "divider",
								bgcolor: cell.day ? "white" : "#fafafa",
								position: "relative",
								transition: "all 0.2s ease",
								"&:hover": cell.day
									? {
											transform: "translateY(-2px)",
											boxShadow: "inset 0 0 10px rgba(0,0,0,0.02)",
											zIndex: 1,
										}
									: {},
							}}
						>
							{cell.day && (
								<>
									<Typography
										variant="body1"
										sx={{
											fontWeight: isToday ? 800 : 700,
											color: isToday ? "white" : "text.primary",
											mb: 1.5,
											display: "inline-block",
											width: 28,
											height: 28,
											lineHeight: "28px",
											textAlign: "center",
											borderRadius: isToday ? "8px" : "0",
											bgcolor: isToday ? "primary.main" : "transparent",
										}}
									>
										{cell.day}
									</Typography>
									<Stack spacing={1}>
										{dayCampaigns.map((campaign) => (
											<Tooltip
												key={campaign.id}
												title={campaign.name}
												arrow
											>
												<Box
													onClick={(e) => {
														e.stopPropagation();
														navigate(`/campaigns/${campaign.id}`);
													}}
													sx={{
														p: 1.2,
														borderRadius: "6px",
														bgcolor: "#E0F2F1", // Very light teal
														color: "#00695C", // Dark teal text
														borderLeft: "4px solid #3DB5AD",
														fontSize: "0.75rem",
														fontWeight: 600,
														cursor: "pointer",
														whiteSpace: "nowrap",
														overflow: "hidden",
														textOverflow: "ellipsis",
														boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
														"&:hover": {
															bgcolor: "#B2DFDB",
															transform: "scale(1.02)",
														},
													}}
												>
													{campaign.name}
												</Box>
											</Tooltip>
										))}
									</Stack>
								</>
							)}
						</Grid>
					);
				})}
			</Grid>
		</Paper>
	);
}
