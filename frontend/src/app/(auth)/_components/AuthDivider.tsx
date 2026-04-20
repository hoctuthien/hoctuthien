interface AuthDividerProps {
  text: string;
}

export function AuthDivider({ text }: AuthDividerProps) {
  return (
    <div className="relative flex items-center my-5">
      <div className="flex-1 border-t border-border-default" />
      <span className="mx-4 text-xs font-semibold text-text-muted uppercase tracking-widest whitespace-nowrap">
        {text}
      </span>
      <div className="flex-1 border-t border-border-default" />
    </div>
  );
}
