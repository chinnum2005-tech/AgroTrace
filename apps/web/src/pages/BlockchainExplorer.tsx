import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ExternalLink, Search, ChevronDown, ChevronUp, Clock, MapPin, CheckCircle, Package, Truck, Activity } from 'lucide-react';

interface Transaction {
  id: string;
  hash: string;
  blockNumber: number;
  timestamp: Date;
  eventType: string;
  productId: string;
  productName: string;
  actor: string;
  location: string;
  status: 'confirmed' | 'pending';
  gasUsed: number;
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    hash: '0x8c3a2f9e1b4d7c6a5e3f2d1c0b9a8e7d6c5b4a3f',
    blockNumber: 43521891,
    timestamp: new Date(Date.now() - 2 * 60000),
    eventType: 'HARVESTED',
    productId: 'WHEAT-001',
    productName: 'Organic Wheat Batch A',
    actor: 'Green Valley Farm',
    location: 'Punjab, India',
    status: 'confirmed',
    gasUsed: 45231,
  },
  {
    id: '2',
    hash: '0x7b2a1e8d0c3b6a5f4e2d1c0b9a8e7d6c5b4a3f2e',
    blockNumber: 43521756,
    timestamp: new Date(Date.now() - 15 * 60000),
    eventType: 'PACKAGED',
    productId: 'RICE-023',
    productName: 'Basmati Rice Premium',
    actor: 'Punjab Processing Unit',
    location: 'Amritsar, Punjab',
    status: 'confirmed',
    gasUsed: 38947,
  },
  {
    id: '3',
    hash: '0x6c1a0d7e9b2c5f4a3e1d0c9b8a7e6d5c4b3a2f1e',
    blockNumber: 43521612,
    timestamp: new Date(Date.now() - 45 * 60000),
    eventType: 'SHIPPED',
    productId: 'CORN-007',
    productName: 'Sweet Corn Field B',
    actor: 'FastMove Logistics',
    location: 'En route to Delhi',
    status: 'confirmed',
    gasUsed: 52103,
  },
  {
    id: '4',
    hash: '0x5d2b1f8c9a3e6b5a4d2c1b0a9e8d7c6b5a4f3e2d',
    blockNumber: 43521498,
    timestamp: new Date(Date.now() - 2 * 3600000),
    eventType: 'QUALITY_CHECK',
    productId: 'RICE-023',
    productName: 'Basmati Rice Premium',
    actor: 'FoodSafe Inspector',
    location: 'Inspection Hub, Delhi',
    status: 'confirmed',
    gasUsed: 29841,
  },
  {
    id: '5',
    hash: '0x4e3c2g7d0b1f4a3e2c1d0b9a8f7e6d5c4b3a2f1',
    blockNumber: 43521350,
    timestamp: new Date(Date.now() - 4 * 3600000),
    eventType: 'RECEIVED',
    productId: 'WHEAT-001',
    productName: 'Organic Wheat Batch A',
    actor: 'FreshMart Distribution',
    location: 'Delhi NCR Hub',
    status: 'confirmed',
    gasUsed: 41256,
  },
];

const eventConfig: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  HARVESTED:     { icon: Package,    color: 'text-green-600',  bg: 'bg-green-100',   label: 'Harvested' },
  PACKAGED:      { icon: Package,    color: 'text-blue-600',   bg: 'bg-blue-100',    label: 'Packaged' },
  SHIPPED:       { icon: Truck,      color: 'text-amber-600',  bg: 'bg-amber-100',   label: 'Shipped' },
  QUALITY_CHECK: { icon: CheckCircle,color: 'text-purple-600', bg: 'bg-purple-100',  label: 'Quality Check' },
  RECEIVED:      { icon: CheckCircle,color: 'text-teal-600',   bg: 'bg-teal-100',    label: 'Received' },
  RETAIL:        { icon: Activity,   color: 'text-pink-600',   bg: 'bg-pink-100',    label: 'At Retail' },
};

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

function shortHash(hash: string): string {
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}

export default function BlockchainExplorer() {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = mockTransactions.filter(tx =>
    tx.productName.toLowerCase().includes(search.toLowerCase()) ||
    tx.hash.toLowerCase().includes(search.toLowerCase()) ||
    tx.eventType.toLowerCase().includes(search.toLowerCase()) ||
    tx.actor.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-6 pb-28">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-600/30 border border-purple-500/50 rounded-2xl backdrop-blur-sm">
              <Shield className="h-8 w-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">⛓️ Blockchain Transaction Explorer</h1>
              <p className="text-slate-400">View all on-chain supply chain events — powered by Polygon</p>
            </div>
          </div>

          {/* Network Status */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Network', value: 'Polygon Mumbai', sub: 'Testnet' },
              { label: 'Total Transactions', value: '43,521', sub: 'this month' },
              { label: 'Avg Confirmation', value: '2.1s', sub: 'block time' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4"
              >
                <p className="text-slate-400 text-xs mb-1">{stat.label}</p>
                <p className="text-white font-bold text-lg">{stat.value}</p>
                <p className="text-slate-500 text-xs">{stat.sub}</p>
              </motion.div>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by hash, product, actor, or event type..."
              className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-slate-400 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </motion.div>

        {/* Transactions */}
        <div className="space-y-3">
          {filtered.map((tx, index) => {
            const cfg = eventConfig[tx.eventType] || eventConfig.HARVESTED;
            const Icon = cfg.icon;
            const isExpanded = expanded === tx.id;

            return (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all"
              >
                <div
                  className="p-5 cursor-pointer"
                  onClick={() => setExpanded(isExpanded ? null : tx.id)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {/* Event Icon */}
                      <div className={`flex-shrink-0 p-3 rounded-xl ${cfg.bg}`}>
                        <Icon className={`h-5 w-5 ${cfg.color}`} />
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${cfg.bg} ${cfg.color}`}>
                            {cfg.label}
                          </span>
                          {tx.status === 'confirmed' && (
                            <span className="flex items-center gap-1 text-xs text-green-400">
                              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                              Confirmed
                            </span>
                          )}
                        </div>
                        <p className="text-white font-semibold">{tx.productName}</p>
                        <p className="text-slate-400 text-xs font-mono">{shortHash(tx.hash)}</p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center justify-end gap-2 text-slate-400 text-xs mb-1">
                        <Clock className="h-3 w-3" />
                        {timeAgo(tx.timestamp)}
                      </div>
                      <p className="text-slate-400 text-xs">Block #{tx.blockNumber.toLocaleString()}</p>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400 ml-auto mt-1" /> : <ChevronDown className="h-4 w-4 text-slate-400 ml-auto mt-1" />}
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-white/10"
                    >
                      <div className="p-5 grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div>
                            <p className="text-slate-500 text-xs mb-1">Full Transaction Hash</p>
                            <p className="text-purple-400 font-mono text-xs break-all">{tx.hash}</p>
                          </div>
                          <div>
                            <p className="text-slate-500 text-xs mb-1">Actor / Organization</p>
                            <p className="text-white text-sm">{tx.actor}</p>
                          </div>
                          <div>
                            <p className="text-slate-500 text-xs mb-1">Location</p>
                            <div className="flex items-center gap-1 text-white text-sm">
                              <MapPin className="h-3 w-3 text-slate-400" />
                              {tx.location}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <p className="text-slate-500 text-xs mb-1">Block Number</p>
                            <p className="text-white text-sm font-mono">#{tx.blockNumber.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-slate-500 text-xs mb-1">Gas Used</p>
                            <p className="text-white text-sm">{tx.gasUsed.toLocaleString()} gwei</p>
                          </div>
                          <div>
                            <p className="text-slate-500 text-xs mb-1">Timestamp</p>
                            <p className="text-white text-sm">{tx.timestamp.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <a
                            href={`https://mumbai.polygonscan.com/tx/${tx.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition-colors"
                          >
                            <ExternalLink className="h-4 w-4" />
                            View on PolygonScan
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <Shield className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No transactions found matching "{search}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
