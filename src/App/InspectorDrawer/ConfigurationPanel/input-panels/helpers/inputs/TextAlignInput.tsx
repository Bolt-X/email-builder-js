import React, { useState } from "react";

import {
	FormatAlignCenterOutlined,
	FormatAlignJustifyOutlined,
	FormatAlignLeftOutlined,
	FormatAlignRightOutlined,
} from "@mui/icons-material";
import { ToggleButton } from "@mui/material";

import RadioGroupInput from "./RadioGroupInput";

type Props = {
	label: string;
	defaultValue: string | null;
	onChange: (value: string | null) => void;
};
export default function TextAlignInput({
	label,
	defaultValue,
	onChange,
}: Props) {
	const [value, setValue] = useState(defaultValue ?? "left");

	return (
		<RadioGroupInput
			label={label}
			defaultValue={value}
			onChange={(value) => {
				setValue(value);
				onChange(value);
			}}
		>
			{textAlignButtons.map((button) => (
				<ToggleButton
					key={button.value}
					value={button.value}
					disabled={button.value === value}
				>
					{button.icon}
				</ToggleButton>
			))}
		</RadioGroupInput>
	);
}

const textAlignButtons = [
	{
		value: "left",
		icon: <FormatAlignLeftOutlined fontSize="small" />,
	},
	{
		value: "center",
		icon: <FormatAlignCenterOutlined fontSize="small" />,
	},
	{
		value: "right",
		icon: <FormatAlignRightOutlined fontSize="small" />,
	},
	{
		value: "justify",
		icon: <FormatAlignJustifyOutlined fontSize="small" />,
	},
];
