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
import { supabase } from "@/lib/supabaseClient"

// Define available column types with icons
const columnTypes = [
  { value: "name", label: "Name", icon: User },
  { value: "location", label: "Location", icon: MapPin },
  { value: "gmb_link", label: "Google My Business Link", icon: Building },
  { value: "email", label: "Email", icon: Mail },
  { value: "phone_number", label: "Phone Number", icon: Phone },
  { value: "website", label: "Website", icon: Building },
  { value: "latitude", label: "Latitude", icon: Hash },
  { value: "longitude", label: "Longitude", icon: Hash },
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

  // Proper CSV parsing function that handles quotes and commas
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    let i = 0

    while (i < line.length) {
      const char = line[i]
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"'
          i += 2
        } else {
          // Toggle quote state
          inQuotes = !inQuotes
          i++
        }
      } else if (char === ',' && !inQuotes) {
        // Field separator
        result.push(current.trim())
        current = ''
        i++
      } else {
        current += char
        i++
      }
    }
    
    // Add the last field
    result.push(current.trim())
    return result
  }

  const parseCSVHeaders = async (file: File) => {
    return new Promise<string[]>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string
          const firstLine = text.split('\n')[0]
          const headers = parseCSVLine(firstLine)
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
          const lines = text.split('\n').filter(line => line.trim())
          if (lines.length < 2) {
            resolve({})
            return
          }
          
          const headers = parseCSVLine(lines[0])
          const firstDataRow = parseCSVLine(lines[1])
          
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

  const parseCSVData = async (file: File) => {
    return new Promise<Record<string, string>[]>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string
          const lines = text.split('\n').filter(line => line.trim()) // Remove empty lines
          if (lines.length < 2) {
            resolve([])
            return
          }
          
          const headers = parseCSVLine(lines[0])
          const dataRows = lines.slice(1).map(line => parseCSVLine(line))
          
          const data = dataRows.map(row => {
            const rowData: Record<string, string> = {}
            headers.forEach((header, index) => {
              rowData[header] = row[index] || ''
            })
            return rowData
          })
          
          resolve(data)
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
      
      // Initialize column mappings with conflict prevention
      const initialMappings: Record<string, string> = {}
      const usedTypes = new Set<string>()
      
      headers.forEach(header => {
        // Try to auto-detect common column types, but prevent conflicts
        const lowerHeader = header.toLowerCase()
        let detectedType = ''
        
        if (lowerHeader.includes('name') && !lowerHeader.includes('business') && !lowerHeader.includes('company') && !usedTypes.has('name')) {
          detectedType = 'name'
        } else if (lowerHeader.includes('email') && !usedTypes.has('email')) {
          detectedType = 'email'
        } else if (lowerHeader.includes('phone') && !usedTypes.has('phone_number')) {
          detectedType = 'phone_number'
        } else if ((lowerHeader.includes('location') || lowerHeader.includes('address') || lowerHeader.includes('city')) && !usedTypes.has('location')) {
          detectedType = 'location'
        } else if ((lowerHeader.includes('website') || lowerHeader.includes('url') || lowerHeader.includes('site')) && !usedTypes.has('website')) {
          detectedType = 'website'
        } else if ((lowerHeader.includes('gmb') || lowerHeader.includes('google') || lowerHeader.includes('business')) && !usedTypes.has('gmb_link')) {
          detectedType = 'gmb_link'
        } else if (lowerHeader.includes('lat') && !lowerHeader.includes('long') && !usedTypes.has('latitude')) {
          detectedType = 'latitude'
        } else if ((lowerHeader.includes('lng') || lowerHeader.includes('long')) && !usedTypes.has('longitude')) {
          detectedType = 'longitude'
        }
        
        if (detectedType) {
          usedTypes.add(detectedType)
          initialMappings[header] = detectedType
        } else {
          initialMappings[header] = '' // Empty default
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
      [columnName]: type === 'clear' ? '' : type
    }))
  }

  // Get available column types for a specific column
  const getAvailableTypes = (currentColumnName: string) => {
    const usedTypes = new Set(
      Object.entries(columnMappings)
        .filter(([colName, type]) => colName !== currentColumnName && type !== '')
        .map(([, type]) => type)
    )
    
    return columnTypes.filter(type => !usedTypes.has(type.value))
  }

  const handleImport = async () => {
    setIsImporting(true)
    
    try {
      if (!uploadedFile) {
        throw new Error('No file uploaded')
      }

      // Get campaign ID from URL parameters
      const campaignId = searchParams.get('campaignId')
      if (!campaignId) {
        throw new Error('Campaign ID not found')
      }

      // Parse CSV file to get all rows
      const csvData = await parseCSVData(uploadedFile)
      
      // Map CSV data to lead objects based on column mappings
      const leads = csvData.map(row => {
        const lead: any = {}
        Object.entries(columnMappings).forEach(([csvColumn, mappedType]) => {
          if (mappedType && mappedType !== '') {
            lead[mappedType] = row[csvColumn] || null
          }
        })
        return lead
      })

      // Filter out leads that have no useful data
      const validLeads = leads.filter(lead => 
        lead.name || lead.email || lead.phone_number || lead.location
      )

      if (validLeads.length === 0) {
        throw new Error('No valid leads found in CSV')
      }

      // Get the authenticated user
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user?.id) {
        throw new Error('You must be logged in to import leads')
      }
      const user_id = session.user.id

      // Send leads to API
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leads: validLeads,
          campaign_id: parseInt(campaignId),
          user_id: user_id
        }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to import leads')
      }

      // Redirect to leads page with success message
      router.push('/app/leads?imported=true')
    } catch (err) {
      console.error('Error importing leads:', err)
      // You might want to show an error message to the user here
      alert(err instanceof Error ? err.message : 'Failed to import leads')
    } finally {
      setIsImporting(false)
    }
  }

  return <>
      <SiteHeader title="Import Leads"/>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4">
              
              {/* Back button and campaign info */}
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/app/leads/import/method?campaign=${encodeURIComponent(campaignName)}&campaignId=${searchParams.get('campaignId') || ''}`}>
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
                                    Select the type for each column from your CSV file. Each type can only be used once.
                                  </p>
                                  <div className="text-xs text-muted-foreground">
                                    {Object.values(columnMappings).filter(type => type && type !== '').length} of {columnTypes.length} field types mapped
                                  </div>
                                </div>
                                
                                <div className="space-y-3">
                                  <div className="grid grid-cols-3 gap-4 text-sm font-medium text-muted-foreground pb-2 border-b">
                                    <div>Column Name</div>
                                    <div>Select Type</div>
                                    <div>Preview</div>
                                  </div>
                                  {csvColumns.map((column, index) => {
                                    const isMapped = columnMappings[column] && columnMappings[column] !== ''
                                    const mappingType = columnMappings[column]
                                    return (
                                    <div key={index} className="grid grid-cols-3 gap-4 items-center">
                                      <div>
                                        <p className="font-medium text-sm flex items-center gap-2">
                                          {column}
                                          {isMapped && (
                                            <span className="inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                                          )}
                                        </p>
                                      </div>
                                      <div>
                                        <Select
                                          value={columnMappings[column] || ""}
                                          onValueChange={(value) => updateColumnMapping(column, value)}
                                        >
                                          <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Not selected" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="clear">
                                              <div className="flex items-center gap-2">
                                                <X className="h-4 w-4" />
                                                <span className="text-muted-foreground italic">Clear Selection</span>
                                              </div>
                                            </SelectItem>
                                            {getAvailableTypes(column).map((type) => {
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
                                  )})}
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