import React, { useState } from "react";
import { RoundedCornerOutlined } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import EmailLayoutPropsSchema, {
	EmailLayoutProps,
} from "../../../../documents/blocks/EmailLayout/EmailLayoutPropsSchema";

import BaseSidebarPanel from "./helpers/BaseSidebarPanel";
import ColorInput, { NullableColorInput } from "./helpers/inputs/ColorInput";
import { NullableFontFamily } from "./helpers/inputs/FontFamily";
import SliderInput from "./helpers/inputs/SliderInput";

type EmailLayoutSidebarFieldsProps = {
	data: EmailLayoutProps;
	setData: (v: EmailLayoutProps) => void;
};
export default function EmailLayoutSidebarFields({
	data,
	setData,
}: EmailLayoutSidebarFieldsProps) {
	const { t } = useTranslation();
	const [, setErrors] = useState<Zod.ZodError | null>(null);

	const updateData = (d: unknown) => {
		const res = EmailLayoutPropsSchema.safeParse(d) as any;
		if (res.success) {
			setData(res.data);
			setErrors(null);
		} else {
			setErrors(res.error);
		}
	};

	return (
		<BaseSidebarPanel title={t("templates.editor.global_styles")}>
			<ColorInput
				label={t("templates.editor.backdrop_color")}
				defaultValue={data.backdropColor ?? "#F5F5F5"}
				onChange={(backdropColor) => updateData({ ...data, backdropColor })}
			/>
			<ColorInput
				label={t("templates.editor.canvas_color")}
				defaultValue={data.canvasColor ?? "#FFFFFF"}
				onChange={(canvasColor) => updateData({ ...data, canvasColor })}
			/>
			<NullableColorInput
				label={t("templates.editor.canvas_border_color")}
				defaultValue={data.borderColor ?? null}
				onChange={(borderColor) => updateData({ ...data, borderColor })}
			/>
			<SliderInput
				iconLabel={<RoundedCornerOutlined />}
				units="px"
				step={4}
				marks
				min={0}
				max={48}
				label={t("templates.editor.canvas_border_radius")}
				defaultValue={data.borderRadius ?? 0}
				onChange={(borderRadius) => updateData({ ...data, borderRadius })}
			/>
			<NullableFontFamily
				label={t("templates.editor.font_family")}
				defaultValue="MODERN_SANS"
				onChange={(fontFamily) => updateData({ ...data, fontFamily })}
			/>
			<ColorInput
				label={t("templates.editor.text_color")}
				defaultValue={data.textColor ?? "#262626"}
				onChange={(textColor) => updateData({ ...data, textColor })}
			/>
		</BaseSidebarPanel>
	);
}
