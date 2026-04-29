import { cn } from "@beetime/ui/lib/utils";

export function AppBody({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-1 flex-col gap-4 p-4 pt-0", className)} {...props}>
      {children}
    </div>
  );
}
