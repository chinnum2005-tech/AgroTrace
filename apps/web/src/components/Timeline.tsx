import { motion } from 'framer-motion';

interface TimelineEvent {
  icon: React.ReactNode;
  title: string;
  description?: string;
  date: string;
  status?: 'completed' | 'current' | 'pending';
}

interface TimelineProps {
  events: TimelineEvent[];
}

export default function Timeline({ events }: TimelineProps) {
  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-secondary to-gray-200"></div>
      
      <div className="space-y-8">
        {events.map((event, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.15 }}
            className="relative flex items-start space-x-6"
          >
            {/* Icon circle */}
            <div className={`relative flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center z-10 shadow-lg ${
              event.status === 'completed' 
                ? 'bg-gradient-to-br from-primary to-primary-light text-white' 
                : event.status === 'current'
                ? 'bg-gradient-to-br from-accent to-accent-light text-white animate-pulse'
                : 'bg-gray-200 text-gray-400'
            }`}>
              {event.icon}
            </div>
            
            {/* Content */}
            <div className={`flex-1 ml-6 p-4 rounded-xl border-l-4 ${
              event.status === 'completed' || event.status === 'current'
                ? 'bg-gradient-to-r from-secondary-light/30 to-transparent border-primary'
                : 'bg-gray-50 border-gray-300'
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className={`font-bold text-lg ${
                    event.status === 'completed' || event.status === 'current'
                      ? 'text-gray-900'
                      : 'text-gray-500'
                  }`}>
                    {event.title}
                  </h4>
                  {event.description && (
                    <p className="text-gray-600 mt-1">{event.description}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-600">{event.date}</p>
                  {event.status && (
                    <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${
                      event.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : event.status === 'current'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {event.status === 'completed' ? '✓ Completed' : event.status === 'current' ? '→ Current' : '○ Pending'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
