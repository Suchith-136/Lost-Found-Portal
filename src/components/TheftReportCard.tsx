import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { AlertTriangle, MapPin, Calendar, User, Edit, CheckCircle } from "lucide-react";
import { TheftReport } from "./TheftReportForm";

interface TheftReportCardProps {
  report: TheftReport;
  onEdit: (report: TheftReport) => void;
  onResolve: (report: TheftReport) => void;
}

export function TheftReportCard({ report, onEdit, onResolve }: TheftReportCardProps) {
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

  return (
    <Card className="hover:shadow-lg transition-all border-l-4 border-l-orange-500">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0 shadow-md">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-800 mb-1">{report.itemName}</h3>
              <Badge className={`${getStatusColor(report.status)} border`}>
                {report.status}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-slate-600 line-clamp-2">{report.description}</p>
        
        <div className="space-y-2 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span>{new Date(report.date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-400" />
            <span>{report.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-slate-400" />
            <span>Reported by: {report.reporterName}</span>
          </div>
          {report.suspectName && (
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span>Suspect: {report.suspectName}</span>
            </div>
          )}
        </div>

        <div className="pt-3 flex gap-2 border-t border-slate-200">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(report)}
            className="flex-1 border-slate-300 hover:bg-slate-50"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          {report.status !== "Resolved" && (
            <Button
              size="sm"
              onClick={() => onResolve(report)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Resolve
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
