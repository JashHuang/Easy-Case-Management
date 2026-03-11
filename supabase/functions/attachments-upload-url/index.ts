import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { S3Client, PutObjectCommand } from 'https://esm.sh/@aws-sdk/client-s3@3.637.0'
import { getSignedUrl } from 'https://esm.sh/@aws-sdk/s3-request-presigner@3.637.0'

interface RequestBody {
  case_id?: string
  file_name?: string
  content_type?: string
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

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
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
    const caseId = body.case_id
    const fileName = body.file_name
    const contentType = body.content_type || 'application/octet-stream'

    if (!caseId || !fileName) {
      return jsonResponse({ error: 'case_id and file_name are required' }, 400)
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

    const objectKey = `${caseId}/${crypto.randomUUID()}/${sanitizeFileName(fileName)}`
    const command = new PutObjectCommand({
      Bucket: r2Bucket,
      Key: objectKey,
      ContentType: contentType,
    })

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 })

    return jsonResponse({
      uploadUrl,
      objectKey,
      expiresIn: 300,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return jsonResponse({ error: message }, 500)
  }
})
