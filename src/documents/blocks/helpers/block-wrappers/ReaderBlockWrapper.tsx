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
	if (!style) return <>{children}</>;

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

	// Email client support for background image
	// Using table structure for better compatibility with Outlook and Gmail
	if (backgroundImage) {
		const bgUrl = backgroundImage.startsWith("url(")
			? backgroundImage
			: `url('${backgroundImage}')`;
		const rawUrl = backgroundImage
			.replace(/^url\(['"]?/, "")
			.replace(/['"]?\)$/, "");

		return (
			<table
				width="100%"
				cellPadding="0"
				cellSpacing="0"
				border={0}
				role="presentation"
				// @ts-ignore
				background={rawUrl}
				style={{
					backgroundImage: bgUrl,
					backgroundRepeat: "no-repeat",
					backgroundSize: "cover",
					backgroundPosition: "center center",
					width: "100%",
				}}
			>
				<tbody>
					<tr>
						<td
							valign="top"
							// @ts-ignore
							background={rawUrl}
							style={{
								backgroundImage: bgUrl,
								backgroundRepeat: "no-repeat",
								backgroundSize: "cover",
								backgroundPosition: "center center",
								// Padding needs to be on the TD for it to push content away from edges
								...(padding
									? {
											padding: `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`,
										}
									: {}),
								// Apply border if exists
								...(borderColor ? { border: `1px solid ${borderColor}` } : {}),
								...restStyle,
							}}
						>
							{children}
						</td>
					</tr>
				</tbody>
			</table>
		);
	}

	return <div style={{ maxWidth: "100%", ...cssStyle }}>{children}</div>;
}
