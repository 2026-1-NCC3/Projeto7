package com.example.mayayamamoto.fragments;

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

import com.example.mayayamamoto.R;

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

        view.findViewById(R.id.btn_agendamentos).setOnClickListener(v ->
                Toast.makeText(getContext(), "Agendamentos", Toast.LENGTH_SHORT).show());

        view.findViewById(R.id.btn_progresso).setOnClickListener(v ->
                Toast.makeText(getContext(), "Seu Progresso", Toast.LENGTH_SHORT).show());

        view.findViewById(R.id.btn_exercicios).setOnClickListener(v ->
                Toast.makeText(getContext(), "Meus Exercícios", Toast.LENGTH_SHORT).show());

        view.findViewById(R.id.btn_mensagens).setOnClickListener(v ->
                Toast.makeText(getContext(), "Mensagens", Toast.LENGTH_SHORT).show());

        Button btnVerDetalhes = view.findViewById(R.id.btn_ver_detalhes);
        btnVerDetalhes.setOnClickListener(v ->
                Toast.makeText(getContext(), "Terça-Feira, 21 de Abril\n10:00h – 12:00h", Toast.LENGTH_LONG).show());

        Button btnDuvidas = view.findViewById(R.id.btn_duvidas);
        btnDuvidas.setOnClickListener(v ->
                Toast.makeText(getContext(), "Abrindo dúvidas...", Toast.LENGTH_SHORT).show());

        return view;
    }
}

// Ate agr tudo bem