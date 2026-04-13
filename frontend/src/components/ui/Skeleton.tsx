import { cn } from "@/lib/utils";

export const Skeleton = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "animate-pulse bg-muted/40 rounded-lg",
        className
      )}
    />
  );
};
