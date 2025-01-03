const SpaceFontHeading = ({ children }: { children: string }) => {
  return (
    // {this heading should be fixed to the top of the page, and not have any bearing on the scroll events or page height}
    <div className="w-full text-center fixed top-0 left-0 z-50">
      <h1 className="text-[clamp(3rem,6vw,8rem)] uppercase font-bold tracking-narrownpm run decoration-violet-50 font-MachineStd xtext-shadow-space-heading bg-clip-text text-fill-transparent gradient-text">
        {children}
      </h1>
    </div>
  )
}

export default SpaceFontHeading
