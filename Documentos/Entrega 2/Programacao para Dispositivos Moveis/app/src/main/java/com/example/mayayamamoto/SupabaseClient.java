package com.example.mayayamamoto;

import java.security.cert.CertificateException;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import okhttp3.OkHttpClient;

public class SupabaseClient {

    // ✅ URL sem /rest/v1/ no final
    public static final String SUPABASE_URL = "https://iuiadwyuufezjwdfvvvv.supabase.co";
    public static final String SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1aWFkd3l1dWZlemp3ZGZ2dnZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1MDA3NDQsImV4cCI6MjA5MzA3Njc0NH0.NqXxRZtmzTVrAjrYe37K5ohGNKGhIvSwcK7BscP6CK4";

    private static String accessToken = null;

    public static void salvarToken(String token) {
        accessToken = token;
    }

    public static String getToken() {
        return accessToken;
    }

    public static OkHttpClient getClient() {
        try {
            X509TrustManager trustManager = new X509TrustManager() {
                @Override
                public void checkClientTrusted(java.security.cert.X509Certificate[] chain, String authType) throws CertificateException {}
                @Override
                public void checkServerTrusted(java.security.cert.X509Certificate[] chain, String authType) throws CertificateException {}
                @Override
                public java.security.cert.X509Certificate[] getAcceptedIssuers() { return new java.security.cert.X509Certificate[]{}; }
            };

            SSLContext sslContext = SSLContext.getInstance("SSL");
            sslContext.init(null, new TrustManager[]{trustManager}, new java.security.SecureRandom());

            return new OkHttpClient.Builder()
                    .sslSocketFactory(sslContext.getSocketFactory(), trustManager)
                    .hostnameVerifier((hostname, session) -> true)
                    .addInterceptor(chain -> {
                        String token = accessToken != null ? accessToken : SUPABASE_KEY;
                        okhttp3.Request request = chain.request().newBuilder()
                                .header("apikey", SUPABASE_KEY)
                                .header("Authorization", "Bearer " + token)
                                .header("Content-Type", "application/json")
                                .build();
                        return chain.proceed(request);
                    })
                    .build();

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}