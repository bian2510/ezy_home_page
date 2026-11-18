// Dirección del envío a domicilio en `/checkout`. Provincia y código postal van
// primero: con esos dos se cotiza (ADR-007); el resto es para el envío.
import { cn } from '@/lib/cn';
import CheckoutTextField, { CHECKOUT_INPUT_CLASS, FieldMessage } from './CheckoutTextField';
import type { AddressErrors, AddressField, AddressForm } from './deliveryUtils';
import { SHIPPING_PROVINCES } from './shippingProvinces';

interface AddressFieldsProps {
  address: AddressForm;
  errors: AddressErrors;
  onChange: (field: AddressField, value: string) => void;
}

const POSTAL_CODE_HINT = 'Los 4 números, por ejemplo 1704';

export default function AddressFields({ address, errors, onChange }: AddressFieldsProps) {
  const provinceId = 'checkout-province';
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="flex flex-col gap-1">
        <label htmlFor={provinceId} className="text-label-md text-on-surface">
          Provincia
        </label>
        <select
          id={provinceId}
          autoComplete="address-level1"
          value={address.province}
          aria-invalid={errors.province !== undefined}
          aria-describedby={errors.province !== undefined ? `${provinceId}-error` : undefined}
          onChange={(event) => onChange('province', event.target.value)}
          className={cn(
            CHECKOUT_INPUT_CLASS,
            errors.province !== undefined && 'ring-2 ring-destructive',
          )}
        >
          <option value="">Elegí tu provincia</option>
          {SHIPPING_PROVINCES.map(({ code, name }) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </select>
        <FieldMessage id={provinceId} error={errors.province} />
      </div>
      <CheckoutTextField
        id="checkout-postal-code"
        label="Código postal"
        input={{ inputMode: 'numeric', autoComplete: 'postal-code' }}
        hint={POSTAL_CODE_HINT}
        value={address.postalCode}
        error={errors.postalCode}
        onChange={(value) => onChange('postalCode', value)}
      />
      <CheckoutTextField
        id="checkout-street"
        label="Calle"
        input={{ autoComplete: 'address-line1' }}
        value={address.street}
        error={errors.street}
        onChange={(value) => onChange('street', value)}
      />
      <div className="grid grid-cols-2 gap-4">
        <CheckoutTextField
          id="checkout-street-number"
          label="Altura"
          input={{ autoComplete: 'off' }}
          value={address.streetNumber}
          error={errors.streetNumber}
          onChange={(value) => onChange('streetNumber', value)}
        />
        <CheckoutTextField
          id="checkout-floor-apartment"
          label="Piso y depto (opcional)"
          input={{ autoComplete: 'address-line2' }}
          value={address.floorApartment}
          error={errors.floorApartment}
          onChange={(value) => onChange('floorApartment', value)}
        />
      </div>
      <CheckoutTextField
        id="checkout-city"
        label="Localidad"
        input={{ autoComplete: 'address-level2' }}
        value={address.city}
        error={errors.city}
        onChange={(value) => onChange('city', value)}
      />
    </div>
  );
}
