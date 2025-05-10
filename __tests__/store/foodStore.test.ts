import { renderHook, act } from '@testing-library/react-hooks';
import { useFoodStore } from '../../src/store/foodStore';

// AsyncStorage'ı mock ediyoruz
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Tarih için sabit bir değer kullanmak test sonuçlarını tutarlı hale getirir
const TEST_DATE = '2024-05-08T12:00:00.000Z';

describe('Food Store', () => {
  beforeEach(async () => {
    // Store'u sıfırla
    const { result, waitForNextUpdate } = renderHook(() => useFoodStore());
    act(() => {
      result.current.reset();
    });
    // AsyncStorage asenkron olduğu için bekle
    await waitForNextUpdate();
  });
  
  it('should add a food item', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useFoodStore());
    
    // Önce loadFoods'u çağır ve sonuçların yüklenmesini bekle
    act(() => {
      result.current.loadFoods();
    });
    await waitForNextUpdate();
    
    const foodItem = { 
      id: '1', 
      name: 'Elma', 
      calories: 95, 
      protein: 0.5, 
      carbs: 25, 
      fat: 0.3, 
      date: TEST_DATE 
    };
    
    await act(async () => {
      await result.current.addFood(foodItem);
    });
    
    expect(result.current.foods.length).toBe(1);
    expect(result.current.foods[0]).toEqual(foodItem);
  });
  
  it('should remove a food item', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useFoodStore());
    
    // Önce loadFoods'u çağır ve sonuçların yüklenmesini bekle
    act(() => {
      result.current.loadFoods();
    });
    await waitForNextUpdate();
    
    const foodItem = { 
      id: '1', 
      name: 'Elma', 
      calories: 95, 
      protein: 0.5, 
      carbs: 25, 
      fat: 0.3, 
      date: TEST_DATE 
    };
    
    await act(async () => {
      await result.current.addFood(foodItem);
    });
    
    expect(result.current.foods.length).toBe(1);
    
    await act(async () => {
      await result.current.removeFood('1');
    });
    
    expect(result.current.foods.length).toBe(0);
  });
  
  it('should update a food item', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useFoodStore());
    
    // Önce loadFoods'u çağır ve sonuçların yüklenmesini bekle
    act(() => {
      result.current.loadFoods();
    });
    await waitForNextUpdate();
    
    const foodItem = { 
      id: '1', 
      name: 'Elma', 
      calories: 95, 
      protein: 0.5, 
      carbs: 25, 
      fat: 0.3, 
      date: TEST_DATE 
    };
    
    await act(async () => {
      await result.current.addFood(foodItem);
    });
    
    const updatedFoodItem = {
      ...foodItem,
      name: 'Kırmızı Elma',
      calories: 100
    };
    
    await act(async () => {
      await result.current.updateFood(updatedFoodItem);
    });
    
    expect(result.current.foods.length).toBe(1);
    expect(result.current.foods[0].name).toBe('Kırmızı Elma');
    expect(result.current.foods[0].calories).toBe(100);
  });
  
  it('should calculate daily calories and nutrients', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useFoodStore());
    
    // Önce loadFoods'u çağır ve sonuçların yüklenmesini bekle
    act(() => {
      result.current.loadFoods();
    });
    await waitForNextUpdate();
    
    const todayFood1 = { 
      id: '1', 
      name: 'Elma', 
      calories: 95, 
      protein: 0.5, 
      carbs: 25, 
      fat: 0.3, 
      date: TEST_DATE 
    };
    
    const todayFood2 = { 
      id: '2', 
      name: 'Yoğurt', 
      calories: 150, 
      protein: 8, 
      carbs: 12, 
      fat: 8, 
      date: TEST_DATE 
    };
    
    await act(async () => {
      await result.current.addFood(todayFood1);
      await result.current.addFood(todayFood2);
    });
    
    // Günlük özetleri kontrol et
    expect(result.current.calculateDailyCalories(TEST_DATE)).toBe(245);
    
    const dailyNutrients = result.current.calculateDailyNutrients(TEST_DATE);
    expect(dailyNutrients.protein).toBe(8.5);
    expect(dailyNutrients.carbs).toBe(37);
    expect(dailyNutrients.fat).toBe(8.3);
  });
}); 