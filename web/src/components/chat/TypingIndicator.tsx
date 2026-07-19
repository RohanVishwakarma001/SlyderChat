export function TypingIndicator() {
  return (
    <div className="glass flex w-fit items-center gap-1 rounded-2xl rounded-bl-sm px-3.5 py-3">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 animate-typing-dot rounded-full bg-[var(--color-text-dim)]"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}
