type CardProps = {
  children: React.ReactNode;
};

export default function Card({ children }: CardProps) {
  return (
    <div className="rounded-xl bg-white p-8 shadow-lg">
      {children}
    </div>
  );
}