export interface Client {
  id: string;
  business_name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  business_type: string;
  package_type: string;
  monthly_savings: number;
  status: 'פעיל' | 'לא פעיל' | 'השהיה';
  signup_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ClientImage {
  id: string;
  client_id: string;
  dish_name: string;
  image_before?: string;
  image_after: string;
  category: string;
  service_type: 'תמונות' | 'סרטונים';
  created_at: string;
  updated_at: string;
}

export interface ClientWithImages extends Client {
  images: ClientImage[];
}

export const packageTypes = [
  'חבילת התנסות',
  'חבילת טעימות',
  'נוכחות דיגיטלית מלאה',
  'הפקת פרימיום',
  'מסלול מנוי - טעימות',
  'מסלול מנוי - נוכחות מלאה',
  'מסלול מנוי - פרימיום',
  'מסלול סוכנויות'
];

export const businessTypes = [
  'מסעדה',
  'בית קפה',
  'מאפייה',
  'ספק מזון',
  'אוכל מהיר',
  'קייטרינג',
  'מלון',
  'בר',
  'פוד טרק',
  'אחר'
];

export const statusOptions = [
  { value: 'פעיל', label: 'פעיל', color: 'bg-green-100 text-green-800' },
  { value: 'לא פעיל', label: 'לא פעיל', color: 'bg-red-100 text-red-800' },
  { value: 'השהיה', label: 'השהיה', color: 'bg-yellow-100 text-yellow-800' }
];