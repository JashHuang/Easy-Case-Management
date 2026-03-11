import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { S3Client, DeleteObjectCommand } from 'https://esm.sh/@aws-sdk/client-s3@3.637.0'

interface RequestBody {
  attachment_id?: string
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
}

const JSON_HEADERS = { 'Content-Type': 'application/json', ...CORS_HEADERS }

function jsonResponse(payload: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: JSON_HEADERS })
}

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS })
    }

    if (req.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405)
    }

    const body = (await req.json()) as RequestBody
    const attachmentId = body.attachment_id

    if (!attachmentId) {
      return jsonResponse({ error: 'attachment_id is required' }, 400)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const requestApiKey = req.headers.get('apikey') ?? req.headers.get('x-supabase-api-key') ?? ''
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || requestApiKey
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return jsonResponse({ error: 'Missing Supabase env vars' }, 500)
    }

    const authHeader = req.headers.get('Authorization') ?? ''
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: userData, error: userError } = await userClient.auth.getUser()
    if (userError || !userData.user) {
      return jsonResponse({ error: 'Unauthorized' }, 401)
    }

    const { data: attachment, error: attachmentError } = await userClient
      .from('attachments')
      .select('id, storage_provider, storage_key')
      .eq('id', attachmentId)
      .single()

    if (attachmentError || !attachment) {
      return jsonResponse({ error: attachmentError?.message || 'Attachment not found' }, 404)
    }

    if (attachment.storage_provider === 'r2' && attachment.storage_key) {
      const r2AccountId = Deno.env.get('R2_ACCOUNT_ID')
      const r2AccessKeyId = Deno.env.get('R2_ACCESS_KEY_ID')
      const r2SecretAccessKey = Deno.env.get('R2_SECRET_ACCESS_KEY')
      const r2Bucket = Deno.env.get('R2_BUCKET')

      if (!r2AccountId || !r2AccessKeyId || !r2SecretAccessKey || !r2Bucket) {
        return jsonResponse({ error: 'Missing R2 env vars' }, 500)
      }

      const endpoint = `https://${r2AccountId}.r2.cloudflarestorage.com`
      const s3 = new S3Client({
        region: 'auto',
        endpoint,
        credentials: {
          accessKeyId: r2AccessKeyId,
          secretAccessKey: r2SecretAccessKey,
        },
      })

      await s3.send(
        new DeleteObjectCommand({
          Bucket: r2Bucket,
          Key: attachment.storage_key,
        })
      )
    }

    const { error: deleteError } = await userClient.from('attachments').delete().eq('id', attachmentId)
    if (deleteError) {
      return jsonResponse({ error: deleteError.message }, 500)
    }

    return jsonResponse({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return jsonResponse({ error: message }, 500)
  }
})
