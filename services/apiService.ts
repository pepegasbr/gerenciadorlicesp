import type { Executive, License } from '../types';

interface ApiResponse {
    executives: Executive[];
    licenses: License[];
    referenceMonth: string;
    referenceYear: number;
}

export const getData = async (url: string): Promise<ApiResponse> => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    if (result.status === 'error') {
        throw new Error(result.message || 'Error from Apps Script');
    }
    
    // The script now returns a nested object { status: "success", data: { ... } }
    // We need to return the inner 'data' object which matches the ApiResponse type.
    if (result.data && result.status === 'success') {
        return result.data;
    }

    // Throw an error if the response format is not what we expect.
    throw new Error("Formato de resposta da API inválido.");
};

export const updateData = async (url: string, action: string, payload: any): Promise<any> => {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
             // Using text/plain is a common workaround for simple POSTs to Google Apps Script to avoid CORS preflight requests.
            'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({ action, payload }),
        redirect: 'follow',
    });

    if (!response.ok) {
        throw new Error(`Network response was not ok. Status: ${response.status}`);
    }

    const result = await response.json();
    if (result.status !== 'success') {
        throw new Error(result.message || 'An error occurred in the Apps Script.');
    }
    return result;
};