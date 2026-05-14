import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

async function verifyAdmin(supabase: ReturnType<typeof createClient>, requestingUserId: string) {
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', requestingUserId)
    .eq('role', 'admin')
    .maybeSingle()
  return !!data
}

// Update user (display name, email, password, ban status)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await params
    const body = await request.json()
    const { requestingUserId, displayName, email, password, banned } = body

    if (!requestingUserId) {
      return NextResponse.json({ error: 'Requesting user ID required' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SECRET_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    if (!(await verifyAdmin(supabase, requestingUserId))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Build the update payload
    const updatePayload: Record<string, unknown> = {}

    if (typeof email === 'string') {
      updatePayload.email = email
    }
    if (typeof password === 'string') {
      updatePayload.password = password
    }
    if (typeof banned === 'boolean') {
      updatePayload.ban_duration = banned ? '876600h' : 'none' // ~100 years or unban
    }
    if (typeof displayName === 'string') {
      updatePayload.user_metadata = { display_name: displayName }
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const { data, error } = await supabase.auth.admin.updateUserById(targetUserId, updatePayload)

    if (error) {
      console.error('Failed to update user:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        displayName: data.user.user_metadata?.display_name || '',
        banned: !!data.user.banned_until,
      }
    })

  } catch (error) {
    console.error('Admin API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// Delete user
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await params
    const { searchParams } = new URL(request.url)
    const requestingUserId = searchParams.get('userId')

    if (!requestingUserId) {
      return NextResponse.json({ error: 'Requesting user ID required' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SECRET_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    if (!(await verifyAdmin(supabase, requestingUserId))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Prevent admin from deleting themselves
    if (targetUserId === requestingUserId) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    const { error } = await supabase.auth.admin.deleteUser(targetUserId)

    if (error) {
      console.error('Failed to delete user:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Admin API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
