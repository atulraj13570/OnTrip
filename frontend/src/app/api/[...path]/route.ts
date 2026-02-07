import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const path = request.nextUrl.pathname.replace('/api', '');
  return NextResponse.json({ message: 'API endpoint', path, method: 'GET' });
}

export async function POST(request: NextRequest) {
  const path = request.nextUrl.pathname.replace('/api', '');
  return NextResponse.json({ message: 'API endpoint', path, method: 'POST' });
}
