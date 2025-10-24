import { useEffect } from "react";
import { useAuthStore } from "../contexts/auth";
import InspectorDrawer from "./InspectorDrawer";
import TemplatePanel from "./TemplatePanel";

export default function App() {
	const restoreSession = useAuthStore((s) => {
		return s.restoreSession;
	});

	useEffect(() => {
		restoreSession();
	}, [restoreSession]);

	return (
		<>
			<TemplatePanel />
			<InspectorDrawer />
		</>
	);
}
