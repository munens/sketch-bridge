import React, { useState, useRef, useEffect } from "react";
import classNames from "classnames";

interface ITextSearchProps<T> {
  readonly placeholder?: string;
  readonly value: string;
  readonly onSearch: (query: string) => void;
  readonly results: T[];
  readonly onSelect: (item: T) => void;
  readonly renderResult: (item: T) => React.ReactNode;
  readonly getResultKey: (item: T) => string;
  readonly isLoading?: boolean;
}

const TextSearch = <T,>({
  placeholder,
  value,
  onSearch,
  results,
  onSelect,
  renderResult,
  getResultKey,
  isLoading = false,
}: ITextSearchProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Show dropdown when results are available
  useEffect(() => {
    if (results.length > 0) {
      setIsOpen(true);
    }
  }, [results]);

  const handleInputChange = (newValue: string) => {
    onSearch(newValue);
    setHighlightedIndex(-1);
    if (newValue.length > 0) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleSelect = (item: T) => {
    onSelect(item);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev,
        );
        break;

      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;

      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < results.length) {
          handleSelect(results[highlightedIndex]);
        }
        break;

      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;

      default:
        break;
    }
  };

  const showDropdown = isOpen && (results.length > 0 || isLoading);

  return (
    <div className="relative mb-4" ref={wrapperRef}>
      <input
        className="mt-1 py-1 px-3 rounded-md w-full text-base border border-black-900"
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        type="text"
        value={value}
      />

      {showDropdown ? (
        <div className="absolute z-10 w-full mt-1 bg-white border border-black-900 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="px-4 py-3 text-black-600">Loading...</div>
          ) : (
            results.map((result, index) => (
              <div
                className={classNames(
                  "px-4 py-3 cursor-pointer transition-colors",
                  {
                    "bg-black-200": highlightedIndex === index,
                    "hover:bg-black-100": highlightedIndex !== index,
                  },
                )}
                key={getResultKey(result)}
                onClick={() => handleSelect(result)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                {renderResult(result)}
              </div>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
};

export default TextSearch;
