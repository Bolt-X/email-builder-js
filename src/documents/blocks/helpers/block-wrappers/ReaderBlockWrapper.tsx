import React, { CSSProperties } from "react";

import { TStyle } from "../TStyle";

type TReaderBlockWrapperProps = {
	style: TStyle;
	children: JSX.Element;
};

export default function ReaderBlockWrapper({
	style,
	children,
}: TReaderBlockWrapperProps) {
	const { padding, borderColor, backgroundImage, ...restStyle } = style;
	const cssStyle: CSSProperties = {
		...restStyle,
	};

	if (padding) {
		const { top, bottom, left, right } = padding;
		cssStyle.padding = `${top}px ${right}px ${bottom}px ${left}px`;
	}

	if (borderColor) {
		cssStyle.border = `1px solid ${borderColor}`;
	}

	if (backgroundImage) {
		cssStyle.backgroundImage = `url(${backgroundImage})`;
		cssStyle.backgroundPosition = "center center";
		cssStyle.backgroundSize = "cover";
		cssStyle.backgroundRepeat = "no-repeat";
	}

	return <div style={{ maxWidth: "100%", ...cssStyle }}>{children}</div>;
}
