/**
 * Validates image files for upload
 * Supports: JPEG, JPG, PNG
 * Max size: 200KB
 */

export const validateImage = (file) => {
    const errors = [];

    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
        errors.push('Format file tidak valid. Hanya JPEG, JPG, dan PNG yang diperbolehkan.');
    }

    // Check file size (200KB = 200 * 1024 bytes)
    const maxSizeKB = 200;
    const maxSizeBytes = maxSizeKB * 1024;
    if (file.size > maxSizeBytes) {
        const fileSizeKB = Math.round(file.size / 1024);
        errors.push(`Ukuran file terlalu besar. Maksimal ${maxSizeKB}KB. File Anda: ${fileSizeKB}KB`);
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Converts file to base64 for preview
 */
export const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            resolve(event.target.result);
        };

        reader.onerror = (error) => {
            reject(error);
        };

        reader.readAsDataURL(file);
    });
};

/**
 * Validates and converts image file
 */
export const validateAndConvertImage = async (file) => {
    const validation = validateImage(file);

    if (!validation.isValid) {
        throw new Error(validation.errors.join('\n'));
    }

    const base64 = await fileToBase64(file);

    return {
        file,
        base64,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
    };
};
