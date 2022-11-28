import { useState, useCallback, useRef, useEffect } from 'react'

class Utils {
    

  static Base64ToBlob(base64Image: string) :Blob
  {
      // Split into two parts
      const parts = base64Image.split(';base64,');
    
      // Hold the content type
      const imageType = parts[0].split(':')[1];
    
      // Decode Base64 string
      const decodedData = window.atob(parts[1]);
    
      // Create UNIT8ARRAY of size same as row data length
      const uInt8Array = new Uint8Array(decodedData.length);
    
      // Insert all character code into uInt8Array
      for (let i = 0; i < decodedData.length; ++i) {
        uInt8Array[i] = decodedData.charCodeAt(i);
      }
    
      // Return BLOB image after conversion
      return new Blob([uInt8Array], { type: imageType });
    }

  static delay(time: number)
  {
    return new Promise(resolve => setTimeout(resolve, 2000))
  }
}

function useStateCallback<T>(
  initialState: T
): [T, (state: T, cb?: (state: T) => void) => void] {
  const [state, setState] = useState(initialState);
  const cbRef = useRef<((state: T) => void) | undefined>(undefined); // init mutable ref container for callbacks

  const setStateCallback = useCallback((state: T, cb?: (state: T) => void) => {
    cbRef.current = cb; // store current, passed callback in ref
    setState(state);
  }, []); // keep object reference stable, exactly like `useState`

  useEffect(() => {
    // cb.current is `undefined` on initial render,
    // so we only invoke callback on state *updates*
    if (cbRef.current) {
      cbRef.current(state);
      cbRef.current = undefined; // reset callback after execution
    }
  }, [state]);

  return [state, setStateCallback];
}

export {Utils, useStateCallback}