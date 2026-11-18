// SmartHomeTip — consejo para ir preparando el hogar inteligente. Sin botón de
// "Ver guía rápida": las guías se están escribiendo (usuario, 2026-11-03).
import Icon from '@/components/ui/Icon';

export default function SmartHomeTip() {
  return (
    <div className="flex w-full items-start gap-4 rounded-xl bg-surface-container-low p-4 text-left md:p-6">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-container-lowest text-primary shadow-sm">
        <Icon name="lightBulb" />
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-label-lg font-bold text-on-surface">
          ¿Querés ir preparando tu hogar inteligente?
        </p>
        <p className="text-body-sm text-on-surface-variant">
          Descargá la app Smart Life o Tuya Smart para vincular tus dispositivos. Compatible con
          Google Assistant y Amazon Alexa.
        </p>
      </div>
    </div>
  );
}
