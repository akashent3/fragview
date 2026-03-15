import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import sharp from 'sharp';

const s3Client = new S3Client({ region: process.env.AWS_REGION || 'ap-south-1' });

// 🔒 STRICTER RATE LIMITING - 10 uploads per hour
const limiter = rateLimit({ interval: 3600000, uniqueTokenPerInterval: 10 });

export async function POST(req: NextRequest) {
  try {
    const rateLimitResult = await limiter(req);
    if (rateLimitResult) return rateLimitResult;

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'misc';

    // 🔒 VALIDATE FILE EXISTS FIRST
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // 🔒 VALIDATE FILENAME
    const originalFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '');
    if (originalFilename.length === 0) {
      return NextResponse.json(
        { error: 'Invalid filename' },
        { status: 400 }
      );
    }

    // 🔒 VALIDATE FILE EXTENSION (more secure than MIME type alone)
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    const extension = originalFilename.split('.').pop()?.toLowerCase();
    
    if (!extension || !allowedExtensions.includes(extension)) {
      return NextResponse.json(
        { error: 'Invalid file type.  Only JPG, PNG, and WebP are allowed.' },
        { status: 400 }
      );
    }

    // Validate MIME type (belt and suspenders approach)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file MIME type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      );
    }

    // 🔒 VALIDATE FILE SIZE (10MB max input — sharp will compress output to ≤1MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // 🔒 VALIDATE FILE CONTENT (check magic bytes for real file type)
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);
    
    // Check magic bytes to verify actual file type
    if (! isValidImageFile(uint8Array, extension)) {
      return NextResponse.json(
        { error: 'File content does not match file extension.  Possible file tampering detected.' },
        { status: 400 }
      );
    }

    // Generate filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);

    // 🔒 STRICT FOLDER SANITIZATION - only allow specific folders
    const allowedFolders = ['reviews', 'avatars', 'articles', 'misc'];
    const safeFolder = allowedFolders.includes(folder) ? folder : 'misc';

    // 🗜️ COMPRESS with sharp — iteratively reduce quality until output ≤ 1MB
    const TARGET_BYTES = 1 * 1024 * 1024; // 1MB
    let finalBuffer: Buffer;
    let finalExtension = 'jpg'; // always output JPEG for max compression

    const sharpBase = sharp(Buffer.from(buffer)).rotate(); // auto-rotate from EXIF
    let quality = 82;
    let compressed = await sharpBase.clone().jpeg({ quality, mozjpeg: true }).toBuffer();

    while (compressed.length > TARGET_BYTES && quality > 20) {
      quality -= 10;
      compressed = await sharpBase.clone().jpeg({ quality, mozjpeg: true }).toBuffer();
    }
    finalBuffer = compressed;

    const filename = `${safeFolder}/${session.user.id}/${timestamp}-${randomString}.${finalExtension}`;

    // Upload to AWS S3
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: filename,
      Body: finalBuffer,
      ContentType: 'image/jpeg',
    }));

    const url = `https://${process.env.AWS_CLOUDFRONT_DOMAIN}/${filename}`;

    return NextResponse.json({
      success: true,
      url,
      filename: filename,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}

// 🔒 HELPER FUNCTION: Validate file by magic bytes
function isValidImageFile(bytes: Uint8Array, extension: string): boolean {
  // JPEG magic bytes: FF D8 FF
  if (extension === 'jpg' || extension === 'jpeg') {
    return bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF;
  }
  
  // PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
  if (extension === 'png') {
    return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47;
  }
  
  // WebP magic bytes: RIFF.... WEBP
  if (extension === 'webp') {
    return bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
           bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
  }
  
  return false;
}