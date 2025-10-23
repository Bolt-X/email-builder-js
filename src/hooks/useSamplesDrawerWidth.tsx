import { useMediaQuery, useTheme } from "@mui/material";

export function useSamplesDrawerWidth() {
	const theme = useTheme();

	const isMd = useMediaQuery(theme.breakpoints.down(1280));
	const isLg = useMediaQuery(theme.breakpoints.between(1280, 1760));

	if (isMd) return 200;
	if (isLg) return 240;
	return 320;
}
