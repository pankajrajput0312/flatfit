import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/client';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Check if email already exists
    const { data: existing } = await supabase
      .from('members')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create member with minimal data (will complete in onboarding)
    const { data: member, error } = await supabase
      .from('members')
      .insert({
        email,
        password_hash: passwordHash,
        name: '',
        gym_days: [],
        water_target_l: 2.0,
        protein_target_g: 120,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create account' },
        { status: 500 }
      );
    }

    // Return member data for session
    return NextResponse.json({
      member: {
        id: member.id,
        email: member.email,
        name: member.name,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
