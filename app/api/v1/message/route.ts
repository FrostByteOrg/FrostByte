import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { Database } from '@/types/database.supabase';
import { sanitizeMessage } from '@/lib/messageHelpers';

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies });

  const { profile_id, channel_id, message } = await request.json();
  const content = sanitizeMessage(message.trim());

  const data = await supabase.rpc('createmessage', {
    content,
    p_id: profile_id,
    c_id: channel_id,
  });
  console.log(data);
  return NextResponse.json(message);
}
