export interface User {
  _id: string;
  name: string;
  addresses: Addresses[];
  email: string;
  avatar: string;
  joined: string;
  bio: string;
  website: string;
  twitter: string;
  x: string;
  instagram: string;
  telegram: string;
  facebook: string;
  isSeller: boolean;
  isDriver?: boolean; // Added for delivery drivers
  currentLocation?: { lat: number; lng: number }; // Added for delivery drivers
  wishlist: string[];
  settings: {
    theme: "light" | "dark" | "system";
    currency: string;
    lenguage: string;
  }
}
export interface Addresses {
  name: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  phone: string;
  lat?: number; // Added for geocoding
  lng?: number; // Added for geocoding
}
export interface CreateProduct {
  seller: string;
  stock?: number;
  location?: string;
  condition?: string;
  name: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  images: Array<File>;
  tags?: string;
  isService?: boolean;
  addressWallet?: string;
}

export interface Product {
  _id: string;
  seller: string;
  name: string;
  addressWallet: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  status: string;
  images: Array<string | File>;
  mainImage: string;
  stock: number;
  location?: string;
  condition?: string;
  tags?: string[];
  isService?: boolean;
  isFeatured?: boolean;
  isOffer?: boolean;
  offerPercentage: number;
  reviews?: string[];
  rating: number;
  subcategory?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CartItem extends Partial<Product> {
  _id: string ;
  seller: string;
  name: string;
  price: number;
  mainImage: string;
  quantity: number;
  addressWallet: string;
  currency: string;
  isOffer?: boolean;
  offerPercentage: number;
  // convertedPrice: number;
}

export interface Order {
  _id: string;
  date: Date;
  status: string;
  buyer: {
    walletAddress: string;
    _id?: string;
  };
  decryptedAddress?: AddressForm;
  sellers: string[];
  signature: string;
  driverId?: string;
  // totalPrice: number;
  items: {
    _id: string;
    price: number;
    quantity: number;
    name: string;
    image: string;
    currency: string;
    seller: string
  }[];
}

export interface Shipment {
  _id: string;
  orderId: string;
  sellerId: string;
  driverId: string;
  status: 'pending_assignment' | 'en_route_to_pickup' | 'in_transit' | 'delivered';
  items: Order['items'];
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderWithEncryptedAddress extends Omit<Order, 'decryptedAddress'> {
  encryptedAddress: EncryptedData;
}

export interface AddressForm {
  fullName: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  email: string;
  lat?: number; // Added for geocoding
  lng?: number; // Added for geocoding
}

export interface EncryptedData {
  iv: string;
  content: string;
  tag: string;
}

export interface Reviews {
  _id: string;
  text: string;
  rating: number;
}


export type Currency = {
	symbol: string,
	name: string,
	price: number,
}