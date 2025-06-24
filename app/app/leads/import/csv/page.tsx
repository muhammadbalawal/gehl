"use client"

import { Suspense, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { ChevronLeft, Upload, FileText, X, CheckCircle, User, Mail, Phone, Building, MapPin, Calendar, Hash } from "lucide-react"

// Define available column types with icons
const columnTypes = [
  { value: "first_name", label: "First Name", icon: User },
  { value: "last_name", label: "Last Name", icon: User },
  { value: "email", label: "Email", icon: Mail },
  { value: "phone", label: "Phone", icon: Phone },
  { value: "business_name", label: "Business Name", icon: Building },
  { value: "location", label: "Location", icon: MapPin },
  { value: "last_interacted", label: "Last Interacted", icon: Calendar },
  { value: "ignore", label: "Ignore Column", icon: X },
]

function CSVUploadContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const campaignName = searchParams.get('campaign') || 'New Campaign'
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadComplete, setUploadComplete] = useState(false)
  const [csvColumns, setCsvColumns] = useState<string[]>([])
  const [columnMappings, setColumnMappings] = useState<Record<string, string>>({})
  const [csvPreview, setCsvPreview] = useState<Record<string, string>>({})
  const [isImporting, setIsImporting] = useState(false)

  const parseCSVHeaders = async (file: File) => {
    return new Promise<string[]>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string
          const firstLine = text.split('\n')[0]
          const headers = firstLine.split(',').map(header => header.trim().replace(/"/g, ''))
          resolve(headers)
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  }

  const parseCSVPreview = async (file: File) => {
    return new Promise<Record<string, string>>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string
          const lines = text.split('\n')
          if (lines.length < 2) {
            resolve({})
            return
          }
          
          const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''))
          const firstDataRow = lines[1].split(',').map(cell => cell.trim().replace(/"/g, ''))
          
          const preview: Record<string, string> = {}
          headers.forEach((header, index) => {
            preview[header] = firstDataRow[index] || ''
          })
          
          resolve(preview)
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  }

  const simulateUpload = async (file: File) => {
    setIsUploading(true)
    setUploadProgress(0)
    setUploadComplete(false)

    // Parse CSV headers and preview data
    try {
      const [headers, preview] = await Promise.all([
        parseCSVHeaders(file),
        parseCSVPreview(file)
      ])
      
      setCsvColumns(headers)
      setCsvPreview(preview)
      
      // Initialize column mappings
      const initialMappings: Record<string, string> = {}
      headers.forEach(header => {
        // Try to auto-detect common column types
        const lowerHeader = header.toLowerCase()
        if (lowerHeader.includes('first') && lowerHeader.includes('name')) {
          initialMappings[header] = 'first_name'
        } else if (lowerHeader.includes('last') && lowerHeader.includes('name')) {
          initialMappings[header] = 'last_name'
        } else if (lowerHeader.includes('email')) {
          initialMappings[header] = 'email'
        } else if (lowerHeader.includes('phone')) {
          initialMappings[header] = 'phone'
        } else if (lowerHeader.includes('business') || lowerHeader.includes('company')) {
          initialMappings[header] = 'business_name'
        } else if (lowerHeader.includes('location') || lowerHeader.includes('address')) {
          initialMappings[header] = 'location'
        } else {
          initialMappings[header] = '' // No default selection
        }
      })
      setColumnMappings(initialMappings)
    } catch (error) {
      console.error('Failed to parse CSV:', error)
    }

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          setUploadComplete(true)
          return 100
        }
        return prev + Math.random() * 15 + 5 // Random progress increment
      })
    }, 200)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type === "text/csv" || file.name.endsWith('.csv')) {
        setUploadedFile(file)
        simulateUpload(file)
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.type === "text/csv" || file.name.endsWith('.csv')) {
        setUploadedFile(file)
        simulateUpload(file)
      }
    }
  }

  const removeFile = () => {
    setUploadedFile(null)
    setIsUploading(false)
    setUploadProgress(0)
    setUploadComplete(false)
  }

  const triggerFileSelect = () => {
    const fileInput = document.getElementById('csv-upload') as HTMLInputElement
    if (fileInput) {
      fileInput.click()
    }
  }

  const updateColumnMapping = (columnName: string, type: string) => {
    setColumnMappings(prev => ({
      ...prev,
      [columnName]: type
    }))
  }

  const handleImport = async () => {
    setIsImporting(true)
    
    // Simulate import process
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Redirect to leads page
    router.push('/app/leads')
  }

  return <>
      <SiteHeader title="Import Leads"/>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4">
              
              {/* Back button and campaign info */}
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/app/leads/import/method">
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Choose another method
                  </Link>
                </Button>
                <div className="text-sm text-muted-foreground">
                  Campaign: <span className="font-medium text-foreground">{campaignName}</span>
                </div>
              </div>

              {/* Page title */}
              <div className="space-y-2">
                <h1 className="text-2xl font-semibold">Upload CSV File</h1>
                <p className="text-muted-foreground">
                  Upload a CSV file containing your leads for "{campaignName}"
                </p>
              </div>

              {/* Upload area */}
              <div className="flex flex-1 items-center justify-center min-h-[40vh]">
                <div className="w-full max-w-4xl">
                  {!uploadedFile ? (
                    <Card 
                      className={`border-2 border-dashed transition-colors ${
                        dragActive 
                          ? 'border-primary bg-primary/5' 
                          : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <CardContent className="p-10 text-center">
                        <div className="space-y-6">
                          <div className="mx-auto w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                            <Upload className="h-10 w-10 text-muted-foreground" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-xl font-medium">Click to upload</h3>
                            <p className="text-muted-foreground">
                              or drag and drop your CSV file here
                            </p>
                          </div>
                          <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="csv-upload"
                          />
                          <Button size="lg" onClick={triggerFileSelect}>
                            Select CSV File
                          </Button>
                          <p className="text-sm text-muted-foreground pt-2">
                            Only CSV files are supported
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      <Card 
                        className="border-2 border-dashed border-muted-foreground/25 relative"
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={removeFile}
                          disabled={isUploading}
                          className="absolute top-4 right-4 z-10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <CardContent className="p-10 text-center">
                          <div className="space-y-6">
                            <div className="mx-auto w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                              <Upload className="h-10 w-10 text-muted-foreground" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">
                                {(uploadedFile.size / 1024).toFixed(1)} KB
                              </p>
                              <h3 className="text-xl font-semibold">{uploadedFile.name}</h3>
                            </div>
                            
                            {isUploading && (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">Uploading...</span>
                                  <span className="text-muted-foreground">{Math.round(uploadProgress)}%</span>
                                </div>
                                <Progress value={uploadProgress} className="h-3 w-full" />
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                      
                      {uploadComplete && (
                        <div className="text-center">
                          <p className="text-sm text-green-600 flex items-center justify-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            File processed successfully!
                          </p>
                        </div>
                      )}

                      {uploadComplete && csvColumns.length > 0 && (
                        <div className="space-y-1">
                          <Card>
                            <CardContent className="p-6">
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <h3 className="text-lg font-semibold">Map Your Columns</h3>
                                  <p className="text-sm text-muted-foreground">
                                    Select the type for each column from your CSV file
                                  </p>
                                </div>
                                
                                <div className="space-y-3">
                                  <div className="grid grid-cols-3 gap-4 text-sm font-medium text-muted-foreground pb-2 border-b">
                                    <div>Column Name</div>
                                    <div>Select Type</div>
                                    <div>Preview</div>
                                  </div>
                                  {csvColumns.map((column, index) => (
                                    <div key={index} className="grid grid-cols-3 gap-4 items-center">
                                      <div>
                                        <p className="font-medium text-sm">{column}</p>
                                      </div>
                                      <div>
                                        <Select
                                          value={columnMappings[column] || ""}
                                          onValueChange={(value) => updateColumnMapping(column, value)}
                                        >
                                          <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select Type" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {columnTypes.map((type) => {
                                              const IconComponent = type.icon
                                              return (
                                                <SelectItem key={type.value} value={type.value}>
                                                  <div className="flex items-center gap-2">
                                                    <IconComponent className="h-4 w-4" />
                                                    {type.label}
                                                  </div>
                                                </SelectItem>
                                              )
                                            })}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground truncate">
                                          {csvPreview[column] || 'No data'}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          
                                                      <div className="flex justify-center pt-4">
                              <Button 
                                size="lg" 
                                onClick={handleImport}
                                disabled={isImporting}
                              >
                                {isImporting ? 'Importing...' : 'Import Leads'}
                              </Button>
                            </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
  </>
}

export default function CSVUploadPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CSVUploadContent />
    </Suspense>
  )
} 