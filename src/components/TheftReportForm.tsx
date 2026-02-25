import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { AlertTriangle, User, MapPin, Calendar, FileText } from "lucide-react";

export interface TheftReport {
  id?: string;
  itemName: string;
  description: string;
  date: string;
  location: string;
  reporterName: string;
  reporterContact: string;
  suspectName: string;
  suspectDescription: string;
  suspectLastSeen: string;
  status: "Under Investigation" | "Resolved" | "Closed";
  createdAt?: string;
}

interface TheftReportFormProps {
  onSubmit: (report: Omit<TheftReport, "id" | "status" | "createdAt">) => void;
  initialData?: TheftReport;
  onCancel?: () => void;
}

export function TheftReportForm({ onSubmit, initialData, onCancel }: TheftReportFormProps) {
  const [formData, setFormData] = useState({
    itemName: initialData?.itemName || "",
    description: initialData?.description || "",
    date: initialData?.date || new Date().toISOString().split('T')[0],
    location: initialData?.location || "",
    reporterName: initialData?.reporterName || "",
    reporterContact: initialData?.reporterContact || "",
    suspectName: initialData?.suspectName || "",
    suspectDescription: initialData?.suspectDescription || "",
    suspectLastSeen: initialData?.suspectLastSeen || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="border-2 border-orange-200 shadow-md">
        <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-400" />
            Stolen Item Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="itemName" className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-600" />
              Item Name *
            </Label>
            <Input
              id="itemName"
              value={formData.itemName}
              onChange={(e) => handleChange("itemName", e.target.value)}
              placeholder="e.g., iPhone 13 Pro, Laptop, Wallet..."
              required
              className="border-slate-300 focus:border-orange-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Detailed description of the stolen item (color, brand, unique features...)"
              rows={3}
              required
              className="border-slate-300 focus:border-orange-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-600" />
                Date of Theft *
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
                required
                className="border-slate-300 focus:border-orange-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-600" />
                Location *
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                placeholder="Where was the item stolen?"
                required
                className="border-slate-300 focus:border-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reporterName" className="flex items-center gap-2">
                <User className="h-4 w-4 text-slate-600" />
                Reporter Name *
              </Label>
              <Input
                id="reporterName"
                value={formData.reporterName}
                onChange={(e) => handleChange("reporterName", e.target.value)}
                placeholder="Your full name"
                required
                className="border-slate-300 focus:border-orange-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reporterContact">Contact Information *</Label>
              <Input
                id="reporterContact"
                value={formData.reporterContact}
                onChange={(e) => handleChange("reporterContact", e.target.value)}
                placeholder="Phone or email"
                required
                className="border-slate-300 focus:border-orange-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-orange-200 shadow-md">
        <CardHeader className="bg-gradient-to-r from-orange-600 to-orange-500 text-white">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Suspect Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="suspectName">Suspect Name (if known)</Label>
            <Input
              id="suspectName"
              value={formData.suspectName}
              onChange={(e) => handleChange("suspectName", e.target.value)}
              placeholder="Name or identifier"
              className="border-slate-300 focus:border-orange-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="suspectDescription">Suspect Description</Label>
            <Textarea
              id="suspectDescription"
              value={formData.suspectDescription}
              onChange={(e) => handleChange("suspectDescription", e.target.value)}
              placeholder="Physical description, clothing, distinguishing features..."
              rows={3}
              className="border-slate-300 focus:border-orange-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="suspectLastSeen" className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-slate-600" />
              Last Seen Location
            </Label>
            <Input
              id="suspectLastSeen"
              value={formData.suspectLastSeen}
              onChange={(e) => handleChange("suspectLastSeen", e.target.value)}
              placeholder="Where was the suspect last seen?"
              className="border-slate-300 focus:border-orange-500"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button 
          type="submit" 
          className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white"
        >
          {initialData ? "Update Report" : "Submit Report"}
        </Button>
      </div>
    </form>
  );
}
