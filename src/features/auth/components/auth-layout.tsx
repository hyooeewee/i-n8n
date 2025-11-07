import Image from "next/image";
import Link from "next/link";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-muted flex flex-col justify-center items-center min-w-svh gap-6 p-6 md:p-10">
      <div className="flex flex-col max-w-sm w-full gap-6">
        <Link
          className="flex item-center gap-2 self-center font-medium"
          href="/"
        >
          <Image
            src="/logos/logo.svg"
            alt="logo"
            height={32}
            width={32}
          />
          iN8N
        </Link>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
