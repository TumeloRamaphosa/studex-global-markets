import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect('/dashboard');
  }

  const tiers = [
    {
      name: 'Aspire',
      price: '$99',
      period: '/month',
      description: 'Perfect for getting started',
      features: [
        'Browse up to 10 commodities',
        'Access to 1 vertical (Meat, Coffee, or Wheat)',
        'Basic filtering and search',
        'Email support',
      ],
      cta: 'Get Started',
      highlighted: false,
    },
    {
      name: 'Engage',
      price: '$299',
      period: '/month',
      description: 'For active traders',
      features: [
        'Browse up to 50 commodities',
        'Access to 2 verticals',
        'Advanced filters and notifications',
        'Priority support',
        'Basic analytics',
      ],
      cta: 'Start Trading',
      highlighted: false,
    },
    {
      name: 'Scale',
      price: '$999',
      period: '/month',
      description: 'For serious businesses',
      features: [
        'Browse 500+ commodities',
        'Access to all 3 verticals',
        'List your own commodities',
        'API access',
        'Dedicated account manager',
        'Advanced analytics',
      ],
      cta: 'Upgrade Now',
      highlighted: true,
    },
    {
      name: 'Elite',
      price: '$2,500',
      period: '/month',
      description: 'For enterprises',
      features: [
        'Browse 5,000+ commodities',
        'All features included',
        'Priority API support',
        'Custom integrations',
        'SLA guarantee',
        'White-label options',
      ],
      cta: 'Contact Sales',
      highlighted: false,
    },
    {
      name: 'Ghost',
      price: 'Custom',
      period: 'pricing',
      description: 'Unlimited access',
      features: [
        'Unlimited commodities',
        'Full platform access',
        'Dedicated infrastructure',
        'Custom workflows',
        'Direct Naledi AI access',
        '24/7 premium support',
      ],
      cta: 'Book Demo',
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-8 py-6 border-b border-yellow-700/20">
        <div className="text-2xl font-bold text-yellow-600">
          STUDEX GLOBAL MARKETS
        </div>
        <Link
          href="/api/auth/signin"
          className="px-6 py-2 bg-yellow-600 text-slate-950 font-semibold rounded hover:bg-yellow-500 transition"
        >
          Sign In
        </Link>
      </nav>

      {/* Hero */}
      <section className="px-8 py-20 text-center">
        <h1 className="text-5xl font-bold text-white mb-4">
          Global Commodity Trading
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Connect with premium African commodities: Wagyu beef, specialty coffee,
          and wheat. AI-powered discovery, transparent pricing, global reach.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/api/auth/signin?callbackUrl=/dashboard"
            className="px-8 py-3 bg-yellow-600 text-slate-950 font-semibold rounded hover:bg-yellow-500 transition text-lg"
          >
            Start Trading →
          </Link>
          <button className="px-8 py-3 border-2 border-yellow-600 text-yellow-600 font-semibold rounded hover:bg-yellow-600/10 transition text-lg">
            Learn More
          </button>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-8 py-20">
        <h2 className="text-4xl font-bold text-center text-white mb-4">
          Simple, Transparent Pricing
        </h2>
        <p className="text-center text-gray-400 mb-12">
          Choose the tier that fits your trading volume and ambitions.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-lg p-8 border-2 transition ${
                tier.highlighted
                  ? 'border-yellow-600 bg-yellow-600/10 transform scale-105'
                  : 'border-gray-700 bg-slate-800/50'
              }`}
            >
              <h3 className="text-2xl font-bold text-white mb-2">
                {tier.name}
              </h3>
              <p className="text-sm text-gray-400 mb-6">{tier.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-yellow-600">
                  {tier.price}
                </span>
                <span className="text-gray-400">{tier.period}</span>
              </div>
              <button className="w-full mb-6 py-2 bg-yellow-600 text-slate-950 font-semibold rounded hover:bg-yellow-500 transition">
                {tier.cta}
              </button>
              <ul className="space-y-2">
                {tier.features.map((feature) => (
                  <li key={feature} className="text-sm text-gray-300 flex items-start">
                    <span className="text-yellow-600 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Verticals */}
      <section className="px-8 py-20 border-t border-yellow-700/20">
        <h2 className="text-4xl font-bold text-center text-white mb-4">
          Our Verticals
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="bg-slate-800/50 rounded-lg p-8 border border-gray-700">
            <h3 className="text-2xl font-bold text-yellow-600 mb-4">🥩 Meat</h3>
            <p className="text-gray-300">
              Premium Wagyu and Ankole beef, certified Halaal. Direct from South
              African ranches to global buyers.
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-8 border border-gray-700">
            <h3 className="text-2xl font-bold text-yellow-600 mb-4">
              ☕ Coffee
            </h3>
            <p className="text-gray-300">
              Specialty coffee from Rwanda, Ethiopia, and across Africa. Single-origin
              lots with full traceability.
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-8 border border-gray-700">
            <h3 className="text-2xl font-bold text-yellow-600 mb-4">
              🌾 Wheat
            </h3>
            <p className="text-gray-300">
              High-quality wheat for institutional buyers. Direct supply from SADC
              producers.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-12 border-t border-yellow-700/20 text-center text-gray-400">
        <p>© 2026 Studex Group. All rights reserved.</p>
      </footer>
    </div>
  );
}
