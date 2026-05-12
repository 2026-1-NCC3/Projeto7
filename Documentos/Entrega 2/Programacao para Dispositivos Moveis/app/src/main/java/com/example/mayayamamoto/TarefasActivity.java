package com.example.mayayamamoto;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.SeekBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import org.json.JSONArray;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Locale;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

public class TarefasActivity extends AppCompatActivity {

    Button btnVoltar, btnCheckin;
    SeekBar seekBarDor;
    TextView txtNivelDor, txtTotalExercicios;
    LinearLayout listaExercicios, listaHistorico;
    DatabaseHelper dbHelper;
    int nivelDorSelecionado = 0;
    String ultimoExercicioSelecionado = "Exercício";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_tarefas);

        dbHelper = new DatabaseHelper(this);

        btnVoltar = findViewById(R.id.btnVoltar);
        btnCheckin = findViewById(R.id.btnCheckin);
        seekBarDor = findViewById(R.id.seekBarDor);
        txtNivelDor = findViewById(R.id.txtNivelDor);
        txtTotalExercicios = findViewById(R.id.txtTotalExercicios);
        listaExercicios = findViewById(R.id.lista_exercicios);
        listaHistorico = findViewById(R.id.listaHistorico);

        btnVoltar.setOnClickListener(v -> {
            Intent intent = new Intent(TarefasActivity.this, DetalhesConsultaActivity.class);
            startActivity(intent);
            finish();
        });

        // SeekBar — atualiza o número ao mover
        seekBarDor.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            @Override
            public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {
                nivelDorSelecionado = progress;
                txtNivelDor.setText("Nível selecionado: " + progress);
            }
            @Override public void onStartTrackingTouch(SeekBar seekBar) {}
            @Override public void onStopTrackingTouch(SeekBar seekBar) {}
        });

        // Botão check-in
        btnCheckin.setOnClickListener(v -> registrarExecucao());

        // Carrega exercícios da API e histórico local
        buscarExercicios();
        carregarHistorico();

        // Notificação de lembrete ao abrir a tela
        NotificacaoHelper.enviarNotificacao(this,
                "Hora dos exercícios! 💪",
                "Não esqueça de registrar sua execução de hoje.");
    }

    private void buscarExercicios() {
        OkHttpClient client = SupabaseClient.getClient();

        Request request = new Request.Builder()
                .url(SupabaseClient.SUPABASE_URL + "/rest/v1/exercicios?select=*")
                .get()
                .build();

        new Thread(() -> {
            try (Response response = client.newCall(request).execute()) {
                String json = response.body().string();

                if (response.isSuccessful()) {
                    JSONArray array = new JSONArray(json);

                    runOnUiThread(() -> {
                        txtTotalExercicios.setText(array.length() + " Exercício(s) Atribuído(s)");
                        listaExercicios.removeAllViews();

                        for (int i = 0; i < array.length(); i++) {
                            try {
                                JSONObject ex = array.getJSONObject(i);
                                String titulo = ex.optString("titulo", "Sem título");
                                String descricao = ex.optString("descricao", "");
                                String instrucoes = ex.optString("instrucoes", "");

                                // Guarda o último exercício para o check-in
                                if (i == 0) ultimoExercicioSelecionado = titulo;

                                // Card do exercício
                                LinearLayout card = new LinearLayout(this);
                                card.setOrientation(LinearLayout.VERTICAL);
                                card.setBackgroundColor(0xFFFFFFFF);
                                card.setPadding(32, 32, 32, 32);
                                LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
                                        LinearLayout.LayoutParams.MATCH_PARENT,
                                        LinearLayout.LayoutParams.WRAP_CONTENT);
                                params.setMargins(0, 0, 0, 16);
                                card.setLayoutParams(params);

                                TextView txtTitulo = new TextView(this);
                                txtTitulo.setText(titulo);
                                txtTitulo.setTextSize(16);
                                txtTitulo.setTypeface(null, android.graphics.Typeface.BOLD);

                                TextView txtDesc = new TextView(this);
                                txtDesc.setText(descricao);
                                txtDesc.setTextSize(14);
                                txtDesc.setPadding(0, 8, 0, 4);

                                TextView txtInstr = new TextView(this);
                                txtInstr.setText(instrucoes);
                                txtInstr.setTextSize(13);
                                txtInstr.setTextColor(0xFF888888);

                                // Clique no card seleciona para o check-in
                                String tituloFinal = titulo;
                                card.setOnClickListener(v -> {
                                    ultimoExercicioSelecionado = tituloFinal;
                                    Toast.makeText(this, "Selecionado: " + tituloFinal, Toast.LENGTH_SHORT).show();
                                });

                                card.addView(txtTitulo);
                                card.addView(txtDesc);
                                card.addView(txtInstr);
                                listaExercicios.addView(card);

                            } catch (Exception e) {
                                e.printStackTrace();
                            }
                        }
                    });
                }
            } catch (Exception e) {
                e.printStackTrace();
                runOnUiThread(() ->
                        Toast.makeText(this, "Erro ao carregar exercícios.", Toast.LENGTH_SHORT).show());
            }
        }).start();
    }

    private void registrarExecucao() {
        String data = new SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.getDefault()).format(new Date());

        // Salva localmente no SQLite
        dbHelper.salvarExecucao(ultimoExercicioSelecionado, nivelDorSelecionado, data);

        Toast.makeText(this, "Check-in registrado! Dor: " + nivelDorSelecionado + "/10", Toast.LENGTH_SHORT).show();

        // Atualiza histórico na tela
        carregarHistorico();

        // Notificação de confirmação
        NotificacaoHelper.enviarNotificacao(this,
                "Exercício registrado ✅",
                ultimoExercicioSelecionado + " — Dor: " + nivelDorSelecionado + "/10");
    }

    private void carregarHistorico() {
        List<String> historico = dbHelper.buscarHistorico();
        listaHistorico.removeAllViews();

        if (historico.isEmpty()) {
            TextView vazio = new TextView(this);
            vazio.setText("Nenhuma execução registrada ainda.");
            vazio.setTextColor(0xFF888888);
            listaHistorico.addView(vazio);
            return;
        }

        for (String item : historico) {
            TextView tv = new TextView(this);
            tv.setText("• " + item);
            tv.setTextSize(13);
            tv.setPadding(0, 4, 0, 4);
            listaHistorico.addView(tv);
        }
    }
}