import { NextRequest, NextResponse } from 'next/server';

import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

const MAX_FILES = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]);

const BUCKET = 'custom-uploads';

async function ensureBucket(): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase storage is not configured.');
  }
  const res = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: BUCKET,
      name: BUCKET,
      public: true,
    }),
  });
  // 409 = already exists — that's fine.
  if (!res.ok && res.status !== 409) {
    const body = await res.text();
    throw new Error(`Failed to prepare upload storage: ${body}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData
      .getAll('files')
      .filter((entry): entry is File => entry instanceof File);

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded.' }, { status: 400 });
    }
    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `You can upload up to ${MAX_FILES} reference photos.` },
        { status: 400 },
      );
    }
    for (const file of files) {
      if (!ALLOWED_TYPES.has(file.type)) {
        return NextResponse.json(
          { error: `Unsupported file type: ${file.type || 'unknown'}` },
          { status: 400 },
        );
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File "${file.name}" exceeds the 5MB limit.` },
          { status: 400 },
        );
      }
    }

    const supabase = createAdminClient();
    const uploaded: string[] = [];

    await ensureBucket();

    for (const file of files) {
      const safeName = file.name
        .replace(/[^a-zA-Z0-9._-]/g, '-')
        .slice(-60);
      const path = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${safeName}`;
      const { error } = await supabase.storage
        .from('custom-uploads')
        .upload(path, file, { contentType: file.type, upsert: true });
      if (error) {
        return NextResponse.json(
          { error: `Upload failed for "${file.name}": ${error.message}` },
          { status: 500 },
        );
      }
      const { data: publicUrlData } = supabase.storage
        .from('custom-uploads')
        .getPublicUrl(path);
      uploaded.push(publicUrlData.publicUrl);
    }

    return NextResponse.json({ urls: uploaded });
  } catch (error) {
    console.error('[api/uploads] Upload failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed.' },
      { status: 500 },
    );
  }
}