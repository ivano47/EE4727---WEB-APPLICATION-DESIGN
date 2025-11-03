/**
 * Seed Doctors Script for Supabase
 * Creates 4 doctors with default password: doctor123
 * 
 * Setup:
 * 1. npm install @supabase/supabase-js
 * 2. Replace SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY with your values
 * 3. Run: node seed_doctors.js
 */

import { createClient } from '@supabase/supabase-js';
// Replace these with your actual Supabase credentials
const SUPABASE_URL = 'PLACEHOLDER'
const SUPABASE_SERVICE_ROLE_KEY = 'PLACEHOLDER'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const doctors = [
  {
    email: 's.tan@ntu.clinic',
    password: 'doctor123',
    full_name: 'Dr. Sarah Tan',
    specialty: 'Family Doctor',
    bio: 'Board-certified family physician with 15 years of experience in comprehensive primary care.',
    schedules: [
      { day_of_week: 'Monday', start_time: '09:00:00', end_time: '17:00:00' },
      { day_of_week: 'Tuesday', start_time: '09:00:00', end_time: '17:00:00' },
      { day_of_week: 'Wednesday', start_time: '09:00:00', end_time: '17:00:00' },
      { day_of_week: 'Thursday', start_time: '09:00:00', end_time: '17:00:00' },
      { day_of_week: 'Friday', start_time: '09:00:00', end_time: '15:00:00' }
    ]
  },
  {
    email: 'm.chen@ntu.clinic',
    password: 'doctor123',
    full_name: 'Dr. Michael Chen',
    specialty: 'Family Doctor',
    bio: 'Specializes in preventive medicine and chronic disease management for all ages.',
    schedules: [
      { day_of_week: 'Monday', start_time: '10:00:00', end_time: '18:00:00' },
      { day_of_week: 'Wednesday', start_time: '10:00:00', end_time: '18:00:00' },
      { day_of_week: 'Thursday', start_time: '10:00:00', end_time: '18:00:00' },
      { day_of_week: 'Friday', start_time: '10:00:00', end_time: '18:00:00' },
      { day_of_week: 'Saturday', start_time: '09:00:00', end_time: '13:00:00' }
    ]
  },
  {
    email: 'e.wong@ntu.clinic',
    password: 'doctor123',
    full_name: 'Dr. Emily Wong',
    specialty: 'Dentist',
    bio: 'General dentist specializing in cosmetic dentistry and preventive oral care.',
    schedules: [
      { day_of_week: 'Monday', start_time: '08:00:00', end_time: '16:00:00' },
      { day_of_week: 'Tuesday', start_time: '08:00:00', end_time: '16:00:00' },
      { day_of_week: 'Thursday', start_time: '08:00:00', end_time: '16:00:00' },
      { day_of_week: 'Friday', start_time: '08:00:00', end_time: '16:00:00' },
      { day_of_week: 'Saturday', start_time: '09:00:00', end_time: '12:00:00' }
    ]
  },
  {
    email: 'r.lim@ntu.clinic',
    password: 'doctor123',
    full_name: 'Dr. Robert Lim',
    specialty: 'Dentist',
    bio: 'Experienced in advanced dental procedures including implants and orthodontics.',
    schedules: [
      { day_of_week: 'Tuesday', start_time: '09:00:00', end_time: '17:00:00' },
      { day_of_week: 'Wednesday', start_time: '09:00:00', end_time: '17:00:00' },
      { day_of_week: 'Thursday', start_time: '09:00:00', end_time: '17:00:00' },
      { day_of_week: 'Friday', start_time: '09:00:00', end_time: '17:00:00' },
      { day_of_week: 'Saturday', start_time: '10:00:00', end_time: '14:00:00' }
    ]
  }
]

async function seedDoctors() {
  console.log('Starting doctor seeding process...\n')

  for (const doctor of doctors) {
    console.log(`Creating doctor: ${doctor.full_name} (${doctor.email})`)

    try {
      // Step 1: Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: doctor.email,
        password: doctor.password,
        email_confirm: true,
        user_metadata: {
          full_name: doctor.full_name
        }
      })

      if (authError) {
        console.error(`❌ Auth creation failed for ${doctor.email}:`, authError.message)
        continue
      }

      const userId = authData.user.id
      console.log(`  ✓ Auth user created with ID: ${userId}`)

      // Step 2: Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          full_name: doctor.full_name,
          email: doctor.email,
          role: 'doctor',
          specialty: doctor.specialty,
          bio: doctor.bio
        })

      if (profileError) {
        console.error(`❌ Profile creation failed for ${doctor.email}:`, profileError.message)
        continue
      }

      console.log(`  ✓ Profile created`)

      // Step 3: Create schedules
      const scheduleInserts = doctor.schedules.map(schedule => ({
        doctor_user_id: userId,
        day_of_week: schedule.day_of_week,
        start_time: schedule.start_time,
        end_time: schedule.end_time
      }))

      const { error: scheduleError } = await supabase
        .from('doctor_schedules')
        .insert(scheduleInserts)

      if (scheduleError) {
        console.error(`❌ Schedule creation failed for ${doctor.email}:`, scheduleError.message)
        continue
      }

      console.log(`  ✓ ${doctor.schedules.length} schedules created`)
      console.log(`  ✅ ${doctor.full_name} successfully seeded!\n`)

    } catch (error) {
      console.error(`❌ Unexpected error for ${doctor.email}:`, error)
    }
  }

  console.log('\n🎉 Doctor seeding complete!')
  console.log('\nDoctor Login Credentials:')
  console.log('==========================')
  doctors.forEach(doctor => {
    console.log(`${doctor.full_name}:`)
    console.log(`  Email: ${doctor.email}`)
    console.log(`  Password: ${doctor.password}\n`)
  })
}

// Run the seed function
seedDoctors().catch(console.error)
