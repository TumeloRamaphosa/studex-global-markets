import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { Vertical } from '@prisma/client';

const TIER_LIMITS = {
  ASPIRE: { commodities: 10, verticals: 1 },
  ENGAGE: { commodities: 50, verticals: 2 },
  SCALE: { commodities: 500, verticals: 3 },
  ELITE: { commodities: 5000, verticals: 3 },
  GHOST: { commodities: null, verticals: 3 },
};

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: { verticals: true },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const limits = TIER_LIMITS[user.tier as keyof typeof TIER_LIMITS];
  const allowedVerticals = user.verticals
    .filter((v) => v.access !== 'NONE')
    .map((v) => v.vertical);

  const where: any = {
    status: 'AVAILABLE',
    ...(allowedVerticals.length > 0 && { vertical: { in: allowedVerticals } }),
  };

  const commodities = await prisma.commodity.findMany({
    where,
    take: limits.commodities || 1000,
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({
    tier: user.tier,
    allowedVerticals,
    commodities,
    total: commodities.length,
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const body = await req.json();
  const { name, vertical, quantity, unit, pricePerUnit, description } = body;

  // Only SCALE+ can create listings
  const CREATOR_TIERS = ['SCALE', 'ELITE', 'GHOST'];
  if (!CREATOR_TIERS.includes(user.tier)) {
    return NextResponse.json(
      { error: 'Insufficient tier for commodity creation' },
      { status: 403 }
    );
  }

  const commodity = await prisma.commodity.create({
    data: {
      name,
      vertical: vertical as Vertical,
      quantity,
      unit,
      pricePerUnit,
      description,
      createdBy: user.id,
    },
  });

  return NextResponse.json(commodity, { status: 201 });
}
