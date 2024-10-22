const SpaceFontHeading = ({ children }: { children: string }) => {
  return (
    <div className="w-full text-center fixed">
      <h1 className="text-[clamp(3rem,6vw,8rem)] uppercase font-bold tracking-narrownpm run decoration-violet-50 font-MachineStd xtext-shadow-space-heading bg-clip-text text-fill-transparent gradient-text">
        {children}
      </h1>
    </div>
  )
}

export default SpaceFontHeading
