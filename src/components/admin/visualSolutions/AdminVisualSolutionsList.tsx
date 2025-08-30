import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Eye, EyeOff, Edit, Trash2, Copy, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VisualSolutionCard } from '@/types/visualSolutions';

interface SortableVisualSolutionItemProps {
  card: VisualSolutionCard;
  onEdit: (card: VisualSolutionCard) => void;
  onDuplicate: (card: VisualSolutionCard) => void;
  onDelete: (id: string) => void;
  onToggleEnabled: (id: string) => void;
}

const SortableVisualSolutionItem = ({ 
  card, 
  onEdit, 
  onDuplicate, 
  onDelete, 
  onToggleEnabled 
}: SortableVisualSolutionItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-card rounded-lg border p-4 ${isDragging ? 'shadow-lg' : 'hover:shadow-sm'} transition-shadow`}
    >
      <div className="flex items-center gap-4">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="flex-shrink-0 cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>

        {/* Media Preview */}
        <div className="flex-shrink-0">
          {card.videoSrc ? (
            <video
              src={card.videoSrc}
              className="w-16 h-12 object-cover rounded border"
              muted
            />
          ) : (
            <img
              src={card.imageSrc}
              alt={card.title}
              className="w-16 h-12 object-cover rounded border"
            />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-assistant font-semibold truncate">
              {card.title}
            </h4>
            <Badge variant={card.enabled ? 'default' : 'secondary'} className="text-xs">
              {card.enabled ? 'פעיל' : 'לא פעיל'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground font-open-sans">
            <span>סדר: {card.order}</span>
            {card.href && <span>קישור: {card.href}</span>}
            {card.tagSlug && <span>תג: {card.tagSlug}</span>}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleEnabled(card.id)}
            className="text-muted-foreground hover:text-foreground"
          >
            {card.enabled ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(card)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Edit className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDuplicate(card)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Copy className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(card.id)}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

interface AdminVisualSolutionsListProps {
  cards: VisualSolutionCard[];
  onEdit: (card: VisualSolutionCard) => void;
  onDuplicate: (card: VisualSolutionCard) => void;
  onDelete: (id: string) => void;
  onToggleEnabled: (id: string) => void;
  onReorder: (cards: VisualSolutionCard[]) => void;
}

const AdminVisualSolutionsList = ({
  cards,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleEnabled,
  onReorder
}: AdminVisualSolutionsListProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = cards.findIndex(card => card.id === active.id);
      const newIndex = cards.findIndex(card => card.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newCards = arrayMove(cards, oldIndex, newIndex).map((card, index) => ({
          ...card,
          order: index
        }));
        onReorder(newCards);
      }
    }
  };

  if (cards.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="font-open-sans">אין פתרונות ויזואליים עדיין</p>
        <p className="font-open-sans text-sm mt-1">לחץ על "הוסף פתרון ויזואלי" כדי להתחיל</p>
      </div>
    );
  }

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext 
        items={cards.map(card => card.id)} 
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {cards.map((card) => (
            <SortableVisualSolutionItem
              key={card.id}
              card={card}
              onEdit={onEdit}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
              onToggleEnabled={onToggleEnabled}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default AdminVisualSolutionsList;