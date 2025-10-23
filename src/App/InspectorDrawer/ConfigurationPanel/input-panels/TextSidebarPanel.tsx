import React, { useState } from "react";

import { TextProps, TextPropsSchema } from "@usewaypoint/block-text";

import BaseSidebarPanel from "./helpers/BaseSidebarPanel";
import BooleanInput from "./helpers/inputs/BooleanInput";
import TextInput from "./helpers/inputs/TextInput";
import MultiStylePropertyPanel from "./helpers/style-inputs/MultiStylePropertyPanel";
import RichTextEditorInput from "./helpers/inputs/RichTextEditorInput";

type TextSidebarPanelProps = {
	data: TextProps;
	setData: (v: TextProps) => void;
};
export default function TextSidebarPanel({
	data,
	setData,
}: TextSidebarPanelProps) {
	const [, setErrors] = useState<Zod.ZodError | null>(null);

	const updateData = (d: unknown) => {
		const res = TextPropsSchema.safeParse(d);

		// Overwrite trường success = true, data = d để apply style khác cho text
		res.success = true;
		res.data = d;

		if (res.success) {
			setData(res.data);
			setErrors(null);
		} else {
			setErrors(res.error);
		}
	};

	return (
		<BaseSidebarPanel title="Text block">
			{data.props?.markdown ? (
				<RichTextEditorInput
					defaultValue={data.props?.text ?? ""}
					onChange={(text) =>
						updateData({ ...data, props: { ...data.props, text } })
					}
				/>
			) : (
				<TextInput
					label="Content"
					rows={5}
					defaultValue={data.props?.text ?? ""}
					onChange={(text) =>
						updateData({ ...data, props: { ...data.props, text } })
					}
				/>
			)}

			<BooleanInput
				label="Markdown"
				defaultValue={data.props?.markdown ?? false}
				onChange={(markdown) =>
					updateData({ ...data, props: { ...data.props, markdown } })
				}
			/>

			<MultiStylePropertyPanel
				names={[
					"color",
					"backgroundColor",
					// "backgroundImage",
					"fontFamily",
					"fontSize",
					"fontWeight",
					"textAlign",
					"padding",
				]}
				value={data.style}
				onChange={(style) => updateData({ ...data, style })}
			/>
		</BaseSidebarPanel>
	);
}
