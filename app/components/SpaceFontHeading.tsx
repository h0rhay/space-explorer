const SpaceFontHeading = ({ children }: { children: string }) => {
  return (
    <div className="w-full text-center fixed">
      <h1 className="text-8xl uppercase font-bold tracking-widest font-MachineStd xtext-shadow-space-heading bg-clip-text text-fill-transparent gradient-text">
        {children}
      </h1>
    </div>
  )
}

export default SpaceFontHeading
