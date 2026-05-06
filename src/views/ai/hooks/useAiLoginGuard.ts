import { inject } from 'vue';
import { useUserStore } from '@/stores/user';

type OpenAiLoginDialog = () => void;

export function useAiLoginGuard() {
  const userStore = useUserStore();
  const openAiLoginDialog = inject<OpenAiLoginDialog>('openAiLoginDialog');

  const ensureLogin = () => {
    if (userStore.isAuthenticated) {
      return true;
    }
    openAiLoginDialog?.();
    return false;
  };

  return {
    ensureLogin,
  };
}