/**
 * Letterhead Generator Utility
 * Generates consistent company letterhead HTML for all print documents
 */

/**
 * Generate HTML letterhead from company settings
 * @param {Object} companySettings - Company settings object from Supabase
 * @returns {string} HTML string for letterhead
 */
export const generateLetterhead = (companySettings) => {
    if (!companySettings) {
        return `
            <div class="letterhead">
                <h1 class="company-name">PT Bakhtera Satu Indonesia</h1>
                <p class="company-address">Jakarta, Indonesia</p>
            </div>
        `;
    }

    const {
        company_name = 'PT Bakhtera Satu Indonesia',
        company_address = '',
        company_phone = '',
        company_fax = '',
        company_email = '',
        company_npwp = '',
        logo_url = ''
    } = companySettings;

    // Build contact info parts
    const contactParts = [];
    if (company_phone) contactParts.push(`Tel: ${company_phone}`);
    if (company_fax) contactParts.push(`Fax: ${company_fax}`);
    if (company_email) contactParts.push(`Email: ${company_email}`);

    const contactLine = contactParts.join(' | ');

    return `
        <div class="letterhead">
            <div class="letterhead-content">
                ${logo_url ? `
                    <div class="letterhead-logo">
                        <img src="${logo_url}" alt="${company_name}" />
                    </div>
                ` : ''}
                <div class="letterhead-info ${logo_url ? 'with-logo' : ''}">
                    <h1 class="company-name">${company_name}</h1>
                    ${company_address ? `<p class="company-address">${company_address.replace(/\n/g, '<br/>')}</p>` : ''}
                    ${contactLine ? `<p class="company-contact">${contactLine}</p>` : ''}
                    ${company_npwp ? `<p class="company-npwp">NPWP: ${company_npwp}</p>` : ''}
                </div>
            </div>
            <div class="letterhead-divider"></div>
        </div>
    `;
};

/**
 * Generate CSS styles for letterhead
 * @returns {string} CSS string for letterhead styling
 */
export const getLetterheadStyles = () => {
    return `
        .letterhead {
            margin-bottom: 20px;
        }
        .letterhead-content {
            display: flex;
            align-items: center;
            gap: 20px;
        }
        .letterhead-logo {
            flex-shrink: 0;
        }
        .letterhead-logo img {
            max-width: 100px;
            max-height: 80px;
            object-fit: contain;
        }
        .letterhead-info {
            flex: 1;
        }
        .letterhead-info.with-logo {
            text-align: left;
        }
        .letterhead-info:not(.with-logo) {
            text-align: center;
        }
        .company-name {
            margin: 0 0 5px 0;
            color: #0070BB;
            font-size: 22px;
            font-weight: bold;
        }
        .company-address {
            margin: 0 0 3px 0;
            font-size: 11px;
            color: #444;
            line-height: 1.4;
        }
        .company-contact {
            margin: 0 0 3px 0;
            font-size: 10px;
            color: #666;
        }
        .company-npwp {
            margin: 0;
            font-size: 10px;
            color: #666;
        }
        .letterhead-divider {
            margin-top: 15px;
            border-top: 2px solid #0070BB;
            border-bottom: 1px solid #0070BB;
            height: 3px;
        }
    `;
};

/**
 * Generate complete print document HTML with letterhead
 * @param {Object} options - Print options
 * @param {Object} options.companySettings - Company settings object
 * @param {string} options.title - Document title
 * @param {string} options.bodyContent - Main document content HTML
 * @param {string} options.additionalStyles - Additional CSS styles
 * @returns {string} Complete HTML document
 */
export const generatePrintDocument = ({
    companySettings,
    title,
    bodyContent,
    additionalStyles = ''
}) => {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>${title}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    font-family: Arial, Helvetica, sans-serif;
                    margin: 20px;
                    color: #333;
                    line-height: 1.4;
                    font-size: 11px;
                }
                ${getLetterheadStyles()}
                ${additionalStyles}
                
                /* Print utilities */
                .button-container {
                    margin-top: 30px;
                    text-align: center;
                }
                .button-container button {
                    padding: 10px 25px;
                    margin: 0 8px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: bold;
                }
                .btn-print {
                    background: #0070BB;
                    color: white;
                }
                .btn-print:hover {
                    background: #005a99;
                }
                .btn-close {
                    background: #666;
                    color: white;
                }
                .btn-close:hover {
                    background: #555;
                }
                @media print {
                    .button-container { display: none; }
                    body { margin: 10px; }
                }
            </style>
        </head>
        <body>
            ${generateLetterhead(companySettings)}
            ${bodyContent}
            <div class="button-container">
                <button onclick="window.print()" class="btn-print">🖨️ Print</button>
                <button onclick="window.close()" class="btn-close">✖ Close</button>
            </div>
        </body>
        </html>
    `;
};

/**
 * Open print window with letterhead document
 * @param {Object} options - Same as generatePrintDocument options
 * @returns {Window|null} Print window reference
 */
export const openPrintWindow = (options) => {
    const printWindow = window.open('', '_blank');

    if (!printWindow) {
        alert('Pop-up blocked! Please allow pop-ups for this site.');
        return null;
    }

    const htmlContent = generatePrintDocument(options);
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    return printWindow;
};
