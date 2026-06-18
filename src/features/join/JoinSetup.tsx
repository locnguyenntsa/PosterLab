import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Upload, type LucideIcon } from 'lucide-react'
import { StepScreen } from '@/components/StepScreen'
import { useFlowStore } from '@/store/useFlowStore'
import { DesignUpload } from '@/features/join/DesignUpload'

/*
  Step two of the non-partner funnel: how does the club want their first design?
  Two flat tiles (the DesignSelection grid style) — bring your own artwork, or use
  one of our studio styles. Either path hands off into the normal builder on the
  generic house club. The upload path swaps to an inline sub-view so its Back
  ("Back to options") stays local without touching the store.
*/
export function JoinSetup() {
  const joinClub = useFlowStore((s) => s.joinClub)
  const startGenericBuild = useFlowStore((s) => s.startGenericBuild)
  const [uploading, setUploading] = useState(false)

  if (uploading) return <DesignUpload onBack={() => setUploading(false)} />

  const clubName = joinClub?.clubName?.trim() || 'Your club'

  return (
    <StepScreen
      step={0}
      kicker="Set Up"
      title="Set Up Your Design"
      subtitle={`${clubName} is in. Choose how to start your first poster.`}
    >
      <div className="grid grid-cols-1 gap-px border border-line bg-line backdrop-blur-sm sm:grid-cols-2">
        <DesignOption
          icon={Upload}
          title="Upload Your Own"
          text="Already have a club design? Drop in your artwork and order a sample."
          onClick={() => setUploading(true)}
        />
        <DesignOption
          icon={Sparkles}
          title="Use A Generic Design"
          text="No design yet? Pick one of our studio styles and make it yours."
          onClick={startGenericBuild}
        />
      </div>
    </StepScreen>
  )
}

function DesignOption({
  icon: Icon,
  title,
  text,
  onClick,
}: {
  icon: LucideIcon
  title: string
  text: string
  onClick: () => void
}) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.12 }}
      onClick={onClick}
      className="group flex flex-col items-start gap-4 bg-surface p-8 text-left transition-[background-color] duration-100 hover:bg-primary"
    >
      <span className="grid size-14 place-items-center border border-line text-cream">
        <Icon className="size-7" strokeWidth={1.5} />
      </span>
      <span className="t-card text-3xl">{title}</span>
      <span className="t-body">{text}</span>
    </motion.button>
  )
}
