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
import { ChevronLeft, ChevronRight, Add as AddIcon } from "@mui/icons-material";
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

	const handleCreateFromDate = (date: Date) => {
		// Format date as YYYY-MM-DD
		const formattedDate = date.toISOString().split("T")[0];
		navigate(`/campaigns/new?date=${formattedDate}`);
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
				borderRadius: 4,
				overflow: "hidden",
				bgcolor: "background.paper",
				boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
				border: "1px solid",
				borderColor: "divider",
			}}
		>
			{/* Calendar Header */}
			<Box
				sx={{
					p: 3,
					borderBottom: "1px solid",
					borderColor: "rgba(0,0,0,0.05)",
				}}
			>
				<Stack
					direction="row"
					justifyContent="space-between"
					alignItems="center"
				>
					<Stack
						direction="row"
						spacing={2}
						alignItems="center"
					>
						<Typography
							variant="h5"
							sx={{
								fontWeight: 800,
								color: "text.primary",
								minWidth: 180,
							}}
						>
							{monthYearString}
						</Typography>
						<Stack
							direction="row"
							spacing={1}
							alignItems="center"
						>
							<IconButton
								size="small"
								onClick={prevMonth}
								sx={{
									bgcolor: "action.hover",
									"&:hover": { bgcolor: "action.selected" },
								}}
							>
								<ChevronLeft fontSize="small" />
							</IconButton>
							<Button
								size="small"
								onClick={goToToday}
								sx={{
									textTransform: "none",
									fontWeight: 700,
									color: "text.secondary",
									"&:hover": { bgcolor: "action.hover" },
								}}
							>
								Today
							</Button>
							<IconButton
								size="small"
								onClick={nextMonth}
								sx={{
									bgcolor: "action.hover",
									"&:hover": { bgcolor: "action.selected" },
								}}
							>
								<ChevronRight fontSize="small" />
							</IconButton>
						</Stack>
					</Stack>
				</Stack>
			</Box>

			{/* Day Headers */}
			<Grid
				container
				sx={{
					bgcolor: "primary.main",
				}}
			>
				{DAYS.map((day) => (
					<Grid
						item
						xs={12 / 7}
						key={day}
						sx={{
							py: 2,
							textAlign: "center",
						}}
					>
						<Typography
							variant="caption"
							sx={{
								fontWeight: 800,
								color: "white",
								textTransform: "uppercase",
								letterSpacing: "1px",
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
								bgcolor: cell.day ? "background.paper" : "action.hover",
								position: "relative",
								transition: "all 0.2s ease",
								"&:hover": cell.day
									? {
											bgcolor: "action.hover",
											"& .create-btn": { opacity: 1 },
										}
									: {},
							}}
						>
							{cell.day && (
								<>
									<Stack
										direction="row"
										justifyContent="space-between"
										alignItems="center"
										sx={{ mb: 1.5 }}
									>
										<Typography
											variant="body2"
											sx={{
												fontWeight: isToday ? 800 : 700,
												color: isToday ? "white" : "text.secondary",
												width: 28,
												height: 28,
												lineHeight: "28px",
												textAlign: "center",
												borderRadius: "8px",
												bgcolor: isToday ? "primary.main" : "transparent",
											}}
										>
											{cell.day}
										</Typography>

										<IconButton
											className="create-btn"
											size="small"
											onClick={() => handleCreateFromDate(cell.date!)}
											sx={{
												opacity: 0,
												transition: "opacity 0.2s",
												color: "primary.main",
												bgcolor: "action.selected",
												"&.MuiIconButton-root": {
													bgcolor: "action.selected",
												},
												"&:hover": { bgcolor: "action.focus" },
											}}
										>
											<AddIcon sx={{ fontSize: 18 }} />
										</IconButton>
									</Stack>

									<Stack spacing={0.8}>
										{dayCampaigns.map((campaign) => (
											<Tooltip
												key={campaign.id || campaign.slug}
												title={campaign.name}
												arrow
											>
												<Box
													onClick={(e) => {
														e.stopPropagation();
														const id = campaign.slug || campaign.id;
														navigate(`/campaigns/${id}`);
													}}
													sx={{
														px: 1,
														py: 0.8,
														borderRadius: "8px",
														bgcolor: "primary.light",
														color: "primary.contrastText",
														borderLeft: "3px solid",
														borderColor: "primary.dark",
														fontSize: "0.7rem",
														fontWeight: 700,
														cursor: "pointer",
														whiteSpace: "nowrap",
														overflow: "hidden",
														textOverflow: "ellipsis",
														transition: "all 0.2s",
														"&:hover": {
															bgcolor: "#b2dfdb",
															boxShadow: "0 2px 4px rgba(0,105,92,0.1)",
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
