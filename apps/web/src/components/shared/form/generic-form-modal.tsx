import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useModalStore } from "@/stores/modal-store";

interface GenericFormModalProps {
  title?: string;
  description?: string;
  className?: string;
  classNameTitle?: string;
  classNameDescription?: string;
  children: React.ReactNode;
}

export const GenericFormModal = ({
  title = "Form Title",
  description = "This is the description of the form.",
  children,
  className,
  classNameDescription,
  classNameTitle,
}: GenericFormModalProps) => {
  const { name, closeModal } = useModalStore();
  const isOpen = Boolean(name);

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent
        className={cn(
          "max-w-4xl w-[95vw] max-h-[90vh] flex flex-col",
          className
        )}
      >
        <DialogHeader>
          <DialogTitle className={classNameTitle}>{title}</DialogTitle>
          <DialogDescription className={classNameDescription}>
            {description}
          </DialogDescription>
        </DialogHeader>
        {/* zone scrollable */}
        <div className="mt-4 flex-1 overflow-y-auto p-2">{children}</div>
      </DialogContent>
    </Dialog>
  );
};
