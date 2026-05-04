package com.example.mayayamamoto;

import android.os.Bundle;

import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.Fragment;

import com.example.mayayamamoto.fragments.AgendaFragment;
import com.example.mayayamamoto.fragments.EvolucaoFragment;
import com.example.mayayamamoto.fragments.HomeFragment;
import com.example.mayayamamoto.fragments.MensagensFragment;
import com.google.android.material.bottomnavigation.BottomNavigationView;

public class MainActivity extends AppCompatActivity {

    private BottomNavigationView bottomNav;
    private String nomeUsuario = "Paciente";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (getSupportActionBar() != null) {
            getSupportActionBar().hide();
        }

        setContentView(R.layout.activity_main);

        bottomNav = findViewById(R.id.bottom_navigation);

        if (getIntent() != null && getIntent().hasExtra("nome_usuario")) {
            nomeUsuario = getIntent().getStringExtra("nome_usuario");
        }

        if (nomeUsuario == null || nomeUsuario.isEmpty()) {
            nomeUsuario = "Paciente";
        }

        if (savedInstanceState == null) {
            carregarFragment(criarHomeFragment());
            bottomNav.setSelectedItemId(R.id.nav_inicio);
        }

        bottomNav.setOnItemSelectedListener(item -> {
            Fragment fragmentSelecionado;

            int id = item.getItemId();

            if (id == R.id.nav_inicio) {
                fragmentSelecionado = criarHomeFragment();

            } else if (id == R.id.nav_agenda) {
                fragmentSelecionado = new AgendaFragment();

            } else if (id == R.id.nav_evolucao) {
                fragmentSelecionado = new EvolucaoFragment();

            } else if (id == R.id.nav_mensagens) {
                fragmentSelecionado = new MensagensFragment();

            } else {
                return false;
            }

            carregarFragment(fragmentSelecionado);
            return true;
        });
    }

    private HomeFragment criarHomeFragment() {
        HomeFragment homeFragment = new HomeFragment();

        Bundle args = new Bundle();
        args.putString("nome_usuario", nomeUsuario);
        homeFragment.setArguments(args);

        return homeFragment;
    }

    private void carregarFragment(Fragment fragment) {
        getSupportFragmentManager()
                .beginTransaction()
                .replace(R.id.fragment_container, fragment)
                .commit();
    }
}