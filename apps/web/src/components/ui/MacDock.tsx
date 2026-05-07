import { useRef, useState, Fragment, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export interface DockItem {
  id: string;
  icon: any;
  label: string;
  href?: string;
  onClick?: () => void;
  active?: boolean;
  badge?: number;
  gradient?: string;
}

interface DockIconProps {
  item: DockItem;
  mouseX: ReturnType<typeof useMotionValue<number>>;
}

function DockIcon({ item, mouseX }: DockIconProps) {
  const ref = useRef<HTMLDivElement>(null);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  // Scale magnification — peak at 1.7x, falloff over 180px for breathing room
  const scaleRaw = useTransform(distance, [-180, 0, 180], [1, 1.7, 1]);
  const scale = useSpring(scaleRaw, { mass: 0.1, stiffness: 180, damping: 14 });

  // Y lift — icon floats upward when hovered
  const yRaw = useTransform(distance, [-180, 0, 180], [0, -18, 0]);
  const y = useSpring(yRaw, { mass: 0.1, stiffness: 180, damping: 14 });

  const [hovered, setHovered] = useState(false);
  const Icon = item.icon;

  const gradient = item.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

  return (
    <motion.div
      ref={ref}
      style={{ scale, y }}
      className="relative flex flex-col items-center cursor-pointer select-none"
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={item.onClick}
      whileTap={{ scale: 0.9 }}
    >
      {/* Tooltip */}
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.85 }}
        animate={hovered ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 8, scale: 0.85 }}
        transition={{ duration: 0.15 }}
        className="absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap pointer-events-none z-50"
        style={{
          background: 'rgba(255,255,255,0.12)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.18)',
          color: '#fff',
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
        }}
      >
        {item.label}
      </motion.div>

      {/* Icon Container */}
      <div
        className="relative w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden"
        style={{
          background: gradient,
          boxShadow: hovered
            ? '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.15)'
            : '0 4px 16px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08)',
          transition: 'box-shadow 0.2s ease',
        }}
      >
        {/* Glass sheen */}
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.22) 0%, transparent 60%)',
          }}
        />
        <Icon size={22} className="relative z-10 text-white drop-shadow-sm" />

        {/* Active dot */}
        {item.active && (
          <span
            className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white"
            style={{ boxShadow: '0 0 4px rgba(255,255,255,0.8)' }}
          />
        )}

        {/* Badge */}
        {item.badge !== undefined && item.badge > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold text-white px-1"
            style={{ background: '#ef4444', boxShadow: '0 2px 6px rgba(239,68,68,0.5)' }}
          >
            {item.badge > 99 ? '99+' : item.badge}
          </span>
        )}
      </div>
    </motion.div>
  );
}

interface MacDockProps {
  items: DockItem[];
}

export default function MacDock({ items }: MacDockProps) {
  const mouseX = useMotionValue(Infinity);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY < 10);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={visible ? { y: 0, opacity: 1 } : { y: 100, opacity: 0 }}
        transition={{ type: 'tween', duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="flex items-end gap-5 px-6 py-3.5 rounded-[32px]"
        style={{
          background: 'rgba(18, 18, 24, 0.72)',
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.10)',
          boxShadow:
            '0 32px 64px rgba(0,0,0,0.5), 0 8px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      >
        {items.map((item, i) => (
          <Fragment key={item.id}>
            {/* Separator before last 2 items */}
            {i === items.length - 2 && (
              <div
                className="self-center h-8 w-px mx-1 rounded-full"
                style={{ background: 'rgba(255,255,255,0.12)' }}
              />
            )}
            <DockIcon item={item} mouseX={mouseX} />
          </Fragment>
        ))}
      </motion.div>
    </div>
  );
}
