import React from 'react'

const Header = ({ title, description, children }: { title: string, description: string, children?: React.ReactNode }) => {
  return (
    <>
    <div className="flex items-center justify-between bg-slate-800 p-4 rounded-sm">
        <div>
            <h2 className="text-2xl font-bold text-white shrink-0">{title}</h2>
            <p className="text-sm text-slate-400">{description}</p>
        </div>
        {children && (
            <div className="flex items-center gap-4">{children}</div>
        )}
    </div>
    </>
  )
}

export default Header