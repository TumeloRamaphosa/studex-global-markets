import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const BITFURY_SECRET = process.env.BITFURY_WEBHOOK_SECRET || 'dev-secret';

export async function POST(req: NextRequest) {
  const signature = req.headers.get('x-bitfury-signature');

  // Verify webhook signature
  if (signature !== BITFURY_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { action, data } = body;

  try {
    switch (action) {
      case 'commodity.create': {
        const commodity = await prisma.commodity.create({
          data: {
            name: data.name,
            vertical: data.vertical,
            quantity: data.quantity,
            unit: data.unit,
            pricePerUnit: data.pricePerUnit,
            description: data.description,
            origin: data.origin,
            quality: data.quality,
            certification: data.certification,
            images: data.images || [],
            createdBy: 'bitfury-integration',
          },
        });
        return NextResponse.json({ success: true, commodity }, { status: 201 });
      }

      case 'commodity.update': {
        const commodity = await prisma.commodity.update({
          where: { id: data.id },
          data: {
            status: data.status,
            quantity: data.quantity,
            pricePerUnit: data.pricePerUnit,
          },
        });
        return NextResponse.json({ success: true, commodity });
      }

      case 'agent.report': {
        // Store agent reports from Naledi Nexus via Bitfury bridge
        const event = await prisma.analyticsEvent.create({
          data: {
            event: 'bitfury.agent.report',
            data: JSON.stringify(data),
          },
        });
        return NextResponse.json({ success: true, event });
      }

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Bitfury integration error:', error);
    return NextResponse.json(
      { error: 'Integration failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'connected',
    integrations: ['commodity.create', 'commodity.update', 'agent.report'],
    timestamp: new Date().toISOString(),
  });
}
