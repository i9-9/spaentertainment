import { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export default function Container({ children, className = "" }: ContainerProps) {
  return (
    <div className={`mx-[80px] grid grid-cols-12 gap-4 ${className}`}>
      {children}
    </div>
  );
}

