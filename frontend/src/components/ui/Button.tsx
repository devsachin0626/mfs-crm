type ButtonProps = {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
};

export default function Button({
  children,
  type = "button",
  onClick,
  className = "",
  disabled = false,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-lg bg-blue-700 px-4 py-3 text-white font-semibold transition hover:bg-blue-800 disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}