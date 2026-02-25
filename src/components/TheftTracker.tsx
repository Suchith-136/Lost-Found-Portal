import { useState, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { TheftReportForm, TheftReport } from "./TheftReportForm";
import { TheftReportCard } from "./TheftReportCard";
import { 
  AlertTriangle, 
  Search, 
  Plus, 
  Shield, 
  CheckCircle, 
  FileX,
  Menu,
  Home,
  List as ListIcon,
  BarChart3
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { Toaster } from "./ui/sonner";
import { api } from "../utils/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

interface TheftTrackerProps {
  onNavigateHome: () => void;
}

export function TheftTracker({ onNavigateHome }: TheftTrackerProps) {
  const [reports, setReports] = useState<TheftReport[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<TheftReport | null>(null);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [stats, setStats] = useState({
    total: 0,
    investigating: 0,
    resolved: 0,
    closed: 0,
  });

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [reports]);

  const loadReports = async () => {
    try {
      const response = await api.getTheftReports();
      setReports(response.reports || []);
      // Save to localStorage for offline access
      localStorage.setItem('theft-reports', JSON.stringify(response.reports || []));
    } catch (error) {
      // Silently fallback to localStorage - API might not be available yet
      try {
        const localReports = localStorage.getItem('theft-reports');
        if (localReports) {
          const parsedReports = JSON.parse(localReports);
          setReports(parsedReports);
          // Only show info message if we have cached data
          if (parsedReports.length > 0) {
            toast.info("Loaded cached data. Working in offline mode.");
          }
        } else {
          // No cached data available
          setReports([]);
        }
      } catch (parseError) {
        // Clear corrupted localStorage data
        localStorage.removeItem('theft-reports');
        setReports([]);
      }
    }
  };

  const calculateStats = () => {
    setStats({
      total: reports.length,
      investigating: reports.filter(r => r.status === "Under Investigation").length,
      resolved: reports.filter(r => r.status === "Resolved").length,
      closed: reports.filter(r => r.status === "Closed").length,
    });
  };

  const handleSubmitReport = async (formData: Omit<TheftReport, "id" | "status" | "createdAt">) => {
    try {
      if (editingReport) {
        try {
          const response = await api.updateTheftReport(editingReport.id!, {
            ...formData,
            status: editingReport.status,
          });
          const updatedReports = reports.map(r => r.id === editingReport.id ? response.report : r);
          setReports(updatedReports);
          localStorage.setItem('theft-reports', JSON.stringify(updatedReports));
          toast.success("Report updated successfully!");
        } catch (apiError) {
          // Fallback to local update
          const updatedReport = { ...editingReport, ...formData };
          const updatedReports = reports.map(r => r.id === editingReport.id ? updatedReport : r);
          setReports(updatedReports);
          localStorage.setItem('theft-reports', JSON.stringify(updatedReports));
          toast.success("Report updated (offline mode)");
        }
      } else {
        try {
          const response = await api.createTheftReport({
            ...formData,
            status: "Under Investigation" as const,
          });
          const newReports = [response.report, ...reports];
          setReports(newReports);
          localStorage.setItem('theft-reports', JSON.stringify(newReports));
          toast.success("Theft report submitted successfully!");
        } catch (apiError) {
          // Fallback to local creation
          const newReport: TheftReport = {
            id: `theft-local-${Date.now()}`,
            ...formData,
            status: "Under Investigation",
            createdAt: new Date().toISOString(),
          };
          const newReports = [newReport, ...reports];
          setReports(newReports);
          localStorage.setItem('theft-reports', JSON.stringify(newReports));
          toast.success("Report created (offline mode)");
        }
      }
      setIsFormOpen(false);
      setEditingReport(null);
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Failed to submit report");
    }
  };

  const handleEdit = (report: TheftReport) => {
    setEditingReport(report);
    setIsFormOpen(true);
  };

  const handleResolve = async (report: TheftReport) => {
    try {
      try {
        const response = await api.updateTheftReport(report.id!, {
          ...report,
          status: "Resolved",
        });
        const updatedReports = reports.map(r => r.id === report.id ? response.report : r);
        setReports(updatedReports);
        localStorage.setItem('theft-reports', JSON.stringify(updatedReports));
        toast.success("Report marked as resolved!");
      } catch (apiError) {
        // Fallback to local update
        const updatedReport = { ...report, status: "Resolved" as const };
        const updatedReports = reports.map(r => r.id === report.id ? updatedReport : r);
        setReports(updatedReports);
        localStorage.setItem('theft-reports', JSON.stringify(updatedReports));
        toast.success("Report resolved (offline mode)");
      }
    } catch (error) {
      console.error("Error resolving report:", error);
      toast.error("Failed to resolve report");
    }
  };

  const filteredReports = reports.filter(report => {
    const searchLower = searchQuery.toLowerCase();
    return (
      report.itemName.toLowerCase().includes(searchLower) ||
      report.description.toLowerCase().includes(searchLower) ||
      report.location.toLowerCase().includes(searchLower) ||
      report.reporterName.toLowerCase().includes(searchLower) ||
      report.suspectName?.toLowerCase().includes(searchLower)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Under Investigation":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "Resolved":
        return "bg-green-100 text-green-800 border-green-300";
      case "Closed":
        return "bg-slate-100 text-slate-800 border-slate-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const Sidebar = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={`${isMobile ? "py-4" : "h-full"} bg-gradient-to-b from-slate-800 to-slate-700 text-white`}>
      <div className={`${isMobile ? "" : "p-6"} space-y-6`}>
        {!isMobile && (
          <div className="flex items-center gap-3 pb-4 border-b border-slate-600">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold">Theft Tracker</h2>
              <p className="text-xs text-slate-300">Security Dashboard</p>
            </div>
          </div>
        )}

        <nav className="space-y-2">
          <button
            onClick={onNavigateHome}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-600/50 transition-colors text-left"
          >
            <Home className="h-5 w-5" />
            <span>Back to Home</span>
          </button>
          <button
            onClick={() => setViewMode("cards")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
              viewMode === "cards" ? "bg-orange-600" : "hover:bg-slate-600/50"
            }`}
          >
            <BarChart3 className="h-5 w-5" />
            <span>Card View</span>
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
              viewMode === "table" ? "bg-orange-600" : "hover:bg-slate-600/50"
            }`}
          >
            <ListIcon className="h-5 w-5" />
            <span>Table View</span>
          </button>
        </nav>

        {!isMobile && (
          <div className="pt-6 border-t border-slate-600">
            <p className="text-xs text-slate-400 mb-3 px-2">Quick Stats</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center px-2">
                <span className="text-slate-300">Total Reports</span>
                <span className="font-semibold">{stats.total}</span>
              </div>
              <div className="flex justify-between items-center px-2">
                <span className="text-slate-300">Investigating</span>
                <span className="font-semibold text-orange-400">{stats.investigating}</span>
              </div>
              <div className="flex justify-between items-center px-2">
                <span className="text-slate-300">Resolved</span>
                <span className="font-semibold text-green-400">{stats.resolved}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 border-r border-slate-200 shadow-xl">
          <Sidebar />
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-gradient-to-r from-slate-700 to-slate-600 text-white shadow-lg">
            <div className="px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Mobile Menu */}
                  <Sheet>
                    <SheetTrigger asChild className="lg:hidden">
                      <button className="p-2 hover:bg-white/10 rounded-md transition-colors">
                        <Menu className="h-6 w-6" />
                      </button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[280px] bg-slate-800 text-white border-slate-700 p-0">
                      <Sidebar isMobile />
                    </SheetContent>
                  </Sheet>

                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-orange-400" />
                    <div>
                      <h1 className="text-lg sm:text-2xl font-bold">Item Theft Tracker</h1>
                      <p className="text-xs sm:text-sm text-slate-300 hidden sm:block">Monitor and manage theft reports</p>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    setEditingReport(null);
                    setIsFormOpen(true);
                  }}
                  className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Add Report</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </div>
            </div>
          </header>

          {/* Stats Cards */}
          <div className="bg-white border-b border-slate-200 px-4 py-6 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-l-4 border-l-slate-600">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Total Reports</p>
                      <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
                    </div>
                    <FileX className="h-8 w-8 text-slate-400" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-orange-600">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Investigating</p>
                      <p className="text-2xl font-bold text-orange-600">{stats.investigating}</p>
                    </div>
                    <Search className="h-8 w-8 text-orange-400" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-green-600">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Resolved</p>
                      <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-slate-400">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Closed</p>
                      <p className="text-2xl font-bold text-slate-600">{stats.closed}</p>
                    </div>
                    <Shield className="h-8 w-8 text-slate-400" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto px-4 py-6 sm:px-6 lg:px-8">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 border-slate-300 focus:border-orange-500"
                />
              </div>
            </div>

            {/* Reports Display */}
            {filteredReports.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">No Reports Found</h3>
                <p className="text-slate-600 mb-4">
                  {searchQuery ? "Try adjusting your search" : "Get started by adding your first theft report"}
                </p>
                {!searchQuery && (
                  <Button onClick={() => setIsFormOpen(true)} className="bg-orange-600 hover:bg-orange-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Report
                  </Button>
                )}
              </div>
            ) : viewMode === "cards" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReports.map((report) => (
                  <TheftReportCard
                    key={report.id}
                    report={report}
                    onEdit={handleEdit}
                    onResolve={handleResolve}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>All Theft Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>Reported By</TableHead>
                          <TableHead>Suspect</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredReports.map((report) => (
                          <TableRow key={report.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{report.itemName}</div>
                                <div className="text-sm text-slate-500 line-clamp-1">{report.description}</div>
                              </div>
                            </TableCell>
                            <TableCell>{report.reporterName}</TableCell>
                            <TableCell>{report.suspectName || "Unknown"}</TableCell>
                            <TableCell>{new Date(report.date).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Badge className={`${getStatusColor(report.status)} border`}>
                                {report.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-2 justify-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(report)}
                                >
                                  Edit
                                </Button>
                                {report.status !== "Resolved" && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleResolve(report)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    Resolve
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Report Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              {editingReport ? "Edit Theft Report" : "Report Stolen Item"}
            </DialogTitle>
          </DialogHeader>
          <TheftReportForm
            onSubmit={handleSubmitReport}
            initialData={editingReport || undefined}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingReport(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Toaster */}
      <Toaster />
    </div>
  );
}