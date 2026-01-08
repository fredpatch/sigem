import { cn } from "@/lib/utils";

interface Props {
  label: string;
  className?: string;
}

const TitleComponent = ({ label, className }: Props) => {
  return (
    <div
      className={cn(
        "flex flex-row items-center gap-3 py-2 cursor-pointer group",
        className
      )}
    >
      <h1
        className={`font-medium hover:border-b hover:border-zinc-700 border-b border-transparent w-fit`}
      >
        {label === "Email" ? label.toLowerCase() : label}
      </h1>
      {/* <ExternalLink className="w-4 h-4 text-gray-500 invisible group-hover:visible" /> */}
    </div>
  );
};

export default TitleComponent;
