import { inject } from 'vue';

type OpenAiLoginDialog = () => void;

export function useAiLoginGuard() {
  const openAiLoginDialog = inject<OpenAiLoginDialog>('openAiLoginDialog');

  const ensureLogin = () => {
    const token = localStorage.getItem('token');
    if (token) {
      return true;
    }
    openAiLoginDialog?.();
    return false;
  };

  return {
    ensureLogin,
  };
}