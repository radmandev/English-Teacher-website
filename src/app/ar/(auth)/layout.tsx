import { LogoMark } from "@/components/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-x grid min-h-[70vh] place-items-center py-12">
      <div className="card w-full max-w-md p-7 md:p-9">
        <LogoMark className="mx-auto mb-5 size-12" />
        {children}
      </div>
    </div>
  );
}
