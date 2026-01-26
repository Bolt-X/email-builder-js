import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "light" | "dark" | "system";
export type DisplayDensity = "comfortable" | "compact";
export type Language = "en" | "vi";

interface SettingsState {
	themeMode: ThemeMode;
	displayDensity: DisplayDensity;
	language: Language;
	sidebarCollapsed: boolean;
	timeFormat: "12h" | "24h";
	dateFormat: string;

	setThemeMode: (mode: ThemeMode) => void;
	setDisplayDensity: (density: DisplayDensity) => void;
	setLanguage: (lang: Language) => void;
	setSidebarCollapsed: (collapsed: boolean) => void;
	setTimeFormat: (format: "12h" | "24h") => void;
	setDateFormat: (format: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
	persist(
		(set) => ({
			themeMode: "light",
			displayDensity: "comfortable",
			language: "en",
			sidebarCollapsed: false,
			timeFormat: "12h",
			dateFormat: "DD/MM/YYYY",

			setThemeMode: (themeMode) => set({ themeMode }),
			setDisplayDensity: (displayDensity) => set({ displayDensity }),
			setLanguage: (language) => set({ language }),
			setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
			setTimeFormat: (timeFormat) => set({ timeFormat }),
			setDateFormat: (dateFormat) => set({ dateFormat }),
		}),
		{
			name: "bolt-settings-storage",
		},
	),
);
