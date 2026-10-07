export interface ProductBundle {
  id: string;
  title: string;
  tagline: string;
  badge?: string;
  popular?: boolean;
  stepsCount: number;
  originalPrice: number;
  price: number;
  installmentsCount: number;
  installmentValue: number;
  savings: number;
  freeShipping: boolean;
  gifts: string[];
  itemsIncluded: string[];
  image: string;
}

export interface Review {
  id: string;
  name: string;
  location: string;
  hairType: string;
  rating: number;
  date: string;
  verified: boolean;
  title: string;
  comment: string;
  hasPhoto?: boolean;
  photoUrl?: string;
  salonProfessional?: boolean;
}

export interface CartItem {
  bundle: ProductBundle;
  quantity: number;
  addOn?: {
    id: string;
    title: string;
    price: number;
  };
}

export interface PurchaseNotification {
  id: string;
  name: string;
  city: string;
  state: string;
  bundleTitle: string;
  timeAgo: string;
  photoUrl: string;
}

export interface QuizState {
  damageLevel: string;
  chemicalHistory: string;
  hairType: string;
  hairLength: string;
}

export interface FAQItem {
  id?: string;
  question: string;
  answer: string;
  category?: string;
}

