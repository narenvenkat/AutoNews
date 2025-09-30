import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  CheckCircle, 
  Clock, 
  Youtube, 
  TrendingUp,
  TrendingDown,
  Briefcase
} from "lucide-react";
import type { Metrics } from "@/types";

interface KPICardsProps {
  metrics?: Metrics;
  isLoading: boolean;
}

export default function KPICards({ metrics, isLoading }: KPICardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="kpi-cards-loading">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-12 w-12 rounded-lg" />
              </div>
              <div className="mt-4 flex items-center space-x-1">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Jobs Today",
      value: metrics?.jobsToday?.toString() || "0",
      icon: Briefcase,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      trend: "+12%",
      trendText: "from yesterday",
      trendUp: true,
      testId: "kpi-jobs-today"
    },
    {
      title: "Success Rate",
      value: `${metrics?.successRate?.toFixed(1) || "0"}%`,
      icon: CheckCircle,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      trend: "+2.1%",
      trendText: "improvement",
      trendUp: true,
      testId: "kpi-success-rate"
    },
    {
      title: "Avg Render Time",
      value: metrics?.avgRenderTime || "0m",
      icon: Clock,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      trend: "-15s",
      trendText: "faster today",
      trendUp: true,
      testId: "kpi-render-time"
    },
    {
      title: "Published",
      value: metrics?.published?.toString() || "0",
      icon: Youtube,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      trend: "",
      trendText: "to YouTube today",
      trendUp: true,
      testId: "kpi-published"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="kpi-cards">
      {cards.map((card) => (
        <Card key={card.title} className="border border-slate-200" data-testid={card.testId}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600" data-testid={`${card.testId}-title`}>
                  {card.title}
                </p>
                <p className="text-3xl font-bold text-slate-900" data-testid={`${card.testId}-value`}>
                  {card.value}
                </p>
              </div>
              <div className={`w-12 h-12 ${card.iconBg} rounded-lg flex items-center justify-center`}>
                <card.icon className={`${card.iconColor} w-6 h-6`} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              {card.trend && (
                <>
                  <span className={`font-medium ${card.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                    {card.trendUp ? (
                      <TrendingUp className="w-4 h-4 inline mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 inline mr-1" />
                    )}
                    {card.trend}
                  </span>
                  <span className="text-slate-500 ml-1">{card.trendText}</span>
                </>
              )}
              {!card.trend && (
                <span className="text-slate-500">{card.trendText}</span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
