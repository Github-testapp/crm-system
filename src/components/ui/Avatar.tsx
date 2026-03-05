import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";

interface AvatarProps {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-base",
};

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        className={cn("rounded-full object-cover shrink-0", sizes[size], className)}
        onError={(e) => {
          // 画像読み込み失敗時はイニシャル表示にフォールバック
          const target = e.currentTarget;
          target.style.display = "none";
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = `<div class="${cn("rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold shrink-0", sizes[size], className)}">${getInitials(name)}</div>`;
          }
        }}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold shrink-0",
        sizes[size],
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
}