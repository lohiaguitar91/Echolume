import Foundation
import Capacitor

/// Tells JS whether this exact install came from the App Store or from
/// TestFlight, exposed as `Capacitor.Plugins.BuildInfo`.
///
/// This exists because ads must serve test creatives to beta testers and real
/// ones to customers, and the two builds are otherwise identical binaries -
/// a hand-flipped flag has to be remembered at exactly the right moment, once,
/// and is silently wrong in both directions if it is not.
///
/// The distinction is the receipt filename: an App Store install carries
/// "receipt", TestFlight and other sandbox installs carry "sandboxReceipt".
/// That is the canonical check, and it is what Bubble Popper uses for the same
/// purpose (modules/expo-build-info).
@objc(BuildInfoPlugin)
public class BuildInfoPlugin: CAPPlugin, CAPBridgedPlugin {

    public let identifier = "BuildInfoPlugin"
    public let jsName = "BuildInfo"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "isAppStoreProduction", returnType: CAPPluginReturnPromise)
    ]

    /// True only for a real App Store install. A missing receipt URL resolves
    /// false, which is the safe direction: an unknown build serves test ads
    /// rather than risking invalid traffic against the live units.
    @objc public func isAppStoreProduction(_ call: CAPPluginCall) {
        guard let url = Bundle.main.appStoreReceiptURL else {
            call.resolve(["value": false])
            return
        }
        call.resolve(["value": url.lastPathComponent != "sandboxReceipt"])
    }
}
