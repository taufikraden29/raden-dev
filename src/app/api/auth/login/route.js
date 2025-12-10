import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { username, password } = await request.json();

        const envUsername = process.env.ADMIN_USERNAME;
        const envPassword = process.env.ADMIN_PASSWORD;

        if (username === envUsername && password === envPassword) {
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}
