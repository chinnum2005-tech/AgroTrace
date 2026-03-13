import { Shield, CheckCircle } from 'lucide-react';

interface BlockchainBadgeProps {
  verified?: boolean;
  hash?: string;
  network?: string;
}

export default function BlockchainBadge({ verified = true, hash, network = 'Polygon' }: BlockchainBadgeProps) {
  return (
    <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg ${
      verified ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
    }`}>
      {verified ? (
        <>
          <Shield className="h-5 w-5 text-green-600" />
          <div>
            <p className="text-sm font-bold text-green-800">Verified on Blockchain</p>
            <p className="text-xs text-green-600">{network}</p>
            {hash && (
              <p className="text-xs font-mono text-green-700 mt-1">
                {hash.substring(0, 10)}...{hash.substring(hash.length - 8)}
              </p>
            )}
          </div>
          <CheckCircle className="h-5 w-5 text-green-600 ml-2" />
        </>
      ) : (
        <>
          <Shield className="h-5 w-5 text-gray-400" />
          <span className="text-sm text-gray-600">Not Verified</span>
        </>
      )}
    </div>
  );
}
