// Yiyecek kategorileri için emoji eşleştirmeleri
const foodCategories = [
  { 
    name: 'çikolata', 
    keywords: ['çikolata', 'çikolatalı', 'kakao', 'chocolate', 'nutella', 'brownie'], 
    emoji: '🍫'
  },
  { 
    name: 'tatlı', 
    keywords: ['tatlı', 'pasta', 'kek', 'kurabiye', 'dondurma', 'dessert', 'sweet', 'cake', 'cookie', 'ice cream', 'baklava', 'künefe'], 
    emoji: '🍰'
  },
  { 
    name: 'et', 
    keywords: ['et', 'kırmızı et', 'köfte', 'biftek', 'steak', 'burger', 'kebap', 'kıyma', 'sucuk'], 
    emoji: '🥩'
  },
  { 
    name: 'tavuk', 
    keywords: ['tavuk', 'piliç', 'chicken', 'nugget', 'popcorn tavuk'], 
    emoji: '🍗'
  },
  { 
    name: 'balık', 
    keywords: ['balık', 'mezgit', 'levrek', 'çipura', 'hamsi', 'fish', 'seafood', 'deniz ürünü', 'karides'], 
    emoji: '🐟'
  },
  { 
    name: 'meyve', 
    keywords: ['meyve', 'elma', 'armut', 'muz', 'çilek', 'portakal', 'fruit', 'apple', 'banana', 'strawberry'], 
    emoji: '🍎'
  },
  { 
    name: 'sebze', 
    keywords: ['sebze', 'domates', 'salatalık', 'biber', 'vegetable', 'tomato', 'salad', 'salata'], 
    emoji: '🥗'
  },
  { 
    name: 'ekmek', 
    keywords: ['ekmek', 'bread', 'pasta', 'sandwich', 'sandviç', 'hamburger', 'tost', 'toast'], 
    emoji: '🍞'
  },
  { 
    name: 'süt ürünü', 
    keywords: ['süt', 'peynir', 'yoğurt', 'milk', 'cheese', 'yogurt', 'ayran'], 
    emoji: '🥛'
  },
  { 
    name: 'pizza', 
    keywords: ['pizza', 'lahmacun', 'pide'], 
    emoji: '🍕'
  },
  { 
    name: 'makarna', 
    keywords: ['makarna', 'spagetti', 'pasta', 'noodle', 'erişte'], 
    emoji: '🍝'
  },
  { 
    name: 'kahvaltı', 
    keywords: ['kahvaltı', 'breakfast', 'yumurta', 'egg', 'omlet'], 
    emoji: '🍳'
  },
  { 
    name: 'içecek', 
    keywords: ['içecek', 'su', 'çay', 'kahve', 'drink', 'beverage', 'coffee', 'tea', 'water', 'kola', 'soda'], 
    emoji: '🥤'
  },
  { 
    name: 'alkol', 
    keywords: ['alkol', 'bira', 'şarap', 'rakı', 'viski', 'vodka', 'alcohol', 'beer', 'wine'], 
    emoji: '🍷'
  },
  { 
    name: 'fast food', 
    keywords: ['fast food', 'hamburger', 'burger', 'patates kızartması', 'fries'], 
    emoji: '🍔'
  },
];

// Varsayılan emoji
const DEFAULT_FOOD_EMOJI = '🍽️';

/**
 * Yiyecek isminden uygun emojiyi belirler
 * @param foodName Yiyecek adı
 * @returns Uygun emoji
 */
export const getFoodEmoji = (foodName: string): string => {
  if (!foodName) return DEFAULT_FOOD_EMOJI;
  
  const lowercaseFoodName = foodName.toLowerCase();
  
  for (const category of foodCategories) {
    if (category.keywords.some(keyword => lowercaseFoodName.includes(keyword))) {
      return category.emoji;
    }
  }
  
  return DEFAULT_FOOD_EMOJI;
};

/**
 * Yiyecek nesnelerinden uygun emojiyi belirler
 * @param food Yiyecek nesnesi
 * @returns Uygun emoji
 */
export const getFoodEmojiFromItem = (food: any): string => {
  if (!food || !food.name) return DEFAULT_FOOD_EMOJI;
  return getFoodEmoji(food.name);
}; 