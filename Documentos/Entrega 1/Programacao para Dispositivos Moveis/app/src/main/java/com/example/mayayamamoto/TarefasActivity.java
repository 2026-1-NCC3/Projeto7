package com.example.mayayamamoto;

import android.os.Bundle;
import android.widget.ImageButton;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;

public class TarefasActivity extends AppCompatActivity {

        ImageButton btnPlay1, btnPlay2;

        @Override
        protected void onCreate(Bundle savedInstanceState) {
            super.onCreate(savedInstanceState);
            setContentView(R.layout.activity_tarefas);

            btnPlay1 = findViewById(R.id.btnPlay1);
            btnPlay2 = findViewById(R.id.btnPlay2);

            btnPlay1.setOnClickListener(v ->
                    Toast.makeText(this, "Iniciando exercício 1", Toast.LENGTH_SHORT).show()
            );

            btnPlay2.setOnClickListener(v ->
                    Toast.makeText(this, "Iniciando exercício 2", Toast.LENGTH_SHORT).show()
            );

        }
    }


