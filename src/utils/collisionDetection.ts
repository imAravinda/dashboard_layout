export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Widget extends Rectangle {
  id: string;
}

/**
 * Check if two rectangles overlap
 */
export const rectanglesOverlap = (rect1: Rectangle, rect2: Rectangle): boolean => {
  return !(
    rect1.x >= rect2.x + rect2.width ||
    rect1.x + rect1.width <= rect2.x ||
    rect1.y >= rect2.y + rect2.height ||
    rect1.y + rect1.height <= rect2.y
  );
};

/**
 * Check if a rectangle collides with any widget in the list
 */
export const checkCollision = (
  x: number,
  y: number,
  width: number,
  height: number,
  widgets: Widget[],
  excludeId?: string
): boolean => {
  const testRect: Rectangle = { x, y, width, height };
  
  return widgets.some(widget => {
    if (excludeId && widget.id === excludeId) return false;
    return rectanglesOverlap(testRect, widget);
  });
};

/**
 * Find the best non-overlapping position using spiral search
 */
export const findBestPosition = (
  x: number,
  y: number,
  width: number,
  height: number,
  widgets: Widget[],
  canvasWidth: number,
  canvasHeight: number,
  gridSize: number,
  excludeId?: string
): { x: number; y: number } => {
  const maxX = Math.max(0, canvasWidth - width);
  const maxY = Math.max(0, canvasHeight - height);
  
  // Clamp initial position to canvas bounds
  const clampedX = Math.max(0, Math.min(x, maxX));
  const clampedY = Math.max(0, Math.min(y, maxY));
  
  // Try the original position first
  if (!checkCollision(clampedX, clampedY, width, height, widgets, excludeId)) {
    return { x: clampedX, y: clampedY };
  }
  
  // Spiral search for alternative position
  for (let radius = gridSize; radius <= Math.max(canvasWidth, canvasHeight); radius += gridSize) {
    const positions = [
      { x: clampedX + radius, y: clampedY }, // Right
      { x: clampedX - radius, y: clampedY }, // Left
      { x: clampedX, y: clampedY + radius }, // Down
      { x: clampedX, y: clampedY - radius }, // Up
      { x: clampedX + radius, y: clampedY + radius }, // Bottom-right
      { x: clampedX - radius, y: clampedY + radius }, // Bottom-left
      { x: clampedX + radius, y: clampedY - radius }, // Top-right
      { x: clampedX - radius, y: clampedY - radius }, // Top-left
    ];
    
    for (const pos of positions) {
      const testX = Math.max(0, Math.min(pos.x, maxX));
      const testY = Math.max(0, Math.min(pos.y, maxY));
      
      if (!checkCollision(testX, testY, width, height, widgets, excludeId)) {
        return { x: testX, y: testY };
      }
    }
  }
  
  // If no position found, return the original clamped position
  return { x: clampedX, y: clampedY };
};

/**
 * Snap coordinates to grid
 */
export const snapToGrid = (value: number, gridSize: number): number => {
  return Math.round(value / gridSize) * gridSize;
};

/**
 * Check if a position is within canvas bounds
 */
export const isWithinBounds = (
  x: number,
  y: number,
  width: number,
  height: number,
  canvasWidth: number,
  canvasHeight: number
): boolean => {
  return x >= 0 && y >= 0 && x + width <= canvasWidth && y + height <= canvasHeight;
};

/**
 * Get the area of overlap between two rectangles
 */
export const getOverlapArea = (rect1: Rectangle, rect2: Rectangle): number => {
  if (!rectanglesOverlap(rect1, rect2)) return 0;
  
  const overlapX = Math.max(0, Math.min(rect1.x + rect1.width, rect2.x + rect2.width) - Math.max(rect1.x, rect2.x));
  const overlapY = Math.max(0, Math.min(rect1.y + rect1.height, rect2.y + rect2.height) - Math.max(rect1.y, rect2.y));
  
  return overlapX * overlapY;
};

/**
 * Find the widget with the most overlap
 */
export const findMostOverlappingWidget = (
  x: number,
  y: number,
  width: number,
  height: number,
  widgets: Widget[],
  excludeId?: string
): Widget | null => {
  const testRect: Rectangle = { x, y, width, height };
  let maxOverlap = 0;
  let mostOverlapping: Widget | null = null;
  
  for (const widget of widgets) {
    if (excludeId && widget.id === excludeId) continue;
    
    const overlap = getOverlapArea(testRect, widget);
    if (overlap > maxOverlap) {
      maxOverlap = overlap;
      mostOverlapping = widget;
    }
  }
  
  return mostOverlapping;
};
