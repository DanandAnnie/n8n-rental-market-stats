"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface MarketStats {
  avgRent1BR: string;
  avgRent2BR: string;
  avgRent3BR: string;
  vacancyRate: string;
  monthlyRentChange: string;
  yearlyRentChange: string;
  medianHomePrice: string;
  daysOnMarket: string;
  activeInventory: string;
  salesVolume: string;
  monthlyPriceChange: string;
  yearlyPriceChange: string;
}

interface WorkflowResponse {
  success: boolean;
  emailsSent?: number;
  stats?: MarketStats;
  reportPreview?: string;
  gammaUrl?: string;
  generatedAt?: string;
  error?: string;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  deliveryPref: string;
  createdAt: string;
}

export default function MarketStatsApp() {
  const [frequency, setFrequency] = useState("monthly");
  const [customMessage, setCustomMessage] = useState("");
  const [result, setResult] = useState<WorkflowResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    deliveryPref: "both",
  });

  const fetchContacts = useCallback(async () => {
    setContactsLoading(true);
    try {
      const res = await fetch("/api/contacts");
      const data = await res.json();
      if (data.contacts) {
        setContacts(data.contacts);
      }
    } catch {
      // Contacts endpoint may not be configured yet
    } finally {
      setContactsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

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
        throw new Error(
          data.detail || data.error || "Failed to generate market report"
        );
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveContact = async () => {
    const method = editingContact ? "PUT" : "POST";
    const body = editingContact
      ? { ...contactForm, id: editingContact.id, createdAt: editingContact.createdAt }
      : contactForm;

    await fetch("/api/contacts", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setShowContactDialog(false);
    setEditingContact(null);
    setContactForm({ name: "", email: "", phone: "", deliveryPref: "both" });
    fetchContacts();
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm("Remove this contact?")) return;
    await fetch("/api/contacts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchContacts();
  };

  const openEditDialog = (contact: Contact) => {
    setEditingContact(contact);
    setContactForm({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      deliveryPref: contact.deliveryPref,
    });
    setShowContactDialog(true);
  };

  const openAddDialog = () => {
    setEditingContact(null);
    setContactForm({ name: "", email: "", phone: "", deliveryPref: "both" });
    setShowContactDialog(true);
  };

  return (
    <main className="min-h-screen p-4 md:p-8 flex items-start justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Card className="w-full max-w-4xl shadow-lg mt-8">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Washington County Market Stats
          </CardTitle>
          <CardDescription className="text-base">
            Generate polished market reports and send to your client list
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="report">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="report">Generate Report</TabsTrigger>
              <TabsTrigger value="contacts">
                Contacts ({contacts.length})
              </TabsTrigger>
            </TabsList>

            {/* ========== REPORT TAB ========== */}
            <TabsContent value="report" className="space-y-6 mt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-base font-medium">
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
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-medium">
                    Custom Message (Optional)
                  </Label>
                  <Textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Add a personal note for this report..."
                    className="min-h-[100px] resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={loading}
                >
                  {loading
                    ? "Researching & Generating..."
                    : "Generate Report"}
                </Button>
              </form>

              {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                  <p className="font-medium">Error</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              )}

              {result?.success && result.stats && (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="font-semibold text-green-800">
                      Report Generated Successfully!
                    </p>
                    {result.emailsSent !== undefined && result.emailsSent > 0 && (
                      <p className="text-sm text-green-700 mt-1">
                        {result.emailsSent} email(s) sent
                      </p>
                    )}
                  </div>

                  {result.gammaUrl && (
                    <Card className="border-blue-200 bg-blue-50/50">
                      <CardContent className="p-4 text-center">
                        <p className="text-sm text-slate-600 mb-3">
                          View the interactive presentation
                        </p>
                        <a
                          href={result.gammaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                            Open Gamma Presentation
                          </Button>
                        </a>
                      </CardContent>
                    </Card>
                  )}

                  {/* Rental Market Stats */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Rental Market</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <MetricCard label="1BR Average" value={result.stats.avgRent1BR} />
                        <MetricCard label="2BR Average" value={result.stats.avgRent2BR} />
                        <MetricCard label="3BR Average" value={result.stats.avgRent3BR} />
                        <MetricCard label="Vacancy Rate" value={result.stats.vacancyRate} />
                        <MetricCard label="Rent MoM" value={result.stats.monthlyRentChange} isChange />
                        <MetricCard label="Rent YoY" value={result.stats.yearlyRentChange} isChange />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Housing Market Stats */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Housing Market</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <MetricCard label="Median Home Price" value={result.stats.medianHomePrice} />
                        <MetricCard label="Days on Market" value={result.stats.daysOnMarket} />
                        <MetricCard label="Active Listings" value={result.stats.activeInventory} />
                        <MetricCard label="Monthly Sales" value={result.stats.salesVolume} />
                        <MetricCard label="Price MoM" value={result.stats.monthlyPriceChange} isChange />
                        <MetricCard label="Price YoY" value={result.stats.yearlyPriceChange} isChange />
                      </div>
                    </CardContent>
                  </Card>

                  {result.reportPreview && (
                    <Card>
                      <CardHeader className="pb-3">
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
                    onClick={() => { setResult(null); setCustomMessage(""); }}
                    variant="outline"
                    className="w-full"
                  >
                    Generate Another Report
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* ========== CONTACTS TAB ========== */}
            <TabsContent value="contacts" className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-muted-foreground">
                  Manage your report recipients
                </p>
                <Button onClick={openAddDialog} size="sm">
                  Add Contact
                </Button>
              </div>

              {contactsLoading ? (
                <p className="text-center text-muted-foreground py-8">
                  Loading contacts...
                </p>
              ) : contacts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-lg font-medium">No contacts yet</p>
                  <p className="text-sm mt-1">
                    Add clients to receive your monthly reports
                  </p>
                  <Button onClick={openAddDialog} className="mt-4" size="sm">
                    Add First Contact
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-white"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{contact.name}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          {contact.email && <span>{contact.email}</span>}
                          {contact.phone && <span>{contact.phone}</span>}
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                            {contact.deliveryPref === "both"
                              ? "Email + SMS"
                              : contact.deliveryPref === "sms"
                                ? "SMS Only"
                                : "Email Only"}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(contact)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteContact(contact.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Contact Add/Edit Dialog */}
              <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingContact ? "Edit Contact" : "Add Contact"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        value={contactForm.name}
                        onChange={(e) =>
                          setContactForm({ ...contactForm, name: e.target.value })
                        }
                        placeholder="John Smith"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={contactForm.email}
                        onChange={(e) =>
                          setContactForm({ ...contactForm, email: e.target.value })
                        }
                        placeholder="john@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        type="tel"
                        value={contactForm.phone}
                        onChange={(e) =>
                          setContactForm({ ...contactForm, phone: e.target.value })
                        }
                        placeholder="+14358001234"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Delivery Preference</Label>
                      <Select
                        value={contactForm.deliveryPref}
                        onValueChange={(v) =>
                          setContactForm({ ...contactForm, deliveryPref: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="both">Email + SMS</SelectItem>
                          <SelectItem value="email">Email Only</SelectItem>
                          <SelectItem value="sms">SMS Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowContactDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveContact}
                      disabled={!contactForm.name || (!contactForm.email && !contactForm.phone)}
                    >
                      {editingContact ? "Save Changes" : "Add Contact"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>
          </Tabs>
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
    isChange && value?.startsWith("+")
      ? "text-green-600"
      : isChange && value?.startsWith("-")
        ? "text-red-600"
        : "text-slate-900";

  return (
    <div className="p-3 bg-slate-50 rounded-lg">
      <p className="text-xs text-slate-600 uppercase tracking-wide">{label}</p>
      <p className={`text-xl font-bold mt-1 ${changeColor}`}>{value || "N/A"}</p>
    </div>
  );
}
