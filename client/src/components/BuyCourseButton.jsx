import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import axios from "axios";
import { Loader2 } from "lucide-react";

const BuyCourseButton = ({ courseId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [method, setMethod] = useState("stripe");

  const handlePurchase = async () => {
    setIsLoading(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL;
      const res = await axios.post(
        "${API_BASE_URL}/api/v1/purchase/checkout/create-checkout-session",
        { courseId, method },
        { withCredentials: true }
      );

      const { url, esewaPayload } = res.data;

      if (method === "stripe" || method === "khalti") {
        window.location.href = url;
      } else if (method === "esewa" && esewaPayload) {
        // auto-create form for eSewa
        const form = document.createElement("form");
        form.method = "POST";
        form.action = url;

        for (const key in esewaPayload) {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = esewaPayload[key];
          form.appendChild(input);
        }

        document.body.appendChild(form);
        form.submit();
      } else {
        toast.error("Unknown payment method");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to initiate payment");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <select
        className="w-full border rounded px-3 py-2 text-base font-medium text-black"
        value={method}
        onChange={(e) => setMethod(e.target.value)}
      >
        <option value="stripe">💳 Pay with Stripe</option>
        <option value="esewa">💚 Pay with eSewa</option>
        <option value="khalti">💜 Pay with Khalti</option>
      </select>

      <Button
        onClick={handlePurchase}
        className="w-full font-semibold text-lg"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Please wait
          </>
        ) : (
          "Purchase Course"
        )}
      </Button>
    </div>
  );
};

export default BuyCourseButton;
