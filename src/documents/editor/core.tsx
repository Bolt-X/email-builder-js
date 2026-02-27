import React from "react";
import { z } from "zod";

import { Avatar, AvatarPropsSchema } from "@usewaypoint/block-avatar";
import { Button, ButtonPropsSchema } from "@usewaypoint/block-button";
import { Divider, DividerPropsSchema } from "@usewaypoint/block-divider";
import { Heading, HeadingPropsSchema } from "@usewaypoint/block-heading";
import { Html, HtmlPropsSchema } from "@usewaypoint/block-html";
import { Image, ImagePropsSchema } from "@usewaypoint/block-image";
import { Spacer, SpacerPropsSchema } from "@usewaypoint/block-spacer";
import { Text, TextPropsSchema } from "@usewaypoint/block-text";
import {
	buildBlockComponent,
	buildBlockConfigurationDictionary,
	buildBlockConfigurationSchema,
} from "@usewaypoint/document-core";

import ColumnsContainerEditor from "../blocks/ColumnsContainer/ColumnsContainerEditor";
import ColumnsContainerPropsSchema from "../blocks/ColumnsContainer/ColumnsContainerPropsSchema";
import ContainerEditor from "../blocks/Container/ContainerEditor";
import ContainerPropsSchema from "../blocks/Container/ContainerPropsSchema";
import EmailLayoutEditor from "../blocks/EmailLayout/EmailLayoutEditor";
import EmailLayoutPropsSchema from "../blocks/EmailLayout/EmailLayoutPropsSchema";
import EditorBlockWrapper from "../blocks/helpers/block-wrappers/EditorBlockWrapper";
import ReaderBlockWrapper from "../blocks/helpers/block-wrappers/ReaderBlockWrapper";

const EDITOR_DICTIONARY = buildBlockConfigurationDictionary({
	Avatar: {
		schema: AvatarPropsSchema,
		Component: (props) => (
			<EditorBlockWrapper>
				<Avatar {...props} />
			</EditorBlockWrapper>
		),
	},
	Button: {
		schema: ButtonPropsSchema,
		Component: (props) => (
			<EditorBlockWrapper>
				<Button {...props} />
			</EditorBlockWrapper>
		),
	},
	Container: {
		schema: ContainerPropsSchema,
		Component: (props) => (
			<EditorBlockWrapper>
				<ContainerEditor {...props} />
			</EditorBlockWrapper>
		),
	},
	ColumnsContainer: {
		schema: ColumnsContainerPropsSchema,
		Component: (props) => (
			<EditorBlockWrapper>
				<ColumnsContainerEditor {...props} />
			</EditorBlockWrapper>
		),
	},
	Heading: {
		schema: HeadingPropsSchema,
		Component: (props) => (
			<EditorBlockWrapper>
				<Heading {...props} />
			</EditorBlockWrapper>
		),
	},
	Html: {
		schema: HtmlPropsSchema,
		Component: (props) => (
			<EditorBlockWrapper>
				<Html {...props} />
			</EditorBlockWrapper>
		),
	},
	Image: {
		schema: ImagePropsSchema,
		Component: (data) => {
			const props = {
				...data,
				props: {
					...data.props,
					url:
						data.props?.url ??
						"https://placehold.co/600x400@2x/F8F8F8/CCC?text=Your%20image",
				},
			};
			return (
				<EditorBlockWrapper>
					<Image {...props} />
				</EditorBlockWrapper>
			);
		},
	},
	Text: {
		schema: TextPropsSchema,
		Component: (props) => (
			<EditorBlockWrapper>
				<Text {...props} />
			</EditorBlockWrapper>
		),
	},
	EmailLayout: {
		schema: EmailLayoutPropsSchema,
		Component: (p) => <EmailLayoutEditor {...p} />,
	},
	Spacer: {
		schema: SpacerPropsSchema,
		Component: (props) => (
			<EditorBlockWrapper>
				<Spacer {...props} />
			</EditorBlockWrapper>
		),
	},
	Divider: {
		schema: DividerPropsSchema,
		Component: (props) => (
			<EditorBlockWrapper>
				<Divider {...props} />
			</EditorBlockWrapper>
		),
	},
});

export const READER_DICTIONARY = buildBlockConfigurationDictionary({
	Avatar: {
		schema: AvatarPropsSchema,
		Component: (props) => (
			<ReaderBlockWrapper style={props.style}>
				<Avatar {...props} />
			</ReaderBlockWrapper>
		),
	},
	Button: {
		schema: ButtonPropsSchema,
		Component: (props) => (
			<ReaderBlockWrapper style={props.style}>
				<Button {...props} />
			</ReaderBlockWrapper>
		),
	},
	Container: {
		schema: ContainerPropsSchema,
		Component: (props: any) => (
			<ReaderBlockWrapper style={props.style}>
				<>{props.children}</>
			</ReaderBlockWrapper>
		),
	},
	ColumnsContainer: {
		schema: ColumnsContainerPropsSchema,
		Component: (props: any) => (
			<ReaderBlockWrapper style={props.style}>
				<>{props.children}</>
			</ReaderBlockWrapper>
		),
	},
	Heading: {
		schema: HeadingPropsSchema,
		Component: (props) => (
			<ReaderBlockWrapper style={props.style}>
				<Heading {...props} />
			</ReaderBlockWrapper>
		),
	},
	Html: {
		schema: HtmlPropsSchema,
		Component: (props) => (
			<ReaderBlockWrapper style={props.style}>
				<Html {...props} />
			</ReaderBlockWrapper>
		),
	},
	Image: {
		schema: ImagePropsSchema,
		Component: (props) => (
			<ReaderBlockWrapper style={props.style}>
				<Image {...props} />
			</ReaderBlockWrapper>
		),
	},
	Text: {
		schema: TextPropsSchema,
		Component: (props) => (
			<ReaderBlockWrapper style={props.style}>
				<Text {...props} />
			</ReaderBlockWrapper>
		),
	},
	EmailLayout: {
		schema: EmailLayoutPropsSchema,
		Component: (props: any) => {
			const bgUrl = props.backgroundImage
				? props.backgroundImage.startsWith("url(")
					? props.backgroundImage
					: `url('${props.backgroundImage}')`
				: undefined;
			const rawUrl = props.backgroundImage
				? props.backgroundImage
						.replace(/^url\(['"]?/, "")
						.replace(/['"]?\)$/, "")
				: undefined;

			return (
				<table
					width="100%"
					cellPadding="0"
					cellSpacing="0"
					border={0}
					role="presentation"
					data-test-marker="READER_LAYOUT"
					// @ts-ignore
					background={rawUrl}
					style={{
						backgroundColor: props.backdropColor ?? "#F5F5F5",
						backgroundImage: bgUrl,
						backgroundRepeat: "no-repeat",
						backgroundSize: "cover",
						backgroundPosition: "center center",
						margin: "0",
						padding: "32px 12px",
						width: "100%",
						minHeight: "100%",
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
									color: props.textColor ?? "#262626",
									fontSize: "16px",
									fontWeight: "400",
									letterSpacing: "0.15008px",
									lineHeight: "1.5",
								}}
							>
								<table
									align="center"
									width="100%"
									style={{
										margin: "0 auto",
										maxWidth: "600px",
										backgroundColor: props.canvasColor ?? "#FFFFFF",
										borderRadius: props.borderRadius ?? undefined,
										border: props.borderColor
											? `1px solid ${props.borderColor}`
											: undefined,
									}}
									role="presentation"
									cellSpacing="0"
									cellPadding="0"
									border={0}
								>
									<tbody>
										<tr style={{ width: "100%" }}>
											<td>{props.children}</td>
										</tr>
									</tbody>
								</table>
							</td>
						</tr>
					</tbody>
				</table>
			);
		},
	},
	Spacer: {
		schema: SpacerPropsSchema,
		Component: (props: any) => <Spacer {...props} />,
	},
	Divider: {
		schema: DividerPropsSchema,
		Component: (props) => (
			<ReaderBlockWrapper style={props.style}>
				<Divider {...props} />
			</ReaderBlockWrapper>
		),
	},
});

export const BLOCK_TYPE_KEYS = Object.keys(EDITOR_DICTIONARY);

export const EditorBlock = buildBlockComponent(EDITOR_DICTIONARY);
export const EditorBlockSchema =
	buildBlockConfigurationSchema(EDITOR_DICTIONARY);
export const EditorConfigurationSchema = z.record(
	z.string(),
	EditorBlockSchema,
);

export type TEditorBlock = z.infer<typeof EditorBlockSchema>;
export type TEditorConfiguration = Record<string, TEditorBlock>;
