import { storage, setItem, getItem, removeItem } from '../../src/storage/mmkvStorage';

// MMKV'yi mock'lamak için
jest.mock('react-native-mmkv', () => {
  const mockStorage = {
    set: jest.fn(),
    getString: jest.fn(),
    delete: jest.fn(),
  };
  return { MMKV: jest.fn(() => mockStorage) };
});

describe('Storage utils', () => {
  const mockMMKV = storage as jest.Mocked<any>;
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should set a string item', () => {
    setItem('testKey', 'testValue');
    expect(mockMMKV.set).toHaveBeenCalledWith('testKey', JSON.stringify('testValue'));
  });
  
  it('should set an object item', () => {
    const testObject = { name: 'Test', value: 123 };
    setItem('testKey', testObject);
    expect(mockMMKV.set).toHaveBeenCalledWith('testKey', JSON.stringify(testObject));
  });
  
  it('should get an item', () => {
    mockMMKV.getString.mockReturnValueOnce(JSON.stringify('testValue'));
    const result = getItem('testKey');
    expect(result).toBe('testValue');
    expect(mockMMKV.getString).toHaveBeenCalledWith('testKey');
  });
  
  it('should return default value when item not found', () => {
    mockMMKV.getString.mockReturnValueOnce(undefined);
    const result = getItem('nonExistentKey', 'defaultValue');
    expect(result).toBe('defaultValue');
  });
  
  it('should return null when item not found and no default value', () => {
    mockMMKV.getString.mockReturnValueOnce(undefined);
    const result = getItem('nonExistentKey');
    expect(result).toBeNull();
  });
  
  it('should remove an item', () => {
    removeItem('testKey');
    expect(mockMMKV.delete).toHaveBeenCalledWith('testKey');
  });
}); 