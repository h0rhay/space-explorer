const SpaceFontHeading = ({ children }: { children: string }) => {
  return (
    <div className="w-full text-center fixed">
      <h1 className="text-yellow-400 tracking-widest uppercase font-bold text-8xl font-MachineStd text-shadow-space-heading">
        {children}
      </h1>
    </div>
  )
}

export default SpaceFontHeading
