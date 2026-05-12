package com.example.mayayamamoto;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;

import java.util.ArrayList;
import java.util.List;

public class DatabaseHelper extends SQLiteOpenHelper {

    private static final String DB_NAME = "maya.db";
    private static final int DB_VERSION = 1;
    private static final String TABELA = "execucoes";

    public DatabaseHelper(Context context) {
        super(context, DB_NAME, null, DB_VERSION);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        db.execSQL("CREATE TABLE " + TABELA + " (" +
                "id INTEGER PRIMARY KEY AUTOINCREMENT," +
                "exercicio_titulo TEXT," +
                "nivel_dor INTEGER," +
                "data TEXT)");
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        db.execSQL("DROP TABLE IF EXISTS " + TABELA);
        onCreate(db);
    }

    public void salvarExecucao(String titulo, int nivelDor, String data) {
        SQLiteDatabase db = getWritableDatabase();
        ContentValues values = new ContentValues();
        values.put("exercicio_titulo", titulo);
        values.put("nivel_dor", nivelDor);
        values.put("data", data);
        db.insert(TABELA, null, values);
        db.close();
    }

    public List<String> buscarHistorico() {
        List<String> historico = new ArrayList<>();
        SQLiteDatabase db = getReadableDatabase();
        Cursor cursor = db.rawQuery("SELECT * FROM " + TABELA + " ORDER BY id DESC", null);

        while (cursor.moveToNext()) {
            String titulo = cursor.getString(cursor.getColumnIndexOrThrow("exercicio_titulo"));
            int dor = cursor.getInt(cursor.getColumnIndexOrThrow("nivel_dor"));
            String data = cursor.getString(cursor.getColumnIndexOrThrow("data"));
            historico.add(data + " — " + titulo + " | Dor: " + dor + "/10");
        }

        cursor.close();
        db.close();
        return historico;
    }
}