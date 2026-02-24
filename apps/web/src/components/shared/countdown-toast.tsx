import { useEffect, useState } from "react";
import { Progress } from "../ui/progress";
import { cn } from "@/lib/utils";
import {
  Announcement,
  AnnouncementTag,
  AnnouncementTitle,
} from "../ui/announcement";
import { AlertTriangle } from "lucide-react";

interface CountDownToastProps {
  duration: number;
  onTimeout: () => void;
  variant?: "default" | "destructive";
}

export const CountDownToast = ({
  duration,
  onTimeout,
  variant = "default",
}: CountDownToastProps) => {
  const [remaining, setRemaining] = useState(duration);
  const [percent, setPercent] = useState(100);

  useEffect(() => {
    const start = Date.now();
    const interval = 100; // Update every 100ms

    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const left = Math.max(duration - elapsed, 0);
      setRemaining(left);
      setPercent((left / duration) * 100);

      if (left <= 0) {
        clearInterval(timer);
        onTimeout();
      }
    }, interval);

    return () => clearInterval(interval);
  }, [onTimeout, duration]);

  const seconds = Math.ceil(remaining / 1000);

  return (
    <div className="flex w-full items-center justify-center gap-4 bg-background rounded-none">
      <Announcement themed className="rounded-none border-black h-16">
        <AnnouncementTag className="ml-2 bg-primary rounded-md">
          <span className="flex gap-2">
            {variant === "destructive" ? (
              <AlertTriangle className="text-white w-5 h-5" />
            ) : (
              <AlertTriangle className="text-white w-5 h-5" />
            )}
          </span>
        </AnnouncementTag>
        <AnnouncementTitle className="p-2">
          <div className="flex flex-col gap-2">
            <span className="text-sm">Dialog will close in {seconds}s</span>
            <Progress
              value={percent}
              className={cn("transition-all h-1", {
                "bg-red-500": variant === "destructive",
              })}
            />
          </div>
        </AnnouncementTitle>
      </Announcement>
    </div>
  );
};
