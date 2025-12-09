import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app_runtime/runtime/components/ui/card'
import { Button } from '@/app_runtime/runtime/components/ui/button'
import { Badge } from '@/app_runtime/runtime/components/ui/badge'

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-4">
          LeapLang UI Runtime Renderer
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Dynamic renderer that transforms JSON configurations into beautiful, interactive React applications
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          <Badge variant="secondary">Next.js 13+</Badge>
          <Badge variant="secondary">TypeScript</Badge>
          <Badge variant="secondary">Tailwind CSS</Badge>
          <Badge variant="secondary">shadcn/ui</Badge>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🚀 Quick Start
            </CardTitle>
            <CardDescription>
              Get started with our sample application to see the renderer in action
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Try our sample lime juice factory landing page built entirely from JSON configuration.
              </p>
              <Link href="/a/sample1" passHref>
                <Button className="w-full" asChild>
                  <a>View Sample App</a>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📖 How It Works
            </CardTitle>
            <CardDescription>
              Learn about the rendering process and capabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• JSON configurations define UI structure</p>
              <p>• Runtime components render dynamically</p>
              <p>• Full TypeScript support with interfaces</p>
              <p>• Extensible component library</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="mb-12">
        <CardHeader>
          <CardTitle>Features</CardTitle>
          <CardDescription>
            Powerful capabilities for dynamic UI rendering
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold mb-2">🎨 Component Library</h3>
              <p className="text-sm text-gray-600">
                Comprehensive set of pre-built components for layouts, forms, navigation, and more.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">⚡ Performance</h3>
              <p className="text-sm text-gray-600">
                Optimized rendering with React Server Components and Next.js 13+ app router.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">🔧 Extensible</h3>
              <p className="text-sm text-gray-600">
                Easy to extend with custom components and styling through TypeScript interfaces.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Ready to explore?</h2>
        <p className="text-gray-600 mb-6">
          Start with our sample application or create your own JSON configuration.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/a/sample1" passHref>
            <Button size="lg" asChild>
              <a>Launch Sample App</a>
            </Button>
          </Link>
          <Button variant="outline" size="lg" disabled>
            Documentation (Coming Soon)
          </Button>
        </div>
      </div>
    </div>
  );
}
