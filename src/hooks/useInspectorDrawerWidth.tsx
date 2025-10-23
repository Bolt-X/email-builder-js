import { useMediaQuery, useTheme } from "@mui/material";

export function useInspectorDrawerWidth() {
	const theme = useTheme();

	const isMd = useMediaQuery(theme.breakpoints.down(1280));
	const isLg = useMediaQuery(theme.breakpoints.between(1280, 1760));

	if (isMd) return 300;
	if (isLg) return 360;
	return 480;
}
