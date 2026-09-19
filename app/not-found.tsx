import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <h1 className="text-6xl font-bold text-gray-200">404</h1>
      <h2 className="mt-4 text-2xl font-semibold">Page Not Found</h2>
      <p className="mt-2 text-gray-500">The page you are looking for does not exist.</p>
      <Link href="/" className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors">
        Back to Home
      </Link>
    </main>
  )
}
