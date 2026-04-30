import PanelHeader from '@/components/ui/PanelHeader'

type Tone = 'green' | 'blue' | 'yellow' | 'purple'

type Props = {
  count: number
  entityLabel: string
  title: string
  subtitle: string
  tone: Tone
}

const toneMap: Record<Tone, { badge: string; dot: string; text: string }> = {
  green: {
    badge: 'bg-[rgba(0,200,83,0.08)] border-[rgba(0,200,83,0.2)]',
    dot: 'bg-oc-green',
    text: 'text-oc-green',
  },
  blue: {
    badge: 'bg-[rgba(90,143,255,0.08)] border-[rgba(90,143,255,0.2)]',
    dot: 'bg-oc-blue',
    text: 'text-oc-blue',
  },
  yellow: {
    badge: 'bg-[rgba(255,180,0,0.08)] border-[rgba(255,180,0,0.2)]',
    dot: 'bg-oc-yellow',
    text: 'text-oc-yellow',
  },
  purple: {
    badge: 'bg-[rgba(180,100,255,0.08)] border-[rgba(180,100,255,0.2)]',
    dot: 'bg-oc-purple',
    text: 'text-oc-purple',
  },
}

export default function ListPageHeader({ count, entityLabel, title, subtitle, tone }: Props) {
  const colors = toneMap[tone]

  return (
    <PanelHeader
      badgeText={`${count} ${entityLabel} DISPONIBLES`}
      title={title}
      subtitle={subtitle}
      badgeColorClass={colors.badge}
      dotColorClass={colors.dot}
      textColorClass={colors.text}
    />
  )
}
