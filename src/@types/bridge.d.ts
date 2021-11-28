import { WINDOW_API } from '../electron/bridge';

declare global {
  interface Window {
    api: typeof WINDOW_API;
  }
}
