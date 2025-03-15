function generateIcon(size, color = '#2196f3') {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Draw background
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, size, size);

    // Draw "OCR" text
    ctx.fillStyle = 'white';
    ctx.font = `${size / 4}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('OCR', size / 2, size / 2);

    return canvas.toDataURL('image/png');
}

// Generate icons for different sizes
const sizes = [16, 48, 128];
sizes.forEach(size => {
    const link = document.createElement('a');
    link.download = `icon${size}.png`;
    link.href = generateIcon(size);
    link.click();
}); 