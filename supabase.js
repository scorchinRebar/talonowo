import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  'https://uepkfbcjjbslujtldeyz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlcGtmYmNqamJzbHVqdGxkZXl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzODMzOTUsImV4cCI6MjA3NDk1OTM5NX0.WfrfNuNCjvXmVnJanvXeZVSYcT4Ck1TBoU1p3ZFPINA'
)

const status = document.getElementById('status')

document.getElementById('registerBtn').addEventListener('click', async () => {
  const email = document.getElementById('regEmail').value
  const password = document.getElementById('regPass').value
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error || !data.user) {
    status.textContent = error ? error.message : 'Signup failed'
    return
  }

  const user = data.user
  await supabase.from('profiles').insert({
    user_id: user.id,
    email: user.email,
    role: 'pending',
    approved: false
  })

  status.textContent = `Registered ${user.email}, awaiting approval`
})

document.getElementById('loginBtn').addEventListener('click', async () => {
  const email = document.getElementById('logEmail').value
  const password = document.getElementById('logPass').value
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error || !data.user) {
    status.textContent = error ? error.message : 'Login failed'
    return
  }

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData || !userData.id) {
    status.textContent = 'Error fetching user'
    return
  }

  const userId = userData.id

  let { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle()

  if (profileError || !profile) {
    const fallback = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .limit(1)
      .maybeSingle()

    profile = fallback.data
    profileError = fallback.error
  }

  if (profileError) {
    status.textContent = 'Error fetching profile'
    return
  }

  if (!profile || !profile.role) {
    status.textContent = 'Logged in, but profile not found'
    return
  }

  if (profile.role === 'admin') {
    status.textContent = 'Logged in as admin'
  } else if (profile.role === 'user') {
    status.textContent = 'Logged in as regular user'
  } else if (profile.role === 'pending') {
    status.textContent = 'Account pending approval'
  } else {
    status.textContent = 'Logged in, role unknown'
  }
})
