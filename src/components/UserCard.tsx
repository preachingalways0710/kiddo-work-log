import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Edit3, Plus, ShoppingBag, UserCheck, Users } from 'lucide-react';

interface UserCardProps {
  name?: string;
  starCount?: number;
  profileImage?: string;
  isPresent?: boolean;
  guestCount?: number;
  shopBalance?: number;
  onEditProfile?: () => void;
  onTogglePresence?: () => void;
  onAddGuest?: () => void;
  onShopAction?: () => void;
}

export const UserCard = ({
  name = "João Silva",
  starCount = 25,
  profileImage,
  isPresent = false,
  guestCount = 2,
  shopBalance = 150,
  onEditProfile,
  onTogglePresence,
  onAddGuest,
  onShopAction
}: UserCardProps) => {
  const [localIsPresent, setLocalIsPresent] = useState(isPresent);

  const handleTogglePresence = () => {
    setLocalIsPresent(!localIsPresent);
    onTogglePresence?.();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="max-w-sm mx-auto bg-gradient-to-br from-background to-muted/30 border-2 border-muted/50 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardContent className="p-6">
        {/* Profile Image Section */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Avatar className="h-20 w-20 border-4 border-primary/20 shadow-md">
              <AvatarImage src={profileImage} alt={name} />
              <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-primary/20 to-accent/20">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="secondary"
              size="sm"
              className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full p-0 shadow-md bg-background border-2 border-primary/20 hover:bg-primary hover:text-primary-foreground"
              onClick={onEditProfile}
            >
              <Edit3 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Name and Stars Section */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold mb-2">{name}</h3>
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 px-3 py-1 rounded-full">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                {starCount}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons Section */}
        <div className="flex justify-between items-center mb-6">
          {/* Presente Button */}
          <Button
            variant={localIsPresent ? "default" : "outline"}
            size="sm"
            onClick={handleTogglePresence}
            className={`h-9 px-4 ${
              localIsPresent 
                ? "bg-gradient-to-r from-success to-success/80 hover:from-success/90 hover:to-success/70" 
                : "border-success text-success hover:bg-success hover:text-success-foreground"
            }`}
          >
            <UserCheck className="h-4 w-4 mr-2" />
            Presente
          </Button>

          {/* Convidados Section */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Convidados:</span>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                {guestCount}
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0 rounded-full border-primary/30 hover:bg-primary hover:text-primary-foreground"
              onClick={onAddGuest}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Loja Section */}
        <div className="bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/20">
                <ShoppingBag className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="text-sm font-medium">Loja</p>
                <p className="text-xs text-muted-foreground">Saldo: R$ {shopBalance},00</p>
              </div>
            </div>
            <Button
              variant="default"
              size="sm"
              className="bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70"
              onClick={onShopAction}
            >
              Gastar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};