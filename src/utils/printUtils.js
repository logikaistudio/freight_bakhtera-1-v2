/**
 * Print utility untuk generate printable BL/AWB certificates
 * Menggunakan window.print() dengan custom CSS untuk print layout
 */

/**
 * Generate HTML untuk BL Certificate yang siap print
 * @param {Object} blData - Data BL lengkap
 * @returns {string} HTML string
 */
export const generateBLPrintHTML = (blData) => {
    const today = new Date().toLocaleDateString('id-ID');

    // Service items table rows
    const serviceItemsHTML = blData.serviceItems.map(item => `
        <tr>
            <td class="border px-2 py-1 text-sm">${item.description}</td>
            <td class="border px-2 py-1 text-center text-sm">${item.qty}</td>
            <td class="border px-2 py-1 text-center text-sm">${item.unit}</td>
            <td class="border px-2 py-1 text-right text-sm">${blData.currency} ${item.sellingTotal.toLocaleString()}</td>
            <td class="border px-2 py-1 text-right text-sm">${blData.currency} ${item.buyingTotal.toLocaleString()}</td>
            <td class="border px-2 py-1 text-right text-sm font-semibold">${blData.currency} ${item.profit.toLocaleString()}</td>
            <td class="border px-2 py-1 text-center text-sm">${item.margin.toFixed(1)}%</td>
        </tr>
    `).join('');

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>BL Certificate - ${blData.blNumber}</title>
    <style>
        @media print {
            @page {
                size: A4;
                margin: 10mm;
            }
            body {
                margin: 0;
                padding: 0;
            }
            .no-print {
                display: none !important;
            }
        }
        
        body {
            font-family: 'Courier New', monospace;
            font-size: 11pt;
            line-height: 1.3;
            color: #000;
            background: white;
            margin: 20px;
        }
        
        .header {
            text-align: center;
            font-weight: bold;
            font-size: 14pt;
            margin-bottom: 20px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
        }
        
        .section {
            margin-bottom: 15px;
        }
        
        .section-title {
            font-weight: bold;
            text-decoration: underline;
            margin-bottom: 5px;
        }
        
        .info-row {
            display: flex;
            margin-bottom: 3px;
        }
        
        .info-label {
            width: 200px;
            font-weight: bold;
        }
        
        .info-value {
            flex: 1;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            font-size: 10pt;
        }
        
        th {
            background-color: #333;
            color: white;
            font-weight: bold;
            padding: 8px 4px;
            text-align: left;
            border: 1px solid #000;
        }
        
        td {
            padding: 6px 4px;
            border: 1px solid #666;
        }
        
        .total-row {
            background-color: #f0f0f0;
            font-weight: bold;
            font-size: 11pt;
        }
        
        .signature-section {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
        }
        
        .signature-box {
            width: 45%;
            text-align: center;
        }
        
        .signature-line {
            border-top: 1px solid #000;
            margin-top: 60px;
            padding-top: 5px;
        }
        
        .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
        
        .print-button:hover {
            background: #0056b3;
        }
    </style>
</head>
<body>
    <button class="print-button no-print" onclick="window.print()">🖨️ Print</button>
    
    <div class="header">
        BAKHTERA FREIGHT FORWARDER<br>
        OCEAN BILL OF LADING
    </div>
    
    <div class="section">
        <div class="info-row">
            <span class="info-label">Job Number:</span>
            <span class="info-value">${blData.jobNumber || 'N/A'}</span>
            <span class="info-label">Date:</span>
            <span class="info-value">${today}</span>
        </div>
        <div class="info-row">
            <span class="info-label">BL Number:</span>
            <span class="info-value">${blData.blNumber}</span>
            <span class="info-label">BL Type:</span>
            <span class="info-value">${blData.blType}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Shipment Number:</span>
            <span class="info-value">${blData.shipmentNumber}</span>
        </div>
    </div>
    
    <div class="section">
        <div class="section-title">SHIPPER (Bill To):</div>
        <div>${blData.customer || ''}</div>
        <div>${blData.customerAddress || ''}</div>
    </div>
    
    <div class="section">
        <div class="section-title">CONSIGNEE:</div>
        <div>${blData.consignee || ''}</div>
        <div>${blData.consigneeAddress || ''}</div>
    </div>
    
    <div class="section">
        <div class="section-title">SHIPPING DETAILS:</div>
        <div class="info-row">
            <span class="info-label">Shipping Line:</span>
            <span class="info-value">${blData.shippingLine}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Vessel/Voyage:</span>
            <span class="info-value">${blData.vesselVoyage}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Port of Loading:</span>
            <span class="info-value">${blData.origin}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Port of Discharge:</span>
            <span class="info-value">${blData.destination}</span>
        </div>
        ${blData.containerNumber ? `
        <div class="info-row">
            <span class="info-label">Container Number:</span>
            <span class="info-value">${blData.containerNumber} (${blData.containerType || ''})</span>
        </div>` : ''}
        ${blData.sealNumber ? `
        <div class="info-row">
            <span class="info-label">Seal Number:</span>
            <span class="info-value">${blData.sealNumber}</span>
        </div>` : ''}
        ${blData.measurement ? `
        <div class="info-row">
            <span class="info-label">Measurement:</span>
            <span class="info-value">${blData.measurement}</span>
        </div>` : ''}
        ${blData.grossWeight ? `
        <div class="info-row">
            <span class="info-label">Gross Weight:</span>
            <span class="info-value">${blData.grossWeight}</span>
        </div>` : ''}
    </div>
    
    <div class="section">
        <div class="section-title">FREIGHT CHARGES BREAKDOWN:</div>
        <table>
            <thead>
                <tr>
                    <th>Description</th>
                    <th style="width: 60px; text-align: center;">Qty</th>
                    <th style="width: 80px; text-align: center;">Unit</th>
                    <th style="width: 100px; text-align: right;">Selling</th>
                    <th style="width: 100px; text-align: right;">Buying</th>
                    <th style="width: 100px; text-align: right;">Profit</th>
                    <th style="width: 80px; text-align: center;">Margin</th>
                </tr>
            </thead>
            <tbody>
                ${serviceItemsHTML}
                <tr class="total-row">
                    <td colspan="3" style="text-align: right; padding-right: 10px;">GRAND TOTAL:</td>
                    <td style="text-align: right;">${blData.currency} ${blData.grandTotal.selling.toLocaleString()}</td>
                    <td style="text-align: right;">${blData.currency} ${blData.grandTotal.buying.toLocaleString()}</td>
                    <td style="text-align: right;">${blData.currency} ${blData.grandTotal.profit.toLocaleString()}</td>
                    <td style="text-align: center;">${blData.grandTotal.margin.toFixed(1)}%</td>
                </tr>
            </tbody>
        </table>
    </div>
    
    <div class="signature-section no-print">
        <div class="signature-box">
            <div class="signature-line">
                Shipper's Signature
            </div>
        </div>
        <div class="signature-box">
            <div class="signature-line">
                Carrier's Signature<br>
                For: BAKHTERA FREIGHT FORWARDER
            </div>
        </div>
    </div>
</body>
</html>
    `;
};

/**
 * Print BL Certificate
 * Open new window dengan printable HTML dan trigger print dialog
 * @param {Object} blData - Data BL
 */
export const printBLCertificate = (blData) => {
    const htmlContent = generateBLPrintHTML(blData);

    // Open new window
    const printWindow = window.open('', '_blank', 'width=800,height=600');

    if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();

        // Wait for content to load then trigger print
        printWindow.onload = () => {
            // Small delay to ensure styles are applied
            setTimeout(() => {
                // Auto print after 500ms
                // printWindow.print();
            }, 500);
        };
    } else {
        alert('Please allow popups to print the certificate');
    }
};

/**
 * Generate AWB Print HTML
 * @param {Object} awbData - Data AWB
 * @returns {string} HTML string
 */
export const generateAWBPrintHTML = (awbData) => {
    const today = new Date().toLocaleDateString('id-ID');

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>AWB Certificate - ${awbData.awbNumber}</title>
    <style>
        @media print {
            @page { size: A4; margin: 10mm; }
            body { margin: 0; padding: 0; }
            .no-print { display: none !important; }
        }
        body {
            font-family: 'Courier New', monospace;
            font-size: 11pt;
            line-height: 1.3;
            color: #000;
            background: white;
            margin: 20px;
        }
        .header {
            text-align: center;
            font-weight: bold;
            font-size: 14pt;
            margin-bottom: 20px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
        }
        .section { margin-bottom: 15px; }
        .info-row { display: flex; margin-bottom: 3px; }
        .info-label { width: 200px; font-weight: bold; }
        .info-value { flex: 1; }
        .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <button class="print-button no-print" onclick="window.print()">🖨️ Print</button>
    
    <div class="header">
        BAKHTERA FREIGHT FORWARDER<br>
        AIR WAYBILL (AWB)
    </div>
    
    <div class="section">
        <div class="info-row">
            <span class="info-label">Job Number:</span>
            <span class="info-value">${awbData.jobNumber || 'N/A'}</span>
            <span class="info-label">Date:</span>
            <span class="info-value">${today}</span>
        </div>
        <div class="info-row">
            <span class="info-label">AWB Number:</span>
            <span class="info-value">${awbData.awbNumber}</span>
            <span class="info-label">Type:</span>
            <span class="info-value">${awbData.awbType}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Airline:</span>
            <span class="info-value">${awbData.airline}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Flight:</span>
            <span class="info-value">${awbData.flightNumber}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Route:</span>
            <span class="info-value">${awbData.origin} → ${awbData.destination}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Weight:</span>
            <span class="info-value">${awbData.chargeableWeight} kg (${awbData.pieces} pieces)</span>
        </div>
    </div>
    
    <div class="section">
        <h3>CHARGES SUMMARY</h3>
        <div class="info-row">
            <span class="info-label">Selling Rate:</span>
            <span class="info-value">${awbData.currency} ${awbData.sellingRate.toLocaleString()} / kg</span>
        </div>
        <div class="info-row">
            <span class="info-label">Total Selling:</span>
            <span class="info-value">${awbData.currency} ${awbData.sellingTotal.toLocaleString()}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Buying Rate:</span>
            <span class="info-value">${awbData.currency} ${awbData.buyingRate.toLocaleString()} / kg</span>
        </div>
        <div class="info-row">
            <span class="info-label">Total Buying:</span>
            <span class="info-value">${awbData.currency} ${awbData.buyingTotal.toLocaleString()}</span>
        </div>
        <div class="info-row" style="margin-top: 10px; font-weight: bold; font-size: 12pt;">
            <span class="info-label">GROSS PROFIT:</span>
            <span class="info-value">${awbData.currency} ${awbData.profit.toLocaleString()} (${awbData.margin.toFixed(1)}%)</span>
        </div>
    </div>
</body>
</html>
    `;
};

/**
 * Print AWB Certificate
 * @param {Object} awbData - Data AWB
 */
export const printAWBCertificate = (awbData) => {
    const htmlContent = generateAWBPrintHTML(awbData);
    const printWindow = window.open('', '_blank', 'width=800,height=600');

    if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
    } else {
        alert('Please allow popups to print the certificate');
    }
};
