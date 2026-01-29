import React from 'react'

interface HeaderProps {
  title: string;
  description: string;
  children?: React.ReactNode;
  childrenLarge?: boolean;
}

const Header = ({ title, description, children, childrenLarge }: HeaderProps) => {
  const wrapperClass = childrenLarge ?
  "bg-slate-800 p-4 rounded-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4" :
  "justify-between bg-slate-800 p-4 rounded-sm flex flex-row md:flex-row md:items-center md:justify-between gap-4";
  
  const childrenClass = childrenLarge 
    ? "flex gap-4 justify-center md:justify-start text-lg" 
    : "flex gap-4 justify-center md:justify-start";

  return (
    <div className={wrapperClass}>
      <div className={`flex flex-col gap-2 md:text-left ${childrenLarge ? 'text-center' : 'text-left'}`}>
        <h2 className="text-xl font-bold text-white shrink-0 tracking-tight md:text-2xl">{title}</h2>
        <p className="hidden md:block text-sm text-slate-400">{description}</p>
      </div>
      {children && (
        <div className={childrenClass}>{children}</div>
      )}
    </div>
  )
}

export default Header