package com.example.mayayamamoto;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import org.json.JSONArray;
import org.json.JSONObject;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

public class DetalhesConsultaActivity extends AppCompatActivity {

    TextView txtData, txtHorario, txtAnotacoes;
    Button btnVerTarefas, btnMensagem, btnVoltar;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_detalhes_consulta);

        txtData = findViewById(R.id.txtData);
        txtHorario = findViewById(R.id.txtHorario);
        txtAnotacoes = findViewById(R.id.txtAnotacoes);
        btnVerTarefas = findViewById(R.id.btnVerTarefas);
        btnMensagem = findViewById(R.id.btnMensagem);
        btnVoltar = findViewById(R.id.btnVoltar);
        
        buscarConsulta();

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

    private void buscarConsulta() {
        OkHttpClient client = SupabaseClient.getClient();

        Request request = new Request.Builder()
                .url(SupabaseClient.SUPABASE_URL + "/rest/v1/consultas?select=*&order=timestamp.desc&limit=1")
                .get()
                .build();

        new Thread(() -> {
            try (Response response = client.newCall(request).execute()) {
                String json = response.body().string();

                if (response.isSuccessful()) {
                    JSONArray array = new JSONArray(json);

                    if (array.length() > 0) {
                        JSONObject consulta = array.getJSONObject(0);

                        String timestamp = consulta.optString("timestamp", "");
                        String observacoes = consulta.optString("observacoes", "Sem anotações");

                        String data = "";
                        String horario = "";

                        if (!timestamp.isEmpty()) {
                            String[] partes = timestamp.split("T");
                            data = formatarData(partes[0]);       // "2025-04-25" → "25 de Abril"
                            horario = partes[1].substring(0, 5);  // "10:00:00" → "10:00"
                        }

                        String dataFinal = data;
                        String horarioFinal = horario;

                        runOnUiThread(() -> {
                            txtData.setText(dataFinal);
                            txtHorario.setText(horarioFinal);
                            txtAnotacoes.setText(observacoes);
                        });

                    } else {
                        runOnUiThread(() ->
                                Toast.makeText(this, "Nenhuma consulta encontrada.", Toast.LENGTH_SHORT).show()
                        );
                    }
                }

            } catch (Exception e) {
                e.printStackTrace();
                runOnUiThread(() ->
                        Toast.makeText(this, "Erro ao carregar consulta.", Toast.LENGTH_SHORT).show()
                );
            }
        }).start();
    }

    private String formatarData(String dataISO) {
        try {
            String[] meses = {
                    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
                    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
            };
            String[] partes = dataISO.split("-");
            int dia = Integer.parseInt(partes[2]);
            int mes = Integer.parseInt(partes[1]) - 1;
            return dia + " de " + meses[mes];
        } catch (Exception e) {
            return dataISO;
        }
    }
}