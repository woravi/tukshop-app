import { readFile } from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const contentTypes: Record<string, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

export async function GET(_request: Request, { params }: { params: { filename: string } }) {
  // Accept only filenames created by our upload handler, never a path.
  const match = /^product-\d+-[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.(jpg|png|webp)$/.exec(params.filename);
  if (!match) return new NextResponse(null, { status: 404 });

  try {
    const image = await readFile(path.join(process.cwd(), 'public', 'uploads', params.filename));
    return new NextResponse(new Uint8Array(image), {
      headers: {
        'Content-Type': contentTypes[match[1]],
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    const missing = (error as NodeJS.ErrnoException).code === 'ENOENT';
    return new NextResponse(null, { status: missing ? 404 : 500 });
  }
}
