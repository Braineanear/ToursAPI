import sharp from 'sharp';

const resizeConvert = async (buffer, width, hight) =>
  await sharp(buffer)
    .resize({
      fit: sharp.fit.contain,
      width,
      hight
    })
    .webp({ lossless: true })
    .toBuffer();

export default resizeConvert;
