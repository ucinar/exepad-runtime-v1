import Image from 'next/image'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <Link href="https://exepad.com" target="_blank" rel="noopener noreferrer">
          <Image
            src="/images/logo.svg"
            alt="Exepad"
            width={350}
            height={120}
            priority
            className="hover:opacity-80 transition-opacity cursor-pointer"
          />
        </Link>
      </div>
    </div>
  );
}
