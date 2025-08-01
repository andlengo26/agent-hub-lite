import { cn } from "@/lib/utils"

function Skeleton({
  className,
  shimmer = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { shimmer?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-md bg-muted",
        shimmer ? "animate-shimmer" : "animate-pulse",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
