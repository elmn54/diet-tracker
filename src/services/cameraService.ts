import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';

/**
 * Requests camera permission from the user
 * @returns {Promise<boolean>} Whether permission was granted
 */
export const getCameraPermission = async (): Promise<boolean> => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === 'granted';
};

/**
 * Requests media library permission from the user
 * @returns {Promise<boolean>} Whether permission was granted
 */
export const getMediaLibraryPermission = async (): Promise<boolean> => {
  const { status } = await MediaLibrary.requestPermissionsAsync();
  return status === 'granted';
};

/**
 * Takes a picture using the device's camera
 * @returns {Promise<string | null>} The URI of the captured image or null if cancelled
 */
export const takePicture = async (): Promise<string | null> => {
  const hasPermission = await getCameraPermission();
  if (!hasPermission) {
    return null;
  }

  try {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0].uri;
    }
    return null;
  } catch (error) {
    console.error('Error taking picture:', error);
    return null;
  }
};

/**
 * Picks an image from the device's media library
 * @returns {Promise<string | null>} The URI of the selected image or null if cancelled
 */
export const pickImage = async (): Promise<string | null> => {
  const hasPermission = await getMediaLibraryPermission();
  if (!hasPermission) {
    return null;
  }

  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0].uri;
    }
    return null;
  } catch (error) {
    console.error('Error picking image:', error);
    return null;
  }
};

/**
 * Converts an image URI to a base64 encoded string
 * @param {string} uri The URI of the image
 * @returns {Promise<string | null>} The base64 encoded image or null on error
 */
export const imageToBase64 = async (uri: string): Promise<string | null> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        // Extract the base64 part after the data URL prefix
        const base64 = base64String.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    return null;
  }
}; 