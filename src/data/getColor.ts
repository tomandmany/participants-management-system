import { Music, School, Store, Users } from 'lucide-react';

const config: Record<
  string,
  {
    mainColor: string; // 主なカラー (メイン)
    subColor: string; // 補助カラー (サブ)
    Icon: React.ComponentType<{ className?: string }> | null;
  }
> = {
  participants: {
    mainColor: '#3b82f6', // 青
    subColor: '#93c5fd', // 薄い青
    Icon: Users,
  },
  booth: {
    mainColor: '#10b981', // 緑
    subColor: '#6ee7b7', // 薄い緑
    Icon: Store,
  },
  stage: {
    mainColor: '#8b5cf6', // 紫
    subColor: '#d8b4fe', // 薄い紫
    Icon: Music,
  },
  room: {
    mainColor: '#facc15', // 黄色
    subColor: '#fde68a', // 薄い黄色
    Icon: School,
  },
  default: {
    mainColor: '#9ca3af', // 灰色
    subColor: '#d1d5db', // 薄い灰色
    Icon: null,
  },
};

export default config;
