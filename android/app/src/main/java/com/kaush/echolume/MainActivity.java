package com.kaush.echolume;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(GameConnectPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
