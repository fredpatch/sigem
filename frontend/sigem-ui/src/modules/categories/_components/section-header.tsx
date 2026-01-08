export const SectionHeader = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
}) => (
  <div className="flex items-start gap-3 mb-5">
    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 flex-shrink-0 mt-1">
      <Icon className="h-4 w-4 text-primary" />
    </div>
    <div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      )}
    </div>
  </div>
);
