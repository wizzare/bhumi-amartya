package com.bhumiamartya.app.billing;

import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.PendingPurchasesParams;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.android.billingclient.api.QueryPurchasesParams;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;
import android.os.Handler;
import android.os.Looper;

@CapacitorPlugin(name = "BhumiBilling")
public class BhumiBillingPlugin extends Plugin implements PurchasesUpdatedListener {
    private static final String PREMIUM_PRODUCT_ID = "bhumi_premium_monthly";
    private static final String PREMIUM_BASE_PLAN_ID = "monthly";
    private static final int MAX_QUERY_RETRIES = 3;
    private static final long RETRY_DELAY_MS = 500L;

    private BillingClient billingClient;
    private ProductDetails premiumProductDetails;
    private PluginCall pendingPurchaseCall;
    private final Handler mainHandler = new Handler(Looper.getMainLooper());

    @Override
    public void load() {
        billingClient = BillingClient.newBuilder(getContext())
            .setListener(this)
            .enablePendingPurchases(
                PendingPurchasesParams.newBuilder()
                    .enableOneTimeProducts()
                    .enablePrepaidPlans()
                    .build()
            )
            .enableAutoServiceReconnection()
            .build();
    }

    @PluginMethod
    public void initialize(PluginCall call) {
        ensureConnected(call, () -> {
            JSObject result = new JSObject();
            result.put("connected", true);
            result.put("productId", PREMIUM_PRODUCT_ID);
            result.put("basePlanId", PREMIUM_BASE_PLAN_ID);
            call.resolve(result);
        });
    }

    @PluginMethod
    public void queryPremiumSubscription(PluginCall call) {
        ensureConnected(call, () -> queryPremiumProduct(call, product -> call.resolve(productDetailsToJson(product))));
    }

    @PluginMethod
    public void purchasePremium(PluginCall call) {
        ensureConnected(call, () -> {
            if (premiumProductDetails == null) {
                queryPremiumProduct(call, product -> launchPremiumPurchase(call));
                return;
            }

            launchPremiumPurchase(call);
        });
    }

    @PluginMethod
    public void restorePurchases(PluginCall call) {
        ensureConnected(call, () -> {
            QueryPurchasesParams params = QueryPurchasesParams.newBuilder()
                .setProductType(BillingClient.ProductType.SUBS)
                .build();

            billingClient.queryPurchasesAsync(params, (billingResult, purchases) -> {
                if (billingResult.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                    call.reject("Restore purchase failed: " + billingResult.getDebugMessage(), String.valueOf(billingResult.getResponseCode()));
                    return;
                }

                JSObject result = new JSObject();
                result.put("purchases", purchasesToJson(purchases));
                call.resolve(result);
            });
        });
    }

    @Override
    public void onPurchasesUpdated(BillingResult billingResult, List<Purchase> purchases) {
        if (pendingPurchaseCall == null) {
            notifyListeners("purchaseUpdated", buildPurchaseUpdate(billingResult, purchases));
            return;
        }

        PluginCall call = pendingPurchaseCall;
        pendingPurchaseCall = null;

        int responseCode = billingResult.getResponseCode();
        if (responseCode == BillingClient.BillingResponseCode.OK && purchases != null && !purchases.isEmpty()) {
            JSObject result = new JSObject();
            result.put("purchases", purchasesToJson(purchases));
            call.resolve(result);
            return;
        }

        if (responseCode == BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED) {
            fetchOwnedPurchasesWithRetry(call, 1);
            return;
        }

        if (responseCode == BillingClient.BillingResponseCode.USER_CANCELED) {
            call.reject("Purchase canceled.", "USER_CANCELED");
            return;
        }

        call.reject("Status transaksi: " + billingResult.getDebugMessage() + " (Kode: " + responseCode + ")", String.valueOf(responseCode));
    }

    private void fetchOwnedPurchasesWithRetry(PluginCall call, int attempt) {
        QueryPurchasesParams params = QueryPurchasesParams.newBuilder()
            .setProductType(BillingClient.ProductType.SUBS)
            .build();

        billingClient.queryPurchasesAsync(params, (queryResult, existingPurchases) -> {
            boolean hasPurchases = queryResult.getResponseCode() == BillingClient.BillingResponseCode.OK
                && existingPurchases != null
                && !existingPurchases.isEmpty();

            if (hasPurchases) {
                JSObject result = new JSObject();
                result.put("alreadyOwned", true);
                result.put("purchases", purchasesToJson(existingPurchases));
                call.resolve(result);
                return;
            }

            if (attempt < MAX_QUERY_RETRIES) {
                mainHandler.postDelayed(() -> fetchOwnedPurchasesWithRetry(call, attempt + 1), RETRY_DELAY_MS);
            } else {
                JSObject result = new JSObject();
                result.put("alreadyOwned", true);
                result.put("purchases", purchasesToJson(existingPurchases != null ? existingPurchases : new ArrayList<>()));
                call.resolve(result);
            }
        });
    }

    private void ensureConnected(PluginCall call, Runnable onConnected) {
        if (billingClient == null) {
            load();
        }

        if (billingClient.isReady()) {
            onConnected.run();
            return;
        }

        billingClient.startConnection(new BillingClientStateListener() {
            @Override
            public void onBillingSetupFinished(BillingResult billingResult) {
                if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                    onConnected.run();
                    return;
                }
                call.reject("Billing setup failed: " + billingResult.getDebugMessage(), String.valueOf(billingResult.getResponseCode()));
            }

            @Override
            public void onBillingServiceDisconnected() {
                notifyListeners("billingDisconnected", new JSObject());
            }
        });
    }

    private void queryPremiumProduct(PluginCall call, Consumer<ProductDetails> onProductLoaded) {
        List<QueryProductDetailsParams.Product> products = new ArrayList<>();
        products.add(
            QueryProductDetailsParams.Product.newBuilder()
                .setProductId(PREMIUM_PRODUCT_ID)
                .setProductType(BillingClient.ProductType.SUBS)
                .build()
        );

        QueryProductDetailsParams params = QueryProductDetailsParams.newBuilder()
            .setProductList(products)
            .build();

        billingClient.queryProductDetailsAsync(params, (billingResult, queryProductDetailsResult) -> {
            if (billingResult.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                call.reject("Product query failed: " + billingResult.getDebugMessage(), String.valueOf(billingResult.getResponseCode()));
                return;
            }

            List<ProductDetails> productsResult = queryProductDetailsResult.getProductDetailsList();
            if (productsResult == null || productsResult.isEmpty()) {
                call.reject("Subscription product bhumi_premium_monthly was not returned by Google Play.", "PRODUCT_NOT_FOUND");
                return;
            }

            premiumProductDetails = productsResult.get(0);
            onProductLoaded.accept(premiumProductDetails);
        });
    }

    private void launchPremiumPurchase(PluginCall call) {
        String offerToken = findMonthlyOfferToken(premiumProductDetails);
        if (offerToken == null || offerToken.isEmpty()) {
            call.reject("Monthly base plan offer token is unavailable.", "OFFER_TOKEN_MISSING");
            return;
        }

        List<BillingFlowParams.ProductDetailsParams> productDetailsParams = new ArrayList<>();
        productDetailsParams.add(
            BillingFlowParams.ProductDetailsParams.newBuilder()
                .setProductDetails(premiumProductDetails)
                .setOfferToken(offerToken)
                .build()
        );

        BillingFlowParams params = BillingFlowParams.newBuilder()
            .setProductDetailsParamsList(productDetailsParams)
            .build();

        pendingPurchaseCall = call;
        BillingResult result = billingClient.launchBillingFlow(getActivity(), params);
        if (result.getResponseCode() != BillingClient.BillingResponseCode.OK) {
            pendingPurchaseCall = null;
            call.reject("Unable to open purchase sheet: " + result.getDebugMessage(), String.valueOf(result.getResponseCode()));
        }
    }

    private String findMonthlyOfferToken(ProductDetails productDetails) {
        List<ProductDetails.SubscriptionOfferDetails> offers = productDetails.getSubscriptionOfferDetails();
        if (offers == null || offers.isEmpty()) return null;

        for (ProductDetails.SubscriptionOfferDetails offer : offers) {
            if (PREMIUM_BASE_PLAN_ID.equals(offer.getBasePlanId())) {
                return offer.getOfferToken();
            }
        }

        return offers.get(0).getOfferToken();
    }

    private JSObject productDetailsToJson(ProductDetails productDetails) {
        JSObject payload = new JSObject();
        payload.put("productId", productDetails.getProductId());
        payload.put("type", productDetails.getProductType());
        payload.put("title", productDetails.getTitle());
        payload.put("description", productDetails.getDescription());
        payload.put("basePlanId", PREMIUM_BASE_PLAN_ID);

        List<ProductDetails.SubscriptionOfferDetails> offers = productDetails.getSubscriptionOfferDetails();
        if (offers != null) {
            JSArray offerArray = new JSArray();
            for (ProductDetails.SubscriptionOfferDetails offer : offers) {
                JSObject offerJson = new JSObject();
                offerJson.put("basePlanId", offer.getBasePlanId());
                offerJson.put("offerId", offer.getOfferId());
                offerJson.put("offerToken", offer.getOfferToken());

                JSArray pricingPhases = new JSArray();
                for (ProductDetails.PricingPhase phase : offer.getPricingPhases().getPricingPhaseList()) {
                    JSObject phaseJson = new JSObject();
                    phaseJson.put("formattedPrice", phase.getFormattedPrice());
                    phaseJson.put("priceCurrencyCode", phase.getPriceCurrencyCode());
                    phaseJson.put("billingPeriod", phase.getBillingPeriod());
                    pricingPhases.put(phaseJson);
                }
                offerJson.put("pricingPhases", pricingPhases);
                offerArray.put(offerJson);
            }
            payload.put("offers", offerArray);
        }

        return payload;
    }

    private JSArray purchasesToJson(List<Purchase> purchases) {
        JSArray purchaseArray = new JSArray();
        if (purchases == null) return purchaseArray;

        for (Purchase purchase : purchases) {
            JSObject payload = new JSObject();
            payload.put("purchaseToken", purchase.getPurchaseToken());
            payload.put("orderId", purchase.getOrderId());
            payload.put("packageName", purchase.getPackageName());
            payload.put("purchaseTime", purchase.getPurchaseTime());
            payload.put("purchaseState", purchase.getPurchaseState());
            payload.put("acknowledged", purchase.isAcknowledged());
            payload.put("products", new JSArray(purchase.getProducts()));
            purchaseArray.put(payload);
        }

        return purchaseArray;
    }

    private JSObject buildPurchaseUpdate(BillingResult billingResult, List<Purchase> purchases) {
        JSObject payload = new JSObject();
        payload.put("responseCode", billingResult.getResponseCode());
        payload.put("debugMessage", billingResult.getDebugMessage());
        payload.put("purchases", purchasesToJson(purchases));
        return payload;
    }

}
