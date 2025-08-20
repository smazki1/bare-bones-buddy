import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Send } from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const ContactForm = () => {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.2 });
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    restaurantName: '',
    address: '',
    cuisineType: '',
    services: [] as string[],
    budget: [5000],
    menuItems: '',
    hasExistingPhotos: '',
    message: '',
    files: [] as File[]
  });

  const serviceOptions = [
    'צילום תמונות AI למנות',
    'סרטוני פוד',
    'עיצוב תפריט',
    'ייעוץ שיווקי',
    'ניהול רשתות חברתיות',
    'צילום מקצועי קלאסי'
  ];

  const handleServiceChange = (service: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      services: checked 
        ? [...prev.services, service]
        : prev.services.filter(s => s !== service)
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({ ...prev, files: [...prev.files, ...files] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.phone || !formData.email || !formData.restaurantName) {
      toast({
        title: "שגיאה",
        description: "אנא מלאו את כל השדות הנדרשים",
        variant: "destructive"
      });
      return;
    }

    // Simulate form submission
    toast({
      title: "הודעה נשלחה בהצלחה!",
      description: "נחזור אליכם תוך 24 שעות עם הצעת מחיר מפורטת",
    });

    // Reset form
    setFormData({
      name: '',
      phone: '',
      email: '',
      restaurantName: '',
      address: '',
      cuisineType: '',
      services: [],
      budget: [5000],
      menuItems: '',
      hasExistingPhotos: '',
      message: '',
      files: []
    });
  };

  return (
    <section ref={ref} id="contact-form" className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-assistant font-bold text-primary mb-4">
            ספרו לנו על המסעדה שלכם
          </h2>
          <p className="text-xl text-muted-foreground font-open-sans max-w-2xl mx-auto">
            מלאו את הטופס ונחזור אליכם עם הצעת מחיר מותאמת אישית
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-card rounded-2xl p-8 shadow-elegant">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-assistant font-semibold text-foreground mb-2">
                    שם מלא *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="השם שלכם"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-assistant font-semibold text-foreground mb-2">
                    טלפון *
                  </label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="050-1234567"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-assistant font-semibold text-foreground mb-2">
                    אימייל *
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="name@restaurant.com"
                    required
                  />
                </div>
              </div>

              {/* Business Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-assistant font-semibold text-foreground mb-2">
                    שם המסעדה *
                  </label>
                  <Input
                    value={formData.restaurantName}
                    onChange={(e) => setFormData(prev => ({ ...prev, restaurantName: e.target.value }))}
                    placeholder="שם המסעדה"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-assistant font-semibold text-foreground mb-2">
                    כתובת
                  </label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="כתובת המסעדה"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-assistant font-semibold text-foreground mb-2">
                  סוג מטבח
                </label>
                <Select value={formData.cuisineType} onValueChange={(value) => setFormData(prev => ({ ...prev, cuisineType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחרו סוג מטבח" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="israeli">ישראלי</SelectItem>
                    <SelectItem value="italian">איטלקי</SelectItem>
                    <SelectItem value="asian">אסייתי</SelectItem>
                    <SelectItem value="meat">בשרי</SelectItem>
                    <SelectItem value="dairy">חלבי</SelectItem>
                    <SelectItem value="vegan">טבעוני</SelectItem>
                    <SelectItem value="fast-food">אוכל מהיר</SelectItem>
                    <SelectItem value="fine-dining">מסעדה יוקרתית</SelectItem>
                    <SelectItem value="other">אחר</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Services */}
              <div>
                <label className="block text-sm font-assistant font-semibold text-foreground mb-4">
                  סוגי השירות המעניינים אתכם
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {serviceOptions.map((service) => (
                    <div key={service} className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Checkbox
                        id={service}
                        checked={formData.services.includes(service)}
                        onCheckedChange={(checked) => handleServiceChange(service, checked as boolean)}
                      />
                      <label 
                        htmlFor={service}
                        className="text-sm font-open-sans text-foreground cursor-pointer"
                      >
                        {service}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div>
                <label className="block text-sm font-assistant font-semibold text-foreground mb-4">
                  תקציב משוער: ₪{formData.budget[0].toLocaleString()}
                </label>
                <Slider
                  value={formData.budget}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, budget: value }))}
                  max={50000}
                  min={1000}
                  step={500}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>₪1,000</span>
                  <span>₪50,000+</span>
                </div>
              </div>

              {/* Menu Items */}
              <div>
                <label className="block text-sm font-assistant font-semibold text-foreground mb-2">
                  מספר מנות בתפריט (משוער)
                </label>
                <Input
                  type="number"
                  value={formData.menuItems}
                  onChange={(e) => setFormData(prev => ({ ...prev, menuItems: e.target.value }))}
                  placeholder="למשל: 25"
                />
              </div>

              {/* Existing Photos */}
              <div>
                <label className="block text-sm font-assistant font-semibold text-foreground mb-2">
                  האם יש לכם תמונות קיימות של המנות?
                </label>
                <Select value={formData.hasExistingPhotos} onValueChange={(value) => setFormData(prev => ({ ...prev, hasExistingPhotos: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחרו תשובה" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">כן, יש לנו תמונות</SelectItem>
                    <SelectItem value="some">יש לנו רק חלק מהמנות</SelectItem>
                    <SelectItem value="no">לא, אין לנו תמונות</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-assistant font-semibold text-foreground mb-2">
                  העלו תמונות קיימות (אופציונלי)
                </label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground font-open-sans mb-4">
                    גררו קבצים לכאן או לחצו לבחירה
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button type="button" variant="outline" asChild>
                    <label htmlFor="file-upload" className="cursor-pointer">
                      בחר קבצים
                    </label>
                  </Button>
                  {formData.files.length > 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {formData.files.length} קבצים נבחרו
                    </p>
                  )}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-assistant font-semibold text-foreground mb-2">
                  הודעה נוספת
                </label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="ספרו לנו יותר על הצרכים שלכם, הסגנון הרצוי, או כל מידע נוסף שחשוב לכם"
                  rows={4}
                />
              </div>

              {/* Submit Button */}
              <div className="text-center">
                <Button 
                  type="submit" 
                  className="bg-secondary hover:bg-secondary/90 text-white px-12 py-4 text-lg font-assistant font-semibold"
                >
                  <Send className="w-5 h-5 ml-2" />
                  שלחו בקשה להצעת מחיר
                </Button>
                <p className="text-sm text-muted-foreground mt-4 font-open-sans">
                  נחזור אליכם תוך 24 שעות עם הצעת מחיר מפורטת
                </p>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactForm;
