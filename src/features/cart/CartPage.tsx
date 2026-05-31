import CartContents from './CartContents';

export default function CartPage() {
  return (
    <section className="mx-auto w-full max-w-content px-4 py-8 sm:py-12">
      <h1 className="mb-6 text-2xl font-semibold text-foreground sm:text-3xl">Mi Carrito</h1>
      <CartContents />
    </section>
  );
}
