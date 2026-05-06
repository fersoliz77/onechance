type Props = {
  title: string
  subtitle?: string
}

export default function SectionHeading({ title, subtitle }: Props) {
  return (
    <div className="mx-auto mb-14 max-w-[760px] text-center md:mb-16">
      <h2 className="text-[clamp(34px,4.5vw,48px)] font-[800] leading-[1.08] tracking-[-0.03em]">{title}</h2>
      {subtitle ? <p className="mx-auto mt-4 max-w-[680px] text-[15px] leading-[1.65] text-[var(--oc-fg-muted)]">{subtitle}</p> : null}
    </div>
  )
}
