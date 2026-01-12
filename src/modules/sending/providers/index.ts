import { EmailProvider } from "../types";
import { MockProvider } from "./MockProvider";

export type ProviderType = "mock" | "ses" | "sendgrid";

export function createProvider(type: ProviderType = "mock"): EmailProvider {
	switch (type) {
		case "mock":
			return new MockProvider();
		case "ses":
			// TODO: Implement SES provider
			throw new Error("SES provider not yet implemented");
		case "sendgrid":
			// TODO: Implement SendGrid provider
			throw new Error("SendGrid provider not yet implemented");
		default:
			return new MockProvider();
	}
}
