import { useCanvas } from '../../context';
import { ToolType } from '../../types';

const designTokenColors = [
  { name: 'Primary', value: '#3B82F6' },
  { name: 'Primary Dark', value: '#1D4ED8' },
  { name: 'Success', value: '#10B981' },
  { name: 'Warning', value: '#F59E0B' },
  { name: 'Error', value: '#EF4444' },
  { name: 'Gray 300', value: '#dee2e6' },
  { name: 'Gray 600', value: '#6c757d' },
  { name: 'Gray 900', value: '#212529' },
];

const Toolbar = () => {
  const { tool, setTool, clearCanvas } = useCanvas();

  const handleToolChange = (type: ToolType) => {
    setTool({ ...tool, type });
  };

  const handleColorChange = (color: string, type: 'fill' | 'stroke') => {
    setTool({
      ...tool,
      options: {
        ...tool.options,
        [type === 'fill' ? 'fillColor' : 'strokeColor']: color,
      },
    });
  };

  const handleStrokeWidthChange = (width: number) => {
    setTool({
      ...tool,
      options: {
        ...tool.options,
        strokeWidth: width,
      },
    });
  };

  const toolButton = (type: ToolType, icon: string, label: string) => (
    <button
      onClick={() => handleToolChange(type)}
      className={`p-3 rounded transition-colors ${
        tool.type === type
          ? 'bg-token-primary text-white'
          : 'bg-black-200 hover:bg-black-300'
      }`}
      title={label}
    >
      <span className="text-xl">{icon}</span>
    </button>
  );

  return (
    <div className="w-full bg-white border-b border-black-300 p-4">
      <div className="flex items-center gap-6">
        <div className="flex gap-2">
          {toolButton('select', '⌖', 'Select')}
          {toolButton('rect', '▭', 'Rectangle')}
          {toolButton('circle', '◯', 'Circle')}
          {toolButton('path', '✎', 'Draw')}
          {toolButton('pan', '✋', 'Pan')}
        </div>

        <div className="h-8 w-px bg-black-300" />

        <div className="flex flex-col gap-2">
          <div className="text-xs text-black-600 font-medium">Fill Color</div>
          <div className="flex gap-1">
            {designTokenColors.map(color => (
              <button
                key={color.value}
                onClick={() => handleColorChange(color.value, 'fill')}
                className={`w-6 h-6 rounded border-2 transition-all ${
                  tool.options.fillColor === color.value
                    ? 'border-black-900 scale-110'
                    : 'border-black-300'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
            <button
              onClick={() => handleColorChange('transparent', 'fill')}
              className={`w-6 h-6 rounded border-2 transition-all ${
                tool.options.fillColor === 'transparent'
                  ? 'border-black-900 scale-110'
                  : 'border-black-300'
              }`}
              style={{
                background: 'linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)',
                backgroundSize: '8px 8px',
                backgroundPosition: '0 0, 4px 4px'
              }}
              title="Transparent"
            />
          </div>
        </div>

        <div className="h-8 w-px bg-black-300" />

        <div className="flex flex-col gap-2">
          <div className="text-xs text-black-600 font-medium">Stroke Color</div>
          <div className="flex gap-1">
            {designTokenColors.map(color => (
              <button
                key={color.value}
                onClick={() => handleColorChange(color.value, 'stroke')}
                className={`w-6 h-6 rounded border-2 transition-all ${
                  tool.options.strokeColor === color.value
                    ? 'border-black-900 scale-110'
                    : 'border-black-300'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
        </div>

        <div className="h-8 w-px bg-black-300" />

        <div className="flex flex-col gap-2">
          <div className="text-xs text-black-600 font-medium">Stroke Width</div>
          <div className="flex gap-1">
            {[1, 2, 4, 8].map(width => (
              <button
                key={width}
                onClick={() => handleStrokeWidthChange(width)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  tool.options.strokeWidth === width
                    ? 'bg-token-primary text-white'
                    : 'bg-black-200 hover:bg-black-300'
                }`}
              >
                {width}px
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1" />

        <button
          onClick={clearCanvas}
          className="px-4 py-2 bg-token-error text-white rounded hover:bg-red-600 transition-colors"
        >
          Clear Canvas
        </button>
      </div>
    </div>
  );
};

export default Toolbar;

