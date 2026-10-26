export type ItemCategory = 
  | 'Electronics' 
  | 'Study' 
  | 'Gaming' 
  | 'Travel' 
  | 'Sports' 
  | 'Photography' 
  | 'College Essentials';

export type ItemCondition = 'Like New' | 'Excellent' | 'Good' | 'Fair';

export interface Owner {
  id: string;
  name: string;
  avatar: string;
  campus: string;
  hostelOrDept: string;
  rating: number;
  rentalsCompleted: number;
  verifiedStudent: boolean;
  joinYear: string;
}

export interface Review {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  date: string;
  comment: string;
}

export interface RentalItem {
  id: string;
  title: string;
  category: ItemCategory;
  pricePerDay: number;
  securityDeposit: number;
  rating: number;
  reviewCount: number;
  location: string;
  campus: string;
  imageUrl: string;
  images?: string[];
  condition: ItemCondition;
  isPopular?: boolean;
  availableNow: boolean;
  owner: Owner;
  description: string;
  highlights: string[];
  includedItems: string[];
  reviews: Review[];
  featured?: boolean;
}

export interface Campus {
  id: string;
  name: string;
  shortName: string;
  city: string;
  studentCount: string;
}

export interface FilterState {
  searchQuery: string;
  category: ItemCategory | 'All';
  campus: string;
  duration: 'Daily' | 'Weekend' | 'Weekly' | 'All';
  maxPrice: number;
  condition: ItemCondition | 'All';
  sortBy: 'popular' | 'price-low' | 'price-high' | 'rating';
  availableOnly: boolean;
}

export type OrderStatus = 
  | 'REQUESTED'
  | 'ACCEPTED'
  | 'PAID'
  | 'READY_FOR_PICKUP'
  | 'ACTIVE_RENTAL'
  | 'RETURNED';

export interface PaymentDetails {
  method: 'UPI_QR' | 'CARD' | 'NET_BANKING';
  transactionId: string;
  timestamp: string;
  rentalFee: number;
  platformFee: number;
  securityDeposit: number;
  totalPaid: number;
}

export interface RentalOrder {
  orderId: string; // e.g. CLP20240922-4587
  pickupCode: string; // e.g. #7A3F
  qrPayload: string;
  item: RentalItem;
  renterName: string;
  renterEmail: string;
  renterCampus: string;
  durationMode: 'HOURLY' | 'DAILY';
  durationValue: number;
  startDate: string;
  endDate: string;
  pickupTime: string;
  pickupLocation: string;
  status: OrderStatus;
  payment: PaymentDetails;
  videoRecorded?: boolean;
  videoTimestamp?: string;
  studentIdCardUrl?: string; // University ID Card picture
  idCardVerified?: boolean;
  rentalStartTime?: number;
  rentalEndTime?: number;
}

export type AdminServiceType = 
  | 'Photography' 
  | 'Content Writing' 
  | 'Video Editor' 
  | 'Graphic Designer';

export interface AdminService {
  id: string;
  title: AdminServiceType;
  subtitle: string;
  description: string;
  startingPrice: string;
  iconName: string;
  imageUrl: string;
  deliverables: string[];
}

export interface ServiceRequest {
  id: string;
  serviceType: AdminServiceType;
  studentName: string;
  studentEmail: string; // Must end with .ac.in
  campus: string;
  details: string;
  deadline: string;
  status: 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface AuthUser {
  email: string; // Verified .ac.in email
  verified: boolean;
  otpVerified: boolean;
}
