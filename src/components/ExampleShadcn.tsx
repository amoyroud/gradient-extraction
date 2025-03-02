import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/sonner"

const ExampleShadcn: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [gradientStyle, setGradientStyle] = useState("soft")
  
  const showToast = () => {
    toast("Gradient Generated", {
      description: "Your beautiful gradient has been created.",
      action: {
        label: "View",
        onClick: () => console.log("View gradient"),
      },
    })
  }
  
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <h2 className="text-2xl font-bold text-center mb-6">Shadcn/UI Components Demo</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Gradient Generator</CardTitle>
          <CardDescription>
            Create beautiful gradients using various parameters.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">
              Gradient Name
            </label>
            <Input placeholder="Sunset Memories" />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">
              Gradient Style
            </label>
            <Select value={gradientStyle} onValueChange={setGradientStyle}>
              <SelectTrigger>
                <SelectValue placeholder="Select a style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="soft">Soft Transition</SelectItem>
                <SelectItem value="emphasized">Emphasized</SelectItem>
                <SelectItem value="balanced">Balanced</SelectItem>
                <SelectItem value="vertical">Vertical</SelectItem>
                <SelectItem value="horizontal">Horizontal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Reset</Button>
          <Button onClick={showToast}>Generate</Button>
        </CardFooter>
      </Card>
      
      <div className="flex justify-center space-x-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Show Details</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Gradient Details</DialogTitle>
              <DialogDescription>
                View and customize your gradient settings.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="h-40 rounded-md mb-4" 
                   style={{ 
                     background: "linear-gradient(to bottom, #ff7e5f, #feb47b)" 
                   }} 
              />
              <p className="text-sm">
                This gradient uses warm colors typically found in sunset photos. You can adjust the colors and direction to achieve different effects.
              </p>
            </div>
            <DialogFooter>
              <Button onClick={() => setOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Options</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={showToast}>
              Download Gradient
            </DropdownMenuItem>
            <DropdownMenuItem>
              Copy CSS
            </DropdownMenuItem>
            <DropdownMenuItem>
              Share
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export default ExampleShadcn 