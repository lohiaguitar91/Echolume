import Foundation
import Capacitor
import GameKit

/// Game Center bridge exposed to JS as `Capacitor.Plugins.GameConnect`.
/// Mirrors the Android Play Games plugin of the same name so www/js/gameservices.js
/// can call one API on both platforms.
@objc(GameConnectPlugin)
public class GameConnectPlugin: CAPPlugin, CAPBridgedPlugin, GKGameCenterControllerDelegate {

    public let identifier = "GameConnectPlugin"
    public let jsName = "GameConnect"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "signIn", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "submitScore", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "unlockAchievement", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "showLeaderboard", returnType: CAPPluginReturnPromise)
    ]

    /// authenticateHandler can fire more than once; only the first outcome answers the call.
    private var pendingSignIn: CAPPluginCall?
    private var signInSettled = false

    private func settleSignIn(authenticated: Bool, error: String?) {
        guard let call = pendingSignIn, !signInSettled else { return }
        signInSettled = true
        pendingSignIn = nil
        if let error = error {
            call.reject(error)
        } else {
            call.resolve([
                "authenticated": authenticated,
                "playerID": GKLocalPlayer.local.gamePlayerID,
                "alias": GKLocalPlayer.local.alias
            ])
        }
    }

    @objc public funcsignIn(_ call: CAPPluginCall) {
        let player = GKLocalPlayer.local
        if player.isAuthenticated {
            call.resolve([
                "authenticated": true,
                "playerID": player.gamePlayerID,
                "alias": player.alias
            ])
            return
        }

        pendingSignIn = call
        signInSettled = false

        player.authenticateHandler = { [weak self] viewController, error in
            guard let self = self else { return }
            DispatchQueue.main.async {
                if let viewController = viewController {
                    // Game Center wants to show its own sign-in sheet first.
                    self.bridge?.viewController?.present(viewController, animated: true)
                    return
                }
                if let error = error {
                    self.settleSignIn(authenticated: false, error: error.localizedDescription)
                    return
                }
                self.settleSignIn(authenticated: GKLocalPlayer.local.isAuthenticated, error: nil)
            }
        }
    }

    @objc public funcsubmitScore(_ call: CAPPluginCall) {
        guard let leaderboardID = call.getString("leaderboardID"),
              let amount = call.getInt("totalScoreAmount") else {
            call.reject("leaderboardID and totalScoreAmount are required")
            return
        }
        guard GKLocalPlayer.local.isAuthenticated else {
            call.reject("Game Center is not signed in")
            return
        }
        GKLeaderboard.submitScore(
            amount,
            context: 0,
            player: GKLocalPlayer.local,
            leaderboardIDs: [leaderboardID]
        ) { error in
            if let error = error {
                call.reject(error.localizedDescription)
            } else {
                call.resolve()
            }
        }
    }

    @objc public funcunlockAchievement(_ call: CAPPluginCall) {
        guard let achievementID = call.getString("achievementID") else {
            call.reject("achievementID is required")
            return
        }
        guard GKLocalPlayer.local.isAuthenticated else {
            call.reject("Game Center is not signed in")
            return
        }
        let achievement = GKAchievement(identifier: achievementID)
        achievement.percentComplete = 100.0
        achievement.showsCompletionBanner = true
        GKAchievement.report([achievement]) { error in
            if let error = error {
                call.reject(error.localizedDescription)
            } else {
                call.resolve()
            }
        }
    }

    @objc public funcshowLeaderboard(_ call: CAPPluginCall) {
        guard GKLocalPlayer.local.isAuthenticated else {
            call.reject("Game Center is not signed in")
            return
        }
        let leaderboardID = call.getString("leaderboardID") ?? ""
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            let vc: GKGameCenterViewController
            if leaderboardID.isEmpty {
                vc = GKGameCenterViewController(state: .leaderboards)
            } else {
                vc = GKGameCenterViewController(
                    leaderboardID: leaderboardID,
                    playerScope: .global,
                    timeScope: .allTime
                )
            }
            vc.gameCenterDelegate = self
            self.bridge?.viewController?.present(vc, animated: true)
            call.resolve()
        }
    }

    public func gameCenterViewControllerDidFinish(_ gameCenterViewController: GKGameCenterViewController) {
        gameCenterViewController.dismiss(animated: true)
    }
}
