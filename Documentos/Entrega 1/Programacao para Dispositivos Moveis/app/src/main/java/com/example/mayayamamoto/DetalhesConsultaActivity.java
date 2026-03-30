package com.example.mayayamamoto;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

public class DetalhesConsultaActivity extends AppCompatActivity {

    TextView txtData, txtHorario, txtAnotacoes;
    Button btnVerTarefas, btnMensagem;
    ImageView btnVoltar;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_detalhes_consulta);

        // Referências
        txtData = findViewById(R.id.txtData);
        txtHorario = findViewById(R.id.txtHorario);
        txtAnotacoes = findViewById(R.id.txtAnotacoes);

        btnVerTarefas = findViewById(R.id.btnVerTarefas);
        btnMensagem = findViewById(R.id.btnMensagem);
        btnVoltar = findViewById(R.id.btnVoltar);

        // Dados mock
        txtData.setText("25 de Abril");
        txtHorario.setText("10:00 — 11:00");
        txtAnotacoes.setText("• Correção da postura cervical\n• Exercícios de relaxamento");

        // BOTÃO VER TAREFAS (FUNCIONANDO)
        btnVerTarefas.setOnClickListener(v -> {
            Intent intent = new Intent(DetalhesConsultaActivity.this, TarefasActivity.class);
            startActivity(intent);
        });

        // OUTROS
        btnMensagem.setOnClickListener(v ->
                Toast.makeText(this, "Enviar mensagem", Toast.LENGTH_SHORT).show()
        );

        btnVoltar.setOnClickListener(v -> finish());
    }
}