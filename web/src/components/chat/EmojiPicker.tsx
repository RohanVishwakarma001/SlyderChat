const EMOJIS = [
  '😀', '😂', '😍', '🥰', '😅', '😊', '😉', '😎', '🤔', '😴',
  '😭', '😱', '😡', '🥳', '🤗', '🙄', '😇', '🤩', '😢', '🤯',
  '👍', '👎', '👏', '🙏', '💪', '🤝', '✌️', '👌', '🤞', '🫶',
  '❤️', '🔥', '💯', '🎉', '✨', '⭐', '💔', '😘', '🤍', '💚',
  '🐶', '🐱', '🍕', '☕', '🎂', '🎁', '📷', '🎵', '⚽', '🚀',
];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

export function EmojiPicker({ onSelect }: EmojiPickerProps) {
  return (
    <div className="glass grid w-64 grid-cols-8 gap-1 rounded-xl p-2 shadow-2xl">
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => onSelect(emoji)}
          className="rounded-lg p-1.5 text-lg transition hover:bg-white/10"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
