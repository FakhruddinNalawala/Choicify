package com.choicify.backend.pusher;

import com.pusher.rest.Pusher;

public class PusherInstance {
    private static Pusher pusher;

    public PusherInstance(String appId, String key, String secret) {
        pusher = new Pusher(appId, key, secret);
        pusher.setCluster("ap4");
        pusher.setEncrypted(true);
    }

    public Pusher getPusher() {
        return pusher;
    }
}
