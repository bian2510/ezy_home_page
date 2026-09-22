// API pública de la feature `toast`. El contexto en sí es interno: se consume
// siempre por `useToast`, que incluye el guard de provider.
// See docs/standards/modulos-feature.md.
export { default as ToastProvider } from './ToastProvider';
export { useToast } from './useToast';
export type { ToastContextValue } from './ToastContext';
