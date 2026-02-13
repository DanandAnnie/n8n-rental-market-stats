"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MarketStats {
  avgRent1BR: string;
  avgRent2BR: string;
  avgRent3BR: string;
  vacancyRate: string;
  monthlyChange: string;
  yearlyChange: string;
}

interface WorkflowResponse {
  success: boolean;
  emailsSent?: number;
  stats?: MarketStats;
  reportPreview?: string;
  generatedAt?: string;
  error?: string;
}

export default function RentalMarketStats() {
  const [frequency, setFrequency] = useState("monthly");
  const [customMessage, setCustomMessage] = useState("");
  const [result, setResult] = useState<WorkflowResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          frequency,
          customMessage: customMessage.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.error || "Failed to generate rental market report");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            St. George Rental Market Stats
          </CardTitle>
          <CardDescription className="text-base">
            Generate and send branded rental market analysis reports to your
            client list
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="frequency" className="text-base font-medium">
                Report Frequency
              </Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly Report</SelectItem>
                  <SelectItem value="weekly">Weekly Report</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Choose how often this report is typically sent
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="customMessage"
                className="text-base font-medium"
              >
                Custom Message (Optional)
              </Label>
              <Textarea
                id="customMessage"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Add a personal note or special announcement for this report..."
                className="min-h-[120px] resize-none"
              />
              <p className="text-sm text-muted-foreground">
                This will be included as a highlighted note in the email
              </p>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={loading}
            >
              {loading
                ? "Generating Report & Sending..."
                : "Generate & Send Report"}
            </Button>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
              <p className="font-medium">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}

          {result?.success && result.stats && (
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    strokeWidth="2"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="font-semibold text-green-800">
                    Report Generated Successfully!
                  </p>
                </div>
                <p className="text-sm text-green-700 mt-2">
                  {result.emailsSent} email(s) sent to your client list
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Key Market Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <MetricCard
                      label="1BR Average"
                      value={result.stats.avgRent1BR}
                    />
                    <MetricCard
                      label="2BR Average"
                      value={result.stats.avgRent2BR}
                    />
                    <MetricCard
                      label="3BR Average"
                      value={result.stats.avgRent3BR}
                    />
                    <MetricCard
                      label="Vacancy Rate"
                      value={result.stats.vacancyRate}
                    />
                    <MetricCard
                      label="Month-Over-Month"
                      value={result.stats.monthlyChange}
                      isChange
                    />
                    <MetricCard
                      label="Year-Over-Year"
                      value={result.stats.yearlyChange}
                      isChange
                    />
                  </div>
                </CardContent>
              </Card>

              {result.reportPreview && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Report Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {result.reportPreview}
                    </p>
                  </CardContent>
                </Card>
              )}

              <Button
                onClick={() => {
                  setResult(null);
                  setCustomMessage("");
                }}
                variant="outline"
                className="w-full"
              >
                Generate Another Report
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

function MetricCard({
  label,
  value,
  isChange = false,
}: {
  label: string;
  value: string;
  isChange?: boolean;
}) {
  const changeColor =
    isChange && value.startsWith("+")
      ? "text-green-600"
      : isChange && value.startsWith("-")
        ? "text-red-600"
        : "text-slate-900";

  return (
    <div className="p-3 bg-slate-50 rounded-lg">
      <p className="text-xs text-slate-600 uppercase tracking-wide">{label}</p>
      <p className={`text-xl font-bold mt-1 ${changeColor}`}>{value}</p>
    </div>
  );
}
