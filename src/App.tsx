import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./components/ui/dialog";
import { Card, CardContent } from "./components/ui/card";
import { ItemCard, Item } from "./components/ItemCard";
import { ItemReportForm } from "./components/ItemReportForm";
import { ItemDetailDialog } from "./components/ItemDetailDialog";
import { ClaimForm } from "./components/ClaimForm";
import { AuthPage } from "./components/AuthPage";
import { TheftTracker } from "./components/TheftTracker";
import { 
  Plus, 
  Search, 
  CheckCircle, 
  LogOut, 
  User as UserIcon, 
  Menu,
  AlertTriangle,
  ClipboardCheck,
  Heart,
  FileText,
  Search as SearchIcon,
  ShieldCheck,
  Users,
  Mail
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { Sheet, SheetContent, SheetTrigger } from "./components/ui/sheet";
import { Toaster } from "./components/ui/sonner";
import { api } from "./utils/api";
import { auth, User } from "./utils/auth";
import { initializeDemoData } from "./utils/demoData";

const categories = ["All", "Electronics", "Keys", "Wallets", "Bags", "Jewelry", "Clothing", "Pets", "Documents", "Other"];

type View = "homepage" | "browse-items" | "claim-item" | "auth-login" | "theft-tracker";

export default function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);
  const [reportType, setReportType] = useState<"lost" | "found">("lost");
  const [currentView, setCurrentView] = useState<View>("homepage");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [stats, setStats] = useState({
    lostCount: 0,
    foundCount: 0,
    claimsCount: 0,
    reunionsCount: 0
  });

  // Check authentication on mount
  useEffect(() => {
    initializeDemoData();
    const user = auth.getCurrentUser();
    setCurrentUser(user);
  }, []);

  // Load items from API
  useEffect(() => {
    loadItems();
    loadStats();
  }, []);

  const loadItems = async () => {
    try {
      const response = await api.getItems();
      setItems(response.items || []);
    } catch (error) {
      console.error("Error loading items:", error);
      toast.error("Failed to load items");
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.getStats();
      setStats(response);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const handleReportItem = (type: "lost" | "found") => {
    if (!currentUser) {
      toast.error("Please login to report an item");
      setCurrentView("auth-login");
      return;
    }
    setReportType(type);
    setReportDialogOpen(true);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentView("homepage");
    toast.success(`Welcome back, ${user.name}!`);
  };

  const handleLogout = () => {
    auth.logout();
    setCurrentUser(null);
    toast.success("Logged out successfully");
    setCurrentView("homepage");
  };

  const handleSubmitReport = async (newItem: Omit<Item, "id" | "status">) => {
    try {
      const response = await api.createItem({
        ...newItem,
        status: "active",
        reportedBy: currentUser?.email || "anonymous",
      });
      setItems([response.item, ...items]);
      setReportDialogOpen(false);
      toast.success("Item reported successfully!");
      loadStats();
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Failed to submit report");
    }
  };

  const handleSubmitClaim = async (claim: any) => {
    if (!currentUser) {
      toast.error("Please login to submit a claim");
      setCurrentView("auth-login");
      return;
    }
    
    try {
      await api.createClaim({
        ...claim,
        claimedBy: currentUser.email,
      });
      setClaimDialogOpen(false);
      toast.success("Claim submitted successfully! We'll review your claim and get back to you soon.");
      loadStats();
    } catch (error) {
      console.error("Error submitting claim:", error);
      toast.error("Failed to submit claim");
    }
  };

  const handleClaimClick = () => {
    if (!currentUser) {
      toast.error("Please login to claim an item");
      setCurrentView("auth-login");
      return;
    }
    setClaimDialogOpen(true);
  };

  const handleViewDetails = (item: Item) => {
    setSelectedItem(item);
    setDetailDialogOpen(true);
  };

  const filterItems = (type: "lost" | "found") => {
    return items
      .filter(item => item.type === type)
      .filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.location.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
        return matchesSearch && matchesCategory;
      });
  };

  const lostItems = filterItems("lost");
  const foundItems = filterItems("found");

  // Show authentication page if on login view
  if (currentView === "auth-login") {
    return <AuthPage onLogin={handleLogin} onCancel={() => setCurrentView("homepage")} />;
  }

  // Show theft tracker if on theft-tracker view
  if (currentView === "theft-tracker") {
    return <TheftTracker onNavigateHome={() => setCurrentView("homepage")} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-emerald-50">
      <Toaster />
      
      {/* Navigation */}
      <nav className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 text-white sticky top-0 z-50 shadow-xl backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold tracking-tight cursor-pointer" onClick={() => setCurrentView("homepage")}>
                Lost & Found
              </h1>
              <ul className="hidden md:flex gap-6">
                <li>
                  <button 
                    onClick={() => setCurrentView("homepage")}
                    className={`hover:bg-white/10 px-3 py-2 rounded-md transition-colors ${currentView === "homepage" ? "bg-white/20" : ""}`}
                  >
                    Home
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setCurrentView("browse-items")}
                    className={`hover:bg-white/10 px-3 py-2 rounded-md transition-colors ${currentView === "browse-items" ? "bg-white/20" : ""}`}
                  >
                    Browse Items
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setCurrentView("claim-item")}
                    className={`hover:bg-white/10 px-3 py-2 rounded-md transition-colors ${currentView === "claim-item" ? "bg-white/20" : ""}`}
                  >
                    Claim Item
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setCurrentView("theft-tracker")}
                    className={`hover:bg-white/10 px-3 py-2 rounded-md transition-colors ${currentView === "theft-tracker" ? "bg-white/20" : ""}`}
                  >
                    Theft Tracker
                  </button>
                </li>
              </ul>
            </div>
            
            {/* Desktop Auth Section */}
            <div className="hidden md:flex items-center gap-3">
              {currentUser ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-md">
                    <UserIcon className="h-4 w-4" />
                    <span className="text-sm">{currentUser.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 bg-destructive hover:bg-destructive/90 rounded-md transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setCurrentView("auth-login")}
                  className="px-4 py-2 bg-white text-cyan-600 hover:bg-cyan-50 rounded-md transition-colors font-semibold shadow-md hover:shadow-lg"
                >
                  Login
                </button>
              )}
            </div>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <button className="p-2 hover:bg-white/10 rounded-md transition-colors">
                  <Menu className="h-6 w-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-primary text-white border-white/20">
                <div className="flex flex-col gap-4 mt-8">
                  {currentUser && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-white/10 rounded-md mb-4">
                      <UserIcon className="h-5 w-5" />
                      <span>{currentUser.name}</span>
                    </div>
                  )}
                  
                  <button 
                    onClick={() => setCurrentView("homepage")}
                    className="text-left px-4 py-3 hover:bg-white/10 rounded-md transition-colors"
                  >
                    Home
                  </button>
                  <button 
                    onClick={() => setCurrentView("browse-items")}
                    className="text-left px-4 py-3 hover:bg-white/10 rounded-md transition-colors"
                  >
                    Browse Items
                  </button>
                  <button 
                    onClick={() => setCurrentView("claim-item")}
                    className="text-left px-4 py-3 hover:bg-white/10 rounded-md transition-colors"
                  >
                    Claim Item
                  </button>
                  <button 
                    onClick={() => setCurrentView("theft-tracker")}
                    className="text-left px-4 py-3 hover:bg-white/10 rounded-md transition-colors"
                  >
                    Theft Tracker
                  </button>
                  
                  <div className="border-t border-white/20 my-2"></div>
                  
                  {currentUser ? (
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-3 bg-destructive hover:bg-destructive/90 rounded-md transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentView("auth-login")}
                      className="px-4 py-3 bg-white text-cyan-600 hover:bg-cyan-50 rounded-md transition-colors font-semibold shadow-md"
                    >
                      Login
                    </button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Hero Section (Homepage Only) */}
      {currentView === "homepage" && (
        <div 
          className="bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-500 text-white relative overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(37, 99, 235, 0.9), rgba(6, 182, 212, 0.85), rgba(20, 184, 166, 0.8)), url('https://images.unsplash.com/photo-1722697309159-cfd535e93549?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb3N0JTIwYW5kJTIwZm91bmQlMjBjb21tdW5pdHklMjBoZWxwaW5nfGVufDF8fHx8MTc1OTgyMTUyN3ww&ixlib=rb-4.1.0&q=80&w=1080')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="container mx-auto px-4 py-16 text-center relative z-10">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">Welcome to Lost & Found</h1>
            <p className="text-lg sm:text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Your trusted platform for reuniting lost items with their owners. Help others and get help when you need it most.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center mb-8">
              <Button 
                onClick={() => handleReportItem("lost")}
                size="lg"
                variant="secondary"
                className="bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 font-semibold shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
              >
                Report Lost Item
              </Button>
              <Button 
                onClick={() => handleReportItem("found")}
                size="lg"
                variant="secondary"
                className="bg-white text-teal-600 hover:bg-teal-50 hover:text-teal-700 font-semibold shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
              >
                Report Found Item
              </Button>
              <Button 
                onClick={handleClaimClick}
                size="lg"
                variant="secondary"
                className="bg-white text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 font-semibold shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
              >
                Claim an Item
              </Button>
            </div>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search for lost or found items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                />
              </div>
              <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/20 w-full sm:w-auto">
                Search
              </Button>
            </div>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-8">
        {currentView === "homepage" && (
          <>
            {/* Stats Section */}
            <section className="mb-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="text-center hover:shadow-xl transition-all hover:scale-105 border-t-4 border-t-amber-500 bg-gradient-to-br from-amber-50 to-white">
                  <CardContent className="pt-6 pb-6 space-y-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                      <AlertTriangle className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-sm text-muted-foreground mb-2 uppercase tracking-wider">Lost Items</h3>
                    <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">{stats.lostCount}</p>
                  </CardContent>
                </Card>
                <Card className="text-center hover:shadow-xl transition-all hover:scale-105 border-t-4 border-t-teal-500 bg-gradient-to-br from-teal-50 to-white">
                  <CardContent className="pt-6 pb-6 space-y-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                      <CheckCircle className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-sm text-muted-foreground mb-2 uppercase tracking-wider">Found Items</h3>
                    <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-teal-500 to-teal-600 bg-clip-text text-transparent">{stats.foundCount}</p>
                  </CardContent>
                </Card>
                <Card className="text-center hover:shadow-xl transition-all hover:scale-105 border-t-4 border-t-cyan-500 bg-gradient-to-br from-cyan-50 to-white">
                  <CardContent className="pt-6 pb-6 space-y-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                      <ClipboardCheck className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-sm text-muted-foreground mb-2 uppercase tracking-wider">Successful Claims</h3>
                    <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-500 to-cyan-600 bg-clip-text text-transparent">{stats.claimsCount}</p>
                  </CardContent>
                </Card>
                <Card className="text-center hover:shadow-xl transition-all hover:scale-105 border-t-4 border-t-emerald-500 bg-gradient-to-br from-emerald-50 to-white">
                  <CardContent className="pt-6 pb-6 space-y-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                      <Heart className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-sm text-muted-foreground mb-2 uppercase tracking-wider">Happy Reunions</h3>
                    <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent">{stats.reunionsCount}</p>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Recent Items */}
            <section className="mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">Recently Reported Items</h2>
              {items.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="max-w-md mx-auto mb-6">
                    <img 
                      src="https://images.unsplash.com/photo-1631823794808-b359f1132de9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbXB0eSUyMHNlYXJjaCUyMGlsbHVzdHJhdGlvbnxlbnwxfHx8fDE3NTk4MjE1NDV8MA&ixlib=rb-4.1.0&q=80&w=400" 
                      alt="No items yet" 
                      className="w-48 h-48 mx-auto rounded-lg opacity-50 object-cover"
                    />
                  </div>
                  <p className="text-lg mb-2">No items reported yet</p>
                  <p>Be the first to report a lost or found item!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.slice(0, 6).map((item) => (
                    <ItemCard key={item.id} item={item} onViewDetails={handleViewDetails} />
                  ))}
                </div>
              )}
            </section>

            {/* How It Works Section */}
            <section className="bg-gradient-to-br from-white via-cyan-50 to-teal-50 rounded-2xl p-6 sm:p-8 shadow-lg border border-cyan-100">
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">How It Works</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                <div className="text-center group">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                    <FileText className="h-8 w-8 sm:h-10 sm:w-10" />
                  </div>
                  <h3 className="font-semibold mb-2 text-blue-700">1. Report</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Report your lost item or submit a found item with detailed information and photos.
                  </p>
                </div>
                <div className="text-center group">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-cyan-500 to-cyan-700 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                    <SearchIcon className="h-8 w-8 sm:h-10 sm:w-10" />
                  </div>
                  <h3 className="font-semibold mb-2 text-cyan-700">2. Match</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Our system helps match lost and found items based on descriptions and locations.
                  </p>
                </div>
                <div className="text-center group">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-teal-500 to-teal-700 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                    <ShieldCheck className="h-8 w-8 sm:h-10 sm:w-10" />
                  </div>
                  <h3 className="font-semibold mb-2 text-teal-700">3. Verify</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Claimants provide proof of ownership to ensure items go to the right person.
                  </p>
                </div>
                <div className="text-center group">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                    <Users className="h-8 w-8 sm:h-10 sm:w-10" />
                  </div>
                  <h3 className="font-semibold mb-2 text-emerald-700">4. Reunite</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Successfully matched items are returned to their rightful owners.
                  </p>
                </div>
              </div>
            </section>
          </>
        )}

        {currentView === "browse-items" && (
          <>
            {/* Floating Action Button */}
            {currentUser && (
              <div className="fixed bottom-6 right-6 z-40">
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={() => handleReportItem("lost")}
                    size="lg" 
                    className="rounded-full w-12 h-12 sm:w-14 sm:h-14 shadow-lg hover:shadow-2xl transition-all bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-2 border-white"
                    title="Report Lost Item"
                  >
                    <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6" />
                  </Button>
                  <Button
                    onClick={() => handleReportItem("found")}
                    size="lg" 
                    className="rounded-full w-12 h-12 sm:w-14 sm:h-14 shadow-lg hover:shadow-2xl transition-all bg-gradient-to-br from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white border-2 border-white"
                    title="Report Found Item"
                  >
                    <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                  </Button>
                </div>
              </div>
            )}
            
            {/* Search and Filter Bar */}
            <div className="mb-8 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="lost" className="space-y-6">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
                <TabsTrigger value="lost">Lost Items ({lostItems.length})</TabsTrigger>
                <TabsTrigger value="found">Found Items ({foundItems.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="lost" className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2>Lost Items</h2>
                    <p className="text-muted-foreground">Browse items that people have lost</p>
                  </div>
                  <Button onClick={() => handleReportItem("lost")} className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Report Lost Item
                  </Button>
                </div>

                {lostItems.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <div className="max-w-sm mx-auto mb-6">
                      <img 
                        src="https://images.unsplash.com/photo-1585984968562-1443b72fb0dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZW9wbGUlMjBzZWFyY2hpbmclMjB0b2dldGhlciUyMHRlYW13b3JrfGVufDF8fHx8MTc1OTgyMTUzMHww&ixlib=rb-4.1.0&q=80&w=400" 
                        alt="No lost items found" 
                        className="w-32 h-32 sm:w-40 sm:h-40 mx-auto rounded-lg opacity-50 object-cover"
                      />
                    </div>
                    <p className="text-lg mb-2">No lost items found</p>
                    <p>Try adjusting your search or browse all categories</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {lostItems.map((item) => (
                      <ItemCard key={item.id} item={item} onViewDetails={handleViewDetails} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="found" className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2>Found Items</h2>
                    <p className="text-muted-foreground">Browse items that people have found</p>
                  </div>
                  <Button onClick={() => handleReportItem("found")} className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Report Found Item
                  </Button>
                </div>

                {foundItems.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <div className="max-w-sm mx-auto mb-6">
                      <img 
                        src="https://images.unsplash.com/photo-1758599669889-2d4707c7b1fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMHJldW5pb24lMjBjZWxlYnJhdGlvbnxlbnwxfHx8fDE3NTk4MjE1NDF8MA&ixlib=rb-4.1.0&q=80&w=400" 
                        alt="No found items" 
                        className="w-32 h-32 sm:w-40 sm:h-40 mx-auto rounded-lg opacity-50 object-cover"
                      />
                    </div>
                    <p className="text-lg mb-2">No found items yet</p>
                    <p>Help others by reporting found items in your area</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {foundItems.map((item) => (
                      <ItemCard key={item.id} item={item} onViewDetails={handleViewDetails} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}

        {currentView === "claim-item" && (
          <div className="max-w-3xl mx-auto">
            {!currentUser ? (
              <div className="text-center py-12">
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">Login Required</h2>
                <p className="text-muted-foreground mb-6">
                  You need to be logged in to claim an item.
                </p>
                <Button onClick={() => setCurrentView("auth-login")} size="lg" className="w-full sm:w-auto">
                  Go to Login
                </Button>
              </div>
            ) : (
              <>
                <div 
                  className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 text-white rounded-2xl p-6 sm:p-8 mb-8 text-center relative overflow-hidden shadow-xl"
                  style={{
                    backgroundImage: `linear-gradient(135deg, rgba(37, 99, 235, 0.9), rgba(6, 182, 212, 0.85), rgba(20, 184, 166, 0.8)), url('https://images.unsplash.com/photo-1729860646472-74e178283483?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBwaG9uZSUyMHNlYXJjaGluZyUyMGFwcHxlbnwxfHx8fDE3NTk4MjE1MzN8MA&ixlib=rb-4.1.0&q=80&w=400')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center right'
                  }}
                >
                  <div className="relative z-10">
                    <h1 className="text-3xl sm:text-4xl font-bold mb-4">Claim an Item</h1>
                    <p className="text-lg opacity-90">
                      Think you've found your lost item? Fill out the claim form below with proof of ownership.
                    </p>
                  </div>
                </div>

                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <ClaimForm 
                      onSubmit={handleSubmitClaim}
                      onCancel={() => setCurrentView("homepage")}
                    />
                  </CardContent>
                </Card>

                <Card className="mt-8">
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="font-semibold mb-4">Claim Process</h3>
                    <ol className="space-y-3 text-muted-foreground">
                      <li className="flex gap-3">
                        <span className="font-semibold text-foreground shrink-0">1.</span>
                        <div>
                          <span className="font-semibold text-foreground">Submit your claim</span> with detailed information and proof of ownership
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-semibold text-foreground shrink-0">2.</span>
                        <div>
                          <span className="font-semibold text-foreground">Verification</span> - Our team will review your claim and supporting documents
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-semibold text-foreground shrink-0">3.</span>
                        <div>
                          <span className="font-semibold text-foreground">Matching</span> - We'll compare your claim with found item reports
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-semibold text-foreground shrink-0">4.</span>
                        <div>
                          <span className="font-semibold text-foreground">Contact</span> - If a match is found, we'll connect you with the finder
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-semibold text-foreground shrink-0">5.</span>
                        <div>
                          <span className="font-semibold text-foreground">Collection</span> - Arrange to collect your item from the finder
                        </div>
                      </li>
                    </ol>

                    <h3 className="font-semibold mt-6 mb-4">Tips for Successful Claims</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex gap-2">
                        <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
                        <span>Provide as much detail as possible about the item</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
                        <span>Upload clear photos of receipts or proof of purchase</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
                        <span>Describe unique features that only you would know</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
                        <span>Be honest and accurate in your descriptions</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
                        <span>Respond promptly to verification requests</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 text-white mt-16 rounded-t-3xl overflow-hidden shadow-2xl">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-4">Lost & Found Community</h3>
            <p className="text-sm opacity-75">© 2025 Lost & Found - Bringing people together, one item at a time.</p>
          </div>
        </div>
      </footer>

      {/* Report Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Report {reportType === "lost" ? "Lost" : "Found"} Item
            </DialogTitle>
            <DialogDescription>
              Fill out the form below to report a {reportType} item
            </DialogDescription>
          </DialogHeader>
          <ItemReportForm
            type={reportType}
            onSubmit={handleSubmitReport}
            onCancel={() => setReportDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Claim Dialog */}
      <Dialog open={claimDialogOpen} onOpenChange={setClaimDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Claim an Item</DialogTitle>
            <DialogDescription>
              Fill out the form below with proof of ownership
            </DialogDescription>
          </DialogHeader>
          <ClaimForm
            onSubmit={handleSubmitClaim}
            onCancel={() => setClaimDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <ItemDetailDialog
        item={selectedItem}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />
    </div>
  );
}