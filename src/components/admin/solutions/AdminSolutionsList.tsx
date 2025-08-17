import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SolutionCard } from '@/types/solutions';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { GripVertical, Edit2, Copy, Trash2, Play } from 'lucide-react';

interface AdminSolutionsListProps {
  items: SolutionCard[];
  onReorder: (items: SolutionCard[]) => void;
  onEdit: (item: SolutionCard) => void;
  onDuplicate: (item: SolutionCard) => void;
  onDelete: (id: string) => void;
  onToggleEnabled: (id: string, enabled: boolean) => void;
}

interface SortableItemProps {
  item: SolutionCard;
  onEdit: (item: SolutionCard) => void;
  onDuplicate: (item: SolutionCard) => void;
  onDelete: (id: string) => void;
  onToggleEnabled: (id: string, enabled: boolean) => void;
}

const SortableItem = ({ item, onEdit, onDuplicate, onDelete, onToggleEnabled }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDelete = () => {
    if (confirm(`האם אתה בטוח שברצונך למחוק את "${item.title}"?`)) {
      onDelete(item.id);
    }
  };

  return (
    <Card ref={setNodeRef} style={style} className={isDragging ? 'z-50' : ''}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
          >
            <GripVertical className="h-5 w-5 text-gray-400" />
          </div>

          {/* Thumbnail */}
          <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative">
            {item.videoSrc ? (
              <>
                <video
                  className="w-full h-full object-cover"
                  muted
                  poster={item.imageSrc}
                >
                  <source src={item.videoSrc} type="video/mp4" />
                </video>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Play className="h-4 w-4 text-white drop-shadow-md" />
                </div>
              </>
            ) : item.imageSrc ? (
              <img
                src={item.imageSrc}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-xs text-gray-400">אין</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 text-right">
            <h3 className="font-assistant font-semibold truncate">{item.title}</h3>
            <div className="flex gap-2 text-xs text-muted-foreground mt-1">
              {item.tagSlug && (
                <span className="bg-gray-100 px-2 py-1 rounded">
                  {item.tagSlug}
                </span>
              )}
              {item.href && (
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  לחיץ
                </span>
              )}
            </div>
          </div>

          {/* Enabled Toggle */}
          <div className="flex items-center gap-2">
            <Switch
              checked={item.enabled}
              onCheckedChange={(enabled) => onToggleEnabled(item.id, enabled)}
            />
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {item.enabled ? 'מופעל' : 'מושבת'}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(item)}
              className="h-8 w-8 p-0"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDuplicate(item)}
              className="h-8 w-8 p-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AdminSolutionsList = ({
  items,
  onReorder,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleEnabled,
}: AdminSolutionsListProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      
      const reorderedItems = arrayMove(items, oldIndex, newIndex).map((item, index) => ({
        ...item,
        order: index,
      }));
      
      onReorder(reorderedItems);
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground font-open-sans">
          אין כרטיסים. לחץ "הוסף כרטיס" כדי להתחיל.
        </p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {items.map((item) => (
            <SortableItem
              key={item.id}
              item={item}
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

export default AdminSolutionsList;