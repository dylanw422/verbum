interface DevProps {
  children: Record<string, any>;
}

export function Dev({ children }: DevProps) {
  const name = Object.keys(children)[0];
  const value = children[name];
  return (
    <div className="bg-red-800 p-2 text-red-300 my-1">
      {name}: {value}
    </div>
  );
}
