package com.example.mayayamamoto;

import android.os.Bundle;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.Fragment;
import android.view.MenuItem;
import com.google.android.material.bottomnavigation.BottomNavigationView;
import com.example.mayayamamoto.fragments.AgendaFragment;
import com.example.mayayamamoto.fragments.EvolucaoFragment;
import com.example.mayayamamoto.fragments.HomeFragment;
import com.example.mayayamamoto.fragments.MensagensFragment;

public class MainActivity2 extends AppCompatActivity {

    private BottomNavigationView bottomNav;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (getSupportActionBar() != null) {
            getSupportActionBar().hide();
        }

        setContentView(R.layout.activity_main);

        String nomeUsuario = getIntent().getStringExtra("nome_usuario");
        if (nomeUsuario == null) nomeUsuario = "Paciente";

        bottomNav = findViewById(R.id.bottom_navigation);

        Bundle args = new Bundle();
        args.putString("nome_usuario", nomeUsuario);

        HomeFragment homeFragment = new HomeFragment();
        homeFragment.setArguments(args);

        getSupportFragmentManager()
                .beginTransaction()
                .replace(R.id.fragment_container, homeFragment)
                .commit();

        bottomNav.setSelectedItemId(R.id.nav_inicio);

        bottomNav.setOnItemSelectedListener(item -> {

            Fragment fragmentSelecionado;

            int id = item.getItemId();

            if (id == R.id.nav_inicio) {
                HomeFragment hf = new HomeFragment();
                hf.setArguments(args);
                fragmentSelecionado = hf;
            } else if (id == R.id.nav_agenda) {
                fragmentSelecionado = new AgendaFragment();
            } else if (id == R.id.nav_evolucao) {
                fragmentSelecionado = new EvolucaoFragment();
            } else if (id == R.id.nav_mensagens) {
                fragmentSelecionado = new MensagensFragment();
            } else {
                return false;
            }

            getSupportFragmentManager()
                    .beginTransaction()
                    .replace(R.id.fragment_container, fragmentSelecionado)
                    .commit();

            return true;
        });
    }
}

// Ate agr tudo bem