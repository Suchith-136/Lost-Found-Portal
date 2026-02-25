import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Calendar, MapPin, Mail } from "lucide-react";
import { Item } from "./ItemCard";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface ItemDetailDialogProps {
  item: Item | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ItemDetailDialog({ item, open, onOpenChange }: ItemDetailDialogProps) {
  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <DialogTitle>{item.title}</DialogTitle>
            <Badge variant={item.type === "lost" ? "destructive" : "default"}>
              {item.type === "lost" ? "Lost Item" : "Found Item"}
            </Badge>
          </div>
          <DialogDescription>Item Details</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="aspect-video overflow-hidden rounded-lg bg-muted">
            <ImageWithFallback
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-3">
            <div>
              <h4 className="mb-1">Description</h4>
              <p className="text-muted-foreground">{item.description}</p>
            </div>

            <div>
              <h4 className="mb-1">Category</h4>
              <Badge variant="secondary">{item.category}</Badge>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <div>
                <span className="text-foreground mr-2">Location:</span>
                {item.location}
              </div>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <div>
                <span className="text-foreground mr-2">Date:</span>
                {item.date}
              </div>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <div>
                <span className="text-foreground mr-2">Contact:</span>
                {item.contact}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}