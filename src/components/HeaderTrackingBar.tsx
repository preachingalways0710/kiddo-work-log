import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Search, Users, UserCheck, Settings } from 'lucide-react';

interface HeaderTrackingBarProps {
  presentCount?: number;
  helpersCount?: number;
  onSearchChange?: (value: string) => void;
}

export const HeaderTrackingBar = ({
  presentCount = 0,
  helpersCount = 0,
  onSearchChange
}: HeaderTrackingBarProps) => {
  const [searchValue, setSearchValue] = useState('');

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    onSearchChange?.(value);
  };

  return (
    <Card className="mb-6 p-4 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left side - Tracking information */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-success/10">
              <UserCheck className="w-4 h-4 text-success" />
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Presentes:</span>
              <Badge variant="secondary" className="ml-2 bg-success/10 text-success border-success/20">
                {presentCount}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Ajudantes:</span>
              <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary border-primary/20">
                {helpersCount}
              </Badge>
            </div>
          </div>
        </div>

        {/* Right side - Search and controls */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar pessoa..."
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 w-48 h-9 bg-background/80 border-muted-foreground/20 focus:border-primary"
            />
          </div>
          
          <Button variant="outline" size="sm" className="h-9 w-9 p-0">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};