package com.example.mayayamamoto;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import androidx.appcompat.app.AppCompatActivity;

public class DetalhesConsultaActivity extends AppCompatActivity {

    Button btnVerTarefas, btnMensagem;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_detalhes_consulta);

        btnVerTarefas = findViewById(R.id.btnVerTarefas);
        btnMensagem = findViewById(R.id.btnMensagem);

        btnVerTarefas.setOnClickListener(v -> {
            Intent intent = new Intent(this, TarefasActivity.class);
            startActivity(intent);
        });

        btnMensagem.setOnClickListener(v -> {
            // ação simples (pode trocar depois)
            System.out.println("Mensagem enviada!");
        });
    }
}
