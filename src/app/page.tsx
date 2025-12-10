import Image from 'next/image'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8 flex justify-center">
          <Image
            src="/images/logo.svg"
            alt="Exepad"
            width={350}
            height={120}
            priority
          />
        </div>
        <Link 
          href="https://exepad.com" 
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors underline"
          target="_self"
          rel="noopener noreferrer"
        >
          Exepad Home
        </Link>
      </div>
    </div>
  );
}
