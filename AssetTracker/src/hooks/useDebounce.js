import { useEffect, useState } from "react";

export default function useDebounce(value, delay = 3000) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler); // Cleanup
  }, [value, delay]);

  return debouncedValue;
}
