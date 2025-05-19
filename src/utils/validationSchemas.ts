import { z } from 'zod';

// Kayıt formu validasyon şeması
export const registerSchema = z.object({
  displayName: z
    .string()
    .min(1, { message: 'Ad Soyad gereklidir' }),
  email: z
    .string()
    .min(1, { message: 'E-posta adresi gereklidir' })
    .email({ message: 'Geçerli bir e-posta adresi girin' }),
  password: z
    .string()
    .min(1, { message: 'Şifre gereklidir' })
    .min(6, { message: 'Şifre en az 6 karakter olmalıdır' }),
  confirmPassword: z
    .string()
    .min(1, { message: 'Şifre onayı gereklidir' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword'],
});

// Giriş formu validasyon şeması
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'E-posta adresi gereklidir' })
    .email({ message: 'Geçerli bir e-posta adresi girin' }),
  password: z
    .string()
    .min(1, { message: 'Şifre gereklidir' }),
});

// Tip tanımlamaları
export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>; 