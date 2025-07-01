"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Filter, Plus, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

// Interface for lead data
interface Lead {
  id: number
  name: string | null
  location: string | null
  email: string | null
  phone_number: string | null
  website: string | null
  gmb_link: string | null
  status: string | null
  last_interacted: string | null
  created_at: string
  campaign: { name: string } | null
}

// Mock data for leads (fallback)
const mockLeadsData = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    business: "Toronto Smile Dental Clinic",
    location: "Toronto, ON",
    email: "sarah.johnson@torontosmile.ca",
    phone: "+1 (416) 555-1234",
    lastInteracted: "2024-01-15",
    status: "Hot Lead",
    campaign: "Toronto Dentists"
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    business: "North York Family Dentistry",
    location: "North York, ON",
    email: "m.chen@nyfamilydental.ca",
    phone: "+1 (416) 555-2345",
    lastInteracted: "no interactions",
    status: "New Lead",
    campaign: "Toronto Dentists"
  },
  {
    id: 3,
    name: "Dr. Emily Rodriguez",
    business: "Montreal Dental Care",
    location: "Montreal, QC",
    email: "emily.r@montrealdentalcare.ca",
    phone: "+1 (514) 555-3456",
    lastInteracted: "2024-01-13",
    status: "no status",
    campaign: "Quebec Dental List"
  },
  {
    id: 4,
    name: "Dr. David Kim",
    business: "Scarborough Orthodontics",
    location: "Scarborough, ON",
    email: "david@scarboroughortho.ca",
    phone: "+1 (416) 555-4567",
    lastInteracted: "no interactions",
    status: "no status",
    campaign: "Toronto Dentists"
  },
  {
    id: 5,
    name: "Dr. Lisa Thompson",
    business: "Westmount Dental Studio",
    location: "Westmount, QC",
    email: "lisa.thompson@westmountdental.ca",
    phone: "+1 (514) 555-5678",
    lastInteracted: "2024-01-11",
    status: "Qualified",
    campaign: "Quebec Dental List"
  },
  {
    id: 6,
    name: "Dr. James Wilson",
    business: "Etobicoke Dental Group",
    location: "Etobicoke, ON",
    email: "j.wilson@etobicokedental.ca",
    phone: "+1 (416) 555-6789",
    lastInteracted: "2024-01-10",
    status: "Hot Lead",
    campaign: "Toronto Dentists"
  },
  {
    id: 7,
    name: "Dr. Anna Martinez",
    business: "Laval Children's Dentistry",
    location: "Laval, QC",
    email: "anna.martinez@lavalchilddental.ca",
    phone: "+1 (450) 555-7890",
    lastInteracted: "no interactions",
    status: "New Lead",
    campaign: "Quebec Dental List"
  },
  {
    id: 8,
    name: "Dr. Robert Taylor",
    business: "Mississauga Modern Dental",
    location: "Mississauga, ON",
    email: "robert.taylor@mississaugamodern.ca",
    phone: "+1 (905) 555-8901",
    lastInteracted: "2024-01-08",
    status: "no status",
    campaign: "Toronto Dentists"
  },
  {
    id: 9,
    name: "Dr. Jennifer Lee",
    business: "Downtown Toronto Dental",
    location: "Toronto, ON",
    email: "jennifer.lee@downtowntoronto.ca",
    phone: "+1 (416) 555-9012",
    lastInteracted: "no interactions",
    status: "no status",
    campaign: "Toronto Dentists"
  },
  {
    id: 10,
    name: "Dr. Mark Thompson",
    business: "Longueuil Dental Clinic",
    location: "Longueuil, QC",
    email: "mark.thompson@longueuildental.ca",
    phone: "+1 (450) 555-0123",
    lastInteracted: "2024-01-07",
    status: "Cold Lead",
    campaign: "Quebec Dental List"
  },
  {
    id: 11,
    name: "Dr. Patricia Brown",
    business: "Richmond Hill Dental Centre",
    location: "Richmond Hill, ON",
    email: "patricia.brown@rhdentalcentre.ca",
    phone: "+1 (905) 555-1234",
    lastInteracted: "no interactions",
    status: "New Lead",
    campaign: "Toronto Dentists"
  },
  {
    id: 12,
    name: "Dr. Kevin Martin",
    business: "Plateau Dental Care",
    location: "Montreal, QC",
    email: "kevin.martin@plateaudental.ca",
    phone: "+1 (514) 555-2345",
    lastInteracted: "2024-01-05",
    status: "Qualified",
    campaign: "Quebec Dental List"
  },
  {
    id: 13,
    name: "Dr. Michelle Davis",
    business: "Brampton Family Dental",
    location: "Brampton, ON",
    email: "michelle.davis@bramptonfamily.ca",
    phone: "+1 (905) 555-3456",
    lastInteracted: "no interactions",
    status: "no status",
    campaign: "Toronto Dentists"
  },
  {
    id: 14,
    name: "Dr. Daniel Garcia",
    business: "Verdun Dental Solutions",
    location: "Verdun, QC",
    email: "daniel.garcia@verdundental.ca",
    phone: "+1 (514) 555-4567",
    lastInteracted: "2024-01-04",
    status: "Hot Lead",
    campaign: "Quebec Dental List"
  },
  {
    id: 15,
    name: "Dr. Amanda Wilson",
    business: "Markham Cosmetic Dentistry",
    location: "Markham, ON",
    email: "amanda.wilson@markhamcosmetic.ca",
    phone: "+1 (905) 555-5678",
    lastInteracted: "no interactions",
    status: "no status",
    campaign: "Toronto Dentists"
  },
  {
    id: 16,
    name: "Dr. Ryan O'Connor",
    business: "Saint-Laurent Dental Group",
    location: "Saint-Laurent, QC",
    email: "ryan.oconnor@sldentalgroup.ca",
    phone: "+1 (514) 555-6789",
    lastInteracted: "2024-01-02",
    status: "Qualified",
    campaign: "Quebec Dental List"
  },
  {
    id: 17,
    name: "Dr. Sophie Dubois",
    business: "Gatineau Dental Practice",
    location: "Gatineau, QC",
    email: "sophie.dubois@gatineaudental.ca",
    phone: "+1 (819) 555-7890",
    lastInteracted: "no interactions",
    status: "New Lead",
    campaign: "Quebec Dental List"
  },
  {
    id: 18,
    name: "Dr. Thomas Anderson",
    business: "Vaughan Dental Excellence",
    location: "Vaughan, ON",
    email: "thomas.anderson@vaughanexcellence.ca",
    phone: "+1 (905) 555-8901",
    lastInteracted: "2024-01-01",
    status: "no status",
    campaign: "Toronto Dentists"
  },
  {
    id: 19,
    name: "Dr. Catherine Leblanc",
    business: "Outremont Dental Clinic",
    location: "Outremont, QC",
    email: "catherine.leblanc@outremontdental.ca",
    phone: "+1 (514) 555-9012",
    lastInteracted: "no interactions",
    status: "New Lead",
    campaign: "Quebec Dental List"
  },
  {
    id: 20,
    name: "Dr. Steven Park",
    business: "Ajax Family Dentistry",
    location: "Ajax, ON",
    email: "steven.park@ajaxfamily.ca",
    phone: "+1 (905) 555-0123",
    lastInteracted: "2023-12-30",
    status: "Cold Lead",
    campaign: "Toronto Dentists"
  },
  {
    id: 21,
    name: "Dr. Marie Tremblay",
    business: "Brossard Dental Center",
    location: "Brossard, QC",
    email: "marie.tremblay@brossarddental.ca",
    phone: "+1 (450) 555-1234",
    lastInteracted: "no interactions",
    status: "no status",
    campaign: "Quebec Dental List"
  },
  {
    id: 22,
    name: "Dr. Jonathan Kim",
    business: "Pickering Orthodontics",
    location: "Pickering, ON",
    email: "jonathan.kim@pickeringortho.ca",
    phone: "+1 (905) 555-2345",
    lastInteracted: "2023-12-28",
    status: "Qualified",
    campaign: "Toronto Dentists"
  },
  {
    id: 23,
    name: "Dr. Isabelle Roy",
    business: "Anjou Dental Studio",
    location: "Anjou, QC",
    email: "isabelle.roy@anjoudental.ca",
    phone: "+1 (514) 555-3456",
    lastInteracted: "no interactions",
    status: "no status",
    campaign: "Quebec Dental List"
  }
]

const statusColors = {
  "Hot Lead": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  "Qualified": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  "New Lead": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  "Cold Lead": "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  "no status": "bg-gray-100 text-gray-600 dark:bg-gray-800/30 dark:text-gray-500"
}

export default function LeadsPage() {
  const searchParams = useSearchParams()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLeads, setSelectedLeads] = useState<number[]>([])
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Fetch leads from API
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true)
        // Get the authenticated user
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user?.id) {
          throw new Error('You must be logged in to view leads')
        }
        const user_id = session.user.id
        
        const response = await fetch(`/api/leads?user_id=${user_id}`)
        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch leads')
        }

        setLeads(result.leads || [])

        // Check if user just imported leads and show success message
        const imported = searchParams.get('imported')
        if (imported === 'true') {
          // You could show a toast notification here
          console.log('Leads imported successfully!')
        }
      } catch (err) {
        console.error('Error fetching leads:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch leads')
        // Fall back to mock data on error
        setLeads(mockLeadsData.map(lead => ({
          id: lead.id,
          name: lead.name,
          location: lead.location,
          email: lead.email,
          phone_number: lead.phone,
          website: null,
          gmb_link: null,
          status: lead.status,
          last_interacted: lead.lastInteracted,
          created_at: new Date().toISOString(),
          campaign: { name: lead.campaign }
        })))
      } finally {
        setLoading(false)
      }
    }

    fetchLeads()
  }, [searchParams])

  // Calculate items per page based on screen height
  useEffect(() => {
    const calculateItemsPerPage = () => {
      const viewportHeight = window.innerHeight
      
      // More accurate heights of UI elements
      const siteHeaderHeight = 48 // SiteHeader height
      const searchBarHeight = 50 // Search and filter section (reduced)
      const tableHeaderHeight = 40 // Table header
      const paginationHeight = 50 // Pagination controls (reduced)
      const paddingAndMargins = 40 // Reduced padding buffer
      
      // Available height for table rows
      const availableHeight = viewportHeight - siteHeaderHeight - searchBarHeight - tableHeaderHeight - paginationHeight - paddingAndMargins
      
      // More accurate table row height (approximately 50px per row)
      const estimatedRowHeight = 50
      
      // Calculate how many rows can fit
      const calculatedItemsPerPage = Math.floor(availableHeight / estimatedRowHeight)
      
      // Subtract 1 for better spacing and ensure minimum of 5 and maximum of 50 items per page
      const finalItemsPerPage = Math.max(5, Math.min(50, calculatedItemsPerPage - 1))
      
      setItemsPerPage(finalItemsPerPage)
    }

    // Calculate on mount
    calculateItemsPerPage()

    // Recalculate on window resize
    const handleResize = () => {
      calculateItemsPerPage()
    }

    window.addEventListener('resize', handleResize)
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Filter leads based on search term and status
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = (lead.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (lead.location?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (lead.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const formatDate = (dateString: string) => {
    if (dateString === "no interactions") return "no interactions"
    
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    
    // Use consistent formatting to avoid hydration mismatch
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Pagination
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedLeads = filteredLeads.slice(startIndex, startIndex + itemsPerPage)

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeads(paginatedLeads.map(lead => lead.id))
    } else {
      setSelectedLeads([])
    }
  }

  const handleSelectLead = (leadId: number, checked: boolean) => {
    if (checked) {
      setSelectedLeads([...selectedLeads, leadId])
    } else {
      setSelectedLeads(selectedLeads.filter(id => id !== leadId))
    }
  }



  return <>
     <SiteHeader title="Leads"/>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4">
              
              {/* Header with actions */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 sm:max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search leads..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Hot Lead">Hot Lead</SelectItem>
                      <SelectItem value="Qualified">Qualified</SelectItem>
                      <SelectItem value="New Lead">New Lead</SelectItem>
                      <SelectItem value="Cold Lead">Cold Lead</SelectItem>
                      <SelectItem value="no status">No Status</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button asChild>
                  <Link href="/app/leads/import">
                    <Plus className="h-4 w-4 mr-2" />
                    Import Leads
                  </Link>
                </Button>
              </div>

              {/* Results summary */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {loading ? 'Loading...' : `${filteredLeads.length} leads found`}
                  {error && <span className="text-red-600 ml-2">({error})</span>}
                </span>
                {selectedLeads.length > 0 && (
                  <span>{selectedLeads.length} selected</span>
                )}
              </div>

              {/* Table */}
              <div className="rounded-lg border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedLeads.length === paginatedLeads.length && paginatedLeads.length > 0}
                          onCheckedChange={handleSelectAll}
                          aria-label="Select all"
                        />
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Website</TableHead>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Last Interacted</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      // Loading skeleton rows
                      Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={`loading-${index}`}>
                          <TableCell><div className="h-4 w-4 bg-muted animate-pulse rounded"></div></TableCell>
                          <TableCell><div className="h-4 w-32 bg-muted animate-pulse rounded"></div></TableCell>
                          <TableCell><div className="h-4 w-24 bg-muted animate-pulse rounded"></div></TableCell>
                          <TableCell><div className="h-4 w-40 bg-muted animate-pulse rounded"></div></TableCell>
                          <TableCell><div className="h-4 w-28 bg-muted animate-pulse rounded"></div></TableCell>
                          <TableCell><div className="h-4 w-36 bg-muted animate-pulse rounded"></div></TableCell>
                          <TableCell><div className="h-4 w-20 bg-muted animate-pulse rounded"></div></TableCell>
                          <TableCell><div className="h-4 w-24 bg-muted animate-pulse rounded"></div></TableCell>
                          <TableCell><div className="h-4 w-16 bg-muted animate-pulse rounded"></div></TableCell>
                          <TableCell><div className="h-4 w-8 bg-muted animate-pulse rounded"></div></TableCell>
                        </TableRow>
                      ))
                    ) : paginatedLeads.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                          {error ? 'Failed to load leads. Using demo data.' : 'No leads found.'}
                          <div className="mt-2">
                            <Button asChild variant="outline" size="sm">
                              <Link href="/app/leads/import">
                                <Plus className="h-4 w-4 mr-2" />
                                Import your first leads
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : paginatedLeads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedLeads.includes(lead.id)}
                            onCheckedChange={(checked) => handleSelectLead(lead.id, !!checked)}
                            aria-label="Select row"
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          <span>{lead.name || 'No name'}</span>
                        </TableCell>
                        <TableCell>{lead.location || 'Not specified'}</TableCell>
                        <TableCell>
                          {lead.email ? (
                            <a href={`mailto:${lead.email}`} className="hover:underline">
                              {lead.email}
                            </a>
                          ) : (
                            <span className="text-muted-foreground">No email</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {lead.phone_number ? (
                            <a href={`tel:${lead.phone_number}`} className="hover:underline">
                              {lead.phone_number}
                            </a>
                          ) : (
                            <span className="text-muted-foreground">No phone</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {lead.website ? (
                            <a href={lead.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              {lead.website}
                            </a>
                          ) : (
                            <span className="text-muted-foreground">No website</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {lead.campaign?.name ? (
                            <Badge variant="secondary" className="text-xs">
                              {lead.campaign.name}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">No campaign</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className={!lead.last_interacted || lead.last_interacted === "no interactions" ? "text-muted-foreground italic" : ""}>
                            {formatDate(lead.last_interacted || "no interactions")}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={statusColors[(lead.status || "no status") as keyof typeof statusColors]}
                            variant="outline"
                          >
                            {lead.status || "no status"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Edit Lead</DropdownMenuItem>
                              <DropdownMenuItem>Send Email</DropdownMenuItem>
                              <DropdownMenuItem>Schedule Call</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredLeads.length)} of {filteredLeads.length} results
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8"
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
  </>
}
