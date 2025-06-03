
import { FC, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Plus, Minus, ListTree } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { useGlobalMaxLevel } from './hooks/useGlobalMaxLevel';

export const MaxLevelControl: FC = () => {
  const { maxLevel, setMaxLevel } = useGlobalMaxLevel();
  const [inputValue, setInputValue] = useState(maxLevel.toString());
  const { toast } = useToast();
  
  const MAX_ALLOWED_LEVEL = 50; // Updated to 50 as per requirements
  
  useEffect(() => {
    // Update input value when maxLevel changes externally
    setInputValue(maxLevel.toString());
  }, [maxLevel]);

  const handleDecrease = () => {
    if (maxLevel > 0) {
      setMaxLevel(maxLevel - 1);
      toast({
        description: `Maximum graph level decreased to ${maxLevel - 1}`,
      });
    }
  };

  const handleIncrease = () => {
    if (maxLevel < MAX_ALLOWED_LEVEL) {
      setMaxLevel(maxLevel + 1);
      toast({
        description: `Maximum graph level increased to ${maxLevel + 1}`,
      });
    } else {
      toast({
        variant: "destructive",
        description: `Maximum level cannot exceed ${MAX_ALLOWED_LEVEL} due to performance considerations`,
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    const newLevel = parseInt(inputValue);
    if (!isNaN(newLevel) && newLevel >= 0 && newLevel <= MAX_ALLOWED_LEVEL) {
      setMaxLevel(newLevel);
      toast({
        description: `Maximum graph level set to ${newLevel}`,
      });
    } else {
      // Reset to current value if invalid
      setInputValue(maxLevel.toString());
      toast({
        variant: "destructive",
        description: `Please enter a valid level between 0 and ${MAX_ALLOWED_LEVEL}`,
      });
    }
  };

  const handleSliderChange = (value: number[]) => {
    const newLevel = value[0];
    setMaxLevel(newLevel);
    setInputValue(newLevel.toString());
  };

  return (
    <div className="flex items-center gap-2">
      <div className="bg-slate-800 text-white px-3 py-1 rounded-md flex items-center">
        <Label className="mr-2 text-xs">Graph Depth:</Label>
        <span className="font-mono font-bold">{maxLevel}</span>
      </div>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-1.5">
            <ListTree className="h-4 w-4" />
            <span>Adjust Level</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <h4 className="font-medium">Maximum Graph Level</h4>
            <p className="text-sm text-muted-foreground">
              Set the maximum depth level for transaction graph visualization.
            </p>
            
            <div className="flex justify-between items-center">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDecrease}
                disabled={maxLevel <= 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              
              <div className="w-40 mx-2">
                <Slider 
                  value={[maxLevel]} 
                  min={0} 
                  max={MAX_ALLOWED_LEVEL} 
                  step={1} 
                  onValueChange={handleSliderChange}
                />
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleIncrease}
                disabled={maxLevel >= MAX_ALLOWED_LEVEL}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Label htmlFor="level-input" className="w-24">Custom Level:</Label>
              <Input
                id="level-input"
                type="number"
                min={0}
                max={MAX_ALLOWED_LEVEL}
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                className="w-20"
              />
              <span className="text-xs text-muted-foreground">
                (0-{MAX_ALLOWED_LEVEL})
              </span>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
