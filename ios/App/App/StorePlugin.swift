import Foundation
import Capacitor
import StoreKit

/// StoreKit 2 bridge exposed to JS as `Capacitor.Plugins.Store`.
///
/// Deliberately not a third-party SDK. Echolume sells exactly one non-consumable
/// and needs no receipt server, so this talks to StoreKit directly, the same way
/// GameConnectPlugin talks to GameKit. Bubble Popper ships the same architecture
/// (expo-iap, direct to StoreKit, no backend); a purchases SDK would be the only
/// third-party data-collection entry in the whole app.
///
/// Three behaviours here are load-bearing and were learned from Bubble Popper's
/// implementation rather than from documentation:
///   1. A purchase can be delivered twice - once as the return of purchase(), once
///      through the Transaction.updates listener. Delivery must be idempotent.
///   2. Every transaction MUST be finished. An unfinished one is re-delivered on
///      every launch, forever.
///   3. Entitlement is checked at startup, which is what silently restores a
///      purchase made on another device without the player pressing Restore.
@objc(StorePlugin)
public class StorePlugin: CAPPlugin, CAPBridgedPlugin {

    public let identifier = "StorePlugin"
    public let jsName = "Store"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "products", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "purchase", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "restore", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "isEntitled", returnType: CAPPluginReturnPromise)
    ]

    /// Watches for transactions that arrive outside a purchase() call: Ask to Buy
    /// approvals, a purchase made on another device, an interrupted download.
    private var updatesTask: Task<Void, Never>?

    override public func load() {
        updatesTask = Task.detached { [weak self] in
            for await update in Transaction.updates {
                guard let self = self, case .verified(let transaction) = update else { continue }
                await transaction.finish()
                self.notifyListeners("purchaseUpdated",
                                     data: ["productId": transaction.productID])
            }
        }
    }

    deinit { updatesTask?.cancel() }

    // MARK: - Products

    /// Localized price for one or more product ids. Anything the store does not
    /// know about is simply absent from the result rather than an error, so a
    /// typo'd id degrades to "no price" instead of breaking the settings screen.
    @objc public func products(_ call: CAPPluginCall) {
        guard let ids = call.getArray("productIds", String.self), !ids.isEmpty else {
            call.reject("productIds is required")
            return
        }
        Task {
            do {
                let products = try await Product.products(for: ids)
                call.resolve(["products": products.map {
                    ["id": $0.id, "price": $0.displayPrice, "title": $0.displayName]
                }])
            } catch {
                call.reject(error.localizedDescription)
            }
        }
    }

    // MARK: - Purchase

    /// Resolves { status } where status is purchased | cancelled | pending | failed.
    /// A cancelled sheet is NOT an error: the player chose, and the UI must stay
    /// silent rather than show them a failure for changing their mind.
    @objc public func purchase(_ call: CAPPluginCall) {
        guard let id = call.getString("productId") else {
            call.reject("productId is required")
            return
        }
        Task {
            do {
                guard let product = try await Product.products(for: [id]).first else {
                    call.reject("Product \(id) not found in the store")
                    return
                }
                switch try await product.purchase() {
                case .success(let verification):
                    switch verification {
                    case .verified(let transaction):
                        await transaction.finish()
                        call.resolve(["status": "purchased", "productId": transaction.productID])
                    case .unverified(_, let error):
                        // A failed signature check. Never grant on this.
                        call.reject("Purchase could not be verified: \(error.localizedDescription)")
                    }
                case .userCancelled:
                    call.resolve(["status": "cancelled"])
                case .pending:
                    // Ask to Buy, or an interrupted payment. The grant will arrive
                    // through Transaction.updates if it is ever approved.
                    call.resolve(["status": "pending"])
                @unknown default:
                    call.resolve(["status": "failed"])
                }
            } catch {
                call.reject(error.localizedDescription)
            }
        }
    }

    // MARK: - Restore and entitlement

    /// Explicit Restore button. Syncs with the App Store (which may prompt for a
    /// password) and then reports current entitlement.
    @objc public func restore(_ call: CAPPluginCall) {
        Task {
            do {
                try await AppStore.sync()
            } catch {
                // A cancelled or failed sync is not fatal; local entitlement may
                // still be current, so fall through and report what we know.
            }
            call.resolve(["owned": await Self.ownedProductIds()])
        }
    }

    /// Silent ownership check, safe to call on every launch.
    @objc public func isEntitled(_ call: CAPPluginCall) {
        Task { call.resolve(["owned": await Self.ownedProductIds()]) }
    }

    /// Every non-consumable this Apple ID currently owns for this app.
    private static func ownedProductIds() async -> [String] {
        var owned: [String] = []
        for await entitlement in Transaction.currentEntitlements {
            guard case .verified(let transaction) = entitlement else { continue }
            guard transaction.revocationDate == nil else { continue }
            owned.append(transaction.productID)
        }
        return owned
    }
}
