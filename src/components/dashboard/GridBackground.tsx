import { useDashboard } from "./DashboardContext";

export const GridBackground = () => {
  const { gridSize } = useDashboard();

  return (
    <div 
      className="absolute inset-0 pointer-events-none opacity-30"
      style={{
        backgroundImage: `
          linear-gradient(to right, hsl(var(--dashboard-grid)) 1px, transparent 1px),
          linear-gradient(to bottom, hsl(var(--dashboard-grid)) 1px, transparent 1px)
        `,
        backgroundSize: `${gridSize}px ${gridSize}px`,
      }}
    />
  );
};