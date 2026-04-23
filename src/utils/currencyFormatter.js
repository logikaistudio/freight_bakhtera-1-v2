export const formatCurrency = (value) => {
    if (value === null || value === undefined || value === '') {
        return '0';
    }

    let num = value;
    if (typeof value === 'string') {
        num = parseCurrency(value);
    }

    if (isNaN(num)) {
        return '0';
    }

    const strNum = num.toString();
    const decPlaces = strNum.includes('.') ? strNum.split('.')[1].length : 0;

    return num.toLocaleString('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: Math.max(decPlaces, 10)
    });
};

// Format currency with prefix symbol based on currency code
export const formatWithCurrency = (value, currencyCode = 'IDR') => {
    const formatted = formatCurrency(value);
    const prefix = getCurrencySymbol(currencyCode);
    return `${prefix} ${formatted}`;
};

// Get currency symbol/prefix
export const getCurrencySymbol = (code) => {
    const symbols = {
        'IDR': 'Rp',
        'USD': '$',
        'EUR': '€',
        'SGD': 'S$',
        'JPY': '¥',
        'CNY': '¥',
        'GBP': '£',
    };
    return symbols[code] || code;
};

// Helper function to parse formatted currency back to number
export const parseCurrency = (value) => {
    if (value === undefined || value === null || value === '') return 0;
    if (typeof value === 'number') return value;
    
    let str = value.toString().trim();
    
    // If the string contains both dot and comma (e.g. 1.000,50)
    if (str.includes('.') && str.includes(',')) {
        str = str.replace(/\./g, '').replace(',', '.');
    } else if (str.includes(',')) {
        // Only comma, treat as decimal (e.g. 0,1)
        str = str.replace(',', '.');
    } else if (str.includes('.')) {
        // Only dot, could be thousand separator (1.000) or decimal (0.1)
        const parts = str.split('.');
        const lastPart = parts[parts.length - 1];
        if (parts.length > 2 || lastPart.length === 3) {
            // Treat dot as thousand separator
            str = str.replace(/\./g, '');
        } else {
            // Treat dot as decimal separator
            // No replacement needed, let parseFloat handle it
        }
    }
    
    return parseFloat(str) || 0;
};

// Hook for currency input handling
export const useCurrencyInput = (initialValue = 0) => {
    const [displayValue, setDisplayValue] = React.useState(formatCurrency(initialValue));
    const [numericValue, setNumericValue] = React.useState(initialValue);

    const handleChange = (e) => {
        const inputValue = e.target.value;
        const formatted = formatCurrency(inputValue);
        const numeric = parseCurrency(formatted);

        setDisplayValue(formatted);
        setNumericValue(numeric);

        return numeric;
    };

    const setValue = (value) => {
        const formatted = formatCurrency(value);
        const numeric = parseCurrency(formatted);
        setDisplayValue(formatted);
        setNumericValue(numeric);
    };

    return {
        displayValue,
        numericValue,
        handleChange,
        setValue
    };
};
