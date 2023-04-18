import {useEffect, useState} from "react";

function useLocalState(defaultValue, key, reset = false) {
    const [value, setValue] = useState(() => {
        if (reset) {
            localStorage.removeItem(key);
            return defaultValue;
        }
        const localStorageValue = localStorage.getItem(key);

        return localStorageValue === null
            ? defaultValue
            : JSON.parse(localStorageValue);
    });
    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);

    return [value, setValue];
}

export {useLocalState}