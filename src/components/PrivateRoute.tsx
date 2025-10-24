import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../contexts/auth";

export default function PrivateRoute() {
	const accessToken = useAuthStore((s) => {
		return s.accessToken;
	});

	return accessToken ? (
		<Outlet />
	) : (
		<Navigate
			to="/auth/login"
			replace
		/>
	);
}
