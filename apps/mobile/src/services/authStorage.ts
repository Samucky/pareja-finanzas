import * as SecureStore from 'expo-secure-store';

const ACCESS_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';

async function safeGet(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function safeSet(key: string, value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    // En algunos dispositivos el almacén seguro falla; la app sigue sin persistir token.
  }
}

async function safeDelete(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    // ignore
  }
}

export async function saveTokens(access: string, refresh: string): Promise<void> {
  await safeSet(ACCESS_KEY, access);
  await safeSet(REFRESH_KEY, refresh);
}

export async function getAccessToken(): Promise<string | null> {
  return safeGet(ACCESS_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return safeGet(REFRESH_KEY);
}

export async function clearTokens(): Promise<void> {
  await safeDelete(ACCESS_KEY);
  await safeDelete(REFRESH_KEY);
}
