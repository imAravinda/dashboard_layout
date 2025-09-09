import { useState, useRef, useEffect } from "react";
import { DashboardWidget } from "../../DashboardContext";
import { useConfig } from "../../ConfigContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Edit3, Check, X, GripVertical } from "lucide-react";

interface DataTableWidgetProps {
  widget: DashboardWidget;
  width: number;
  height: number;
}

interface TableData {
  columns: string[];
  data: string[][];
  columnWidths?: number[];
  rowHeights?: number[];
}

// Mock data generator
const generateMockTableData = (): TableData => {
  return {
    columns: ['Name', 'Department', 'Status', 'Last Login', 'Actions'],
    data: [
      ['John Doe', 'Engineering', 'Active', '2 hours ago', 'Edit'],
      ['Jane Smith', 'Marketing', 'Active', '1 day ago', 'Edit'],
      ['Mike Johnson', 'Sales', 'Inactive', '3 days ago', 'Edit'],
      ['Sarah Wilson', 'Engineering', 'Active', '5 hours ago', 'Edit'],
      ['David Brown', 'HR', 'Active', '1 hour ago', 'Edit'],
      ['Lisa Davis', 'Marketing', 'Active', '2 days ago', 'Edit'],
      ['Tom Anderson', 'Sales', 'Inactive', '1 week ago', 'Edit'],
      ['Emma Taylor', 'Engineering', 'Active', '30 minutes ago', 'Edit']
    ],
    columnWidths: [150, 120, 100, 120, 100],
    rowHeights: [40, 40, 40, 40, 40, 40, 40, 40]
  };
};

export const DataTableWidget = ({ widget, width, height }: DataTableWidgetProps) => {
  const { getConfig } = useConfig();
  const config = getConfig(widget.id);
  
  // Use mock data if no data provided
  const mockData = generateMockTableData();
  const initialData = widget.data ? 
    // Cast to unknown first to handle potential type mismatch
    (widget.data as unknown as TableData) : 
    mockData;
  
  // Ensure columnWidths is properly initialized
  const ensureColumnWidths = (data: TableData): TableData => {
    if (!data.columnWidths || data.columnWidths.length !== data.columns.length) {
      return {
        ...data,
        columnWidths: new Array(data.columns.length).fill(120)
      };
    }
    return data;
  };
  
  const [tableData, setTableData] = useState<TableData>(ensureColumnWidths(initialData));
  const [editingCell, setEditingCell] = useState<{row: number, col: number} | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [isResizing, setIsResizing] = useState<{type: 'column' | 'row', index: number} | null>(null);
  const [isEditingColumn, setIsEditingColumn] = useState<number | null>(null);
  const [newColumnName, setNewColumnName] = useState('');

  const tableRef = useRef<HTMLTableElement>(null);

  // Update widget data when table data changes
  useEffect(() => {
    // Deep compare the data objects since they may be structurally equal
    const isDataDifferent = JSON.stringify(widget.data as unknown) !== JSON.stringify(tableData);
    if (isDataDifferent) {
      // This would typically update the widget data through a callback
      // For now, we'll just update local state
    }
  }, [tableData, widget.data]);

  const handleCellEdit = (rowIndex: number, colIndex: number) => {
    setEditingCell({row: rowIndex, col: colIndex});
    setEditingValue(tableData.data[rowIndex][colIndex] || '');
  };

  const handleCellSave = () => {
    if (editingCell) {
      const newData = [...tableData.data];
      newData[editingCell.row][editingCell.col] = editingValue;
      setTableData({...tableData, data: newData});
      setEditingCell(null);
      setEditingValue('');
    }
  };

  const handleCellCancel = () => {
    setEditingCell(null);
    setEditingValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCellSave();
    } else if (e.key === 'Escape') {
      handleCellCancel();
    }
  };

  const addRow = () => {
    const newRow = new Array(tableData.columns.length).fill('');
    setTableData({
      ...tableData,
      data: [...tableData.data, newRow],
      rowHeights: [...(tableData.rowHeights || []), 40]
    });
  };

  const removeRow = (rowIndex: number) => {
    const newData = tableData.data.filter((_, index) => index !== rowIndex);
    const newRowHeights = (tableData.rowHeights || []).filter((_, index) => index !== rowIndex);
    setTableData({
      ...tableData,
      data: newData,
      rowHeights: newRowHeights
    });
  };

  const addColumn = () => {
    if (newColumnName.trim()) {
      console.log('Adding column:', newColumnName.trim());
      console.log('Current tableData:', tableData);
      
      const newColumns = [...tableData.columns, newColumnName.trim()];
      const newData = tableData.data.map(row => [...row, '']);
      const currentColumnWidths = tableData.columnWidths || new Array(tableData.columns.length).fill(120);
      const newColumnWidths = [...currentColumnWidths, 120];
      
      const updatedData = {
        ...tableData,
        columns: newColumns,
        data: newData,
        columnWidths: newColumnWidths
      };
      
      console.log('Updated tableData:', updatedData);
      
      setTableData(updatedData);
      setNewColumnName('');
      setIsEditingColumn(null);
    }
  };

  const removeColumn = (colIndex: number) => {
    const newColumns = tableData.columns.filter((_, index) => index !== colIndex);
    const newData = tableData.data.map(row => row.filter((_, index) => index !== colIndex));
    const newColumnWidths = (tableData.columnWidths || []).filter((_, index) => index !== colIndex);
    setTableData({
      ...tableData,
      columns: newColumns,
      data: newData,
      columnWidths: newColumnWidths
    });
  };

  const updateColumnName = (colIndex: number, newName: string) => {
    const newColumns = [...tableData.columns];
    newColumns[colIndex] = newName;
    setTableData({...tableData, columns: newColumns});
    setIsEditingColumn(null);
  };

  const startResizing = (type: 'column' | 'row', index: number) => {
    setIsResizing({type, index});
  };

  const handleResize = (e: MouseEvent) => {
    if (!isResizing || !tableRef.current) return;

    const rect = tableRef.current.getBoundingClientRect();
    
    if (isResizing.type === 'column') {
      const newWidth = Math.max(50, e.clientX - rect.left - (isResizing.index * 120));
      const newColumnWidths = [...(tableData.columnWidths || [])];
      newColumnWidths[isResizing.index] = newWidth;
      setTableData({...tableData, columnWidths: newColumnWidths});
    } else if (isResizing.type === 'row') {
      const newHeight = Math.max(30, e.clientY - rect.top - (isResizing.index * 40));
      const newRowHeights = [...(tableData.rowHeights || [])];
      newRowHeights[isResizing.index] = newHeight;
      setTableData({...tableData, rowHeights: newRowHeights});
    }
  };

  const stopResizing = () => {
    setIsResizing(null);
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResize);
      document.addEventListener('mouseup', stopResizing);
      return () => {
        document.removeEventListener('mousemove', handleResize);
        document.removeEventListener('mouseup', stopResizing);
      };
    }
  }, [isResizing]);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b border-dashboard-border">
        <div className="flex items-center space-x-2">
          <Button size="sm" onClick={addRow}>
            <Plus className="h-4 w-4 mr-1" />
            Add Row
          </Button>
          <Button size="sm" onClick={() => setIsEditingColumn(tableData.columns.length)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Column
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          {tableData.data.length} rows × {tableData.columns.length} columns
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table ref={tableRef} className="w-full text-sm">
          {config?.table?.showHeader !== false && (
            <thead className="bg-muted/50 sticky top-0">
              <tr>
                {tableData.columns.map((column, index) => (
                  <th 
                    key={index} 
                    className="px-3 py-2 text-left font-medium text-foreground border-b border-dashboard-border relative group"
                    style={{ width: tableData.columnWidths?.[index] || 120 }}
                  >
                    <div className="flex items-center justify-between">
                      {isEditingColumn === index ? (
                        <Input
                          value={newColumnName}
                          onChange={(e) => setNewColumnName(e.target.value)}
                          onBlur={() => updateColumnName(index, newColumnName || column)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              updateColumnName(index, newColumnName || column);
                            }
                          }}
                          className="h-6 text-xs"
                          autoFocus
                        />
                      ) : (
                        <span 
                          className="flex-1 cursor-pointer"
                          onClick={() => {
                            setIsEditingColumn(index);
                            setNewColumnName(column);
                          }}
                        >
                          {column}
                        </span>
                      )}
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => {
                            setIsEditingColumn(index);
                            setNewColumnName(column);
                          }}
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-destructive"
                          onClick={() => removeColumn(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50"
                      onMouseDown={() => startResizing('column', index)}
                    />
                  </th>
                ))}
                {isEditingColumn === tableData.columns.length && (
                  <th className="px-3 py-2 text-left font-medium text-foreground border-b border-dashboard-border">
                    <div className="flex items-center space-x-2">
                      <Input
                        value={newColumnName}
                        onChange={(e) => setNewColumnName(e.target.value)}
                        placeholder="Column name"
                        className="h-6 text-xs"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addColumn();
                          }
                        }}
                        autoFocus
                      />
                      <Button size="sm" onClick={addColumn}>
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button size="sm" onClick={() => setIsEditingColumn(null)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </th>
                )}
              </tr>
            </thead>
          )}
          <tbody>
            {tableData.data.map((row, rowIndex) => (
              <tr 
                key={rowIndex} 
                className={`${config?.table?.hoverable !== false ? 'hover:bg-muted/30' : ''} ${
                  config?.table?.striped && rowIndex % 2 === 1 ? 'bg-muted/20' : ''
                } group`}
                style={{ height: tableData.rowHeights?.[rowIndex] || 40 }}
              >
                {row.map((cell, cellIndex) => (
                  <td 
                    key={cellIndex} 
                    className="px-3 py-2 text-foreground border-b border-dashboard-border/50 relative"
                    style={{ width: tableData.columnWidths?.[cellIndex] || 120 }}
                  >
                    {editingCell?.row === rowIndex && editingCell?.col === cellIndex ? (
                      <Input
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onKeyDown={handleKeyPress}
                        onBlur={handleCellSave}
                        className="h-6 text-xs"
                        autoFocus
                      />
                    ) : (
                      <div 
                        className="cursor-pointer min-h-[20px]"
                        onClick={() => handleCellEdit(rowIndex, cellIndex)}
                      >
                        {cell || <span className="text-muted-foreground italic">Click to edit</span>}
                      </div>
                    )}
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50"
                      onMouseDown={() => startResizing('column', cellIndex)}
                    />
                  </td>
                ))}
                <td className="px-2 py-1 border-b border-dashboard-border/50">
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => handleCellEdit(rowIndex, 0)}
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-destructive"
                      onClick={() => removeRow(rowIndex)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};