import { useState, useEffect } from 'react';
import { marketsStore } from '@/data/marketsStore';
import { MarketTag, MarketsConfig } from '@/types/markets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, GripVertical, Save, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
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
import {
  CSS,
} from '@dnd-kit/utilities';

const SortableMarketItem = ({ 
  market, 
  onUpdate, 
  onDelete 
}: { 
  market: MarketTag; 
  onUpdate: (id: string, updates: Partial<MarketTag>) => void;
  onDelete: (id: string) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: market.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-card border rounded-lg p-4 space-y-4"
    >
      <div className="flex items-center gap-2">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`label-${market.id}`} className="text-sm text-foreground">תווית</Label>
            <Input
              id={`label-${market.id}`}
              value={market.label}
              onChange={(e) => onUpdate(market.id, { label: e.target.value })}
              placeholder="מנות מסעדות"
              className="text-right bg-background border-input text-foreground placeholder:text-muted-foreground"
              dir="rtl"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor={`slug-${market.id}`} className="text-sm text-foreground">Slug</Label>
            <Input
              id={`slug-${market.id}`}
              value={market.slug}
              onChange={(e) => onUpdate(market.id, { slug: e.target.value })}
              placeholder="restaurants"
              className="text-left bg-background border-input text-foreground placeholder:text-muted-foreground"
              dir="ltr"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm text-foreground">מצב</Label>
            <div className="flex items-center gap-2">
              <Switch
                checked={market.enabled}
                onCheckedChange={(enabled) => onUpdate(market.id, { enabled })}
              />
              <Badge variant={market.enabled ? "default" : "secondary"}>
                {market.enabled ? 'פעיל' : 'לא פעיל'}
              </Badge>
            </div>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => onDelete(market.id)}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

const AdminMarketsEditor = () => {
  const [config, setConfig] = useState<MarketsConfig>(() => marketsStore.safeGetConfigOrDefaults());
  const [hasChanges, setHasChanges] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const stored = marketsStore.getConfig();
    if (stored) {
      setConfig(stored);
    }
  }, []);

  const handleSave = () => {
    try {
      marketsStore.saveConfig(config);
      setHasChanges(false);
      toast.success('השינויים נשמרו בהצלחה');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('שגיאה בשמירת השינויים');
    }
  };

  const handleReset = () => {
    marketsStore.resetToDefaults();
    const defaults = marketsStore.safeGetConfigOrDefaults();
    setConfig(defaults);
    setHasChanges(true);
    toast.info('התצורה אופסה לברירת מחדל');
  };

  const handleConfigUpdate = (updates: Partial<MarketsConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  const handleMarketUpdate = (id: string, updates: Partial<MarketTag>) => {
    setConfig(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    }));
    setHasChanges(true);
  };

  const handleMarketDelete = (id: string) => {
    setConfig(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
    setHasChanges(true);
  };

  const handleAddMarket = () => {
    const newMarket: MarketTag = {
      id: marketsStore.generateId('חדש'),
      label: 'שוק חדש',
      slug: 'new-market',
      enabled: true,
      order: config.items.length
    };

    setConfig(prev => ({
      ...prev,
      items: [...prev.items, newMarket]
    }));
    setHasChanges(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setConfig(prev => {
        const oldIndex = prev.items.findIndex(item => item.id === active.id);
        const newIndex = prev.items.findIndex(item => item.id === over.id);
        
        const newItems = arrayMove(prev.items, oldIndex, newIndex);
        // Update order field
        const updatedItems = newItems.map((item, index) => ({
          ...item,
          order: index
        }));

        return {
          ...prev,
          items: updatedItems
        };
      });
      setHasChanges(true);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-assistant text-right">
              ניהול שווקי המזון
            </CardTitle>
            <div className="flex gap-2">
              {hasChanges && (
                <Button onClick={handleSave} className="font-assistant">
                  <Save className="h-4 w-4 ml-2" />
                  שמור שינויים
                </Button>
              )}
              <Button variant="outline" onClick={handleReset} className="font-assistant">
                <RotateCcw className="h-4 w-4 ml-2" />
                אפס לברירת מחדל
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sectionTitle" className="text-foreground">כותרת הסקשן</Label>
              <Input
                id="sectionTitle"
                value={config.sectionTitle}
                onChange={(e) => handleConfigUpdate({ sectionTitle: e.target.value })}
                className="text-right bg-background border-input text-foreground placeholder:text-muted-foreground"
                dir="rtl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sectionSubtitle" className="text-foreground">תת-כותרת</Label>
              <Textarea
                id="sectionSubtitle"
                value={config.sectionSubtitle}
                onChange={(e) => handleConfigUpdate({ sectionSubtitle: e.target.value })}
                className="text-right min-h-[60px] bg-background border-input text-foreground placeholder:text-muted-foreground"
                dir="rtl"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-assistant text-right">
              ניהול תגי השווקים ({config.items.length} פריטים)
            </CardTitle>
            <Button onClick={handleAddMarket} className="font-assistant">
              <Plus className="h-4 w-4 ml-2" />
              הוסף שוק חדש
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={config.items.map(item => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {config.items.map((market) => (
                  <SortableMarketItem
                    key={market.id}
                    market={market}
                    onUpdate={handleMarketUpdate}
                    onDelete={handleMarketDelete}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {config.items.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="font-open-sans">אין תגי שווקים להצגה</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminMarketsEditor;