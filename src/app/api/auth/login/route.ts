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

    const supabase = createClient();

    // Find member by email
    const { data: member, error } = await supabase
      .from('members')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !member) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await bcrypt.compare(password, member.password_hash);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Return member data for session
    return NextResponse.json({
      member: {
        id: member.id,
        email: member.email,
        name: member.name,
        needsOnboarding: !member.name || member.name === '',
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
