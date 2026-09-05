package com.echo.app;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Bridges the web app to HomeWidgetProvider: writes the next suggested
 * workout + streak into SharedPreferences and asks Android to redraw every
 * instance of the home-screen widget.
 */
@CapacitorPlugin(name = "HomeWidget")
public class HomeWidgetPlugin extends Plugin {

    @PluginMethod
    public void update(PluginCall call) {
        String workoutName = call.getString("workoutName", "Abrir o Echo");
        int streak = call.getInt("streak", 0);

        Context context = getContext();
        SharedPreferences prefs = context.getSharedPreferences(HomeWidgetProvider.PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit()
            .putString(HomeWidgetProvider.KEY_WORKOUT, workoutName)
            .putInt(HomeWidgetProvider.KEY_STREAK, streak)
            .apply();

        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        int[] ids = manager.getAppWidgetIds(new ComponentName(context, HomeWidgetProvider.class));
        if (ids.length > 0) {
            Intent intent = new Intent(context, HomeWidgetProvider.class);
            intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
            intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids);
            context.sendBroadcast(intent);
        }

        call.resolve();
    }
}
