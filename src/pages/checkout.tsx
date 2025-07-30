import React, { useState, useEffect, type ChangeEvent, type FormEvent, } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { env } from "../config/env";

interface Address {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock?: number;
  imageUrl?: string;
  category?: {
    id: number;
    name: string;
  };
}

interface OrderData {
  orderId: string;
  productId: number;
  phonepe_transactionId: string;
  status: string;
  amount: number;
  redirectUrl: string;
  validity: number;
}

interface LocationState {
  orderData: OrderData;
  product: Product;
}

const emptyAddress: Address = {
  fullName: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  phone: "",
};

const Checkout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as LocationState | undefined;

  // Redirect to home if invalid access
  useEffect(() => {
    if (!state || !state.orderData || !state.product) {
      toast.error("Invalid access. Please select a product first.");
      navigate("/", { replace: true });
    }
  }, [state, navigate]);

  const orderData = state?.orderData;
  const product = state?.product;

  // Billing and shipping address states
  const [billing, setBilling] = useState<Address>(emptyAddress);
  const [shipping, setShipping] = useState<Address>(emptyAddress);
  const [shippingSameAsBilling, setShippingSameAsBilling] = useState(false);

  // Validation error state
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Sync shipping address when shippingSameAsBilling toggles on
  useEffect(() => {
    if (shippingSameAsBilling) {
      setShipping(billing);
    }
  }, [shippingSameAsBilling, billing]);

  // Handle form input change
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>, section: "billing" | "shipping") => {
    const { name, value } = e.target;

    if (section === "billing") {
      setBilling((prev) => ({ ...prev, [name]: value }));

      if (shippingSameAsBilling) {
        setShipping((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setShipping((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Validate an address, set errors if any, and return boolean
  const validateAddress = (address: Address): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!address.fullName.trim()) newErrors.fullName = "Full Name is required.";
    if (!address.addressLine1.trim()) newErrors.addressLine1 = "Address Line 1 is required.";
    if (!address.city.trim()) newErrors.city = "City is required.";
    if (!address.state.trim()) newErrors.state = "State is required.";
    if (!address.postalCode.trim()) newErrors.postalCode = "Postal Code is required.";
    if (!address.country.trim()) newErrors.country = "Country is required.";
    if (!address.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    } else if (!/^\+?[0-9\- ]{7,15}$/.test(address.phone)) {
      newErrors.phone = "Phone number format is invalid.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Submit handler
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const billingValid = validateAddress(billing);
    const shippingValid = shippingSameAsBilling ? true : validateAddress(shipping);

    if (!billingValid || !shippingValid) {
      toast.error("Please correct the errors in the form.");
      return;
    }

    if (!orderData) {
      toast.error("Order details missing.");
      return;
    }

    const finalOrder = {
      ...orderData,
      billingAddress: billing,
      shippingAddress: shippingSameAsBilling ? billing : shipping,
      status: "Confirmed",
    };

    try {
      const res = await fetch(`${env.API}/payment/create-order-product`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalOrder),
      });

      if (!res.ok) throw new Error("Order completion failed");

      const respData = await res.json();

    
        window.location.href = respData.data;
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Order processing error");
    }
  };

  if (!orderData || !product) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      {/* Order Summary */}
      <section className="mb-6 p-4 bg-gray-100 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        <p>
          <strong>Product:</strong> {product.name}
        </p>
        <p>
          <strong>Quantity:</strong> {orderData.amount}
        </p>
        <p>
          <strong>Price per unit:</strong> ₹{product.price.toFixed(2)}
        </p>
        <p>
          <strong>Total:</strong> ₹{(product.price * orderData.amount).toFixed(2)}
        </p>
      </section>

      <form onSubmit={handleSubmit} noValidate className="space-y-8">
        {/* Billing Address */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Billing Address</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { label: "Full Name", name: "fullName", required: true },
              { label: "Address Line 1", name: "addressLine1", required: true },
              { label: "Address Line 2", name: "addressLine2", required: false },
              { label: "City", name: "city", required: true },
              { label: "State", name: "state", required: true },
              { label: "Postal Code", name: "postalCode", required: true },
              { label: "Country", name: "country", required: true },
              { label: "Phone Number", name: "phone", required: true, type: "tel" },
            ].map(({ label, name, required, type }) => (
              <div key={`billing-${name}`} className="flex flex-col">
                <label htmlFor={`billing-${name}`} className="mb-1 font-medium">
                  {label}
                  {required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <input
                  id={`billing-${name}`}
                  name={name}
                  type={type || "text"}
                  value={(billing as any)[name] || ""}
                  onChange={(e) => handleInputChange(e, "billing")}
                  className={`border rounded px-3 py-2 focus:outline-none focus:ring ${
                    errors[name] ? "border-red-500 focus:ring-red-300" : "border-gray-300 focus:ring-blue-300"
                  }`}
                  required={required}
                />
                {errors[name] && (
                  <span className="mt-1 text-xs text-red-600">{errors[name]}</span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Shipping Address */}
        <section>
          <div className="flex items-center mb-4">
            <input
              id="shippingSame"
              type="checkbox"
              checked={shippingSameAsBilling}
              onChange={() => setShippingSameAsBilling((prev) => !prev)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="shippingSame" className="ml-2 text-sm cursor-pointer">
              Shipping address same as billing
            </label>
          </div>

          {!shippingSameAsBilling && (
            <>
              <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { label: "Full Name", name: "fullName", required: true },
                  { label: "Address Line 1", name: "addressLine1", required: true },
                  { label: "Address Line 2", name: "addressLine2", required: false },
                  { label: "City", name: "city", required: true },
                  { label: "State", name: "state", required: true },
                  { label: "Postal Code", name: "postalCode", required: true },
                  { label: "Country", name: "country", required: true },
                  { label: "Phone Number", name: "phone", required: true, type: "tel" },
                ].map(({ label, name, required, type }) => (
                  <div key={`shipping-${name}`} className="flex flex-col">
                    <label htmlFor={`shipping-${name}`} className="mb-1 font-medium">
                      {label}
                      {required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <input
                      id={`shipping-${name}`}
                      name={name}
                      type={type || "text"}
                      value={(shipping as any)[name] || ""}
                      onChange={(e) => handleInputChange(e, "shipping")}
                      className={`border rounded px-3 py-2 focus:outline-none focus:ring ${
                        errors[name] ? "border-red-500 focus:ring-red-300" : "border-gray-300 focus:ring-blue-300"
                      }`}
                      required={required}
                    />
                    {errors[name] && (
                      <span className="mt-1 text-xs text-red-600">{errors[name]}</span>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        <button
          type="submit"
          className="w-full py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition"
        >
          Place Order
        </button>
      </form>
    </div>
  );
};

export default Checkout;
