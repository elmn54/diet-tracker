import { create } from 'zustand';
import { ToastType } from '../components/Toast';
import { AlertType } from '../components/CustomAlert';

interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
  duration: number;
}

interface AlertButton {
  text: string;
  onPress: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertState {
  visible: boolean;
  title: string;
  message?: string;
  type: AlertType;
  buttons: AlertButton[];
}

interface UIStore {
  // Toast state
  toast: ToastState;
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  hideToast: () => void;
  
  // Alert state
  alert: AlertState;
  showAlert: (
    title: string, 
    message?: string, 
    type?: AlertType, 
    buttons?: AlertButton[]
  ) => void;
  hideAlert: () => void;
}

// Toast varsayılan değerleri
const defaultToast: ToastState = {
  visible: false,
  message: '',
  type: 'success',
  duration: 3000,
};

// Alert varsayılan değerleri
const defaultAlert: AlertState = {
  visible: false,
  title: '',
  message: '',
  type: 'info',
  buttons: [{ text: 'Tamam', onPress: () => {}, style: 'default' }],
};

// UI Store
export const useUIStore = create<UIStore>((set) => ({
  // Toast state ve metotları
  toast: defaultToast,
  
  showToast: (message: string, type: ToastType = 'success', duration: number = 3000) => 
    set({ toast: { visible: true, message, type, duration } }),
  
  hideToast: () => 
    set({ toast: { ...defaultToast, visible: false } }),
  
  // Alert state ve metotları
  alert: defaultAlert,
  
  showAlert: (
    title: string, 
    message?: string, 
    type: AlertType = 'info', 
    buttons: AlertButton[] = [{ text: 'Tamam', onPress: () => {}, style: 'default' }]
  ) => 
    set({ alert: { visible: true, title, message, type, buttons } }),
  
  hideAlert: () => 
    set({ alert: { ...defaultAlert, visible: false } }),
})); 