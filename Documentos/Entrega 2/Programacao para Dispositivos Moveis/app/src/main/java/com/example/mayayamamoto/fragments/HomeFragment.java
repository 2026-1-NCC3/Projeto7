package com.example.mayayamamoto.fragments;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import com.example.mayayamamoto.DetalhesConsultaActivity;
import com.example.mayayamamoto.R;
import com.example.mayayamamoto.TarefasActivity;

public class HomeFragment extends Fragment {

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater,
                             @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {

        View view = inflater.inflate(R.layout.fragment_home, container, false);

        TextView txtSaudacao = view.findViewById(R.id.txt_saudacao);

        if (getArguments() != null) {
            String nome = getArguments().getString("nome_usuario", "Paciente");
            txtSaudacao.setText("Olá, " + nome + "!");
        }

        // Card Agendamentos
        View cardAgendamentos = view.findViewById(R.id.card_agendamentos);
        cardAgendamentos.setOnClickListener(v ->
                Toast.makeText(getContext(), "Agendamentos", Toast.LENGTH_SHORT).show()
        );

        // Card Progresso
        View cardProgresso = view.findViewById(R.id.card_progresso);
        cardProgresso.setOnClickListener(v ->
                Toast.makeText(getContext(), "Seu Progresso", Toast.LENGTH_SHORT).show()
        );

        // Card Exercícios - abre a tela de tarefas/exercícios
        View cardExercicios = view.findViewById(R.id.card_exercicios);
        cardExercicios.setOnClickListener(v -> {
            Intent intent = new Intent(getActivity(), TarefasActivity.class);
            startActivity(intent);
        });

        // Card Mensagens
        View cardMensagens = view.findViewById(R.id.card_mensagens);
        cardMensagens.setOnClickListener(v ->
                Toast.makeText(getContext(), "Mensagens", Toast.LENGTH_SHORT).show()
        );

        // Botão Ver Detalhes - abre a tela Detalhes da Consulta
        Button btnVerDetalhes = view.findViewById(R.id.btn_ver_detalhes);
        btnVerDetalhes.setOnClickListener(v -> {
            Intent intent = new Intent(getActivity(), DetalhesConsultaActivity.class);
            startActivity(intent);
        });

        // Botão Dúvidas Frequentes
        Button btnDuvidas = view.findViewById(R.id.btn_duvidas);
        btnDuvidas.setOnClickListener(v ->
                Toast.makeText(getContext(), "Abrindo dúvidas...", Toast.LENGTH_SHORT).show()
        );

        return view;
    }
}