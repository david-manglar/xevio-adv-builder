import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
  )
}

async function verifyAdmin(supabase: ReturnType<typeof createClient>, userId: string) {
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'admin')
    .maybeSingle()
  return !!data
}

// Create a new user
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { requestingUserId, email, password, displayName } = body

    if (!requestingUserId || !email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    if (!(await verifyAdmin(supabase, requestingUserId))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: displayName ? { display_name: displayName } : undefined,
    })

    if (error) {
      console.error('Failed to create user:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        displayName: data.user.user_metadata?.display_name || '',
      }
    })

  } catch (error) {
    console.error('Admin API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const requestingUserId = searchParams.get('userId')

    if (!requestingUserId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    if (!(await verifyAdmin(supabase, requestingUserId))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Fetch all users via Supabase Admin API
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 100,
    })

    if (usersError) {
      console.error('Failed to list users:', usersError)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    // Fetch campaign counts per user
    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('user_id, status')

    const countMap: Record<string, { total: number; drafted: number; completed: number }> = {}
    if (campaigns) {
      for (const c of campaigns) {
        if (!countMap[c.user_id]) {
          countMap[c.user_id] = { total: 0, drafted: 0, completed: 0 }
        }
        countMap[c.user_id].total++
        if (c.status === 'drafted') countMap[c.user_id].drafted++
        if (c.status === 'completed') countMap[c.user_id].completed++
      }
    }

    // Fetch roles
    const { data: allRoles } = await supabase
      .from('user_roles')
      .select('user_id, role')

    const roleMap: Record<string, string> = {}
    if (allRoles) {
      for (const r of allRoles) {
        roleMap[r.user_id] = r.role
      }
    }

    // Format response
    const formattedUsers = users.map(user => ({
      id: user.id,
      email: user.email || '',
      displayName: user.user_metadata?.display_name || '',
      createdAt: user.created_at,
      lastSignInAt: user.last_sign_in_at || null,
      campaigns: countMap[user.id] || { total: 0, drafted: 0, completed: 0 },
      role: roleMap[user.id] || 'user',
      banned: !!user.banned_until,
    }))

    // Sort by most recently created first
    formattedUsers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({ users: formattedUsers })

  } catch (error) {
    console.error('Admin API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
