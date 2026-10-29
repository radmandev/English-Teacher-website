export function PageIntro({ title, text }: { title: string; text?: string }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-l from-navy via-violet to-pink text-white">
      <Blobs />
      <div className="container-x relative py-12 md:py-16">
        <h1 className="text-3xl font-bold text-white md:text-5xl">{title}</h1>
        {text && <p className="mt-4 max-w-2xl text-lg leading-8 text-white/85">{text}</p>}
      </div>
    </section>
  );
}

/** Soft floating color shapes for gradient bands. */
export function Blobs() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <span className="floaty absolute -end-16 -top-20 size-64 rounded-full bg-orange/40 blur-2xl" />
      <span className="floaty absolute -bottom-24 start-1/4 size-72 rounded-full bg-mint/30 blur-2xl [animation-delay:-3s]" />
      <span className="floaty absolute end-1/3 top-6 size-6 rotate-12 rounded-md bg-sun/80 [--r:24deg]" />
      <span className="floaty absolute bottom-8 end-10 size-4 rounded-full bg-white/70 [animation-delay:-2s]" />
      <span className="floaty absolute start-8 top-10 size-5 rounded-full border-4 border-sun/80 [animation-delay:-4s]" />
    </div>
  );
}
