import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import CircularProgress from '../components/ui/CircularProgress';

const ComponentShowcase = () => {
  const [progress, setProgress] = useState(75);

  return (
    <div className="min-h-screen bg-gradient-to-br from-calm-50 via-white to-focus-50 dark:from-calm-900 dark:via-calm-800 dark:to-focus-900 p-8">
      <div className="container mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold font-display text-gradient">
            🎨 FOCUSLOOM Design System
          </h1>
          <p className="text-lg text-calm-600 dark:text-calm-400 max-w-2xl mx-auto">
            A showcase of our premium UI components designed for calm, distraction-free productivity
          </p>
        </div>

        {/* Color Palette */}
        <Card>
          <CardHeader>
            <CardTitle>Color Palette</CardTitle>
            <CardDescription>Our carefully crafted color system for focus and calm</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              
              {/* Focus Colors */}
              <div>
                <h4 className="font-semibold text-calm-900 dark:text-calm-100 mb-3">Focus Blue</h4>
                <div className="space-y-2">
                  {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(shade => (
                    <div key={shade} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg bg-focus-${shade} border border-calm-200`}></div>
                      <span className="text-sm text-calm-600 dark:text-calm-400">focus-{shade}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calm Colors */}
              <div>
                <h4 className="font-semibold text-calm-900 dark:text-calm-100 mb-3">Calm Gray</h4>
                <div className="space-y-2">
                  {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(shade => (
                    <div key={shade} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg bg-calm-${shade} border border-calm-200`}></div>
                      <span className="text-sm text-calm-600 dark:text-calm-400">calm-{shade}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Colors */}
              <div>
                <h4 className="font-semibold text-calm-900 dark:text-calm-100 mb-3">Status Colors</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-500 border border-calm-200"></div>
                    <span className="text-sm text-calm-600 dark:text-calm-400">Success</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-yellow-500 border border-calm-200"></div>
                    <span className="text-sm text-calm-600 dark:text-calm-400">Warning</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-500 border border-calm-200"></div>
                    <span className="text-sm text-calm-600 dark:text-calm-400">Danger</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500 border border-calm-200"></div>
                    <span className="text-sm text-calm-600 dark:text-calm-400">Purple</span>
                  </div>
                </div>
              </div>

              {/* Gradients */}
              <div>
                <h4 className="font-semibold text-calm-900 dark:text-calm-100 mb-3">Gradients</h4>
                <div className="space-y-2">
                  <div className="w-full h-8 rounded-lg focus-gradient"></div>
                  <span className="text-sm text-calm-600 dark:text-calm-400">Focus Gradient</span>
                  <div className="w-full h-8 rounded-lg calm-gradient"></div>
                  <span className="text-sm text-calm-600 dark:text-calm-400">Calm Gradient</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Button Components</CardTitle>
            <CardDescription>Various button styles and sizes for different use cases</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              
              {/* Button Variants */}
              <div>
                <h4 className="font-semibold text-calm-900 dark:text-calm-100 mb-4">Variants</h4>
                <div className="flex flex-wrap gap-4">
                  <Button variant="default">Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                </div>
              </div>

              {/* Button Sizes */}
              <div>
                <h4 className="font-semibold text-calm-900 dark:text-calm-100 mb-4">Sizes</h4>
                <div className="flex flex-wrap items-center gap-4">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                  <Button size="icon">🎯</Button>
                </div>
              </div>

              {/* Button States */}
              <div>
                <h4 className="font-semibold text-calm-900 dark:text-calm-100 mb-4">States</h4>
                <div className="flex flex-wrap gap-4">
                  <Button>Normal</Button>
                  <Button disabled>Disabled</Button>
                  <Button className="animate-pulse">Loading</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Indicators */}
        <Card>
          <CardHeader>
            <CardTitle>Progress Indicators</CardTitle>
            <CardDescription>Circular progress components for focus scores and metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              
              <div>
                <CircularProgress value={progress} size={120} color="focus">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-focus-600">{progress}</div>
                    <div className="text-xs text-calm-500">Focus</div>
                  </div>
                </CircularProgress>
                <p className="text-sm text-calm-600 dark:text-calm-400 mt-2">Focus Score</p>
              </div>

              <div>
                <CircularProgress value={85} size={120} color="success">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">85</div>
                    <div className="text-xs text-calm-500">Success</div>
                  </div>
                </CircularProgress>
                <p className="text-sm text-calm-600 dark:text-calm-400 mt-2">Success Rate</p>
              </div>

              <div>
                <CircularProgress value={60} size={120} color="warning">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">60</div>
                    <div className="text-xs text-calm-500">Warning</div>
                  </div>
                </CircularProgress>
                <p className="text-sm text-calm-600 dark:text-calm-400 mt-2">Attention</p>
              </div>

              <div>
                <CircularProgress value={25} size={120} color="danger">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">25</div>
                    <div className="text-xs text-calm-500">Danger</div>
                  </div>
                </CircularProgress>
                <p className="text-sm text-calm-600 dark:text-calm-400 mt-2">Distractions</p>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="w-64"
              />
            </div>
          </CardContent>
        </Card>

        {/* Cards */}
        <Card>
          <CardHeader>
            <CardTitle>Card Components</CardTitle>
            <CardDescription>Glassmorphism cards with various content layouts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Basic Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>🎯</span>
                    Basic Card
                  </CardTitle>
                  <CardDescription>
                    A simple card with header and content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-calm-600 dark:text-calm-400">
                    This is the content area of the card. It can contain any type of content.
                  </p>
                </CardContent>
              </Card>

              {/* Stat Card */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-focus-100 dark:bg-focus-900 flex items-center justify-center">
                      <span className="text-xl">📊</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-calm-900 dark:text-calm-100">Stat Card</h3>
                      <p className="text-xs text-calm-500">Metric display</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-focus-600">1,234</div>
                  <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                    <span>↗</span> +12% increase
                  </p>
                </CardContent>
              </Card>

              {/* Feature Card */}
              <Card className="bg-gradient-to-br from-focus-50 to-focus-100 dark:from-focus-900/20 dark:to-focus-800/20 border-focus-200 dark:border-focus-800">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-3">✨</div>
                  <h3 className="font-semibold text-focus-900 dark:text-focus-100 mb-2">
                    Feature Card
                  </h3>
                  <p className="text-sm text-focus-700 dark:text-focus-300">
                    Highlighted card with gradient background for special content.
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Typography */}
        <Card>
          <CardHeader>
            <CardTitle>Typography</CardTitle>
            <CardDescription>Font hierarchy and text styles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              
              {/* Headings */}
              <div>
                <h4 className="font-semibold text-calm-900 dark:text-calm-100 mb-4">Headings</h4>
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold font-display text-gradient">Heading 1 - Display Font</h1>
                  <h2 className="text-3xl font-bold text-calm-900 dark:text-calm-100">Heading 2 - Bold</h2>
                  <h3 className="text-2xl font-semibold text-calm-900 dark:text-calm-100">Heading 3 - Semibold</h3>
                  <h4 className="text-xl font-medium text-calm-900 dark:text-calm-100">Heading 4 - Medium</h4>
                </div>
              </div>

              {/* Body Text */}
              <div>
                <h4 className="font-semibold text-calm-900 dark:text-calm-100 mb-4">Body Text</h4>
                <div className="space-y-2">
                  <p className="text-lg text-calm-900 dark:text-calm-100">Large body text for important content</p>
                  <p className="text-base text-calm-700 dark:text-calm-300">Regular body text for general content</p>
                  <p className="text-sm text-calm-600 dark:text-calm-400">Small text for secondary information</p>
                  <p className="text-xs text-calm-500">Extra small text for captions and labels</p>
                </div>
              </div>

              {/* Special Text */}
              <div>
                <h4 className="font-semibold text-calm-900 dark:text-calm-100 mb-4">Special Styles</h4>
                <div className="space-y-2">
                  <p className="text-gradient text-xl font-bold">Gradient Text Effect</p>
                  <p className="text-focus-600 font-semibold">Focus Brand Color</p>
                  <p className="text-green-600">Success State</p>
                  <p className="text-red-600">Error State</p>
                  <p className="text-yellow-600">Warning State</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Glassmorphism Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Glassmorphism Effects</CardTitle>
            <CardDescription>Modern glass-like UI elements with backdrop blur</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="glass p-6 rounded-2xl">
                <h4 className="font-semibold text-calm-900 dark:text-calm-100 mb-2">Glass Effect</h4>
                <p className="text-sm text-calm-600 dark:text-calm-400">
                  Subtle transparency with backdrop blur for modern UI elements.
                </p>
              </div>

              <div className="glass-card p-6">
                <h4 className="font-semibold text-calm-900 dark:text-calm-100 mb-2">Glass Card</h4>
                <p className="text-sm text-calm-600 dark:text-calm-400">
                  Enhanced glass effect with shadow for elevated content.
                </p>
              </div>

              <div className="bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 rounded-2xl p-6">
                <h4 className="font-semibold text-calm-900 dark:text-calm-100 mb-2">Custom Glass</h4>
                <p className="text-sm text-calm-600 dark:text-calm-400">
                  Custom glassmorphism implementation with manual styling.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ComponentShowcase;