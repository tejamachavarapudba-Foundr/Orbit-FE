declare module "expo-secure-store" {
  export type SecureStoreOptions = {
    keychainService?: string;
    requireAuthentication?: boolean;
    authenticationPrompt?: string;
  };

  export function getItemAsync(key: string, options?: SecureStoreOptions): Promise<string | null>;
  export function setItemAsync(key: string, value: string, options?: SecureStoreOptions): Promise<void>;
  export function deleteItemAsync(key: string, options?: SecureStoreOptions): Promise<void>;
}
