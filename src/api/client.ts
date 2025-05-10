import axios from 'axios';

// Create a default axios instance with common configuration
const client = axios.create({
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Make a GET request
 * @param url The URL to fetch from
 * @param config Optional axios config
 * @returns Promise with the response data
 */
export const get = async <T>(url: string, config?: any): Promise<T> => {
  try {
    const response = await client.get<T>(url, config);
    return response.data;
  } catch (error) {
    console.error('GET request failed:', error);
    throw error;
  }
};

/**
 * Make a POST request
 * @param url The URL to post to
 * @param data The data to send
 * @param config Optional axios config
 * @returns Promise with the response data
 */
export const post = async <T>(url: string, data?: any, config?: any): Promise<T> => {
  try {
    const response = await client.post<T>(url, data, config);
    return response.data;
  } catch (error) {
    console.error('POST request failed:', error);
    throw error;
  }
};

/**
 * Make a PUT request
 * @param url The URL to put to
 * @param data The data to send
 * @param config Optional axios config
 * @returns Promise with the response data
 */
export const put = async <T>(url: string, data?: any, config?: any): Promise<T> => {
  try {
    const response = await client.put<T>(url, data, config);
    return response.data;
  } catch (error) {
    console.error('PUT request failed:', error);
    throw error;
  }
};

/**
 * Make a DELETE request
 * @param url The URL to delete from
 * @param config Optional axios config
 * @returns Promise with the response data
 */
export const del = async <T>(url: string, config?: any): Promise<T> => {
  try {
    const response = await client.delete<T>(url, config);
    return response.data;
  } catch (error) {
    console.error('DELETE request failed:', error);
    throw error;
  }
};

export default {
  get,
  post,
  put,
  delete: del,
}; 