import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Calculator, CalculatorIcon } from "lucide-react";
import { DashboardWidget } from "../../DashboardContext";

interface CalculatorWidgetProps {
  widget: DashboardWidget;
  width: number;
  height: number;
}

export const CalculatorWidget = ({ widget, width, height }: CalculatorWidgetProps) => {
  const [display, setDisplay] = useState("0");
  const [operation, setOperation] = useState<string | null>(null);
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);
  const [isScientific, setIsScientific] = useState(false);

  const inputNumber = (num: string) => {
    if (waitingForNewValue) {
      setDisplay(num);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === "0" ? num : display + num);
    }
  };

  const inputOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForNewValue(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string) => {
    switch (operation) {
      case "+":
        return firstValue + secondValue;
      case "-":
        return firstValue - secondValue;
      case "×":
        return firstValue * secondValue;
      case "÷":
        return firstValue / secondValue;
      case "^":
        return Math.pow(firstValue, secondValue);
      case "√":
        return Math.sqrt(secondValue);
      case "=":
        return secondValue;
      default:
        return secondValue;
    }
  };

  const performScientificFunction = (func: string) => {
    const value = parseFloat(display);
    let result: number;

    switch (func) {
      case "sin":
        result = Math.sin(value * Math.PI / 180);
        break;
      case "cos":
        result = Math.cos(value * Math.PI / 180);
        break;
      case "tan":
        result = Math.tan(value * Math.PI / 180);
        break;
      case "log":
        result = Math.log10(value);
        break;
      case "ln":
        result = Math.log(value);
        break;
      case "√":
        result = Math.sqrt(value);
        break;
      case "x²":
        result = value * value;
        break;
      case "x³":
        result = value * value * value;
        break;
      case "1/x":
        result = 1 / value;
        break;
      case "π":
        result = Math.PI;
        break;
      case "e":
        result = Math.E;
        break;
      case "!":
        result = factorial(Math.floor(value));
        break;
      default:
        result = value;
    }

    setDisplay(String(result));
    setWaitingForNewValue(true);
  };

  const factorial = (n: number): number => {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    return n * factorial(n - 1);
  };

  const performCalculation = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForNewValue(true);
    }
  };

  const clearAll = () => {
    setDisplay("0");
    setOperation(null);
    setPreviousValue(null);
    setWaitingForNewValue(false);
  };

  const normalButtons = [
    ["C", "±", "%", "÷"],
    ["7", "8", "9", "×"],
    ["4", "5", "6", "-"],
    ["1", "2", "3", "+"],
    ["0", ".", "="]
  ];

  const scientificButtons = [
    ["C", "±", "%", "÷", "sin", "cos"],
    ["7", "8", "9", "×", "tan", "log"],
    ["4", "5", "6", "-", "ln", "√"],
    ["1", "2", "3", "+", "x²", "x³"],
    ["0", ".", "=", "1/x", "π", "e"],
    ["(", ")", "^", "!", "°", "rad"]
  ];

  const buttons = isScientific ? scientificButtons : normalButtons;
  const gridCols = isScientific ? "grid-cols-6" : "grid-cols-4";

  return (
    <div className="w-full h-full p-2 flex flex-col">
      {/* Header with mode toggle */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {isScientific ? <CalculatorIcon className="h-4 w-4" /> : <Calculator className="h-4 w-4" />}
          <span className="text-sm font-medium">
            {isScientific ? "Scientific" : "Standard"}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="scientific-mode" className="text-xs">Scientific</Label>
          <Switch
            id="scientific-mode"
            checked={isScientific}
            onCheckedChange={setIsScientific}
          />
        </div>
      </div>

      {/* Display */}
      <div className="bg-muted/50 rounded-lg p-3 mb-2 text-right">
        <div className="text-lg font-mono text-foreground truncate">{display}</div>
      </div>

      {/* Buttons */}
      <div className={`flex-1 grid ${gridCols} gap-1`}>
        {buttons.map((row, rowIndex) => 
          row.map((button, colIndex) => {
            const isOperator = ["C", "±", "%", "÷", "×", "-", "+", "=", "^", "√"].includes(button);
            const isScientificFunc = ["sin", "cos", "tan", "log", "ln", "x²", "x³", "1/x", "π", "e", "!"].includes(button);
            const isSpecial = ["(", ")", "°", "rad"].includes(button);
            
            return (
              <Button
                key={`${rowIndex}-${colIndex}`}
                variant={isOperator || isScientificFunc ? "default" : "outline"}
                size="sm"
                className={`text-xs ${button === "0" && colIndex === 0 ? "col-span-2" : ""}`}
                onClick={() => {
                  if (button === "C") {
                    clearAll();
                  } else if (["+", "-", "×", "÷", "^"].includes(button)) {
                    inputOperation(button);
                  } else if (button === "=") {
                    performCalculation();
                  } else if (button === "±") {
                    setDisplay(String(parseFloat(display) * -1));
                  } else if (button === "%") {
                    setDisplay(String(parseFloat(display) / 100));
                  } else if (isScientificFunc) {
                    performScientificFunction(button);
                  } else if (button === "π") {
                    setDisplay(String(Math.PI));
                    setWaitingForNewValue(true);
                  } else if (button === "e") {
                    setDisplay(String(Math.E));
                    setWaitingForNewValue(true);
                  } else if (button === "°") {
                    // Convert to degrees (placeholder)
                    setDisplay(display + "°");
                  } else if (button === "rad") {
                    // Convert to radians (placeholder)
                    setDisplay(display + " rad");
                  } else {
                    inputNumber(button);
                  }
                }}
              >
                {button}
              </Button>
            );
          })
        )}
      </div>
    </div>
  );
};