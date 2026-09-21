'use client';

import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const TIER_INFO = {
  ASPIRE: {
    name: 'Aspire',
    price: '$99/mo',
    commodities: 10,
    verticals: 1,
    color: 'blue',
  },
  ENGAGE: {
    name: 'Engage',
    price: '$299/mo',
    commodities: 50,
    verticals: 2,
    color: 'emerald',
  },
  SCALE: {
    name: 'Scale',
    price: '$999/mo',
    commodities: 500,
    verticals: 3,
    color: 'yellow',
  },
  ELITE: {
    name: 'Elite',
    price: '$2,500/mo',
    commodities: 5000,
    verticals: 3,
    color: 'amber',
  },
  GHOST: {
    name: 'Ghost',
    price: 'Custom',
    commodities: 'Unlimited',
    verticals: 3,
    color: 'purple',
  },
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [commodities, setCommodities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchCommodities();
    }
  }, [session]);

  const fetchCommodities = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/commodities');
      const data = await res.json();
      setCommodities(data.commodities || []);
    } catch (error) {
      console.error('Failed to fetch commodities:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return <div className="text-white text-center py-20">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  const tierInfo = TIER_INFO[(session.user as any).tier || 'ASPIRE'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-8 py-6 border-b border-yellow-700/20">
        <div className="text-2xl font-bold text-yellow-600">
          STUDEX GLOBAL MARKETS
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-300">{session.user?.email}</span>
          <button
            onClick={() => signOut()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500 transition"
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* Tier Card */}
      <section className="px-8 py-12">
        <div className="max-w-2xl mx-auto bg-slate-800/50 rounded-lg p-8 border border-yellow-700/30">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-yellow-600 mb-2">
                {tierInfo.name}
              </h1>
              <p className="text-gray-400">{tierInfo.price}</p>
            </div>
            <Link
              href="/upgrade"
              className="px-4 py-2 bg-yellow-600 text-slate-950 font-semibold rounded hover:bg-yellow-500 transition"
            >
              Upgrade
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-gray-400 text-sm">Browsable Commodities</p>
              <p className="text-2xl font-bold text-yellow-600">
                {tierInfo.commodities}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Vertical Access</p>
              <p className="text-2xl font-bold text-yellow-600">
                {tierInfo.verticals}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Commodities */}
      <section className="px-8 py-12">
        <h2 className="text-3xl font-bold text-white mb-8">
          Available Commodities
        </h2>

        {loading ? (
          <div className="text-gray-400 text-center">Loading commodities...</div>
        ) : commodities.length === 0 ? (
          <div className="text-gray-400 text-center py-12">
            No commodities available for your tier yet. Upgrade to access more.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {commodities.map((commodity: any) => (
              <div
                key={commodity.id}
                className="bg-slate-800/50 rounded-lg p-6 border border-gray-700 hover:border-yellow-600 transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-white">
                    {commodity.name}
                  </h3>
                  <span className="px-2 py-1 bg-yellow-600/20 text-yellow-600 text-xs font-bold rounded">
                    {commodity.vertical}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-4">
                  {commodity.description}
                </p>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-gray-500 text-xs">Quantity</p>
                    <p className="font-bold text-white">
                      {commodity.quantity} {commodity.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Price/Unit</p>
                    <p className="font-bold text-yellow-600">
                      ${commodity.pricePerUnit}
                    </p>
                  </div>
                </div>
                <button className="w-full py-2 bg-yellow-600 text-slate-950 font-semibold rounded hover:bg-yellow-500 transition">
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
