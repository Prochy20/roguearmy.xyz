"use client"

import {
  CircleCheck,
  Info,
  LoaderCircle,
  OctagonX,
  TriangleAlert,
} from "lucide-react"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      icons={{
        success: <CircleCheck className="h-4 w-4 text-rga-cyan" />,
        info: <Info className="h-4 w-4 text-rga-cyan" />,
        warning: <TriangleAlert className="h-4 w-4 text-rga-orange" />,
        error: <OctagonX className="h-4 w-4 text-rga-red" />,
        loading: <LoaderCircle className="h-4 w-4 animate-spin text-rga-cyan" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast bg-void/95 backdrop-blur-md border border-rga-cyan/20 text-rga-gray shadow-lg shadow-rga-cyan/5",
          description: "text-rga-gray/60",
          actionButton:
            "bg-rga-cyan text-void font-medium",
          cancelButton:
            "bg-rga-gray/20 text-rga-gray",
          success: "border-rga-cyan/30",
          error: "border-rga-red/30",
          warning: "border-rga-orange/30",
          info: "border-rga-cyan/30",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
