import {
  CanvasObject,
  ComponentSuggestion,
  ComponentMetadata,
} from "@sketch-bridge/common/model";
import { componentRegistry } from "./component-registry";

export class ShapeRecognizer {
  recognizeShape(object: CanvasObject): ComponentSuggestion[] {
    const suggestions: ComponentSuggestion[] = [];

    for (const component of componentRegistry) {
      for (const pattern of component.matchingPatterns) {
        const confidence = this.matchPattern(object, pattern);

        if (confidence > 0.5) {
          suggestions.push({
            componentId: component.id,
            componentName: component.name,
            confidence,
            matchedPattern: pattern,
            suggestedProps: this.extractSuggestedProps(object, component),
            reasoning: this.generateReasoning(object, pattern, component),
          });
        }
      }
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  matchPattern = (
    object: CanvasObject,
    pattern: {
      shapeType: string;
      confidence: number;
      aspectRatioMin?: number;
      aspectRatioMax?: number;
      minWidth?: number;
      maxWidth?: number;
      minHeight?: number;
      maxHeight?: number;
      hasText?: boolean;
    },
  ): number => {
    if (object.type !== pattern.shapeType) {
      return 0;
    }

    let confidence = pattern.confidence;
    const aspectRatio = object.width / object.height;

    if (pattern.aspectRatioMin && aspectRatio < pattern.aspectRatioMin) {
      confidence *= 0.5;
    }
    if (pattern.aspectRatioMax && aspectRatio > pattern.aspectRatioMax) {
      confidence *= 0.5;
    }

    if (pattern.minWidth && object.width < pattern.minWidth) {
      confidence *= 0.7;
    }
    if (pattern.maxWidth && object.width > pattern.maxWidth) {
      confidence *= 0.8;
    }

    if (pattern.minHeight && object.height < pattern.minHeight) {
      confidence *= 0.7;
    }
    if (pattern.maxHeight && object.height > pattern.maxHeight) {
      confidence *= 0.8;
    }

    if (pattern.hasText && object.textContent) {
      confidence *= 1.2;
    } else if (pattern.hasText && !object.textContent) {
      confidence *= 0.6;
    }

    return Math.min(confidence, 1);
  };

  extractSuggestedProps = (
    object: CanvasObject,
    component: ComponentMetadata,
  ): Record<string, string | number | boolean> => {
    const props: Record<string, string | number | boolean> = {
      ...component.defaultProps,
    };

    if (object.textContent) {
      props.text = object.textContent;
      props.label = object.textContent;
      props.placeholder = object.textContent;
    }

    props.width = Math.round(object.width);
    props.height = Math.round(object.height);

    return props;
  };

  generateReasoning = (
    object: CanvasObject,
    pattern: {
      shapeType: string;
      confidence: number;
      aspectRatioMin?: number;
      aspectRatioMax?: number;
      minWidth?: number;
      maxWidth?: number;
      minHeight?: number;
      maxHeight?: number;
      hasText?: boolean;
    },
    component: ComponentMetadata,
  ): string => {
    const reasons: string[] = [];

    const aspectRatio = object.width / object.height;

    if (pattern.aspectRatioMin && pattern.aspectRatioMax) {
      reasons.push(
        `Aspect ratio (${aspectRatio.toFixed(2)}) matches ${component.category} pattern`,
      );
    }

    if (object.textContent && pattern.hasText) {
      reasons.push(`Contains text content`);
    }

    if (object.width >= pattern.minWidth && object.width <= pattern.maxWidth) {
      reasons.push(`Width matches typical ${component.category} dimensions`);
    }

    return reasons.join(". ");
  };
}

export const shapeRecognizer = new ShapeRecognizer();
