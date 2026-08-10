package com.wibesllc.echolume;

import android.content.Intent;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.gms.games.AchievementsClient;
import com.google.android.gms.games.GamesSignInClient;
import com.google.android.gms.games.LeaderboardsClient;
import com.google.android.gms.games.PlayGames;
import com.google.android.gms.games.PlayGamesSdk;

/**
 * Google Play Games bridge exposed to JS as `Capacitor.Plugins.GameConnect`.
 * Method names and payloads mirror the iOS Game Center plugin so
 * www/js/gameservices.js talks to one API on both platforms.
 */
@CapacitorPlugin(name = "GameConnect")
public class GameConnectPlugin extends Plugin {

    private boolean sdkReady = false;

    @Override
    public void load() {
        // The SDK throws if the games APP_ID resource is missing or still a
        // placeholder, so only initialize once it looks real.
        try {
            int resId = getContext().getResources().getIdentifier(
                    "game_services_project_id", "string", getContext().getPackageName());
            String appId = resId == 0 ? "" : getContext().getString(resId);
            if (appId != null && appId.length() > 0 && !appId.startsWith("REPLACE")) {
                PlayGamesSdk.initialize(getContext());
                sdkReady = true;
            }
        } catch (Exception e) {
            sdkReady = false;
        }
    }

    private boolean guardReady(PluginCall call) {
        if (!sdkReady) {
            call.reject("Play Games is not configured");
            return false;
        }
        return true;
    }

    @PluginMethod
    public void signIn(final PluginCall call) {
        if (!guardReady(call)) return;
        final GamesSignInClient client = PlayGames.getGamesSignInClient(getActivity());
        client.isAuthenticated().addOnCompleteListener(task -> {
            boolean already = task.isSuccessful()
                    && task.getResult() != null
                    && task.getResult().isAuthenticated();
            if (already) {
                JSObject res = new JSObject();
                res.put("authenticated", true);
                call.resolve(res);
                return;
            }
            client.signIn().addOnCompleteListener(signInTask -> {
                JSObject res = new JSObject();
                res.put("authenticated", signInTask.isSuccessful()
                        && signInTask.getResult() != null
                        && signInTask.getResult().isAuthenticated());
                call.resolve(res);
            });
        });
    }

    @PluginMethod
    public void submitScore(PluginCall call) {
        if (!guardReady(call)) return;
        String leaderboardID = call.getString("leaderboardID");
        Integer amount = call.getInt("totalScoreAmount");
        if (leaderboardID == null || amount == null) {
            call.reject("leaderboardID and totalScoreAmount are required");
            return;
        }
        LeaderboardsClient client = PlayGames.getLeaderboardsClient(getActivity());
        client.submitScore(leaderboardID, amount.longValue());
        call.resolve();
    }

    @PluginMethod
    public void unlockAchievement(PluginCall call) {
        if (!guardReady(call)) return;
        String achievementID = call.getString("achievementID");
        if (achievementID == null) {
            call.reject("achievementID is required");
            return;
        }
        AchievementsClient client = PlayGames.getAchievementsClient(getActivity());
        client.unlock(achievementID);
        call.resolve();
    }

    @PluginMethod
    public void showLeaderboard(final PluginCall call) {
        if (!guardReady(call)) return;
        String leaderboardID = call.getString("leaderboardID");
        LeaderboardsClient client = PlayGames.getLeaderboardsClient(getActivity());
        if (leaderboardID == null || leaderboardID.length() == 0) {
            client.getAllLeaderboardsIntent()
                    .addOnSuccessListener(intent -> openIntent(intent, call))
                    .addOnFailureListener(err -> call.reject(String.valueOf(err.getMessage())));
        } else {
            client.getLeaderboardIntent(leaderboardID)
                    .addOnSuccessListener(intent -> openIntent(intent, call))
                    .addOnFailureListener(err -> call.reject(String.valueOf(err.getMessage())));
        }
    }

    private void openIntent(Intent intent, PluginCall call) {
        if (intent == null) {
            call.reject("Play Games returned no leaderboard view");
            return;
        }
        getActivity().startActivityForResult(intent, 9004);
        call.resolve();
    }
}
