import { ComponentMetadata } from "@sketch-bridge/common/model";

export const componentRegistry: ComponentMetadata[] = [
  {
    id: "button-primary",
    name: "Button.Primary",
    category: "button",
    description: "Primary action button with dark background",
    props: [
      {
        name: "text",
        type: "string",
        required: true,
        description: "Button label",
      },
      {
        name: "onClick",
        type: "function",
        required: true,
        description: "Click handler",
      },
      {
        name: "disabled",
        type: "boolean",
        required: false,
        defaultValue: false,
      },
      { name: "type", type: "string", required: false, defaultValue: "button" },
    ],
    defaultProps: {
      text: "Button",
      disabled: false,
      type: "button",
    },
    variants: ["primary", "secondary"],
    matchingPatterns: [
      {
        shapeType: "rect",
        aspectRatioMin: 2,
        aspectRatioMax: 8,
        minWidth: 60,
        maxWidth: 200,
        minHeight: 30,
        maxHeight: 50,
        hasText: true,
        confidence: 0.8,
      },
    ],
  },
  {
    id: "button-secondary",
    name: "Button.Secondary",
    category: "button",
    description: "Secondary action button with light background",
    props: [
      {
        name: "text",
        type: "string",
        required: true,
        description: "Button label",
      },
      {
        name: "onClick",
        type: "function",
        required: true,
        description: "Click handler",
      },
      {
        name: "disabled",
        type: "boolean",
        required: false,
        defaultValue: false,
      },
      { name: "type", type: "string", required: false, defaultValue: "button" },
    ],
    defaultProps: {
      text: "Button",
      disabled: false,
      type: "button",
    },
    matchingPatterns: [
      {
        shapeType: "rect",
        aspectRatioMin: 2,
        aspectRatioMax: 8,
        minWidth: 60,
        maxWidth: 200,
        minHeight: 30,
        maxHeight: 50,
        hasText: true,
        confidence: 0.75,
      },
    ],
  },
  {
    id: "text-field",
    name: "TextField",
    category: "input",
    description: "Text input field with optional label",
    props: [
      {
        name: "value",
        type: "string",
        required: true,
        description: "Input value",
      },
      {
        name: "onChange",
        type: "function",
        required: false,
        description: "Change handler",
      },
      { name: "type", type: "string", required: true, defaultValue: "text" },
      { name: "placeholder", type: "string", required: false },
      { name: "label", type: "string", required: false },
    ],
    defaultProps: {
      type: "text",
      value: "",
      placeholder: "Enter text...",
    },
    matchingPatterns: [
      {
        shapeType: "rect",
        aspectRatioMin: 4,
        aspectRatioMax: 15,
        minWidth: 150,
        maxWidth: 400,
        minHeight: 30,
        maxHeight: 45,
        confidence: 0.85,
      },
    ],
  },
  {
    id: "panel",
    name: "Panel",
    category: "card",
    description: "Card-like container with customizable background",
    props: [
      { name: "children", type: "ReactNode", required: true },
      { name: "className", type: "string", required: false },
      { name: "backgroundColor", type: "string", required: false },
    ],
    defaultProps: {
      backgroundColor: "bg-white",
    },
    matchingPatterns: [
      {
        shapeType: "rect",
        aspectRatioMin: 0.5,
        aspectRatioMax: 3,
        minWidth: 200,
        minHeight: 150,
        confidence: 0.7,
      },
    ],
  },
];

export const getComponentById = (id: string): ComponentMetadata | undefined =>
  componentRegistry.find((comp) => comp.id === id);

export const getComponentsByCategory = (
  category: string,
): ComponentMetadata[] =>
  componentRegistry.filter((comp) => comp.category === category);
