package com.example.mayayamamoto;

import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import com.example.mayayamamoto.R;

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

        btnEntrar.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                fazerLogin();
            }
        });
    }

    private void fazerLogin() {
        String email = editEmail.getText().toString().trim();
        String senha = editSenha.getText().toString().trim();

        // Validação básica dos campos
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

        // -------------------------------------------------------
        // AQUI a gnt conecta com o backend
        // Exemplo simulado para protótipo:
        // -------------------------------------------------------
        if (email.equals("paciente@maya.com") && senha.equals("123456")) {
            Toast.makeText(this, "Login realizado!", Toast.LENGTH_SHORT).show();
            Intent intent = new Intent(LoginActivity.this, MainActivity.class);
            intent.putExtra("nome_usuario", "Fulan@"); // passa o nome para a home
            startActivity(intent);
            finish();
        } else {
            Toast.makeText(this, "E-mail ou senha incorretos.", Toast.LENGTH_SHORT).show();
        }
    }
}

// Só add o back ai, mas de resto suave