/**
 * Blink Document Number Generator
 * Standardized numbering format for all Blink documents
 * 
 * Format:
 * - Quotation: BLKYYMM-XXXX
 * - SO: BLKYYMM-SO-XXXX (follows quotation number)
 * - Invoice: INV-BLKYYMM-XXXX (follows quotation number)
 * - PO: PO-BLKYYMM-XXXX
 */

import { supabase } from '../lib/supabase';

/**
 * Get current YYMM format
 * @returns {string} e.g., "2601" for January 2026
 */
export const getYYMM = () => {
    const date = new Date();
    const yy = date.getFullYear().toString().substr(-2);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    return `${yy}${mm}`;
};

/**
 * Generate Quotation Number
 * Format: BLKYYMM-XXXX
 * @returns {Promise<string>} Generated quotation number
 */
export const generateQuotationNumber = async () => {
    const yymm = getYYMM();
    const prefix = `BLK${yymm}`;

    try {
        // Get the latest quotation number for this month
        const { data, error } = await supabase
            .from('blink_quotations')
            .select('quotation_number')
            .like('quotation_number', `${prefix}%`)
            .order('quotation_number', { ascending: false })
            .limit(1);

        if (error) throw error;

        let nextNumber = 1;
        if (data && data.length > 0) {
            // Extract the sequence number from the last quotation
            const lastNumber = data[0].quotation_number;
            const match = lastNumber.match(/-(\d+)$/);
            if (match) {
                nextNumber = parseInt(match[1]) + 1;
            }
        }

        return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
    } catch (error) {
        console.error('Error generating quotation number:', error);
        // Fallback using timestamp
        return `${prefix}-${String(Date.now()).slice(-4)}`;
    }
};

/**
 * Generate SO Number from Quotation Number
 * Format: BLKYYMM-SO-XXXX (based on quotation number)
 * @param {string} quotationNumber - The base quotation number
 * @returns {string} SO number
 */
export const generateSONumber = (quotationNumber) => {
    if (!quotationNumber) {
        const yymm = getYYMM();
        return `BLK${yymm}-SO-0001`;
    }

    // Insert -SO- before the sequence number
    // BLK2601-0001 -> BLK2601-SO-0001
    const parts = quotationNumber.split('-');
    if (parts.length >= 2) {
        return `${parts[0]}-SO-${parts[1]}`;
    }

    return `${quotationNumber}-SO`;
};

/**
 * Generate Invoice Number from Quotation Number
 * Format: INV-BLKYYMM-XXXX (based on quotation number)
 * @param {string} quotationNumber - The base quotation number
 * @returns {string} Invoice number
 */
export const generateInvoiceNumber = (quotationNumber) => {
    if (!quotationNumber) {
        const yymm = getYYMM();
        return `INV-BLK${yymm}-0001`;
    }

    // Prepend INV- to the quotation number
    // BLK2601-0001 -> INV-BLK2601-0001
    return `INV-${quotationNumber}`;
};

/**
 * Generate PO Number
 * Format: PO-BLKYYMM-XXXX
 * @returns {Promise<string>} Generated PO number
 */
export const generatePONumber = async () => {
    const yymm = getYYMM();
    const prefix = `PO-BLK${yymm}`;

    try {
        // Get the latest PO number for this month
        const { data, error } = await supabase
            .from('blink_purchase_orders')
            .select('po_number')
            .like('po_number', `${prefix}%`)
            .order('po_number', { ascending: false })
            .limit(1);

        if (error) throw error;

        let nextNumber = 1;
        if (data && data.length > 0) {
            // Extract the sequence number from the last PO
            const lastNumber = data[0].po_number;
            const match = lastNumber.match(/-(\d+)$/);
            if (match) {
                nextNumber = parseInt(match[1]) + 1;
            }
        }

        return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
    } catch (error) {
        console.error('Error generating PO number:', error);
        // Fallback using timestamp
        return `${prefix}-${String(Date.now()).slice(-4)}`;
    }
};

/**
 * Generate AP Number
 * Format: AP-YYMM-XXXXXX
 * @returns {string} AP number
 */
export const generateAPNumber = () => {
    const yymm = getYYMM();
    return `AP-${yymm}-${String(Date.now()).slice(-6)}`;
};

/**
 * Generate AR Number
 * Format: AR-YYMM-XXXXXX
 * @returns {string} AR number
 */
export const generateARNumber = () => {
    const yymm = getYYMM();
    return `AR-${yymm}-${String(Date.now()).slice(-6)}`;
};

/**
 * Generate Payment Number
 * Format: PAY-IN-YYMM-XXXXXX (incoming) or PAY-OUT-YYMM-XXXXXX (outgoing)
 * @param {string} type - 'in' or 'out'
 * @returns {string} Payment number
 */
export const generatePaymentNumber = (type = 'in') => {
    const yymm = getYYMM();
    const suffix = type === 'out' ? 'OUT' : 'IN';
    return `PAY-${suffix}-${yymm}-${String(Date.now()).slice(-6)}`;
};
