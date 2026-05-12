package com.example.mayayamamoto;

import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.util.Log;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import org.json.JSONObject;

import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class LoginActivity extends AppCompatActivity {

    private EditText editEmail;
    private EditText editSenha;
    private Button btnEntrar;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (getSupportActionBar() != null) {
            getSupportActionBar().hide();
        }

        setContentView(R.layout.activity_login);

        editEmail = findViewById(R.id.edit_email);
        editSenha = findViewById(R.id.edit_senha);
        btnEntrar = findViewById(R.id.btn_entrar);

        btnEntrar.setOnClickListener(v -> fazerLogin());
    }

    private void fazerLogin() {
        String email = editEmail.getText().toString().trim();
        String senha = editSenha.getText().toString().trim();

        if (TextUtils.isEmpty(email)) {
            editEmail.setError("Informe seu e-mail");
            editEmail.requestFocus();
            return;
        }

        if (TextUtils.isEmpty(senha)) {
            editSenha.setError("Informe sua senha");
            editSenha.requestFocus();
            return;
        }

        btnEntrar.setEnabled(false);

        OkHttpClient client = SupabaseClient.getClient();

        String json = "{\"email\": \"" + email + "\", \"password\": \"" + senha + "\"}";
        RequestBody body = RequestBody.create(json, MediaType.get("application/json"));

        Request request = new Request.Builder()
                .url(SupabaseClient.SUPABASE_URL + "/auth/v1/token?grant_type=password")
                .header("apikey", SupabaseClient.SUPABASE_KEY)
                .header("Content-Type", "application/json")
                .post(body)
                .build();

        new Thread(() -> {
            try (Response response = client.newCall(request).execute()) {
                String resposta = response.body().string();

                // ✅ Log para ver o que o Supabase retorna
                Log.d("Supabase Login", "Código: " + response.code() + " | Resposta: " + resposta);

                if (response.isSuccessful()) {
                    JSONObject jsonObj = new JSONObject(resposta);
                    JSONObject userMetadata = jsonObj
                            .getJSONObject("user")
                            .getJSONObject("user_metadata");

                    String nome = userMetadata.optString("nome", email);

                    String accessToken = jsonObj.getString("access_token");
                    SupabaseClient.salvarToken(accessToken);

                    runOnUiThread(() -> {
                        Toast.makeText(this, "Login realizado!", Toast.LENGTH_SHORT).show();
                        Intent intent = new Intent(LoginActivity.this, MainActivity.class);
                        intent.putExtra("nome_usuario", nome);
                        startActivity(intent);
                        finish();
                    });

                } else {
                    // ✅ Log do erro detalhado
                    Log.e("Supabase Login", "Erro: " + resposta);

                    runOnUiThread(() -> {
                        btnEntrar.setEnabled(true);
                        Toast.makeText(this, "E-mail ou senha incorretos.", Toast.LENGTH_SHORT).show();
                    });
                }

            } catch (Exception e) {
                Log.e("Supabase Login", "Exceção: " + e.getMessage());
                e.printStackTrace();
                runOnUiThread(() -> {
                    btnEntrar.setEnabled(true);
                    Toast.makeText(this, "Erro de conexão. Tente novamente.", Toast.LENGTH_SHORT).show();
                });
            }
        }).start();
    }
}