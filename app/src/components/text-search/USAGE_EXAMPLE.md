# TextSearch Component Usage

## Example Implementation in `start.tsx`

```tsx
import React, { useState } from "react";
import { Panel, TextSearch, Button, Layout } from "../../components";
import { useGetQuery } from "../../hooks/queries";
import { debounce } from "lodash";

interface PlaceSuggestion {
  description: string;
  placeId: string;
  mainText: string;
  secondaryText: string;
}

const Start = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [cityResults, setCityResults] = useState<PlaceSuggestion[]>([]);
  const [selectedCity, setSelectedCity] = useState<PlaceSuggestion | null>(null);
  
  const { refetch: fetchPlaces, isFetching } = useGetQuery(
    `/places?q=${encodeURIComponent(searchQuery)}`,
    ["get-places-autocomplete"],
  );

  // Debounced search function
  const debouncedSearch = debounce((query: string) => {
    if (query.length > 0) {
      fetchPlaces().then((response) => {
        if (response.data?.data) {
          setCityResults(response.data.data);
        }
      });
    } else {
      setCityResults([]);
    }
  }, 500);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const handleSelectCity = (city: PlaceSuggestion) => {
    setSelectedCity(city);
    setSearchQuery(city.mainText);
    setCityResults([]); // Clear results after selection
  };

  const handleCreateSession = () => {
    if (!selectedCity) return;
    
    // Call your create session API with selectedCity.placeId
    console.log('Creating session for:', selectedCity);
  };

  return (
    <Layout>
      <Panel backgroundColor="bg-black-200" className="w-96">
        <span className="mb-2 block">Select a city of your choice:</span>
        
        <TextSearch
          placeholder="e.g. New York"
          value={searchQuery}
          onSearch={handleSearch}
          results={cityResults}
          onSelect={handleSelectCity}
          renderResult={(city) => (
            <div>
              <div className="font-semibold">{city.mainText}</div>
              <div className="text-sm text-black-600">{city.secondaryText}</div>
            </div>
          )}
          getResultKey={(city) => city.placeId}
          isLoading={isFetching}
        />
        
        {selectedCity && (
          <div className="mb-4 p-2 bg-black-100 rounded">
            <span className="text-sm">Selected: {selectedCity.description}</span>
          </div>
        )}
        
        <div className="flex justify-end w-full">
          <Button.Primary
            onClick={handleCreateSession}
            text="Create Session"
            type="button"
            disabled={!selectedCity}
          />
        </div>
      </Panel>
    </Layout>
  );
};

export default Start;
```

---

## Component Props

### `TextSearchProps<T>`

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `placeholder` | `string` | No | Placeholder text for input field |
| `value` | `string` | Yes | Current input value (controlled) |
| `onSearch` | `(query: string) => void` | Yes | Callback when user types - use to fetch results |
| `results` | `T[]` | Yes | Array of search results to display |
| `onSelect` | `(item: T) => void` | Yes | Callback when user selects an item |
| `renderResult` | `(item: T) => React.ReactNode` | Yes | Function to render each result item |
| `getResultKey` | `(item: T) => string` | Yes | Function to get unique key for each result |
| `isLoading` | `boolean` | No | Show loading state in dropdown |

---

## Features

### ✅ Keyboard Navigation
- **Arrow Down** - Move to next item
- **Arrow Up** - Move to previous item
- **Enter** - Select highlighted item
- **Escape** - Close dropdown

### ✅ Mouse Interaction
- **Hover** - Highlights item
- **Click** - Selects item
- **Click Outside** - Closes dropdown

### ✅ Visual Feedback
- Highlighted item has `bg-black-200` background
- Hover effect on non-highlighted items (`hover:bg-black-100`)
- Loading state shows "Loading..." text

### ✅ Accessibility
- Proper keyboard navigation
- Visual focus indicators
- Screen reader friendly structure

---

## Styling

The component uses Tailwind CSS classes that match your existing design system:
- `border-black-900` - Border color
- `bg-black-200` - Highlighted background
- `bg-black-100` - Hover background
- `text-black-600` - Secondary text color
- `shadow-lg` - Dropdown shadow
- `max-h-60` - Max height with scroll

---

## Advanced Usage

### Custom Rendering

```tsx
<TextSearch
  renderResult={(city) => (
    <div className="flex items-center gap-2">
      <span className="text-xl">📍</span>
      <div>
        <div className="font-bold text-lg">{city.mainText}</div>
        <div className="text-xs text-gray-500">{city.secondaryText}</div>
      </div>
    </div>
  )}
  // ... other props
/>
```

### With Empty State

```tsx
const results = cityResults.length > 0 ? cityResults : [
  { placeId: 'empty', mainText: 'No results found', secondaryText: '', description: '' }
];

<TextSearch
  results={results}
  renderResult={(city) => 
    city.placeId === 'empty' ? (
      <div className="text-black-500 italic">No results found</div>
    ) : (
      <div>
        <div className="font-semibold">{city.mainText}</div>
        <div className="text-sm">{city.secondaryText}</div>
      </div>
    )
  }
  // ... other props
/>
```

---

## TypeScript Support

The component is fully typed with generics, so it works with any result type:

```tsx
interface City {
  id: string;
  name: string;
  country: string;
}

<TextSearch<City>
  results={cities}
  getResultKey={(city) => city.id}
  renderResult={(city) => (
    <div>
      <span>{city.name}</span>
      <span>, {city.country}</span>
    </div>
  )}
  // ...
/>
```

