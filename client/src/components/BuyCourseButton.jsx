import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCreateCheckoutSessionMutation } from "@/features/api/purchaseApi";
import { Loader2, CreditCard, Wallet } from "lucide-react";
import { toast } from "sonner";

const BuyCourseButton = ({ courseId }) => {
  const [createCheckoutSession, { isLoading }] =
    useCreateCheckoutSessionMutation();
  const [selectedMethod, setSelectedMethod] = useState(null);

  const handlePurchase = async (method) => {
    setSelectedMethod(method);

    try {
      const response = await createCheckoutSession({
        courseId,
        method,
      }).unwrap();

      if (response.success) {
        if (method === "stripe") {
          // Redirect to Stripe checkout
          window.location.href = response.url;
        } else if (method === "esewa") {
          // Handle eSewa payment
          if (response.esewaPayload) {
            // Create a form and submit to eSewa
            const form = document.createElement("form");
            form.method = "POST";
            form.action = response.url;

            // Add all payload data as hidden inputs
            Object.keys(response.esewaPayload).forEach((key) => {
              const input = document.createElement("input");
              input.type = "hidden";
              input.name = key;
              input.value = response.esewaPayload[key];
              form.appendChild(input);
            });

            document.body.appendChild(form);
            form.submit();
          } else {
            toast.error("eSewa payment data not received");
          }
        }
      } else {
        toast.error("Failed to create checkout session");
      }
    } catch (error) {
      console.error("Purchase error:", error);
      toast.error(error.data?.message || "Something went wrong");
    } finally {
      setSelectedMethod(null);
    }
  };

  const isMethodLoading = (method) => isLoading && selectedMethod === method;

  return (
    <div className="space-y-3 w-full">
      <Button
        onClick={() => handlePurchase("stripe")}
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        {isMethodLoading("stripe") ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Buy with Stripe
          </>
        )}
      </Button>

      <Button
        onClick={() => handlePurchase("esewa")}
        disabled={isLoading}
        className="w-full bg-green-600 hover:bg-green-700 text-white"
      >
        {isMethodLoading("esewa") ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Wallet className="mr-2 h-4 w-4" />
            Pay with eSewa
          </>
        )}
      </Button>
    </div>
  );
};

export default BuyCourseButton;
