import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const COURSE_PURCHASE_API = `${
  import.meta.env.VITE_API_URL
}/api/v1/purchase`;

export const purchaseApi = createApi({
  reducerPath: "purchaseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: COURSE_PURCHASE_API,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    createCheckoutSession: builder.mutation({
      query: ({ courseId, method = "stripe" }) => ({
        url: "/checkout/create-checkout-session",
        method: "POST",
        body: { courseId, method },
      }),
    }),
    getCourseDetailWithStatus: builder.query({
      query: (courseId) => ({
        url: `/course/${courseId}/detail-with-status`,
        method: "GET",
      }),
    }),
    getPurchasedCourses: builder.query({
      query: () => ({
        url: `/`,
        method: "GET",
      }),
    }),
    verifyEsewaPayment: builder.mutation({
      query: (paymentData) => ({
        url: "/checkout/verify-esewa",
        method: "POST",
        body: paymentData,
      }),
    }),
  }),
});

export const {
  useCreateCheckoutSessionMutation,
  useGetCourseDetailWithStatusQuery,
  useGetPurchasedCoursesQuery,
  useVerifyEsewaPaymentMutation,
} = purchaseApi;
