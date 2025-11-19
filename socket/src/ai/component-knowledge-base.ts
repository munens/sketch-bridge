import type { ComponentMetadata } from '../../../common/model';

/**
 * Extended component metadata for AI analysis
 */
export interface ComponentKnowledge extends ComponentMetadata {
  visualDescription: string;
  sourceCode: string;
  usageExamples: CodeExample[];
  visualCharacteristics: {
    colors: string[];
    typography: string[];
    spacing: string[];
    borders: string[];
  };
}

export interface CodeExample {
  description: string;
  code: string;
}

/**
 * Component knowledge base - teaches AI what your components look like
 */
export const COMPONENT_KNOWLEDGE_BASE: ComponentKnowledge[] = [
  {
    id: 'button-primary',
    name: 'Button.Primary',
    category: 'button',
    description: 'Primary action button with dark background',
    
    visualDescription: `
      A rectangular button with:
      - Dark background (black-900 color)
      - Light text (black-100 color)
      - Rounded corners (rounded-md)
      - Padding: horizontal 20px (px-5), vertical 8px (py-2)
      - No border
      - Opacity 70% when disabled
    `,
    
    sourceCode: `
const Primary = ({ text, type, disabled, onClick }: IButtonProps) => (
  <button
    className="px-5 py-2 cursor-pointer border-0 disabled:opacity-70 rounded-md bg-black-900 text-black-100"
    disabled={disabled}
    onClick={onClick}
    type={type}
  >
    {text}
  </button>
);
    `.trim(),
    
    usageExamples: [
      {
        description: 'Basic button',
        code: `<Button.Primary text="Click Me" type="button" onClick={() => console.log('clicked')} />`
      }
    ],
    
    visualCharacteristics: {
      colors: ['bg-black-900', 'text-black-100'],
      typography: ['Base font size', 'Medium weight'],
      spacing: ['px-5', 'py-2'],
      borders: ['rounded-md', 'no border']
    },
    
    props: [
      { name: 'text', type: 'string', required: true, description: 'Button label' },
      { name: 'onClick', type: 'function', required: true, description: 'Click handler' },
      { name: 'disabled', type: 'boolean', required: false, defaultValue: false },
      { name: 'type', type: 'string', required: false, defaultValue: 'button' },
    ],
    
    defaultProps: { text: 'Button', disabled: false, type: 'button' },
    
    matchingPatterns: [{
      shapeType: 'rect',
      aspectRatioMin: 2,
      aspectRatioMax: 8,
      minWidth: 60,
      maxWidth: 200,
      minHeight: 30,
      maxHeight: 50,
      hasText: true,
      confidence: 0.8,
    }],
  },
  
  {
    id: 'button-secondary',
    name: 'Button.Secondary',
    category: 'button',
    description: 'Secondary action button with light background',
    
    visualDescription: `
      A rectangular button with:
      - Light background (black-100 color)
      - Dark border (border-black-900)
      - Dark text
      - Rounded corners (rounded-md)
      - Padding: horizontal 16px (px-4), vertical 10px (py-2.5)
    `,
    
    sourceCode: `
const Secondary = ({ text, type, disabled, onClick }: IButtonProps) => (
  <button
    className="px-4 py-2.5 cursor-pointer border-1 border-black-900 disabled:opacity-70 rounded-md bg-black-100 text-black-100"
    disabled={disabled}
    onClick={onClick}
    type={type}
  >
    {text}
  </button>
);
    `.trim(),
    
    usageExamples: [
      {
        description: 'Secondary action',
        code: `<Button.Secondary text="Cancel" type="button" onClick={handleCancel} />`
      }
    ],
    
    visualCharacteristics: {
      colors: ['bg-black-100', 'border-black-900', 'text-black-100'],
      typography: ['Base font size'],
      spacing: ['px-4', 'py-2.5'],
      borders: ['rounded-md', 'border-1']
    },
    
    props: [
      { name: 'text', type: 'string', required: true },
      { name: 'onClick', type: 'function', required: true },
      { name: 'disabled', type: 'boolean', required: false },
      { name: 'type', type: 'string', required: false },
    ],
    
    defaultProps: { text: 'Button', disabled: false, type: 'button' },
    
    matchingPatterns: [{
      shapeType: 'rect',
      aspectRatioMin: 2,
      aspectRatioMax: 8,
      minWidth: 60,
      maxWidth: 200,
      minHeight: 30,
      maxHeight: 50,
      hasText: true,
      confidence: 0.75,
    }],
  },
  
  {
    id: 'text-field',
    name: 'TextField',
    category: 'input',
    description: 'Text input field with optional label',
    
    visualDescription: `
      A text input field with:
      - White background
      - Black border (border-black-900)
      - Rounded corners (rounded-md)
      - Full width (w-full)
      - Padding: horizontal 12px (px-3), vertical 4px (py-1)
      - Optional label above input
      - Margin bottom 16px (mb-4)
    `,
    
    sourceCode: `
const TextField = ({ type, value, label, placeholder, onChange }: ITextFieldProps) => (
  <div className="mb-4">
    <label htmlFor="text-field">{label}</label>
    <input
      className="mt-1 py-1 px-3 rounded-md w-full text-base border border-black-900"
      id="text-field"
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      type={type}
      value={value}
    />
  </div>
);
    `.trim(),
    
    usageExamples: [
      {
        description: 'Input with label',
        code: `<TextField type="email" value={email} label="Email Address" placeholder="you@example.com" onChange={setEmail} />`
      }
    ],
    
    visualCharacteristics: {
      colors: ['bg-white', 'border-black-900'],
      typography: ['text-base'],
      spacing: ['px-3', 'py-1', 'mb-4'],
      borders: ['rounded-md', 'border 1px']
    },
    
    props: [
      { name: 'value', type: 'string', required: true },
      { name: 'type', type: 'string', required: true },
      { name: 'onChange', type: 'function', required: false },
      { name: 'placeholder', type: 'string', required: false },
      { name: 'label', type: 'string', required: false },
    ],
    
    defaultProps: { type: 'text', value: '', placeholder: 'Enter text...' },
    
    matchingPatterns: [{
      shapeType: 'rect',
      aspectRatioMin: 4,
      aspectRatioMax: 15,
      minWidth: 150,
      maxWidth: 400,
      minHeight: 30,
      maxHeight: 45,
      confidence: 0.85,
    }],
  },
  
  {
    id: 'text-search',
    name: 'TextSearch',
    category: 'input',
    description: 'Search input with dropdown results',
    
    visualDescription: `
      A search component with:
      - Text input field (white bg, black border, rounded)
      - Dropdown panel below (shadow-lg, white bg)
      - List items with hover states (bg-black-100 on hover, bg-black-200 when selected)
      - Max height 240px with scroll
      - Keyboard navigation support
    `,
    
    sourceCode: `
const TextSearch = <T,>({ placeholder, value, onSearch, results, onSelect, renderResult, getResultKey, isLoading }: ITextSearchProps<T>) => (
  <div className="relative mb-4">
    <input
      className="mt-1 py-1 px-3 rounded-md w-full text-base border border-black-900"
      onChange={(e) => onSearch(e.target.value)}
      placeholder={placeholder}
      type="text"
      value={value}
    />
    {results.length > 0 && (
      <div className="absolute z-10 w-full mt-1 bg-white border border-black-900 rounded-md shadow-lg max-h-60 overflow-y-auto">
        {results.map((result) => (
          <div className="px-4 py-3 cursor-pointer hover:bg-black-100" onClick={() => onSelect(result)}>
            {renderResult(result)}
          </div>
        ))}
      </div>
    )}
  </div>
);
    `.trim(),
    
    usageExamples: [
      {
        description: 'User search',
        code: `<TextSearch placeholder="Search users..." value={query} onSearch={fetchUsers} results={users} onSelect={(user) => console.log(user)} renderResult={(user) => <div>{user.name}</div>} getResultKey={(user) => user.id} />`
      }
    ],
    
    visualCharacteristics: {
      colors: ['bg-white', 'border-black-900', 'bg-black-100 (hover)', 'bg-black-200 (selected)'],
      typography: ['text-base'],
      spacing: ['px-3 py-1 (input)', 'px-4 py-3 (items)'],
      borders: ['rounded-md', 'shadow-lg']
    },
    
    props: [
      { name: 'value', type: 'string', required: true },
      { name: 'onSearch', type: 'function', required: true },
      { name: 'results', type: 'T[]', required: true },
      { name: 'onSelect', type: 'function', required: true },
      { name: 'renderResult', type: 'function', required: true },
      { name: 'getResultKey', type: 'function', required: true },
    ],
    
    matchingPatterns: [{ shapeType: 'group', confidence: 0.9 }],
  },
  
  {
    id: 'panel',
    name: 'Panel',
    category: 'card',
    description: 'Container with customizable background',
    
    visualDescription: `
      A container with:
      - Customizable background (default: bg-black-700)
      - Rounded corners (rounded-md)
      - Padding 20px (p-5)
      - Can contain any children
    `,
    
    sourceCode: `
const Panel = ({ children, backgroundColor = "bg-black-700", className }: IPanelProps) => (
  <div className={classNames("relative p-5 rounded-md", backgroundColor, className)}>
    {children}
  </div>
);
    `.trim(),
    
    usageExamples: [
      {
        description: 'Light panel with content',
        code: `<Panel backgroundColor="bg-white"><TextField type="text" value={value} /></Panel>`
      }
    ],
    
    visualCharacteristics: {
      colors: ['bg-black-700 (default)', 'customizable'],
      typography: [],
      spacing: ['p-5'],
      borders: ['rounded-md']
    },
    
    props: [
      { name: 'children', type: 'ReactNode', required: true },
      { name: 'backgroundColor', type: 'string', required: false },
      { name: 'className', type: 'string', required: false },
    ],
    
    defaultProps: { backgroundColor: 'bg-white' },
    
    matchingPatterns: [{
      shapeType: 'rect',
      aspectRatioMin: 0.5,
      aspectRatioMax: 3,
      minWidth: 200,
      minHeight: 150,
      confidence: 0.7,
    }],
  },
  
  {
    id: 'overlay-panel',
    name: 'OverlayPanel',
    category: 'container',
    description: 'Overlay panel that appears above content, typically used for modals or popovers',
    
    visualDescription: `
      A container that overlays content:
      - Positioned absolutely or fixed
      - Usually has a shadow or backdrop
      - Can contain any components
      - Often has higher z-index
      - May have close button
    `,
    
    sourceCode: `
const OverlayPanel = ({ children, onClose, className }: IOverlayPanelProps) => (
  <div className={classNames("absolute bg-white rounded-lg shadow-xl border border-black-300 p-4", className)}>
    {onClose && (
      <button onClick={onClose} className="absolute top-2 right-2">×</button>
    )}
    {children}
  </div>
);
    `.trim(),
    
    usageExamples: [
      {
        description: 'Overlay with form',
        code: `<OverlayPanel onClose={handleClose}><TextField type="text" value={value} /><Button.Primary text="Submit" /></OverlayPanel>`
      }
    ],
    
    visualCharacteristics: {
      colors: ['bg-white', 'shadow overlay'],
      typography: [],
      spacing: ['p-4'],
      borders: ['rounded-lg', 'shadow-xl']
    },
    
    props: [
      { name: 'children', type: 'ReactNode', required: true },
      { name: 'onClose', type: 'function', required: false },
      { name: 'className', type: 'string', required: false },
    ],
    
    matchingPatterns: [{
      shapeType: 'rect',
      confidence: 0.65,
    }],
  },
];

/**
 * Generate comprehensive prompt for OpenAI
 */
export function generateComponentLibraryPrompt(): string {
  const componentDescriptions = COMPONENT_KNOWLEDGE_BASE.map(comp => `
## ${comp.name} (${comp.id})
Category: ${comp.category}
Description: ${comp.description}

Visual Appearance:
${comp.visualDescription}

Visual Characteristics:
- Colors: ${comp.visualCharacteristics.colors.join(', ')}
- Spacing: ${comp.visualCharacteristics.spacing.join(', ')}
- Borders: ${comp.visualCharacteristics.borders.join(', ')}

Props:
${comp.props.map(p => `- ${p.name}: ${p.type}${p.required ? ' (required)' : ''}`).join('\n')}

Source Code:
\`\`\`typescript
${comp.sourceCode}
\`\`\`

Usage Example:
\`\`\`tsx
${comp.usageExamples[0]?.code || ''}
\`\`\`
  `).join('\n---\n');

  return `You are analyzing UI screenshots to identify components from this React/TypeScript library.

Available Components:
${componentDescriptions}

Task: Analyze the provided screenshot and identify which components are used.

Return ONLY valid JSON in this format:
{
  "detectedComponents": ["component-id-1", "component-id-2"],
  "layoutStructure": "brief description of layout",
  "generatedCode": "complete React/TypeScript code using the components",
  "confidence": 0.85,
  "reasoning": "explanation of component choices"
}`;
}

