import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Star, ChevronUp, ChevronDown } from 'lucide-react';
import type { Testimonial } from '@/types/testimonials';

interface AdminTestimonialsListProps {
  items: Testimonial[];
  onEdit: (item: Testimonial) => void;
  onDelete: (id: string) => void;
  onReorder: (reorderedItems: Testimonial[]) => void;
}

const AdminTestimonialsList = ({ items, onEdit, onDelete, onReorder }: AdminTestimonialsListProps) => {
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    
    const newItems = [...items];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    
    // Update order_index values
    const updatedItems = newItems.map((item, idx) => ({
      ...item,
      order_index: idx
    }));
    
    onReorder(updatedItems);
  };

  const handleMoveDown = (index: number) => {
    if (index === items.length - 1) return;
    
    const newItems = [...items];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    
    // Update order_index values
    const updatedItems = newItems.map((item, idx) => ({
      ...item,
      order_index: idx
    }));
    
    onReorder(updatedItems);
  };

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Star className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">אין המלצות</h3>
          <p className="text-muted-foreground text-center">
            לחץ על "המלצה חדשה" כדי להוסיף את ההמלצה הראשונה
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4" dir="rtl">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-1">
                      {[...Array(item.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                      ))}
                    </div>
                    {item.is_featured && (
                      <Badge variant="secondary" className="text-xs">
                        מומלץ
                      </Badge>
                    )}
                  </div>

                  <h3 className="font-semibold text-lg mb-1">
                    {item.client_name}
                  </h3>
                  
                  {item.client_business && (
                    <p className="text-muted-foreground text-sm mb-3">
                      {item.client_business}
                    </p>
                  )}

                  <blockquote className="text-foreground/90 italic border-r-4 border-primary/20 pr-4 mb-4">
                    "{item.content}"
                  </blockquote>

                  <div className="text-xs text-muted-foreground">
                    סדר הצגה: {item.order_index}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === items.length - 1}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(item)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default AdminTestimonialsList;