// OrderLayout — marco de la página del pedido: la franja de los pasos de la
// compra (el último, "Confirmación") y el contenido en el ancho del sitio.
import type { ReactNode } from 'react';
import { PURCHASE_STEP, PURCHASE_STEPS, PURCHASE_STEPS_LABEL } from '@/data/purchaseSteps';
import SectionBand from '@/components/ui/SectionBand';
import Stepper from '@/components/ui/Stepper';

export default function OrderLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col">
      <SectionBand tone="low" className="py-6">
        <Stepper
          label={PURCHASE_STEPS_LABEL}
          steps={PURCHASE_STEPS}
          current={PURCHASE_STEP.order}
        />
      </SectionBand>
      <SectionBand tone="surface" className="py-8 md:py-12">
        {children}
      </SectionBand>
    </div>
  );
}
