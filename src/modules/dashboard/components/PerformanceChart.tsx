import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	Legend,
} from "recharts";
import { useTranslation } from "react-i18next";

interface PerformanceChartProps {
	data: any[];
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ data }) => {
	const { t } = useTranslation();

	return (
		<Card
			sx={{
				height: "400px",
				borderRadius: 4,
				boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
				border: "1px solid",
				borderColor: "rgba(0,0,0,0.05)",
			}}
		>
			<CardContent
				sx={{ height: "100%", display: "flex", flexDirection: "column", p: 3 }}
			>
				<Typography
					variant="h6"
					sx={{ fontWeight: 700, mb: 3, fontSize: "1.1rem" }}
				>
					{t("dashboard.campaign_performance")}
				</Typography>
				<Box sx={{ flexGrow: 1, width: "100%", minHeight: 0 }}>
					<ResponsiveContainer
						width="100%"
						height="100%"
					>
						<BarChart
							data={data}
							margin={{
								top: 10,
								right: 10,
								left: -20,
								bottom: 0,
							}}
						>
							<CartesianGrid
								strokeDasharray="3 3"
								vertical={false}
								stroke="rgba(0,0,0,0.05)"
							/>
							<XAxis
								dataKey="name"
								axisLine={false}
								tickLine={false}
								tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
								dy={10}
							/>
							<YAxis
								axisLine={false}
								tickLine={false}
								tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
							/>
							<Tooltip
								cursor={{ fill: "rgba(0,0,0,0.02)" }}
								contentStyle={{
									borderRadius: "12px",
									border: "1px solid rgba(0,0,0,0.1)",
									boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
									padding: "10px",
								}}
							/>
							<Legend
								verticalAlign="top"
								align="center"
								iconType="circle"
								wrapperStyle={{
									paddingBottom: "20px",
									fontSize: "13px",
									fontWeight: 600,
								}}
							/>
							<Bar
								dataKey="clicked"
								name={t("dashboard.clicked")}
								fill="#f59e0b"
								radius={[6, 6, 0, 0]}
								barSize={12}
							/>
							<Bar
								dataKey="opened"
								name={t("dashboard.opened")}
								fill="#10b981"
								radius={[6, 6, 0, 0]}
								barSize={12}
							/>
							<Bar
								dataKey="sent"
								name={t("dashboard.sent")}
								fill="#6366f1"
								radius={[6, 6, 0, 0]}
								barSize={12}
							/>
						</BarChart>
					</ResponsiveContainer>
				</Box>
			</CardContent>
		</Card>
	);
};

export default PerformanceChart;
