import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Calendar, MapPin, Eye } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export interface Item {
  id: string;
  type: "lost" | "found";
  title: string;
  description: string;
  category: string;
  location: string;
  date: string;
  contact: string;
  imageUrl: string;
  status: "active" | "resolved";
}

interface ItemCardProps {
  item: Item;
  onViewDetails: (item: Item) => void;
}

export function ItemCard({ item, onViewDetails }: ItemCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        <ImageWithFallback
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-full object-cover"
        />
      </div>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-1">{item.title}</CardTitle>
          <Badge variant={item.type === "lost" ? "destructive" : "default"}>
            {item.type === "lost" ? "Lost" : "Found"}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">{item.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0" />
          <span className="truncate">{item.location}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4 shrink-0" />
          <span>{item.date}</span>
        </div>
        <div className="flex items-center justify-between pt-2">
          <Badge variant="secondary">{item.category}</Badge>
          <Button onClick={() => onViewDetails(item)} size="sm">
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}