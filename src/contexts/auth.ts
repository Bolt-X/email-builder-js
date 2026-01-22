// stores/authStore.ts
import { create } from "zustand";
import { directusClientWithRest as directus } from "../services/directus";
import { readMe } from "@directus/sdk";

interface AuthState {
	user: any;
	accessToken: string | null;
	refreshToken: string | null;
	login: (email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
	refreshTokenFn: () => Promise<void>;
	restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => {
	return {
		user: null,
		accessToken: localStorage.getItem("access_token"),
		refreshToken: localStorage.getItem("refresh_token"),

		/** Đăng nhập */
		login: async (email, password) => {
			try {
				const res = await directus.login({ email, password });
				const access_token = res.access_token;
				const refresh_token = res.refresh_token;

				// Lưu token vào localStorage
				localStorage.setItem("access_token", access_token!);
				localStorage.setItem("refresh_token", refresh_token!);

				// Lấy thông tin user hiện tại
				const user = await directus.request(readMe());
				console.log("🚀 ~ user:", user);

				set({
					user,
					accessToken: access_token!,
					refreshToken: refresh_token!,
				});
			} catch (err: any) {
				console.error("Login error:", err);
				throw err;
			}
		},

		refreshTokenFn: async () => {
			console.log("🚀 ~ refreshTokenFn ()");
			try {
				const refresh = localStorage.getItem("refresh_token");
				if (!refresh) throw new Error("No refresh token found");

				const res = await directus.refresh({ refresh_token: refresh });

				const newAccess = res.access_token;
				const newRefresh = res.refresh_token;

				// cập nhật localStorage
				localStorage.setItem("access_token", newAccess);
				localStorage.setItem("refresh_token", newRefresh);

				// cập nhật SDK để dùng token mới
				await directus.setToken(newAccess);

				// cập nhật store
				set({ accessToken: newAccess, refreshToken: newRefresh });
			} catch (err) {
				console.error("Refresh token failed:", err);
				get().logout();
			}
		},

		restoreSession: async () => {
			console.log("🚀 ~ restoreSession ()");
			const access = localStorage.getItem("access_token");
			const refresh = localStorage.getItem("refresh_token");

			if (!access || !refresh) return;

			try {
				// khôi phục session với access token hiện có
				await directus.setToken(access);
				const user = await directus.request(readMe());
				set({ user });
			} catch (err) {
				console.warn("Access token expired, trying refresh...");
				try {
					await get().refreshTokenFn();
					const user = await directus.request(readMe());
					set({ user });
				} catch {
					get().logout();
				}
			}
		},

		/** Đăng xuất */
		logout: async () => {
			try {
				await directus.logout();
			} catch (err) {
				console.warn("Logout error:", err);
			}
			localStorage.removeItem("access_token");
			localStorage.removeItem("refresh_token");
			set({ user: null, accessToken: null, refreshToken: null });
		},
	};
});
