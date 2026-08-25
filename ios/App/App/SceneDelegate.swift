import UIKit
import Capacitor

/// Registers the plugins that live in the app target itself. Capacitor's
/// automatic registration only covers npm plugin packages — `cap sync` scans
/// those for `@objc(...)` classes and writes the names into the bundled
/// capacitor.config.json's `packageClassList`, overwriting it every run — so a
/// plugin compiled directly into this app never makes that list. Without this
/// override, `Capacitor.Plugins.GameConnect` is simply undefined on the JS
/// side and gameservices.js silently degrades to local-only.
final class EchoBridgeViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(GameConnectPlugin())
    }
}

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        window = UIWindow(windowScene: windowScene)
        window?.rootViewController = EchoBridgeViewController()
        window?.makeKeyAndVisible()

        SceneDelegateProxy.shared.scene(scene, willConnectTo: session, options: connectionOptions)
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        SceneDelegateProxy.shared.scene(scene, continue: userActivity)
    }
}
