"use client"

import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { ShoppingCart, Utensils, Clock } from "lucide-react"
import { useRouter } from "next/navigation"
export default function CustomerOrderSection() {
  const router = useRouter()
  const handleStartOrder = () => {
    // Navigate to order page or trigger order flow
    router.push("/home/build")
    console.log("Starting new order...")
  }

  return (
    <Card className="border-2 border-neutral-200 shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader className="space-y-4 pb-8">
        <div className="flex items-center justify-center">
          <div className="rounded-full bg-tamu-maroon/10 p-6">
            <ShoppingCart className="h-16 w-16 text-tamu-maroon" />
          </div>
        </div>
        <div className="text-center">
          <CardTitle className="text-3xl font-bold text-neutral-900">Welcome, Customer!</CardTitle>
          <CardDescription className="mt-2 text-base text-neutral-600">
            Ready to order your favorite dishes?
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg bg-neutral-50 p-4">
            <Utensils className="h-5 w-5 text-tamu-maroon mt-0.5" />
            <div>
              <h3 className="font-semibold text-neutral-900">Fresh & Delicious</h3>
              <p className="text-sm text-neutral-600">Choose from our wide selection of Chinese cuisine</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg bg-neutral-50 p-4">
            <Clock className="h-5 w-5 text-tamu-maroon mt-0.5" />
            <div>
              <h3 className="font-semibold text-neutral-900">Quick Service</h3>
              <p className="text-sm text-neutral-600">Fast ordering and preparation for your convenience</p>
            </div>
          </div>
        </div>

        <Button
          onClick={handleStartOrder}
          size="lg"
          className="w-full bg-tamu-maroon hover:bg-tamu-maroon-dark text-white font-semibold text-lg py-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
        >
          Start Your Order
        </Button>

        <p className="text-center text-xs text-neutral-500">Tap the button above to begin ordering</p>
      </CardContent>
    </Card>
  )
}
