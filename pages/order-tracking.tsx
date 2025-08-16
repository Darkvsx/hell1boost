import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useOrders } from "@/hooks/useOrders";
import { useAuth } from "@/hooks/useAuth";
import { useUserReviews } from "@/hooks/useReviews";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ReviewSubmissionModal } from "@/components/ReviewSubmissionModal";
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Send,
  User,
  Gamepad2,
  Target,
  Trophy,
  Star,
  Eye,
  Gift,
  ThumbsUp,
} from "lucide-react";

export default function OrderTracking() {
  const router = useRouter();
  const { orderId } = router.query as { orderId: string };
  const { getOrder, addOrderMessage, orders, loading } = useOrders();
  const { user } = useAuth();
  const [order, setOrder] = useState(getOrder(orderId || ""));
  const [newMessage, setNewMessage] = useState("");
  const [showMessages, setShowMessages] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (orderId) {
      const foundOrder = getOrder(orderId);
      setOrder(foundOrder);

      // If we still haven't found the order and we're not loading, mark as not found
      if (!foundOrder && !loading && !isInitialLoad) {
        setIsInitialLoad(false);
      } else if (foundOrder && isInitialLoad) {
        setIsInitialLoad(false);
      }
    }
  }, [orderId, getOrder, orders, loading, isInitialLoad]);

  // Show loading state while orders are being fetched
  if (loading && isInitialLoad) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Loading Order...</h2>
            <p className="text-muted-foreground">
              Please wait while we retrieve your order information.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The order ID you're looking for doesn't exist or you don't have
              permission to view it.
            </p>
            <Link href="/">
              <Button>Back to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400";
      case "processing":
        return "bg-blue-500/20 text-blue-700 dark:text-blue-400";
      case "in-progress":
        return "bg-purple-500/20 text-purple-700 dark:text-purple-400";
      case "completed":
        return "bg-green-500/20 text-green-700 dark:text-green-400";
      case "cancelled":
        return "bg-red-500/20 text-red-700 dark:text-red-400";
      default:
        return "bg-gray-500/20 text-gray-700 dark:text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "processing":
        return <Package className="w-4 h-4" />;
      case "in-progress":
        return <Gamepad2 className="w-4 h-4" />;
      case "completed":
        return <Trophy className="w-4 h-4" />;
      case "cancelled":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      await addOrderMessage(order.id, { from: "customer", message: newMessage });
      setNewMessage("");
      // Update local order state after message is sent
      const updatedOrder = getOrder(order.id);
      if (updatedOrder) {
        setOrder(updatedOrder);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getProgressPercentage = () => {
    switch (order.status) {
      case "pending":
        return 10;
      case "in-progress":
        return order.progress || 50;
      case "completed":
        return 100;
      case "cancelled":
        return 0;
      default:
        return 0;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="bg-gradient-to-r from-card to-card/80 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center mb-6">
            <Link href="/account">
              <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Account
              </Button>
            </Link>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Order #{order.id}</h1>
              <p className="text-muted-foreground">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>

            <div className="mt-4 md:mt-0">
              <Badge
                className={`text-sm px-3 py-1 ${getStatusColor(order.status)}`}
              >
                {getStatusIcon(order.status)}
                <span className="ml-2 capitalize">{order.status}</span>
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Bar */}
            <Card className="border border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Order Progress
                </CardTitle>
                <CardDescription>
                  Current completion status of your boosting order
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {getProgressPercentage()}%
                    </span>
                  </div>
                  <Progress value={getProgressPercentage()} className="h-3" />

                  {order.assignedBooster && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Assigned Booster:
                      </span>
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1 text-primary" />
                        <span className="font-medium text-primary">
                          {order.assignedBooster}
                        </span>
                      </div>
                    </div>
                  )}

                  {order.estimatedCompletion && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Estimated Completion:
                      </span>
                      <span className="font-medium">
                        {formatDate(order.estimatedCompletion)}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tracking Timeline */}
            <Card className="border border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Order Timeline
                </CardTitle>
                <CardDescription>
                  Detailed tracking of your order progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.tracking.map((event, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{event.status}</p>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(event.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {event.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Messages */}
            <Card className="border border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Messages
                    {order.messages.filter(
                      (m) => !m.isRead && m.from !== "customer",
                    ).length > 0 && (
                      <Badge className="ml-2 bg-red-500/20 text-red-700">
                        {
                          order.messages.filter(
                            (m) => !m.isRead && m.from !== "customer",
                          ).length
                        }{" "}
                        new
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMessages(!showMessages)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {showMessages ? "Hide" : "Show"} Messages
                  </Button>
                </CardTitle>
              </CardHeader>

              {showMessages && (
                <CardContent>
                  <div className="space-y-4 max-h-60 overflow-y-auto mb-4">
                    {order.messages.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No messages yet. Send a message to communicate with our
                        team.
                      </p>
                    ) : (
                      order.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`p-3 rounded-lg ${
                            message.from === "customer"
                              ? "bg-primary/10 ml-8"
                              : "bg-muted mr-8"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium capitalize">
                              {message.from === "customer"
                                ? "You"
                                : message.from}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(message.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm">{message.message}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <Separator className="mb-4" />

                  <div className="space-y-3">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message to our support team..."
                      rows={3}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card className="border border-border/50">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.services.map((service, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{service.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Qty: {service.quantity}
                      </p>
                    </div>
                    <span className="font-medium">
                      ${(service.price * service.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}

                <Separator />

                <div className="flex justify-between items-center font-semibold">
                  <span>Total</span>
                  <span>${order.totalAmount.toFixed(2)}</span>
                </div>

                <div className="pt-2">
                  <Badge
                    variant="outline"
                    className={
                      order.paymentStatus === "paid"
                        ? "text-green-700 border-green-200"
                        : "text-yellow-700 border-yellow-200"
                    }
                  >
                    Payment: {order.paymentStatus}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card className="border border-border/50">
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{order.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{order.customerEmail}</p>
                </div>
                {order.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Special Notes
                    </p>
                    <p className="font-medium text-sm bg-muted p-2 rounded">
                      {order.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Support Actions */}
            <Card className="border border-border/50">
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/contact">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Contact Support
                  </Link>
                </Button>

                <Button variant="outline" className="w-full" asChild>
                  <Link href="/faq">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    View FAQ
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
